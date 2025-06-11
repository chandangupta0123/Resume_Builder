import React, { useState } from "react";

function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "", role: "", contact: "", location: "",

    // Education
    education: "", college: "", school: "",

    // Skills
    languages: "", tools: "", mathSkills: "", softSkills: "",

    // Competitive Programming
    cpRanks: "", cpContests: "",

    // Problem Solving
    problemStats: "",

    // Projects & POR
    projects: "", por: ""
  });

  const [resumeText, setResumeText] = useState("");
  const [suggestions, setSuggestions] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSectionSuggest = async (section) => {
    setSuggestions((prev) => ({ ...prev, [section]: "Improving..." }));
    const res = await fetch("http://localhost:5000/improve-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, text: form[section] }),
    });
    const data = await res.json();
    setSuggestions((prev) => ({ ...prev, [section]: data.suggestion || "No suggestion." }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResumeText("Generating resume...");

    const res = await fetch("http://localhost:5000/generate-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResumeText(data.text || "Error generating resume.");
  };

  const downloadPDF = () => {
    window.open("http://localhost:5000/download-resume", "_blank");
  };

  const sections = [
    { title: "Basic Info", fields: ["name", "role", "contact", "location"] },
    { title: "Education", fields: ["education", "college", "school"] },
    { title: "Skills", fields: ["languages", "tools", "mathSkills", "softSkills"] },
    { title: "Competitive Programming", fields: ["cpRanks", "cpContests"] },
    { title: "Problem Solving", fields: ["problemStats"] },
    { title: "Projects & POR", fields: ["projects", "por"] },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <h2>🧠 AI Resume Builder (Structured Sections + Gemini)</h2>
      <form onSubmit={handleSubmit}>
        {sections.map(({ title, fields }) => (
          <div key={title} style={{ marginBottom: 30, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
            <h3>{title}</h3>
            {fields.map((field) => (
              <div key={field} style={{ marginBottom: 10 }}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}:</label><br />
                <textarea
                  name={field}
                  rows={field === "problemStats" || field === "projects" ? 4 : 3}
                  value={form[field]}
                  onChange={handleChange}
                  placeholder={`Enter your ${field}`}
                  style={{ width: "100%" }}
                />
                <button type="button" onClick={() => handleSectionSuggest(field)} style={{ marginTop: 5 }}>
                  Improve {field}
                </button>
                {suggestions[field] && <p><em>💡 Suggestion:</em> {suggestions[field]}</p>}
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Generate Resume</button>
      </form>

      <h3>📄 Resume Preview</h3>
      <pre>{resumeText}</pre>

      <button onClick={downloadPDF} style={{ marginTop: 10 }}>
        Download PDF
      </button>
    </div>
  );
}

export default ResumeBuilder;

