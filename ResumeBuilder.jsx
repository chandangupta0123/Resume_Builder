import React, { useState } from "react";

function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "",
    role: "",
    experience: "",
    skills: "",
    education: "",
    college: "",
    school: "",
    competitiveProgramming: "",
    problemSolving: "",
  });
  const [resumeText, setResumeText] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResumeText("Generating resume...");

    const res = await fetch("http://localhost:5000/generate-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()),
      }),
    });

    const data = await res.json();
    setResumeText(data.text || "Error generating resume.");
  };

  const getSuggestions = async () => {
    setSuggestion("Fetching suggestions...");
    const res = await fetch("http://localhost:5000/get-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSuggestion(data.suggestion || "No suggestions received.");
  };

  const downloadPDF = () => {
    window.open("http://localhost:5000/download-resume", "_blank");
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h2>🧠 AI Resume Builder (LangChain + Gemini)</h2>
      <form onSubmit={handleSubmit}>
        {[
          "name",
          "role",
          "experience",
          "skills",
          "education",
          "college",
          "school",
          "competitiveProgramming",
          "problemSolving",
        ].map((field) => (
          <div key={field} style={{ marginBottom: 10 }}>
            <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label><br />
            <textarea
              name={field}
              rows={3}
              placeholder={
                field === "skills"
                  ? "Comma separated"
                  : field === "competitiveProgramming"
                  ? "e.g., CF - Expert, LC - 2100"
                  : field === "problemSolving"
                  ? "e.g., LC: 500, CF: 300"
                  : ""
              }
              value={form[field]}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
        ))}
        <button type="submit">Generate Resume</button>
        <button type="button" onClick={getSuggestions} style={{ marginLeft: 10 }}>
          Suggest Improvements
        </button>
      </form>

      <h3>📄 Resume Preview</h3>
      <pre>{resumeText}</pre>

      <h3>💡 Suggestions</h3>
      <pre>{suggestion}</pre>

      <button onClick={downloadPDF} style={{ marginTop: 10 }}>
        Download PDF
      </button>
    </div>
  );
}

export default ResumeBuilder;
