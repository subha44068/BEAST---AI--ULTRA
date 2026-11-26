let engine = "gemini";
const $ = id => document.getElementById(id);
const messages = $("messages");
function addMessage(text, who) {
  const el = document.createElement("div");
  el.className = "bubble " + who;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
}
function setStatus(text) { $("status").textContent = text; }
document.querySelectorAll(".engine").forEach(btn => btn.addEventListener("click", () => {
  engine = btn.dataset.engine;
  document.querySelectorAll(".engine").forEach(b => b.classList.toggle("active", b === btn));
  $("engineLabel").textContent = engine.toUpperCase() + " ENGINE";
  setStatus(engine === "offline" ? "OFFLINE MODULE NOT INSTALLED" : "SYSTEM READY");
}));
$("settingsBtn").addEventListener("click", () => {
  $("geminiKey").value = localStorage.getItem("beast_gemini_key") || "";
  $("openaiKey").value = localStorage.getItem("beast_openai_key") || "";
  $("settingsDialog").showModal();
});
$("saveSettings").addEventListener("click", () => {
  localStorage.setItem("beast_gemini_key", $("geminiKey").value.trim());
  localStorage.setItem("beast_openai_key", $("openaiKey").value.trim());
});
async function ask() {
  const prompt = $("prompt").value.trim();
  if (!prompt) return;
  $("prompt").value = "";
  addMessage(prompt, "user");
  if (engine === "offline") {
    addMessage("Offline AI is not connected in this starter version. A compatible local model and Android runtime must be added for true offline answers.", "bot");
    return;
  }
  setStatus("AI THINKING…");
  try {
    let answer = engine === "gemini" ? await askGemini(prompt) : await askOpenAI(prompt);
    addMessage(answer, "bot");
  } catch (e) {
    addMessage("Could not get an answer: " + e.message, "bot");
  } finally { setStatus("SYSTEM READY"); }
}
async function askGemini(prompt) {
  const key = localStorage.getItem("beast_gemini_key");
  if (!key) throw new Error("Add your Gemini API key in Settings.");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key);
  const res = await fetch(url, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({system_instruction:{parts:[{text:"You are BEAST AI ULTRA, a helpful personal assistant. Reply in the same language as the user."}]}, contents:[{parts:[{text:prompt}]}]})});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Gemini request failed.");
  return data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "No response received.";
}
async function askOpenAI(prompt) {
  const key = localStorage.getItem("beast_openai_key");
  if (!key) throw new Error("Add your OpenAI API key in Settings.");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {method:"POST", headers:{"Content-Type":"application/json","Authorization":"Bearer "+key}, body:JSON.stringify({model:"gpt-4o-mini",messages:[{role:"system",content:"You are BEAST AI ULTRA, a helpful personal assistant. Reply in the same language as the user."},{role:"user",content:prompt}]})});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "OpenAI request failed.");
  return data.choices?.[0]?.message?.content || "No response received.";
}
$("sendBtn").addEventListener("click", ask);
$("prompt").addEventListener("keydown", e => { if(e.key==="Enter" && !e.shiftKey){e.preventDefault();ask();} });
document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click", () => { $("prompt").value=btn.dataset.prompt; $("prompt").focus(); }));
$("voiceBtn").addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { addMessage("Voice input is not supported by this Android WebView yet. Native Android speech support will be added in a later build.", "bot"); return; }
  const rec = new SpeechRecognition(); rec.lang = "or-IN"; rec.interimResults = false;
  setStatus("LISTENING…"); rec.onresult = e => { $("prompt").value = e.results[0][0].transcript; setStatus("SYSTEM READY"); };
  rec.onerror = () => setStatus("VOICE INPUT ERROR"); rec.onend = () => setStatus("SYSTEM READY"); rec.start();
});
