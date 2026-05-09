from fastapi import APIRouter
from pydantic import BaseModel
from app.agents import gemini_service

router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/")
async def chat_with_ai(req: ChatRequest):
    """Müşteri veya yöneticinin doğal dilde soru sorduğu endpoint."""
    reply = await gemini_service.ask_ai(req.message)
    return {"reply": reply}