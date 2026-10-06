import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(express.json());

// Persistent store setup
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredQuestion {
  id: string;
  type: 'text' | 'multiple_choice' | 'yes_no';
  text: string;
  order: number;
  options: string[];
  correctAnswer: string;
  acceptedAnswers: string[];
}

interface StoredSubmission {
  id: string;
  testId: string;
  submittedAt: string;
  score: number;
  total: number;
  percentage: number;
  answers: {
    questionId: string;
    answerText: string;
    isCorrect: boolean;
  }[];
}

interface StoredTest {
  id: string;
  ownerId: string;
  ownerToken: string;
  ownerName: string;
  friendName: string;
  title: string;
  description: string;
  responderToken: string;
  status: 'waiting' | 'completed';
  createdAt: string;
  completedAt: string | null;
  questions: StoredQuestion[];
  submission: StoredSubmission | null;
}

interface AppStore {
  tests: Record<string, StoredTest>; // key = testId
  responderTokens: Record<string, string>; // responderToken -> testId
  ownerTokens: Record<string, string[]>; // ownerToken -> testId[]
}

let store: AppStore = {
  tests: {},
  responderTokens: {},
  ownerTokens: {},
};

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      store = JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to load store, initializing fresh store:', err);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

loadStore();

// Helper: generate cryptographically secure random token
function generateSecureToken(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function generateOwnerToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper: Normalize text for comparisons (Section 12)
export function normalizeTextAnswer(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '') // remove basic punctuation
    .replace(/\s+/g, ' ') // collapse multiple whitespaces
    .trim();
}

// Helper: Check if responder text matches expected or accepted answers
export function checkAnswerMatch(
  q: StoredQuestion,
  responderText: string
): boolean {
  if (q.type === 'text') {
    const normResp = normalizeTextAnswer(responderText);
    const normExpected = normalizeTextAnswer(q.correctAnswer);
    if (normResp === normExpected) return true;

    if (q.acceptedAnswers && q.acceptedAnswers.length > 0) {
      for (const accepted of q.acceptedAnswers) {
        if (normResp === normalizeTextAnswer(accepted)) return true;
      }
    }
    return false;
  }

  // Multiple Choice or Yes/No
  const normResp = responderText.trim().toLowerCase();
  const normExpected = q.correctAnswer.trim().toLowerCase();
  return normResp === normExpected;
}

// Category determination helper
export function getScoreCategory(percentage: number) {
  if (percentage >= 90) {
    return {
      title: 'BEST FRIENDS FOREVER',
      emoji: '❤️🔥',
      description: 'You two are practically soulmates! There is nothing you hide from each other!',
      color: '#e11d48',
    };
  }
  if (percentage >= 75) {
    return {
      title: 'SUPER CLOSE FRIENDS',
      emoji: '❤️',
      description: 'Incredible bond! They know your favorites, quirks, and stories inside out!',
      color: '#db2777',
    };
  }
  if (percentage >= 50) {
    return {
      title: 'GOOD FRIENDS',
      emoji: '😊',
      description: 'Solid friendship! You share great memories and understand each other well.',
      color: '#d97706',
    };
  }
  if (percentage >= 25) {
    return {
      title: 'FRIENDSHIP LOADING...',
      emoji: '😂',
      description: 'Time to hang out more, grab some snacks, and share a few more secrets!',
      color: '#4f46e5',
    };
  }
  return {
    title: 'DO YOU EVEN KNOW ME?',
    emoji: '😂',
    description: 'Uh oh! Are you sure you two have ever had a conversation before?! Time for a catch-up!',
    color: '#64748b',
  };
}

// Get base URL for shareable links
function getBaseUrl(req: Request): string {
  const isRender = Boolean(process.env.RENDER || process.env.RENDER_EXTERNAL_URL || process.env.RENDER_SERVICE_ID);
  if (process.env.PUBLIC_BASE_URL) {
    const pub = process.env.PUBLIC_BASE_URL.trim();
    if (!isRender || !pub.includes('localhost')) {
      return pub.replace(/\/$/, '');
    }
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.trim().replace(/\/$/, '');
  }
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  const isRenderHost = host.includes('onrender.com');
  const protocol = (req.headers['x-forwarded-proto'] as string) || (isRenderHost ? 'https' : (req.protocol || 'http'));
  return `${protocol}://${host}`;
}

// Owner authorization middleware
function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Owner token required.' });
  }

  const rawTokens = authHeader.replace('Bearer ', '').trim().split(',');
  const matchedTokens: string[] = [];

  for (const t of rawTokens) {
    const trimmed = t.trim();
    if (trimmed && store.ownerTokens[trimmed]) {
      matchedTokens.push(trimmed);
    }
  }

  if (matchedTokens.length === 0) {
    return res.status(401).json({ message: 'Unauthorized: Invalid owner token.' });
  }

  (req as any).ownerTokens = matchedTokens;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check (Section 39)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ------------------------------------------
// PUBLIC RESPONDER ENDPOINTS
// ------------------------------------------

// Public: Get test details for responder (Section 29)
// CRITICAL PRIVACY: NEVER return correct answers, expected answers, or results!
app.get('/api/public/tests/:token', (req, res) => {
  const token = req.params.token;
  const testId = store.responderTokens[token];

  if (!testId || !store.tests[testId]) {
    return res.status(404).json({
      message: "This friendship test doesn't exist or is no longer available.",
    });
  }

  const test = store.tests[testId];

  // If already submitted, return friendly completed state
  if (test.status === 'completed') {
    return res.json({
      id: test.id,
      title: test.title,
      ownerName: test.ownerName,
      friendName: test.friendName,
      description: test.description,
      completed: true,
      questions: [],
    });
  }

  // Strip all correct answers / expected answers
  const safeQuestions = test.questions.map((q) => ({
    id: q.id,
    type: q.type,
    text: q.text,
    order: q.order,
    options: q.type === 'multiple_choice' ? q.options : undefined,
  }));

  res.json({
    id: test.id,
    title: test.title,
    ownerName: test.ownerName,
    friendName: test.friendName,
    description: test.description,
    completed: false,
    questions: safeQuestions,
  });
});

// Public: Submit answers (Section 20 & 21)
// CRITICAL PRIVACY: Must return ONLY { success: true, message: "..." }
// NEVER return score, percentage, correct/incorrect, or expected answers!
app.post('/api/public/tests/:token/submit', (req, res) => {
  const token = req.params.token;
  const testId = store.responderTokens[token];

  if (!testId || !store.tests[testId]) {
    return res.status(404).json({
      message: "This friendship test doesn't exist or is no longer available.",
    });
  }

  const test = store.tests[testId];

  // Prevent duplicate submission (Section 32)
  if (test.status === 'completed') {
    return res.status(400).json({
      message: 'This test has already been submitted.',
    });
  }

  const { answers } = req.body;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: 'Invalid submission data.' });
  }

  // Answer matching & score calculation server-side
  let correctCount = 0;
  const totalCount = test.questions.length;
  const answerRecords: {
    questionId: string;
    answerText: string;
    isCorrect: boolean;
  }[] = [];

  for (const q of test.questions) {
    const submitted = answers.find((a: any) => a.questionId === q.id);
    const respText = submitted ? String(submitted.answerText || '') : '';
    const isCorrect = checkAnswerMatch(q, respText);

    if (isCorrect) {
      correctCount++;
    }

    answerRecords.push({
      questionId: q.id,
      answerText: respText,
      isCorrect,
    });
  }

  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const now = new Date().toISOString();

  // Save submission
  test.status = 'completed';
  test.completedAt = now;
  test.submission = {
    id: 'sub_' + generateSecureToken(8),
    testId: test.id,
    submittedAt: now,
    score: correctCount,
    total: totalCount,
    percentage,
    answers: answerRecords,
  };

  saveStore();

  // Return strictly privacy-safe response
  return res.json({
    success: true,
    message: 'Answers submitted successfully',
  });
});

// ------------------------------------------
// OWNER PRIVATE ENDPOINTS
// ------------------------------------------

// Owner: Create a new test (Section 13)
app.post('/api/owner/tests', (req, res) => {
  const { ownerName, friendName, title, description, questions } = req.body;

  if (!ownerName || !ownerName.trim()) {
    return res.status(400).json({ message: 'Owner name is required.' });
  }
  if (!friendName || !friendName.trim()) {
    return res.status(400).json({ message: 'Friend name is required.' });
  }
  if (!Array.isArray(questions) || questions.length < 3) {
    return res.status(400).json({ message: 'At least 3 questions are required.' });
  }

  // Validate questions
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.text || !q.text.trim()) {
      return res.status(400).json({ message: `Question ${i + 1} text is required.` });
    }
    if (!q.correctAnswer || !q.correctAnswer.trim()) {
      return res.status(400).json({ message: `Question ${i + 1} correct answer is required.` });
    }
  }

  const testId = 'test_' + generateSecureToken(8);
  const responderToken = generateSecureToken(10);
  const ownerToken = generateOwnerToken();
  const now = new Date().toISOString();

  const formattedQuestions: StoredQuestion[] = questions.map((q: any, idx: number) => ({
    id: 'q_' + generateSecureToken(6),
    type: q.type || 'text',
    text: q.text.trim(),
    order: idx + 1,
    options: Array.isArray(q.options) ? q.options.map((o: any) => String(o).trim()) : [],
    correctAnswer: q.correctAnswer.trim(),
    acceptedAnswers: Array.isArray(q.acceptedAnswers)
      ? q.acceptedAnswers.map((a: any) => String(a).trim()).filter(Boolean)
      : [],
  }));

  const newTest: StoredTest = {
    id: testId,
    ownerId: 'owner_' + generateSecureToken(6),
    ownerToken,
    ownerName: ownerName.trim(),
    friendName: friendName.trim(),
    title: (title && title.trim()) || 'How Well Do You Know Me?',
    description: (description && description.trim()) || '',
    responderToken,
    status: 'waiting',
    createdAt: now,
    completedAt: null,
    questions: formattedQuestions,
    submission: null,
  };

  store.tests[testId] = newTest;
  store.responderTokens[responderToken] = testId;

  if (!store.ownerTokens[ownerToken]) {
    store.ownerTokens[ownerToken] = [];
  }
  store.ownerTokens[ownerToken].push(testId);

  saveStore();

  const baseUrl = getBaseUrl(req);
  const shareUrl = `${baseUrl}/test/${responderToken}`;

  res.status(201).json({
    test: {
      id: newTest.id,
      title: newTest.title,
      ownerName: newTest.ownerName,
      friendName: newTest.friendName,
      description: newTest.description,
      questionCount: newTest.questions.length,
      status: newTest.status,
      createdAt: newTest.createdAt,
      completedAt: newTest.completedAt,
      responderToken: newTest.responderToken,
      shareUrl,
    },
    ownerToken,
    responderToken,
    shareUrl,
  });
});

// Owner: List tests owned by the caller
app.get('/api/owner/tests', requireOwnerAuth, (req, res) => {
  const ownerTokens = (req as any).ownerTokens as string[];
  const testIds = new Set<string>();

  for (const ot of ownerTokens) {
    const ids = store.ownerTokens[ot] || [];
    ids.forEach((id) => testIds.add(id));
  }

  const baseUrl = getBaseUrl(req);
  const result: any[] = [];

  for (const id of testIds) {
    const t = store.tests[id];
    if (t) {
      result.push({
        id: t.id,
        title: t.title,
        ownerName: t.ownerName,
        friendName: t.friendName,
        description: t.description,
        questionCount: t.questions.length,
        status: t.status,
        createdAt: t.createdAt,
        completedAt: t.completedAt,
        responderToken: t.responderToken,
        shareUrl: `${baseUrl}/test/${t.responderToken}`,
      });
    }
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(result);
});

// Owner: Get test detail by ID
app.get('/api/owner/tests/:id', requireOwnerAuth, (req, res) => {
  const testId = req.params.id;
  const test = store.tests[testId];

  if (!test) {
    return res.status(404).json({ message: 'Test not found.' });
  }

  const ownerTokens = (req as any).ownerTokens as string[];
  if (!ownerTokens.includes(test.ownerToken)) {
    return res.status(403).json({ message: "You don't have permission to view this test." });
  }

  const baseUrl = getBaseUrl(req);
  res.json({
    id: test.id,
    title: test.title,
    ownerName: test.ownerName,
    friendName: test.friendName,
    description: test.description,
    questionCount: test.questions.length,
    status: test.status,
    createdAt: test.createdAt,
    completedAt: test.completedAt,
    responderToken: test.responderToken,
    shareUrl: `${baseUrl}/test/${test.responderToken}`,
    questions: test.questions,
  });
});

// Owner: Get results for completed test (Section 25 & 26)
app.get('/api/owner/tests/:id/results', requireOwnerAuth, (req, res) => {
  const testId = req.params.id;
  const test = store.tests[testId];

  if (!test) {
    return res.status(404).json({ message: 'Test not found.' });
  }

  const ownerTokens = (req as any).ownerTokens as string[];
  if (!ownerTokens.includes(test.ownerToken)) {
    return res.status(403).json({ message: "You don't have permission to view these results." });
  }

  if (test.status !== 'completed' || !test.submission) {
    return res.status(400).json({ message: 'Friend has not completed the test yet.' });
  }

  const sub = test.submission;
  res.json({
    testId: test.id,
    status: test.status,
    score: sub.score,
    total: sub.total,
    percentage: sub.percentage,
    category: getScoreCategory(sub.percentage),
    completedAt: sub.submittedAt,
  });
});

// Owner: Get full answer review (Section 27)
app.get('/api/owner/tests/:id/answers', requireOwnerAuth, (req, res) => {
  const testId = req.params.id;
  const test = store.tests[testId];

  if (!test) {
    return res.status(404).json({ message: 'Test not found.' });
  }

  const ownerTokens = (req as any).ownerTokens as string[];
  if (!ownerTokens.includes(test.ownerToken)) {
    return res.status(403).json({ message: "You don't have permission to view this review." });
  }

  if (test.status !== 'completed' || !test.submission) {
    return res.status(400).json({ message: 'Friend has not completed the test yet.' });
  }

  const sub = test.submission;
  const answersList = test.questions.map((q) => {
    const ansRecord = sub.answers.find((a) => a.questionId === q.id);
    return {
      questionId: q.id,
      questionText: q.text,
      questionType: q.type,
      expectedAnswer: q.correctAnswer,
      acceptedAnswers: q.acceptedAnswers,
      responderAnswer: ansRecord ? ansRecord.answerText : '',
      isCorrect: ansRecord ? ansRecord.isCorrect : false,
    };
  });

  res.json({
    summary: {
      total: sub.total,
      completedAt: sub.submittedAt,
    },
    answers: answersList,
  });
});

// Owner: Rotate responder link (Section 16)
app.post('/api/owner/tests/:id/rotate-link', requireOwnerAuth, (req, res) => {
  const testId = req.params.id;
  const test = store.tests[testId];

  if (!test) {
    return res.status(404).json({ message: 'Test not found.' });
  }

  const ownerTokens = (req as any).ownerTokens as string[];
  if (!ownerTokens.includes(test.ownerToken)) {
    return res.status(403).json({ message: "You don't have permission to modify this test." });
  }

  // Remove old token mapping
  delete store.responderTokens[test.responderToken];

  // Generate new token
  const newResponderToken = generateSecureToken(10);
  test.responderToken = newResponderToken;
  store.responderTokens[newResponderToken] = testId;

  saveStore();

  const baseUrl = getBaseUrl(req);
  const shareUrl = `${baseUrl}/test/${newResponderToken}`;

  res.json({
    responderToken: newResponderToken,
    shareUrl,
  });
});

// Owner: Delete test
app.delete('/api/owner/tests/:id', requireOwnerAuth, (req, res) => {
  const testId = req.params.id;
  const test = store.tests[testId];

  if (!test) {
    return res.status(404).json({ message: 'Test not found.' });
  }

  const ownerTokens = (req as any).ownerTokens as string[];
  if (!ownerTokens.includes(test.ownerToken)) {
    return res.status(403).json({ message: "You don't have permission to delete this test." });
  }

  delete store.responderTokens[test.responderToken];
  if (store.ownerTokens[test.ownerToken]) {
    store.ownerTokens[test.ownerToken] = store.ownerTokens[test.ownerToken].filter(
      (id) => id !== testId
    );
  }
  delete store.tests[testId];

  saveStore();
  res.json({ success: true, message: 'Test deleted successfully.' });
});

// ==========================================
// ADMIN CONSOLE ENDPOINTS
// ==========================================
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Admin token required.' });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  if (token !== 'secret_admin_session_token_xyz987') {
    return res.status(401).json({ message: 'Unauthorized: Invalid admin token.' });
  }
  next();
}

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password !== 'admin123') {
    return res.status(401).json({ message: 'Incorrect admin password.' });
  }
  res.json({ success: true, token: 'secret_admin_session_token_xyz987' });
});

app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  const allTests = Object.values(store.tests);
  const totalTests = allTests.length;
  const completedTests = allTests.filter((t) => t.status === 'completed').length;
  const waitingTests = totalTests - completedTests;

  const baseUrl = getBaseUrl(req);
  const testsList = allTests
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((t) => ({
      id: t.id,
      title: t.title,
      ownerName: t.ownerName,
      friendName: t.friendName,
      questionCount: t.questions.length,
      status: t.status,
      createdAt: t.createdAt,
      completedAt: t.completedAt || null,
      shareUrl: `${baseUrl}/test/${t.responderToken}`,
    }));

  res.json({
    totalTests,
    completedTests,
    waitingTests,
    tests: testsList,
  });
});

app.delete('/api/admin/tests/:id', requireAdminAuth, (req, res) => {
  const testId = req.params.id;
  const test = store.tests[testId];
  if (!test) {
    return res.status(404).json({ message: 'Test not found.' });
  }

  delete store.tests[testId];
  delete store.responderTokens[test.responderToken];
  if (store.ownerTokens[test.ownerToken]) {
    store.ownerTokens[test.ownerToken] = store.ownerTokens[test.ownerToken].filter(
      (id) => id !== testId
    );
  }
  saveStore();

  res.json({ success: true, message: 'Test deleted successfully by admin.' });
});

// ==========================================
// STATIC FILES & SPA FALLBACK / VITE MIDDLEWARE
// ==========================================

async function startServer() {
  if (!IS_PROD) {
    // Development mode: Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve dist files
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Friendship Test server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
