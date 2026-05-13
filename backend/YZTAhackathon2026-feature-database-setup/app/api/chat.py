from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.agents import gemini_service
from app.agents import admin_service

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini"   # "gemini" | "gemma"
    session_id: Optional[str] = None


class CustomerChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None
    session_id: Optional[str] = None


@router.post("/")
async def admin_chat(body: ChatRequest):
    """Admin paneli — Gemini agent (DB tool calling) veya yerel Gemma4."""
    if body.model == "gemma":
        reply = await admin_service.chat_with_admin(body.message, body.session_id, use_ollama=True)
    else:
        reply = await admin_service.chat_with_admin(body.message, body.session_id)
    return {"reply": reply, "model": body.model}


@router.post("/customer")
async def customer_chat(body: CustomerChatRequest):
    """Müşteri chatbotu — function calling ile sipariş ve stok sorgulama."""
    reply = await gemini_service.chat_with_agent(body.message, body.customer_id, body.session_id)
    return {"reply": reply}
