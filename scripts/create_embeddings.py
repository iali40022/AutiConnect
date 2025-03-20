import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load the model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Paths to the cleaned text files
processed_files = [
    os.path.join("data", "processed", "communication_tips_cleaned.txt"),
    os.path.join("data", "processed", "visual_supports_cleaned.txt"),  # Add the new file
    os.path.join("data", "processed", "language_dev_in_autistic_children_refined.txt")
]

# Initialize storage for text chunks and embeddings
all_chunks = []
all_embeddings = []

for file_path in processed_files:
    if os.path.exists(file_path):  # Ensure file exists before processing
        with open(file_path, "r", encoding="utf-8") as file:
            text = file.read().strip()

        # Split text into smaller chunks
        chunks = text.split("\n\n")  
        all_chunks.extend(chunks)  

        # Generate embeddings
        embeddings = model.encode(chunks, convert_to_numpy=True)
        all_embeddings.append(embeddings)

# Convert embeddings list to a NumPy array
if all_embeddings:
    all_embeddings = np.vstack(all_embeddings)

    # Create FAISS index
    dimension = all_embeddings.shape[1]  
    index = faiss.IndexFlatL2(dimension)  
    index.add(all_embeddings)

    # Save the FAISS index
    faiss.write_index(index, os.path.join("data", "processed", "communication_embeddings.index"))

    # Save all text chunks for retrieval mapping
    with open(os.path.join("data", "processed", "chunked_texts.txt"), "w", encoding="utf-8") as f:
        for chunk in all_chunks:
            f.write(chunk + "\n---\n")

    print("✅ Embeddings for all documents generated and stored successfully.")

else:
    print("⚠️ No valid text files found for embedding.")
