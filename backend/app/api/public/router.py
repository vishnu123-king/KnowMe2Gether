import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from backend.app.database.session import get_db
from backend.app.models.models import Test, Submission, Answer
from backend.app.schemas.schemas import (
    PublicTestResponse,
    PublicQuestionSchema,
    PublicSubmitRequest,
    PublicSubmitResponse,
)
from backend.app.services.scoring import check_answer_match

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/tests/{token}", response_model=PublicTestResponse)
def get_public_test(token: str, db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.responder_token == token).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This friendship test doesn't exist or is no longer available."
        )

    if test.status == "completed":
        return PublicTestResponse(
            id=test.id,
            title=test.title,
            ownerName=test.owner.name,
            friendName=test.responder_name,
            description=test.description,
            completed=True,
            questions=[],
        )

    safe_questions = []
    for q in test.questions:
        options = [opt.option_text for opt in q.options] if q.question_type == "multiple_choice" else None
        safe_questions.append(
            PublicQuestionSchema(
                id=q.id,
                type=q.question_type,
                text=q.question_text,
                order=q.question_order,
                options=options,
            )
        )

    return PublicTestResponse(
        id=test.id,
        title=test.title,
        ownerName=test.owner.name,
        friendName=test.responder_name,
        description=test.description,
        completed=False,
        questions=safe_questions,
    )

@router.post("/tests/{token}/submit", response_model=PublicSubmitResponse)
def submit_public_answers(
    token: str,
    payload: PublicSubmitRequest,
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.responder_token == token).first()
    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This friendship test doesn't exist or is no longer available."
        )

    if test.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This test has already been submitted."
        )

    now = datetime.datetime.utcnow()
    total_count = len(test.questions)
    correct_count = 0

    submission_id = "sub_" + uuid.uuid4().hex[:12]
    submission = Submission(
        id=submission_id,
        test_id=test.id,
        submitted_at=now,
        score=0,
        percentage=0,
    )
    db.add(submission)

    for q in test.questions:
        submitted_item = next((a for a in payload.answers if a.questionId == q.id), None)
        resp_text = submitted_item.answerText.strip() if submitted_item else ""
        accepted_list = [acc.answer_text for acc in q.accepted_answers]

        is_correct = check_answer_match(
            question_type=q.question_type,
            correct_answer=q.correct_answer,
            accepted_answers=accepted_list,
            responder_answer=resp_text,
        )

        if is_correct:
            correct_count += 1

        answer = Answer(
            id="ans_" + uuid.uuid4().hex[:12],
            submission_id=submission_id,
            question_id=q.id,
            answer_text=resp_text,
            is_correct=is_correct,
        )
        db.add(answer)

    percentage = round((correct_count / total_count) * 100) if total_count > 0 else 0
    submission.score = correct_count
    submission.percentage = percentage

    test.status = "completed"
    test.completed_at = now

    db.commit()

    # CRITICAL PRIVACY: Return ONLY success response. NEVER return score or answers!
    return PublicSubmitResponse(
        success=True,
        message="Answers submitted successfully"
    )
