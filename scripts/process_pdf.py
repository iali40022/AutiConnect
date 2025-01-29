import PyPDF2
import os

def extract_text_from_pdf(pdf_path):
    """Extracts text from a given PDF file."""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    return text

# Specify the path to your PDF file
pdf_file_path = os.path.join("data", "raw", "Communication tips.pdf")

# Extract text
extracted_text = extract_text_from_pdf(pdf_file_path)

# Save the extracted text as a processed file
output_path = os.path.join("data", "processed", "communication_tips.txt")
with open(output_path, "w", encoding="utf-8") as file:
    file.write(extracted_text)

print("Text extraction completed. Saved to:", output_path)
