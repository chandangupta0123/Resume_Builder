from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from fpdf import FPDF
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app)

model = genai.GenerativeModel("gemini-pro")


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


def build_prompt(data):
    return f"""
You are a professional resume writer.

Generate a clean, professional resume based on the following structured input:

Name: {data['name']}
Role: {data['role']}
Contact: {data['contact']}
Location: {data['location']}

EDUCATION:
{data['education']}
College: {data['college']}
School: {data['school']}

SKILLS:
Languages: {data['languages']}
Tools: {data['tools']}
Mathematics: {data['mathSkills']}
Soft Skills: {data['softSkills']}

COMPETITIVE PROGRAMMING:
Ratings: {data['cpRanks']}
Contests: {data['cpContests']}

PROBLEM SOLVING:
{data['problemStats']}

PROJECTS:
{data['projects']}

POSITIONS OF RESPONSIBILITY:
{data['por']}

Use bullet points where relevant and maintain a professional tone.
"""


@app.route("/generate-resume", methods=["POST"])
def generate_resume():
    try:
        data = request.get_json()
        prompt = build_prompt(data)
        response = model.generate_content(prompt)
        resume_text = getattr(response, "text", "Error: No response text.")
        ResumePDF(resume_text).generate("resume.pdf")
        return jsonify({"text": resume_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/improve-section", methods=["POST"])
def improve_section():
    try:
        data = request.get_json()
        section = data["section"]
        content = data["text"]
        prompt = f"""You are a resume coach.
Improve the following section of a resume titled "{section}":
---
{content}
---
Return a clean, improved version with professional phrasing, keeping it brief and impactful."""
        response = model.generate_content(prompt)
        return jsonify({"suggestion": getattr(response, "text", "No suggestion returned.")})
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


