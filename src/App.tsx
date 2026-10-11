import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, CircleHelp, Clock3, Code2, Download, FileCode2, Play, ShieldCheck, Terminal, Trophy, UserRound, XCircle } from "lucide-react";

type MCQ = { id: number; topic: string; question: string; options: string[]; answer: number; explanation: string };
type Coding = { id: number; topic: "JavaScript" | "React" | "Node.js"; title: string; prompt: string; starter: string; mode: "js" | "react" | "node"; expectedHint: string };

const mcqs: MCQ[] = [
  { id: 1, topic: "JavaScript", question: 'What is the result of  "5" === 5 ?', options: ["true", "false", "undefined", "TypeError"], answer: 1, explanation: "=== compares both value and type; string and number differ." },
  { id: 2, topic: "JavaScript", question: "Which array method returns a new array containing only items that pass a condition?", options: ["map()", "filter()", "forEach()", "findIndex()"], answer: 1, explanation: "filter() returns a new array of all matching elements." },
  { id: 3, topic: "JavaScript", question: "What is printed by console.log(typeof null)?", options: ['"null"', '"object"', '"undefined"', '"number"'], answer: 1, explanation: 'typeof null is a well-known JavaScript historical quirk: "object".' },
  { id: 4, topic: "React", question: "Which React hook is used to manage local component state?", options: ["useEffect", "useMemo", "useState", "useRef"], answer: 2, explanation: "useState stores state and provides a setter that triggers rendering." },
  { id: 5, topic: "React", question: "Why should list items have stable keys?", options: ["To add CSS automatically", "To help React identify items between renders", "To call an API", "Keys make arrays mutable"], answer: 1, explanation: "Stable keys help React match items when lists change." },
  { id: 6, topic: "Node.js", question: "What is Node.js?", options: ["A database", "A CSS framework", "A JavaScript runtime", "A programming language separate from JavaScript"], answer: 2, explanation: "Node.js runs JavaScript outside the browser." },
  { id: 7, topic: "Node.js", question: "In Express, which object usually contains JSON submitted in a POST request after express.json() middleware?", options: ["req.query", "req.params", "req.body", "res.body"], answer: 2, explanation: "req.body contains parsed request payload data." }
];

const coding: Coding[] = [
  { id: 8, topic: "JavaScript", title: "1. Find the largest number", mode: "js", prompt: "Complete the function so it returns the largest number. Do not use Math.max(). Expected for the sample input: 42.", starter: `function findLargest(numbers) {\n  // Your code here\n  \n}\n\nconsole.log(findLargest([12, 4, 42, 7, 19]));`, expectedHint: "Return 42. Use a loop and track the largest value." },
  { id: 9, topic: "JavaScript", title: "2. Remove duplicates", mode: "js", prompt: "Return a new array containing unique values in their original order. Expected output: [1, 2, 3, 4].", starter: `function uniqueValues(items) {\n  // Your code here\n  \n}\n\nconsole.log(uniqueValues([1, 2, 2, 3, 1, 4]));`, expectedHint: "Output should be [1, 2, 3, 4]. Set or a loop are both acceptable." },
  { id: 10, topic: "JavaScript", title: "3. Count vowels", mode: "js", prompt: "Write a function that counts a, e, i, o, u (case-insensitive). Expected output for 'JavaScript': 3.", starter: `function countVowels(text) {\n  // Your code here\n  \n}\n\nconsole.log(countVowels("JavaScript"));`, expectedHint: "Return 3 for JavaScript." },
  { id: 11, topic: "React", title: "4. Build a counter", mode: "react", prompt: "Build a React counter starting at 0 with Increase and Decrease buttons. Clicking each button must update the displayed count.", starter: `function CandidateApp() {\n  // TODO: Create state for the counter, starting at 0.\n\n  return (\n    <div style={{fontFamily: 'Arial', padding: 16}}>\n      <h2>Count: {/* TODO: display the current count */}</h2>\n      <button>{'Increase'}</button>{' '}\n      <button>{'Decrease'}</button>\n    </div>\n  );\n}`, expectedHint: "Use React.useState(0), display the count, and update it from each button's onClick handler." },
  { id: 12, topic: "React", title: "5. Filter and render users", mode: "react", prompt: "Display only users aged 18 or above. Use filter() and map(). The final list should include Rahul, Priya, and Ravi.", starter: `function CandidateApp() {\n  const users = [\n    { id: 1, name: "Rahul", age: 22 },\n    { id: 2, name: "Amit", age: 17 },\n    { id: 3, name: "Priya", age: 25 },\n    { id: 4, name: "Ravi", age: 30 }\n  ];\n\n  return (\n    <div style={{fontFamily: 'Arial', padding: 16}}>\n      <h2>Eligible users</h2>\n      {/* Render users aged 18 or above */}\n    </div>\n  );\n}`, expectedHint: "Render Rahul, Priya and Ravi, but not Amit." },
  { id: 13, topic: "React", title: "6. Live text input", mode: "react", prompt: "Create a controlled input using useState. Whatever the user types should appear immediately in the preview below it.", starter: `function CandidateApp() {\n  // TODO: Create state to store the text entered by the user.\n\n  return (\n    <div style={{fontFamily: 'Arial', padding: 16}}>\n      <label>Name: </label>\n      <input />\n      <p>You typed: {/* TODO: display the current input value */}</p>\n    </div>\n  );\n}`, expectedHint: "Use React.useState(''), connect the input's value and onChange props, and display the state in the paragraph." },
  { id: 14, topic: "Node.js", title: "7. Validate an API payload", mode: "node", prompt: "Write a function like a basic backend validation step. Return { valid: true } only when name is a non-empty string and email contains '@'. Otherwise return { valid: false }. Test both valid and invalid inputs.", starter: `function validateUser(payload) {\n  // Your validation logic\n  \n}\n\nconsole.log(validateUser({ name: "Riya", email: "riya@example.com" }));\nconsole.log(validateUser({ name: " ", email: "wrong" }));`, expectedHint: "First output should be { valid: true }; second should be { valid: false }." },
  { id: 15, topic: "Node.js", title: "8. Filter API records", mode: "node", prompt: "Imagine these are records returned by an API. Implement getActiveUsers() to return only users where active is true, then log their names. Expected names: Rahul, Priya.", starter: `const users = [\n  { id: 1, name: "Rahul", active: true },\n  { id: 2, name: "Amit", active: false },\n  { id: 3, name: "Priya", active: true }\n];\n\nfunction getActiveUsers(items) {\n  // Your code here\n  \n}\n\nconsole.log(getActiveUsers(users).map(user => user.name));`, expectedHint: "Output should be [ 'Rahul', 'Priya' ]." }
];

const allQuestions = [...mcqs, ...coding];
const DURATION = 15 * 60;

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function App() {
  // Use the company logo as the browser tab favicon.
  useEffect(() => {
    let favicon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.type = "image/png";
    favicon.href = "/logo.png";
  }, []);
  const [phase, setPhase] = useState<"intro" | "test" | "identity" | "done">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [outputs, setOutputs] = useState<Record<number, string>>({});
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [fullName, setFullName] = useState("");
  const [college, setCollege] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [errorText, setErrorText] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const question = allQuestions[current];
  const answeredCount = mcqs.filter(q => mcqAnswers[q.id] !== undefined).length +
    coding.filter(q => (answers[q.id] || "").trim().length > 0).length;
  const mcqScore = mcqs.filter(q => mcqAnswers[q.id] === q.answer).length;

  const submitTest = useCallback(() => {
    setSubmittedAt(new Date().toLocaleString());
    setPhase("identity");
  }, []);

  useEffect(() => {
    if (phase !== "test") return;
    const timer = window.setInterval(() => {
      setTimeLeft(previous => {
        if (previous <= 1) {
          window.clearInterval(timer);
          setSubmittedAt(new Date().toLocaleString());
          setPhase("identity");
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "test" && question && "starter" in question && !answers[question.id]) {
      setAnswers(previous => ({ ...previous, [question.id]: question.starter }));
    }
  }, [phase, current, question, answers]);

  const runCode = useCallback((item: Coding) => {
    const code = answers[item.id] ?? item.starter;
    setErrorText("");
    if (item.mode === "react") {
      const frame = document.getElementById(`preview-${item.id}`) as HTMLIFrameElement | null;
      if (!frame) return;
      // The iframe executes classic JavaScript, not ES modules. Remove module
      // declarations before JSX compilation, including whitespace/BOM and
      // common side-effect, default, named, and namespace imports.
      const safeCode = code
        .replace(/^\uFEFF/, "")
        .replace(/<\/script/gi, "<\\/script")
        .replace(/^[ \t]*import\s+(?:[\s\S]*?\s+from\s+)?["'][^"']+["']\s*;?[ \t]*(?:\r?\n|$)/gm, "")
        // CommonJS React imports are not available inside the browser iframe.
        // React and its hooks are injected into the preview function below.
        .replace(/^[ \t]*(?:const|let|var)\s+React\s*=\s*require\(["']react["']\)\s*;?[ \t]*(?:\r?\n|$)/gm, "")
        .replace(/^[ \t]*(?:const|let|var)\s+ReactDOM\s*=\s*require\(["']react-dom(?:\/client)?["']\)\s*;?[ \t]*(?:\r?\n|$)/gm, "")
        .replace(/^[ \t]*(?:const|let|var)\s+\{[^}]+\}\s*=\s*require\(["']react["']\)\s*;?[ \t]*(?:\r?\n|$)/gm, "")
        .replace(/^[ \t]*export\s+default\s+/gm, "")
        .replace(/^[ \t]*export\s*\{[^}]*\}\s*;?[ \t]*(?:\r?\n|$)/gm, "");
      const sourceLiteral = JSON.stringify(safeCode);
      const src = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial,sans-serif;padding:12px;color:#172033}button,input{padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px}button{cursor:pointer;margin-right:6px}h2{font-size:18px}</style></head><body><div id="root"></div><div id="err" style="color:#b91c1c;white-space:pre-wrap;margin-top:12px"></div><script src="https://unpkg.com/react@18/umd/react.development.js"><\/script><script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script><script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script><script>
window.onerror=function(message){document.getElementById('err').textContent='Runtime error: '+message};
window.addEventListener('DOMContentLoaded', function(){
  try {
    const source = ${sourceLiteral};
    const transformed = Babel.transform(source, {presets: ['react'], sourceType: 'script'}).code;
    if (/\bimport\s+(?:[\w*{]|['"])/.test(transformed)) { throw new Error('Import statement remained after preprocessing. Remove import lines from the answer and retry.'); }
    const renderApp = new Function(
      'React', 'ReactDOM', 'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'require',
      transformed + '\\nconst root = ReactDOM.createRoot(document.getElementById("root")); root.render(React.createElement(CandidateApp));'
    );
    // Support common React CommonJS imports used in candidate answers.
    // This is a small browser-preview shim, not a full Node.js module loader.
    const jsxRuntime = {
      Fragment: React.Fragment,
      jsx: (type, props, key) => React.createElement(type, { ...(props || {}), ...(key !== undefined ? { key } : {}) }),
      jsxs: (type, props, key) => React.createElement(type, { ...(props || {}), ...(key !== undefined ? { key } : {}) }),
      jsxDEV: (type, props, key) => React.createElement(type, { ...(props || {}), ...(key !== undefined ? { key } : {}) })
    };
    const previewRequire = (moduleName) => {
      if (moduleName === 'react') return React;
      if (moduleName === 'react-dom') return ReactDOM;
      if (moduleName === 'react-dom/client') return { createRoot: ReactDOM.createRoot };
      if (moduleName === 'react/jsx-runtime' || moduleName === 'react/jsx-dev-runtime') return jsxRuntime;
      throw new Error('Preview cannot load module: ' + moduleName + '. Supported modules: react, react-dom, react-dom/client, react/jsx-runtime.');
    };
    renderApp(React, ReactDOM, React.useState, React.useEffect, React.useMemo, React.useCallback, React.useRef, previewRequire);
  } catch (error) { document.getElementById('err').textContent = 'Preview error: ' + (error && error.message ? error.message : String(error)); }
});
</script></body></html>`;
      frame.srcdoc = src;
      setOutputs(prev => ({ ...prev, [item.id]: "React preview refreshed. Try the controls in the preview pane." }));
      return;
    }
    try {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: unknown[]) => logs.push(args.map(value => {
          if (typeof value === "string") return value;
          try { return JSON.stringify(value, null, 2) ?? String(value); } catch { return String(value); }
        }).join(" ")),
        error: (...args: unknown[]) => logs.push("ERROR: " + args.map(String).join(" "))
      };
      const execute = new Function("console", `"use strict";\n${code}`);
      execute(customConsole);
      setOutputs(prev => ({ ...prev, [item.id]: logs.join("\n") || "(Code ran without console output.)" }));
    } catch (error) {
      setOutputs(prev => ({ ...prev, [item.id]: `Error: ${error instanceof Error ? error.message : String(error)}` }));
    }
  }, [answers]);

  function saveReport() {
    if (!fullName.trim()) return;
    const report = {
      assessment: "Leads Digital MERN Junior Developer Test",
      candidate: { fullName: fullName.trim(), college: college.trim(), rollNumber: rollNumber.trim() },
      submittedAt,
      durationUsed: formatTime(DURATION - timeLeft),
      mcqScore: `${mcqScore}/7`,
      answers: allQuestions.map(q => {
        const isMcq = "options" in q;
        return {
          id: q.id,
          topic: q.topic,
          question: isMcq ? q.question : q.title,
          answer: isMcq ? (mcqAnswers[q.id] === undefined ? "Not answered" : q.options[mcqAnswers[q.id]]) : answers[q.id] || "",
          codeOutput: outputs[q.id] || ""
        };
      })
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = fullName.trim().replace(/[^a-z0-9_-]/gi, "_");
    link.href = url;
    link.download = `LeadsDigital_Assessment_${safeName}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setPhase("done");
  }

  if (phase === "intro") {
    return <div className="shell intro-shell">
      <div className="intro-card">
        <div className="brand-row"><div className="brand-mark" style={{ background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src="/logo.png" alt="Leads Digital logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /></div><div><b>LEADS DIGITAL</b><span>ENGINEERING HIRING</span></div><div className="secure"><ShieldCheck size={15}/> Assessment</div></div>
        <div className="hero-pill"><span className="pulse-dot"/> JUNIOR MERN DEVELOPER · ROUND 01</div>
        <h1>Show us how<br/><em>you think.</em></h1>
        <p className="intro-copy">A focused assessment of JavaScript, React, and Node.js fundamentals. Choose answers, write code, run it, and check the output right here.</p>
        <div className="stats-grid">
          <div><span className="stat-icon"><CircleHelp size={18}/></span><b>15</b><small>Total questions</small></div>
          <div><span className="stat-icon"><Code2 size={18}/></span><b>8</b><small>Live coding tasks</small></div>
          <div><span className="stat-icon"><Clock3 size={18}/></span><b>15 min</b><small>Time limit</small></div>
        </div>
        <div className="topic-row"><span>JavaScript <b>6</b></span><span>React <b>5</b></span><span>Node.js <b>4</b></span></div>
        <div className="instruction-box"><b>Before you begin</b><p>Complete 7 multiple-choice questions and 8 coding tasks. The timer starts when you begin. When time expires, the test moves to submission automatically. You'll enter your full name after the test to save your report.</p></div>
        <button className="btn btn-primary btn-wide" onClick={() => setPhase("test")}>Begin assessment <ArrowRight size={17}/></button>
        <p className="privacy-note"><ShieldCheck size={14}/> Your answers are held in this browser until the report is downloaded.</p>
      </div>
      <footer className="page-footer">LEADS DIGITAL <span>·</span> MERN DEVELOPER ASSESSMENT</footer>
    </div>;
  }

  if (phase === "identity") {
    return <div className="shell identity-shell"><div className="identity-card">
      <div className="complete-icon"><CheckCircle2 size={30}/></div><div className="eyebrow">ASSESSMENT {timeLeft === 0 ? "TIME EXPIRED" : "COMPLETED"}</div>
      <h1>One last thing.</h1><p className="muted">Enter your details to generate your submission report. Your answers are ready to be saved.</p>
      <div className="result-strip"><div><span>MCQ score</span><b>{mcqScore}/7</b></div><div><span>Questions attempted</span><b>{answeredCount}/15</b></div><div><span>Time used</span><b>{formatTime(DURATION-timeLeft)}</b></div></div>
      <label>Full name <i>*</i><input autoFocus value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full legal name" /></label>
      <label>College name<input value={college} onChange={e => setCollege(e.target.value)} placeholder="Engineering college" /></label>
      <label>Roll number / student ID <span className="optional">Optional</span><input value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="Enter roll number" /></label>
      <button className="btn btn-primary btn-wide" disabled={!fullName.trim()} onClick={saveReport}><Download size={17}/> Download and submit report</button>
      <p className="privacy-note">Please do not close this tab until the report has downloaded.</p>
    </div></div>;
  }

  if (phase === "done") {
    return <div className="shell identity-shell"><div className="identity-card done-card">
      <div className="complete-icon"><Check size={30}/></div><div className="eyebrow">SUBMISSION READY</div><h1>Thank you, {fullName.split(" ")[0]}.</h1>
      <p className="muted">The assessment report has been generated in your browser's Downloads folder. Please tell the interviewer you have finished.</p>
      <div className="result-strip"><div><span>MCQ score</span><b>{mcqScore}/7</b></div><div><span>Attempted</span><b>{answeredCount}/15</b></div><div><span>Candidate</span><b className="candidate-short">{fullName}</b></div></div>
      <p className="warning-note"><ShieldCheck size={16}/> Ask the interviewer to verify that your report file was downloaded successfully.</p>
    </div></div>;
  }

  const isMcq = "options" in question;
  const isCoding = !isMcq;
  const currentAnswer = isCoding ? (answers[question.id] ?? question.starter) : "";
  const previousQuestion = current > 0 ? allQuestions[current - 1] : null;
  const nextQuestion = current < allQuestions.length - 1 ? allQuestions[current + 1] : null;

  return <div className="test-shell">
    <aside className="sidebar">
      <div className="side-brand"><div className="brand-mark" style={{ background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><img src="/logo.png" alt="Leads Digital logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /></div><div><b>LEADS DIGITAL</b><small>TECHNICAL ASSESSMENT</small></div></div>
      <div className="candidate-chip"><div className="avatar"><UserRound size={18}/></div><div><b>Candidate</b><span>Name collected at submission</span></div></div>
      <div className="side-label">QUESTION NAVIGATION</div>
      <div className="nav-group"><span className="nav-group-title">MULTIPLE CHOICE <small>01–07</small></span><div className="q-grid">{mcqs.map(q => <button key={q.id} className={`q-number ${current === q.id-1 ? "active" : ""} ${mcqAnswers[q.id] !== undefined ? "answered" : ""}`} onClick={() => setCurrent(q.id-1)}>{q.id}{mcqAnswers[q.id] !== undefined && <Check size={10}/>}</button>)}</div></div>
      {(["JavaScript", "React", "Node.js"] as const).map(topic => <div className="nav-group" key={topic}><span className="nav-group-title">{topic.toUpperCase()} <small>{coding.filter(q=>q.topic===topic).map(q=>q.id).join(", ")}</small></span><div className="q-grid">{coding.filter(q=>q.topic===topic).map(q => <button key={q.id} className={`q-number ${current === q.id-1 ? "active" : ""} ${(answers[q.id] || "").trim() !== "" ? "answered" : ""}`} onClick={() => setCurrent(q.id-1)}>{q.id}{(answers[q.id] || "").trim() !== "" && <Check size={10}/>}</button>)}</div></div>)}
      <div className="sidebar-bottom"><div className="side-progress"><div><span>Progress</span><b>{answeredCount}/15</b></div><div className="mini-track"><span style={{width:`${answeredCount/15*100}%`}}/></div></div><div className="side-safe"><ShieldCheck size={15}/> Answers stay in this tab</div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="crumb">Assessment <span>/</span> {question.topic} <span>/</span> <b>Question {question.id}</b></div><div className={`timer-chip ${timeLeft < 120 ? "urgent" : ""}`}><Clock3 size={16}/><span>TIME LEFT</span><b>{formatTime(timeLeft)}</b></div></header>
      <div className="workspace">
        <div className="question-heading"><div className="question-kicker"><span className={isMcq ? "kind-label mcq-label" : "kind-label code-label"}>{isMcq ? "MULTIPLE CHOICE" : "LIVE CODING"}</span><span className="question-count">QUESTION {String(question.id).padStart(2,"0")} OF 15</span></div><h1>{isMcq ? question.question : question.title}</h1>{isCoding && <p>{question.prompt}</p>}</div>

        {isMcq && <div className="mcq-options">{question.options.map((option, index) => <button key={option} className={`option-card ${mcqAnswers[question.id] === index ? "selected" : ""}`} onClick={() => setMcqAnswers(prev => ({...prev,[question.id]:index}))}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option}</span><span className="option-check">{mcqAnswers[question.id] === index && <Check size={16}/>}</span></button>)}</div>}

        {isCoding && <div className="coding-layout">
          <section className="editor-panel"><div className="panel-toolbar"><div className="panel-title"><FileCode2 size={15}/><span>{question.topic === "React" ? "App.jsx" : "solution.js"}</span><span className="live-tag">EDITABLE</span></div><button className="run-btn" onClick={() => runCode(question)}><Play size={14} fill="currentColor"/> Run code</button></div>
            <div className="editor-wrap"><div className="line-numbers">{(currentAnswer || "").split("\n").map((_, i) => <span key={i}>{i+1}</span>)}</div><textarea ref={editorRef} className="code-editor" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={currentAnswer} onChange={e => setAnswers(prev => ({...prev,[question.id]:e.target.value}))} /></div>
            <div className="editor-footer"><span><span className="green-dot"/> JavaScript {question.topic === "React" ? "· JSX preview" : "· Console output"}</span><span>{(currentAnswer || "").split("\n").length} lines</span></div>
          </section>
          <section className="output-panel"><div className="output-header"><div><Terminal size={15}/><b>{question.topic === "React" ? "Live preview" : "Console output"}</b></div><span className="output-state">{outputs[question.id] ? "LAST RUN" : "NOT RUN"}</span></div>
            {question.topic === "React" ? <iframe id={`preview-${question.id}`} title={`React preview for question ${question.id}`} sandbox="allow-scripts" className="react-preview" /> : <pre className="console-output">{outputs[question.id] || "Click “Run code” to see the output here.\n\nYour console.log() results and errors will appear in this panel."}</pre>}
            {question.topic === "React" && <p className="preview-note">The preview loads React and Babel from the internet. An internet connection is required for React coding questions.</p>}
          </section>
        </div>}

        <div className="workspace-bottom"><div className="autosave-note"><ShieldCheck size={15}/> Answers saved in this tab <span>·</span> {answeredCount}/15 answered</div><div className="nav-actions"><button className="btn btn-secondary" disabled={!previousQuestion} onClick={() => setCurrent(current-1)}><ArrowLeft size={15}/> Previous</button>{nextQuestion ? <button className="btn btn-primary" onClick={() => setCurrent(current+1)}>Next question <ArrowRight size={15}/></button> : <button className="btn btn-submit" onClick={submitTest}>Finish test <CheckCircle2 size={16}/></button>}</div></div>
        <div className="bottom-disclaimer">Do your own work. Explain your solution when asked. Code execution runs in this browser; Node.js tasks simulate basic backend logic, not a live server.</div>
      </div>
    </main>
  </div>;
}

export default App;