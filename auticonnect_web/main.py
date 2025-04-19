from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scripts.query_llm import query_faiss, query_openai
from deep_translator import GoogleTranslator  # ✅ Add this

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AutiConnect API is running 🎉"}

# Updated to include language field
class QueryRequest(BaseModel):
    query: str
    language: str = "en"  # default to English if not provided

@app.post("/query")
def handle_query(req: QueryRequest):
    original_query = req.query
    user_language = req.language or "en"

    # Step 1: Translate query to English if needed
    if user_language != "en":
        try:
            translated_query = GoogleTranslator(source='auto', target='en').translate(original_query)
        except Exception as e:
            return {"answer": f"❌ Translation error: {str(e)}"}

    else:
        translated_query = original_query

    # Step 2: Retrieve relevant sections using translated query
    retrieved_sections = query_faiss(translated_query, top_k=5)
    if not retrieved_sections:
        return {"answer": "Sorry, I couldn’t find relevant information. Try rephrasing your question."}

    context = "\n\n".join(retrieved_sections)

    # Step 3: Ask OpenAI
    english_answer = query_openai(context, translated_query)

    # Step 4: Translate answer back to user language (if needed)
    if user_language != "en":
        try:
            final_answer = GoogleTranslator(source='en', target=user_language).translate(english_answer)
        except Exception as e:
            final_answer = f"✅ English Answer:\n{english_answer}\n\n⚠️ But couldn't translate it due to: {str(e)}"
    else:
        final_answer = english_answer

    return {
        "top_sections": retrieved_sections,
        "answer": final_answer
    }
