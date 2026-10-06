import os
import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import (
    Owner,
    Test,
    Question,
    QuestionOption,
    AcceptedAnswer,
)
from backend.app.schemas.schemas import (
    CreateTestRequest,
    CreateTestResponse,
    OwnerTestSummary,
    OwnerResultResponse,
    OwnerAnswerReviewResponse,
    OwnerAnswerReviewItem,
    OwnerAnswerSummary,
    ScoreCategory,
)
from backend.app.services.scoring import get_score_category

router = APIRouter(prefix="/api/owner", tags=["owner"])

def get_base_url(request: Request) -> str:
    # 1. Check PUBLIC_BASE_URL (if provided and valid)
    env_base = (os.getenv("PUBLIC_BASE_URL") or "").strip()
    is_render = bool(os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_URL") or os.getenv("RENDER_SERVICE_ID"))
    if env_base and not (is_render and "localhost" in env_base):
        return env_base.rstrip("/")

    # 2. Check Render injected external URL (e.g. https://your-app.onrender.com)
    render_url = (os.getenv("RENDER_EXTERNAL_URL") or "").strip()
    if render_url:
        return render_url.rstrip("/")

    # 3. Dynamic reverse proxy headers from incoming request
    headers = request.headers
    host = headers.get("x-forwarded-host") or headers.get("host") or str(request.base_url.netloc)
    proto = headers.get("x-forwarded-proto") or ("https" if "onrender.com" in host else request.url.scheme)
    return f"{proto}://{host}".rstrip("/")

def get_current_owner_tokens(authorization: str = Header(None)) -> List[str]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Owner token required."
        )
    raw = authorization.replace("Bearer ", "").strip()
    tokens = [t.strip() for t in raw.split(",") if t.strip()]
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid token format."
        )
    return tokens

@router.post("/tests", response_model=CreateTestResponse, status_code=status.HTTP_201_CREATED)
def create_test(payload: CreateTestRequest, request: Request, db: Session = Depends(get_db)):
    if not payload.ownerName.strip() or not payload.friendName.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner name and friend name are required."
        )
    if len(payload.questions) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 3 questions are required."
        )

    # Create Owner record
    owner_id = "owner_" + uuid.uuid4().hex[:12]
    owner_token = uuid.uuid4().hex + uuid.uuid4().hex
    owner = Owner(
        id=owner_id,
        name=payload.ownerName.strip(),
        token=owner_token,
    )
    db.add(owner)

    test_id = "test_" + uuid.uuid4().hex[:10]
    responder_token = uuid.uuid4().hex[:10]

    test = Test(
        id=test_id,
        owner_id=owner_id,
        title=payload.title.strip() if payload.title else "How Well Do You Know Me?",
        description=payload.description.strip() if payload.description else "",
        responder_name=payload.friendName.strip(),
        responder_token=responder_token,
        status="waiting",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(test)

    # Insert Questions
    for idx, q_draft in enumerate(payload.questions):
        q_id = "q_" + uuid.uuid4().hex[:10]
        q = Question(
            id=q_id,
            test_id=test_id,
            question_type=q_draft.type,
            question_text=q_draft.text.strip(),
            question_order=idx + 1,
            correct_answer=q_draft.correctAnswer.strip(),
        )
        db.add(q)

        # Options for multiple choice
        if q_draft.type == "multiple_choice":
            for opt_text in q_draft.options:
                trimmed = opt_text.strip()
                db.add(QuestionOption(
                    id="opt_" + uuid.uuid4().hex[:10],
                    question_id=q_id,
                    option_text=trimmed,
                    is_correct=(trimmed == q_draft.correctAnswer.strip()),
                ))

        # Accepted answers
        for acc in q_draft.acceptedAnswers:
            trimmed = acc.strip()
            if trimmed:
                db.add(AcceptedAnswer(
                    id="acc_" + uuid.uuid4().hex[:10],
                    question_id=q_id,
                    answer_text=trimmed,
                ))

    db.commit()
    db.refresh(test)

    base_url = get_base_url(request)
    share_url = f"{base_url}/test/{responder_token}"

    summary = OwnerTestSummary(
        id=test.id,
        title=test.title,
        ownerName=owner.name,
        friendName=test.responder_name,
        description=test.description,
        questionCount=len(test.questions),
        status=test.status,
        createdAt=test.created_at.isoformat(),
        completedAt=test.completed_at.isoformat() if test.completed_at else None,
        responderToken=responder_token,
        shareUrl=share_url,
    )

    return CreateTestResponse(
        test=summary,
        ownerToken=owner_token,
        responderToken=responder_token,
        shareUrl=share_url,
    )

@router.get("/tests", response_model=List[OwnerTestSummary])
def list_owner_tests(
    request: Request,
    tokens: List[str] = Depends(get_current_owner_tokens),
    db: Session = Depends(get_db)
):
    owners = db.query(Owner).filter(Owner.token.in_(tokens)).all()
    owner_ids = [o.id for o in owners]

    tests = (
        db.query(Test)
        .filter(Test.owner_id.in_(owner_ids))
        .order_by(Test.created_at.desc())
        .all()
    )

    base_url = get_base_url(request)
    result = []
    for t in tests:
        result.append(
            OwnerTestSummary(
                id=t.id,
                title=t.title,
                ownerName=t.owner.name,
                friendName=t.responder_name,
                description=t.description,
                questionCount=len(t.questions),
                status=t.status,
                createdAt=t.created_at.isoformat(),
                completedAt=t.completed_at.isoformat() if t.completed_at else None,
                responderToken=t.responder_token,
                shareUrl=f"{base_url}/test/{t.responder_token}",
            )
        )
    return result

@router.get("/tests/{id}", response_model=dict)
def get_owner_test_detail(
    id: str,
    request: Request,
    tokens: List[str] = Depends(get_current_owner_tokens),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    if test.owner.token not in tokens:
        raise HTTPException(status_code=403, detail="You don't have permission to view this test.")

    base_url = get_base_url(request)
    questions_data = []
    for q in test.questions:
        questions_data.append({
            "id": q.id,
            "type": q.question_type,
            "text": q.question_text,
            "order": q.question_order,
            "options": [opt.option_text for opt in q.options],
            "correctAnswer": q.correct_answer,
            "acceptedAnswers": [acc.answer_text for acc in q.accepted_answers],
        })

    return {
        "id": test.id,
        "title": test.title,
        "ownerName": test.owner.name,
        "friendName": test.responder_name,
        "description": test.description,
        "questionCount": len(test.questions),
        "status": test.status,
        "createdAt": test.created_at.isoformat(),
        "completedAt": test.completed_at.isoformat() if test.completed_at else None,
        "responderToken": test.responder_token,
        "shareUrl": f"{base_url}/test/{test.responder_token}",
        "questions": questions_data,
    }

@router.get("/tests/{id}/results", response_model=OwnerResultResponse)
def get_owner_test_results(
    id: str,
    tokens: List[str] = Depends(get_current_owner_tokens),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    if test.owner.token not in tokens:
        raise HTTPException(status_code=403, detail="You don't have permission to view these results.")

    if test.status != "completed" or not test.submissions:
        raise HTTPException(status_code=400, detail="Friend has not completed the test yet.")

    submission = test.submissions[-1]
    cat_dict = get_score_category(submission.percentage)

    return OwnerResultResponse(
        testId=test.id,
        status=test.status,
        score=submission.score,
        total=len(test.questions),
        percentage=submission.percentage,
        category=ScoreCategory(**cat_dict),
        completedAt=submission.submitted_at.isoformat(),
    )

@router.get("/tests/{id}/answers", response_model=OwnerAnswerReviewResponse)
def get_owner_test_answers(
    id: str,
    tokens: List[str] = Depends(get_current_owner_tokens),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    if test.owner.token not in tokens:
        raise HTTPException(status_code=403, detail="You don't have permission to view this review.")

    if test.status != "completed" or not test.submissions:
        raise HTTPException(status_code=400, detail="Friend has not completed the test yet.")

    submission = test.submissions[-1]
    cat_dict = get_score_category(submission.percentage)

    ans_items = []
    for q in test.questions:
        matching_ans = next((a for a in submission.answers if a.question_id == q.id), None)
        ans_items.append(
            OwnerAnswerReviewItem(
                questionId=q.id,
                questionText=q.question_text,
                questionType=q.question_type,
                expectedAnswer=q.correct_answer,
                acceptedAnswers=[acc.answer_text for acc in q.accepted_answers],
                responderAnswer=matching_ans.answer_text if matching_ans else "",
                isCorrect=matching_ans.is_correct if matching_ans else False,
            )
        )

    return OwnerAnswerReviewResponse(
        summary=OwnerAnswerSummary(
            total=len(test.questions),
            completedAt=submission.submitted_at.isoformat(),
        ),
        answers=ans_items,
    )

@router.post("/tests/{id}/rotate-link")
def rotate_test_link(
    id: str,
    request: Request,
    tokens: List[str] = Depends(get_current_owner_tokens),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    if test.owner.token not in tokens:
        raise HTTPException(status_code=403, detail="You don't have permission to modify this test.")

    new_token = uuid.uuid4().hex[:10]
    test.responder_token = new_token
    db.commit()

    base_url = get_base_url(request)
    return {
        "responderToken": new_token,
        "shareUrl": f"{base_url}/test/{new_token}",
    }

@router.delete("/tests/{id}")
def delete_test(
    id: str,
    tokens: List[str] = Depends(get_current_owner_tokens),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")

    if test.owner.token not in tokens:
        raise HTTPException(status_code=403, detail="You don't have permission to delete this test.")

    db.delete(test)
    db.commit()
    return {"success": True, "message": "Test deleted successfully."}
