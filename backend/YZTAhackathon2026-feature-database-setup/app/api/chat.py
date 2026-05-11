from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    model: Optional[str] = "gemini"  # "gemini" | "gemma"


class CustomerChatRequest(BaseModel):
    message: str
    customer_id: Optional[str] = None


@router.post("/")
async def admin_chat(body: ChatRequest):
    if body.model == "gemma":
        reply = await chat_service.chat_ollama(body.message)
    else:
        reply = await chat_service.chat_gemini(body.message)
    return {"reply": reply, "model": body.model}


@router.post("/customer")
async def customer_chat(body: CustomerChatRequest):
    reply = await chat_service.chat_customer(body.message, body.customer_id)
    return {"reply": reply}
