import json
import os
import time
from collections import defaultdict

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

load_dotenv()

# ─── Setup ────────────────────────────────────────────────────────────────────

# ───────────────────
# Käynnistä backend komennolla uvicorn backendMain:app --reload 
# ───────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-lite")

app = FastAPI(title="LLM Chat API")

# Allow requests from the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request model ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []   # [{"role": "user"|"model", "parts": ["..."]}]
    session_id: str = "default"


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(request: ChatRequest):

    chat_session = model.start_chat(history=request.history)
    response = chat_session.send_message(request.message)
    usage = response.usage_metadata

    return {
        "response": response.text,
        }


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    def generate():
        chat_session = model.start_chat(history=request.history)
        response = chat_session.send_message(request.message, stream=True)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # tells nginx: don't buffer this
        },
    )
