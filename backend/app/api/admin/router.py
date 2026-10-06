import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import Test, Owner, Submission

router = APIRouter(prefix="/api/admin", tags=["admin"])

ADMIN_SECRET = os.getenv("ADMIN_PASSWORD", "admin123")

class AdminLoginRequest(BaseModel):
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: str

class AdminTestItem(BaseModel):
    id: str
    title: str
    ownerName: str
    friendName: str
    questionCount: int
    status: str
    createdAt: str
    completedAt: Optional[str] = None
    shareUrl: str

class AdminStatsResponse(BaseModel):
    totalTests: int
    completedTests: int
    waitingTests: int
    tests: List[AdminTestItem]

def verify_admin_token(authorization: str = Header(None)) -> bool:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Admin token required."
        )
    token = authorization.replace("Bearer ", "").strip()
    # Simple token validation (in production, use JWT or secure session)
    if token != "secret_admin_session_token_xyz987":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid admin token."
        )
    return True

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest):
    if payload.password != ADMIN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin password."
        )
    return {
        "success": True,
        "token": "secret_admin_session_token_xyz987"
    }

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    authorized: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    tests = db.query(Test).order_by(Test.created_at.desc()).all()
    
    total = len(tests)
    completed = sum(1 for t in tests if t.status == "completed")
    waiting = total - completed

    test_items = []
    for t in tests:
        # Base url fallback
        base_url = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:3000").rstrip("/")
        test_items.append(
            AdminTestItem(
                id=t.id,
                title=t.title,
                ownerName=t.owner.name if t.owner else "Unknown",
                friendName=t.responder_name,
                questionCount=len(t.questions),
                status=t.status or "waiting",
                createdAt=t.created_at.isoformat() if t.created_at else "",
                completedAt=t.completed_at.isoformat() if t.completed_at else None,
                shareUrl=f"{base_url}/test/{t.responder_token}",
            )
        )

    return {
        "totalTests": total,
        "completedTests": completed,
        "waitingTests": waiting,
        "tests": test_items,
    }

@router.delete("/tests/{test_id}")
def delete_admin_test(
    test_id: str,
    authorized: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")
    
    db.delete(test)
    db.commit()
    return {"success": True, "message": "Test deleted successfully by admin."}
