import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load FAISS index and corresponding texts
index = faiss.read_index("data/processed/communication_embeddings.index")

# Load text chunks
with open("data/processed/chunked_texts.txt", "r", encoding="utf-8") as file:
    chunks = file.read().split("\n---\n")  # Ensure correct splitting

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

def query_faiss(query, top_k=3):  # Adjusted to 3 for more relevant results
    """Retrieve top_k most relevant text chunks."""
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, top_k)

    retrieved_texts = [chunks[i] for i in indices[0] if i < len(chunks)]
    
    return retrieved_texts  # Return a list instead of merging everything

# Prompt user for a query
while True:
    query = input("\nEnter your query (or type 'exit' to quit): ").strip()
    if query.lower() == "exit":
        print("Exiting query tool.")
        break
    
    retrieved_sections = query_faiss(query, top_k=3)

    print("\n🔍 **Top Matching Sections:**\n")

    for idx, section in enumerate(retrieved_sections, start=1):
        print(f"📌 **Section {idx}:**\n{section.strip()}\n")
        print("-" * 50)  # Adds a visual separator for readability
