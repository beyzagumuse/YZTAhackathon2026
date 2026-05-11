from fastapi import APIRouter
from pydantic import BaseModel
from app.agents.gemini_service import chat_with_agent

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    """Kullanıcı mesajını alır, yapay zekaya iletir ve cevabı döner."""
    reply = await chat_with_agent(request.message)
    return {"reply": reply}