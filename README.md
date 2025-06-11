# 🧠 AI-Powered Resume Builder

An end-to-end resume builder using Google Gemini + React + Flask. Generate structured, professional resumes with AI-powered suggestions.

## 🌟 Features

- ✍️ Section-wise resume builder (Education, Skills, CP, Projects, etc.)
- 🤖 Gemini AI-powered suggestions per section
- 📄 PDF export using FPDF
- 🔄 React + Flask full-stack integration

## 🔧 Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Put your GOOGLE_API_KEY in .env
python app.py
