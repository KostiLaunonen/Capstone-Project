# AI Assistant App Aimo (Gemini + FastAPI + Tool-Using Agent)

## Project Description

This project is an AI-powered chat assistant that allows users to interact with a large language model in a conversational interface. The assistant can answer general questions and also use an external search tool (DuckDuckGo API) to retrieve up-to-date information when needed.

Users interact with a simple chat UI, send messages, and receive AI-generated responses. Behind the scenes, the system dynamically decides when to use external tools to improve answer quality.

---

## Architecture Overview

**Frontend → FastAPI Backend → Google Gemini API → (optional tool) DuckDuckGo API**

### Flow:

React Frontend  
→ FastAPI Backend  
→ Gemini 2.5 Flash Model  
→ (optional function call) DuckDuckGo Search API  
→ Gemini processes tool result  
→ Final response returned to frontend

---

## Technical Choices

- **FastAPI**  
  Used for building a fast, lightweight backend API with async support.

- **Google Generative AI (Gemini 2.5 Flash)**  
  Core LLM used for generating responses and handling tool/function calling.

- **DuckDuckGo API (requests-based)**  
  Used as a simple external search tool to provide real-time information.

- **Pydantic**  
  Used for structured request validation in the API layer.

- **python-dotenv**  
  Used to manage environment variables securely (e.g., API keys).

- **CORS Middleware**  
  Enables communication between frontend (localhost:5173) and backend.

This architecture implements a lightweight AI agent that can decide when to use external tools dynamically.

---

## Setup and Running Instructions

```bash
# 1. Clone the repository
git clone https://github.com/KostiLaunonen/Capstone-Project
cd Capstone-Project
cd Backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows

### 3. Install backend dependencies
pip install fastapi uvicorn google-generativeai python-dotenv requests beautifulsoup4

# 4. Add environment variables (.env file)
# Create a .env file in the Backend folder and add:
GEMINI_API_KEY=your_api_key_here

# 5. Run backend
uvicorn backendMain:app --reload

# Backend runs at http://localhost:8000

# 6. Run frontend
cd ..
cd frontend
npm install
npm run dev

### Frontend runs at http://localhost:5173
```

## Known Limitations
- Only one tool (DuckDuckGo API) is used
- No persistent database for chat history
- Tool usage fully depends on model decisions
- Minimal error handling
- Not production-ready

## AI Tools Used
- ChatGPT (OpenAI)
- Used for debugging, structuring backend logic, and writing documentation.
- GitHub Copilot
- Used for boilerplate FastAPI code and import suggestions.
- Google Gemini documentation/examples
- Used to implement tool/function calling correctly.

- All AI-generated suggestions were reviewed and integrated manually.