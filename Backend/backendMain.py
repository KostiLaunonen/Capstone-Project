import os
import google.generativeai as genai
from google.generativeai import types as genai_types
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

load_dotenv()

# ─── Tools ────────────────────────────────────────────────────────────────────

def ddg_search(query: str):
    url = "https://api.duckduckgo.com/"
    params = {
        "q": query,
        "format": "json",
        "no_redirect": 1,
        "no_html": 1
    }

    r = requests.get(url, params=params)
    data = r.json()

    results = []

    # Abstract (Wikipedia-tyylinen yhteenveto)
    if data.get("AbstractText"):
        results.append({
            "title": data.get("Heading", "Result"),
            "url": data.get("AbstractURL")
        })

    # Related topics
    for item in data.get("RelatedTopics", [])[:5]:
        if isinstance(item, dict) and "Text" in item and "FirstURL" in item:
            results.append({
                "title": item["Text"],
                "url": item["FirstURL"]
            })

    return {"results": results}

# ─── Setup ────────────────────────────────────────────────────────────────────

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    tools=[ddg_search],
    system_instruction="Always use the ddg_search tool when the user asks for information."
)

app = FastAPI(title="LLM Chat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    session_id: str = "default"


# ─── Endpoint ────────────────────────────────────────────────────────────────

@app.post("/chat")
async def chat(request: ChatRequest):

    chat_session = model.start_chat(history=request.history)

    # 1) Mallin ensimmäinen vastaus
    response = chat_session.send_message(request.message)

    # 2) Etsi mahdollinen function_call
    call = None
    for part in response.candidates[0].content.parts:
        if getattr(part, "function_call", None):
            call = part.function_call
            break

    # 3) Jos työkalu kutsutaan
    if call and call.name == "ddg_search":
        tool_result = ddg_search(**dict(call.args))

        # 🔥 UUSI OIKEA TAPA: lähetä function_response dictinä
        response = chat_session.send_message({
            "function_response": {
                "name": call.name,
                "response": tool_result
            }
        })

    # 4) Kerää lopullinen tekstivastaus
    final_text = ""
    for part in response.candidates[0].content.parts:
        if getattr(part, "text", None):
            final_text += part.text

    return {
        "response": final_text,
        "used_tool": call is not None,
        "tool_name": call.name if call else None,
        "tool_args": dict(call.args) if call else None
    }
