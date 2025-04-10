from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware  # ✅ Added for CORS support
from pydantic import BaseModel
from scripts.query_llm import query_faiss, query_openai  # reuse your existing logic!

app = FastAPI()

# ✅ Allow requests from the frontend (Vite on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust if frontend runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AutiConnect API is running 🎉"}

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
def handle_query(req: QueryRequest):
    # Step 1: Retrieve relevant sections
    retrieved_sections = query_faiss(req.query, top_k=5)
    if not retrieved_sections:
        return {"response": "Sorry, I couldn’t find relevant information. Try rephrasing your question."}
    
    # Step 2: Combine context and send to OpenAI
    context = "\n\n".join(retrieved_sections)
    answer = query_openai(context, req.query)

    return {
        "top_sections": retrieved_sections,
        "answer": answer
    }
