AutiConnect is an AI-powered web application designed to support parents, carers, and educators of autistic children. It allows users to ask questions and get answers that are accurate from reliable, educated sources of information.

Make sure to create a .env file with your OpenAI API key:
OPENAI_API_KEY=your-api-key

Create the same environment by running:
pip install -r requirements.txt

To run AutiConnect locally, follow these steps for both the backend and frontend.

Start the Backend (FastAPI)
Open a terminal and navigate to the backend directory.

Run the following command:
uvicorn auticonnect_web.main:app --reload
This will start the FastAPI server at http://127.0.0.1:8000.

Start the Frontend (React + Vite)
Open a separate terminal and navigate to the frontend directory.

Run the following command:
npm run dev
This will start the React frontend at http://localhost:5173.
Vite may assign a different port if 5173 is taken, so always check your terminal output for the actual address.
