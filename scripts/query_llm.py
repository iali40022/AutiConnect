import faiss
import numpy as np
import openai
import os
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load FAISS index and corresponding texts
index = faiss.read_index("data/processed/communication_embeddings.index")

# Load text chunks
with open("data/processed/chunked_texts.txt", "r", encoding="utf-8") as file:
    chunks = file.read().split("\n---\n")  # Ensure correct splitting

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load OpenAI API key from environment variable
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def query_faiss(query, top_k=5, relevance_threshold=0.6):  
    """Retrieve top_k most relevant text chunks, ensuring at least one result is returned."""
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, top_k)

    retrieved_texts = []
    for i, dist in zip(indices[0], distances[0]):
        if i < len(chunks) and dist < relevance_threshold:
            retrieved_texts.append(chunks[i])

    # Ensure at least one section is returned
    if not retrieved_texts and indices[0][0] < len(chunks):
        retrieved_texts.append(chunks[indices[0][0]])  # Take the best available match

    return retrieved_texts


def query_openai(context, user_query):
    """Generate a response from OpenAI based ONLY on the provided context."""
    messages = [
        {
            "role": "system",
            "content": (
                "You are an assistant that only answers questions using the provided context below. "
                "Do not answer based on prior knowledge. If the context is not relevant enough or doesn't answer the question, "
                "reply with: 'I’m sorry, I couldn’t find enough information to answer that based on the provided materials.'"
            )
        },
        {
            "role": "user",
            "content": f"Context:\n{context}\n\nQuestion: {user_query}"
        }
    ]

    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.2,  # Lower temperature makes responses more controlled
        max_tokens=500
    )

    return response.choices[0].message.content



# ✅ This only runs if the script is executed directly (not imported)
if __name__ == "__main__":
    while True:
        query = input("\nEnter your query (or type 'exit' to quit): ").strip()
        if query.lower() == "exit":
            print("Exiting query tool.")
            break
        
        retrieved_sections = query_faiss(query, top_k=5)

        if not retrieved_sections:
            print("\n⚠️ No highly relevant sections found. Try rewording your query.")
            continue

        print("\n🔍 **Top Matching Sections:**\n")

        for idx, section in enumerate(retrieved_sections, start=1):
            print(f"📌 **Section {idx}:**\n{section.strip()}\n")
            print("-" * 50)  

        combined_context = "\n\n".join(retrieved_sections)
        ai_response = query_openai(combined_context, query)

        print("\n💡 **AI-Generated Response:**\n")
        formatted_response = ai_response.replace("For example,", "**For example:**").replace("Additionally,", "**Additionally:**")
        print(f"📖 *Based on best practices and research, here are strategies to consider:*\n\n{formatted_response}")
        print("=" * 80)
