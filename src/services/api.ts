import {
  PublicTest,
  ResponderAnswerSubmission,
  SubmitResponse,
  OwnerTestSummary,
  OwnerTestDetail,
  OwnerAnswerReviewData,
  QuestionDraft
} from '../types';

const OWNER_TOKEN_KEY = 'friendship_test_owner_tokens';

// Storage helper for owner tokens (maps testId or global session)
export function getStoredOwnerTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(OWNER_TOKEN_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOwnerToken(testId: string, token: string) {
  try {
    const tokens = getStoredOwnerTokens();
    tokens[testId] = token;
    tokens['latest'] = token;
    localStorage.setItem(OWNER_TOKEN_KEY, JSON.stringify(tokens));
  } catch (err) {
    console.error('Failed to save owner token', err);
  }
}

export function getOwnerTokenForTest(testId?: string): string | null {
  const tokens = getStoredOwnerTokens();
  if (testId && tokens[testId]) return tokens[testId];
  return tokens['latest'] || null;
}

const API_BASE = '/api';

export async function fetchPublicTest(token: string): Promise<PublicTest> {
  const res = await fetch(`${API_BASE}/public/tests/${encodeURIComponent(token)}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'This friendship test doesn\'t exist or is no longer available.');
  }
  return res.json();
}

export async function submitPublicAnswers(
  token: string,
  answers: ResponderAnswerSubmission[]
): Promise<SubmitResponse> {
  const res = await fetch(`${API_BASE}/public/tests/${encodeURIComponent(token)}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong while submitting your answers.');
  }
  return data;
}

export async function createOwnerTest(payload: {
  ownerName: string;
  friendName: string;
  title?: string;
  description?: string;
  questions: Omit<QuestionDraft, 'id'>[];
}): Promise<{
  test: OwnerTestSummary;
  ownerToken: string;
  shareUrl: string;
  responderToken: string;
}> {
  const res = await fetch(`${API_BASE}/owner/tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create friendship test.');
  }

  // Save token locally
  if (data.test?.id && data.ownerToken) {
    saveOwnerToken(data.test.id, data.ownerToken);
  }

  return data;
}

export async function fetchOwnerTests(): Promise<OwnerTestSummary[]> {
  const tokens = getStoredOwnerTokens();
  const tokenList = Array.from(new Set(Object.values(tokens))).filter(Boolean);

  const res = await fetch(`${API_BASE}/owner/tests`, {
    headers: {
      'Authorization': `Bearer ${tokenList.join(',')}`
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return [];
    }
    throw new Error('Failed to load your tests.');
  }
  return res.json();
}

export async function fetchOwnerTestDetail(testId: string): Promise<OwnerTestDetail> {
  const token = getOwnerTokenForTest(testId);
  const res = await fetch(`${API_BASE}/owner/tests/${encodeURIComponent(testId)}`, {
    headers: {
      'Authorization': `Bearer ${token || ''}`
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('You don\'t have permission to view this test.');
    }
    throw new Error('This friendship test was not found.');
  }
  return res.json();
}

export async function fetchOwnerAnswers(testId: string): Promise<OwnerAnswerReviewData> {
  const token = getOwnerTokenForTest(testId);
  const res = await fetch(`${API_BASE}/owner/tests/${encodeURIComponent(testId)}/answers`, {
    headers: {
      'Authorization': `Bearer ${token || ''}`
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('You don\'t have permission to view this answer review.');
    }
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Answer review not ready yet.');
  }
  return res.json();
}

export async function rotateResponderLink(testId: string): Promise<{
  responderToken: string;
  shareUrl: string;
}> {
  const token = getOwnerTokenForTest(testId);
  const res = await fetch(`${API_BASE}/owner/tests/${encodeURIComponent(testId)}/rotate-link`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || ''}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to generate a new responder link.');
  }
  return res.json();
}

export async function deleteOwnerTest(testId: string): Promise<void> {
  const token = getOwnerTokenForTest(testId);
  const res = await fetch(`${API_BASE}/owner/tests/${encodeURIComponent(testId)}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token || ''}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to delete test.');
  }
}
