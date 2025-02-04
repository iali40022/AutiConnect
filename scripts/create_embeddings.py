import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load the model (this will download if not already cached)
model = SentenceTransformer("all-MiniLM-L6-v2")

# Path to the cleaned text file
cleaned_text_path = os.path.join("data", "processed", "communication_tips_cleaned.txt")

# Read the cleaned text
with open(cleaned_text_path, "r", encoding="utf-8") as file:
    text = file.read().strip()

# Split text into smaller chunks for embedding (adjust as needed)
chunks = text.split("\n\n")  # Splitting by paragraphs

# Generate embeddings
embeddings = model.encode(chunks, convert_to_numpy=True)

# Create FAISS index (for fast similarity search)
dimension = embeddings.shape[1]  # Get the embedding size
index = faiss.IndexFlatL2(dimension)  # L2 similarity search
index.add(embeddings)

# Save the FAISS index
faiss.write_index(index, os.path.join("data", "processed", "communication_embeddings.index"))

# Save chunked text for retrieval mapping
with open(os.path.join("data", "processed", "chunked_texts.txt"), "w", encoding="utf-8") as f:
    for chunk in chunks:
        f.write(chunk + "\n---\n")

print("✅ Embeddings generated and stored successfully.")
