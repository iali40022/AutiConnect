import PyPDF2
import os
import re

def extract_text_from_pdf(pdf_path):
    """Extracts and cleans text from a given PDF file, ensuring proper formatting."""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

    # Step 1: Remove unwanted metadata, links, and timestamps
    text = re.sub(r'https?://\S+', '', text)  # Remove URLs
    text = re.sub(r'\d{1,2}/\d{1,2}/\d{2,4}, \d{1,2}:\d{2} (AM|PM)', '', text)  # Remove timestamps
    text = re.sub(r'Page \d+ of \d+', '', text)  # Remove page numbers
    text = re.sub(r'Related guides.*', '', text, flags=re.DOTALL)  # Remove navigation links and footers

    # Step 2: Fix broken lines (join words split across lines)
    text = re.sub(r'(?<!\n)\n(?!\n)', ' ', text)  # Convert single newlines to spaces

    # Step 3: Ensure **Headings** are separated properly
    text = re.sub(r'([a-z])([A-Z])', r'\1\n\n\2', text)  # Add line breaks before capitalized words

    # Step 4: Ensure **Bullet Points** stay on separate lines
    text = re.sub(r'•\s?', '\n• ', text)  # Add newlines before bullet points
    text = re.sub(r'(\n• [^\n]+)(?!\n)', r'\1\n', text)  # Ensure each bullet point is on a separate line

    # Step 5: Ensure **Section Headings are Clear**
    text = re.sub(r'(\n[A-Za-z ]{3,}):', r'\n\n\1:', text)  # Add extra space before headings
    text = re.sub(r'(\n[A-Za-z ]{3,})\s{2,}', r'\n\n\1\n', text)  # Ensure proper spacing around section headers

    # Step 6: Remove excessive newlines
    text = re.sub(r'\n+', '\n', text).strip()

    return text

# Specify the path to your new refined PDF
pdf_file_path = os.path.join("data", "raw", "Self_Injurious_Behaviour_Refined.pdf ")

# Extract and clean text
cleaned_text = extract_text_from_pdf(pdf_file_path)

# Save cleaned text as a processed file
output_path = os.path.join("data", "processed", "self_injurious_behaviour_refined.txt")
with open(output_path, "w", encoding="utf-8") as file:
    file.write(cleaned_text)

print("Text extraction completed. Cleaned text saved to:", output_path)
