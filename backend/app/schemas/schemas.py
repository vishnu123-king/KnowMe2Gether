from typing import List, Optional
from pydantic import BaseModel, Field

# Public Schemas
class PublicQuestionSchema(BaseModel):
    id: str
    type: str
    text: str
    order: int
    options: Optional[List[str]] = None

class PublicTestResponse(BaseModel):
    id: str
    title: str
    ownerName: str
    friendName: str
    description: Optional[str] = None
    completed: bool
    questions: List[PublicQuestionSchema]

class AnswerSubmissionItem(BaseModel):
    questionId: str
    answerText: str

class PublicSubmitRequest(BaseModel):
    answers: List[AnswerSubmissionItem]

class PublicSubmitResponse(BaseModel):
    success: bool = True
    message: str = "Answers submitted successfully"

# Owner Schemas
class CreateQuestionDraft(BaseModel):
    type: str = "text"
    text: str
    order: int
    options: List[str] = []
    correctAnswer: str
    acceptedAnswers: List[str] = []

class CreateTestRequest(BaseModel):
    ownerName: str
    friendName: str
    title: Optional[str] = "How Well Do You Know Me?"
    description: Optional[str] = ""
    questions: List[CreateQuestionDraft]

class OwnerTestSummary(BaseModel):
    id: str
    title: str
    ownerName: str
    friendName: str
    description: Optional[str] = None
    questionCount: int
    status: str
    createdAt: str
    completedAt: Optional[str] = None
    responderToken: str
    shareUrl: str

class CreateTestResponse(BaseModel):
    test: OwnerTestSummary
    ownerToken: str
    responderToken: str
    shareUrl: str

class ScoreCategory(BaseModel):
    title: str
    emoji: str
    description: str
    color: str

class OwnerResultResponse(BaseModel):
    testId: str
    status: str
    score: int
    total: int
    percentage: int
    category: ScoreCategory
    completedAt: str

class OwnerAnswerReviewItem(BaseModel):
    questionId: str
    questionText: str
    questionType: str
    expectedAnswer: str
    acceptedAnswers: List[str]
    responderAnswer: str
    isCorrect: bool

class OwnerAnswerSummary(BaseModel):
    total: int
    completedAt: str

class OwnerAnswerReviewResponse(BaseModel):
    summary: OwnerAnswerSummary
    answers: List[OwnerAnswerReviewItem]
