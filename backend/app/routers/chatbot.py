from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatAskRequest, ChatAskResponse, ChatSessionOut, ChatMessageOut, ReferencedProductOut
from app.services.rag_service import RAGService
from app.services.recommendation_service import RecommendationService
from app.routers.auth import get_optional_user, get_current_user

router = APIRouter(prefix="/api/chat", tags=["AI Shopping Assistant"])

def _format_chat_message(m: ChatMessage) -> ChatMessageOut:
    return ChatMessageOut(
        id=m.id,
        role=m.role,
        message=m.message,
        created_at=m.created_at
    )

@router.post("/ask", response_model=ChatAskResponse)
def ask_assistant(
    request: ChatAskRequest,
    db: Session = Depends(get_db),
    optional_user=Depends(get_optional_user)
):
    """
    Primary RAG endpoint:
    Processes user queries, retrieves vector chunks and live SQL product information,
    and returns a factual response with grounded product references and source citations.
    """
    user_id = optional_user.id if optional_user else None
    result = RAGService.answer_query(
        db=db,
        query=request.message,
        session_id=request.session_id,
        user_id=user_id
    )
    return result

@router.get("/sessions", response_model=List[ChatSessionOut])
def list_chat_sessions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Returns past chat conversations for the authenticated user."""
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).order_by(ChatSession.created_at.desc()).all()
    out = []
    for s in sessions:
        msgs = [_format_chat_message(m) for m in s.messages]
        out.append(ChatSessionOut(
            id=s.id,
            user_id=s.user_id,
            created_at=s.created_at,
            messages=msgs
        ))
    return out

@router.get("/sessions/{session_id}", response_model=ChatSessionOut)
def get_chat_session(
    session_id: int,
    db: Session = Depends(get_db),
    optional_user=Depends(get_optional_user)
):
    """Retrieves full transcript turns for a specific chat session."""
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found")

    # If session is owned by a user, ensure only that user or an admin can access it
    if session.user_id and (
        not optional_user
        or (session.user_id != optional_user.id and optional_user.role != "admin")
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    msgs = [_format_chat_message(m) for m in session.messages]
    return ChatSessionOut(
        id=session.id,
        user_id=session.user_id,
        created_at=session.created_at,
        messages=msgs
    )

@router.post("/recommendations", response_model=List[ReferencedProductOut])
def quick_recommendations(
    query: str,
    limit: int = 4,
    db: Session = Depends(get_db)
):
    """Instant hybrid recommendations parsed from natural language request."""
    matching, intent = RecommendationService.get_recommendations(db, query, limit=limit)
    results = []
    for p in matching:
        results.append(ReferencedProductOut(
            id=p.id,
            name=p.name,
            brand=p.brand,
            price=p.price,
            stock_quantity=p.stock_quantity,
            image_url=p.image_url,
            specifications=p.specs_dict,
            reason=f"Top candidate matching '{query}'"
        ))
    return results
