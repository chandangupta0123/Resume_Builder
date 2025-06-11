import os
from flask import Flask, request, jsonify, send_file
from fpdf import FPDF
from dotenv import load_dotenv
import google.generativeai as genai
from langchain.prompts import PromptTemplate

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)

model = genai.GenerativeModel("gemini-pro")

def build_prompt(data):
    return f"""
You are a professional resume writer.

Create a resume with:
Name: {data['name']}
Role: {data['role']}
Experience: {data['experience']}
Skills: {', '.join(data['skills'])}
Education: {data['education']}

Format: Name → Summary → Skills (bullet) → Experience → Education
"""

def build_feedback_prompt(data):
    return f"""
You are a resume coach.

Give 3 improvement suggestions for the following details:

Name: {data['name']}
Role: {data['role']}
Experience: {data['experience']}
Skills: {data['skills']}
Education: {data['education']}
"""

class ResumePDF:
    def __init__(self, text):
        self.text = text

    def generate(self, filename="resume.pdf"):
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        for line in self.text.split("\n"):
            pdf.multi_cell(0, 10, line)
        pdf.output(filename)
        return filename

@app.route("/generate-resume", methods=["POST"])
def generate_resume():
    try:
        data = request.get_json()
        prompt = build_prompt(data)
        response = model.generate_content(prompt)
        resume_text = response.text

        ResumePDF(resume_text).generate("resume.pdf")
        return jsonify({"text": resume_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-suggestions", methods=["POST"])
def get_suggestions():
    try:
        data = request.get_json()
        feedback_prompt = build_feedback_prompt(data)
        response = model.generate_content(feedback_prompt)
        return jsonify({"suggestion": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download-resume", methods=["GET"])
def download_resume():
    try:
        return send_file("resume.pdf", as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
