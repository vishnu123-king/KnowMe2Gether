export type QuestionType = 'text' | 'multiple_choice' | 'yes_no';

export interface QuestionDraft {
  id: string;
  type: QuestionType;
  text: string;
  order: number;
  // For multiple choice
  options: string[];
  // For multiple choice / yes-no
  correctAnswer: string;
  // For text questions: primary answer + optional extra accepted answers
  acceptedAnswers: string[];
}

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  text: string;
  order: number;
  options?: string[]; // ONLY for multiple_choice. NEVER include correct answers!
}

export interface PublicTest {
  id: string;
  title: string;
  ownerName: string;
  friendName: string;
  description?: string;
  completed: boolean;
  questions: PublicQuestion[];
}

export interface ResponderAnswerSubmission {
  questionId: string;
  answerText: string;
}

export interface SubmitResponse {
  success: boolean;
  message: string;
}

export interface OwnerTestSummary {
  id: string;
  title: string;
  ownerName: string;
  friendName: string;
  description?: string;
  questionCount: number;
  status: 'waiting' | 'completed';
  createdAt: string;
  completedAt?: string | null;
  responderToken: string;
  shareUrl: string;
}

export interface OwnerTestDetail extends OwnerTestSummary {
  questions: {
    id: string;
    type: QuestionType;
    text: string;
    order: number;
    options: string[];
    correctAnswer: string;
    acceptedAnswers: string[];
  }[];
}

export interface OwnerAnswerReviewItem {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  expectedAnswer: string;
  acceptedAnswers: string[];
  responderAnswer: string;
  isMatch?: boolean;
}

export interface OwnerAnswerReviewData {
  summary: {
    total: number;
    completedAt: string;
  };
  answers: OwnerAnswerReviewItem[];
}
