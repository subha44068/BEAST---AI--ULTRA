let engine = "gemini";
const $ = id => document.getElementById(id);
const messages = $("messages");
const HISTORY_KEY = "beast_chat_history_v2";
const MEMORY_KEY = "beast_memory_v1";
let history = safeRead(HISTORY_KEY, []);
let wakeRecognition = null;
let wakeEnabled = false;

function safeRead(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function addMessage(text, who, save = true) {
  const el = document.createElement("div");
  el.className = "bubble " + who;
  el.textContent = text;
  messages.appendChild(el);
  messages.scrollTop = messages.scrollHeight;
  if (save) {
    history.push({role: who === "user" ? "user" : "assistant", content: text});
    history = history.slice(-30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}
function setStatus(text) { $("status").textContent = text; }
function setOrb(mode) { $("orb").classList.toggle("speaking", mode === "speaking"); $("orb").classList.toggle("listening", mode === "listening"); }
function setEngine(name) {
  engine = name;
  document.querySelectorAll(".engine").forEach(b => b.classList.toggle("active", b.dataset.engine === name));
  $("engineLabel").textContent = name.toUpperCase() + " ENGINE";
  setStatus(name === "offline" ? "OFFLINE MODULE NOT INSTALLED" : "SYSTEM READY");
}
document.querySelectorAll(".engine").forEach(btn => btn.addEventListener("click", () => setEngine(btn.dataset.engine)));

$("settingsBtn").addEventListener("click", () => {
  $("geminiKey").value = localStorage.getItem("beast_gemini_key") || "";
  $("openaiKey").value = localStorage.getItem("beast_openai_key") || "";
  $("settingsDialog").showModal();
});
$("saveSettings").addEventListener("click", () => {
  localStorage.setItem("beast_gemini_key", $("geminiKey").value.trim());
  localStorage.setItem("beast_openai_key", $("openaiKey").value.trim());
});

function personalityText() {
  const styles = {
    jarvis: "You are BEAST AI ULTRA, a capable, concise, respectful personal assistant. Be natural and conversational, not robotic.",
    friend: "You are BEAST AI ULTRA, a friendly and supportive companion. Speak naturally and casually while staying truthful.",
    mentor: "You are BEAST AI ULTRA, a patient mentor. Explain clearly in small steps and check understanding when useful.",
    professional: "You are BEAST AI ULTRA, a professional assistant. Be direct, organized, accurate and practical."
  };
  return styles[$("personality").value] + " Reply in the same language as the user. Use conversation history for context. Never claim to perform phone actions or access live data unless a connected tool actually did it.";
}
function memoryText() {
  if (!$("memoryEnabled").checked) return "";
  const mem = safeRead(MEMORY_KEY, []);
  return mem.length ? "\nUser-approved saved notes (use only when relevant): " + mem.join("; ") : "";
}
function apiHistory(prompt) {
  const prior = history.slice(-12).map(m => ({role: m.role, content: m.content}));
  return [...prior, {role: "user", content: prompt}];
}
async function ask() {
  const prompt = $("prompt").value.trim();
  if (!prompt) return;
  $("prompt").value = "";
  addMessage(prompt, "user");
  if (engine === "offline") {
    addMessage("Offline AI is not installed in this web project. A local model and Android runtime are required for offline answers.", "bot");
    return;
  }
  setStatus("AI THINKING…");
  try {
    const answer = engine === "gemini" ? await askGemini(prompt) : await askOpenAI(prompt);
    addMessage(answer, "bot");
    if ($("voiceReply").checked) speak(answer);
  } catch (e) {
    addMessage("Could not get an answer: " + e.message, "bot");
  } finally { setStatus("SYSTEM READY"); setOrb(""); }
}
async function askGemini(prompt) {
  const key = localStorage.getItem("beast_gemini_key");
  if (!key) throw new Error("Add your Gemini API key in Settings.");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key);
  const contents = apiHistory(prompt).map(m => ({role: m.role === "assistant" ? "model" : "user", parts: [{text: m.content}]}));
  const res = await fetch(url, {method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({system_instruction:{parts:[{text:personalityText() + memoryText()}]}, contents})});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Gemini request failed.");
  return data.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("") || "No response received.";
}
async function askOpenAI(prompt) {
  const key = localStorage.getItem("beast_openai_key");
  if (!key) throw new Error("Add your OpenAI API key in Settings.");
  const msgs = [{role:"system",content:personalityText() + memoryText()}, ...apiHistory(prompt)];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+key},
    body:JSON.stringify({model:"gpt-4o-mini",messages:msgs})});
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "OpenAI request failed.");
  return data.choices?.[0]?.message?.content || "No response received.";
}
$("sendBtn").addEventListener("click", ask);
$("prompt").addEventListener("keydown", e => { if(e.key==="Enter" && !e.shiftKey){e.preventDefault();ask();} });
document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click", () => { $("prompt").value=btn.dataset.prompt; $("prompt").focus(); }));

function speak(text) {
  if (!("speechSynthesis" in window)) { addMessage("Text-to-speech is not supported in this browser.", "bot"); return; }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.slice(0, 3500));
  utter.lang = "or-IN";
  utter.onstart = () => { setStatus("SPEAKING…"); setOrb("speaking"); };
  utter.onend = () => { setStatus("SYSTEM READY"); setOrb(""); };
  utter.onerror = () => { setStatus("VOICE OUTPUT ERROR"); setOrb(""); };
  window.speechSynthesis.speak(utter);
}
function startSpeechInput(onText) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { addMessage("Speech recognition is not supported in this browser/WebView. Native Android speech integration is needed.", "bot"); return null; }
  const rec = new SpeechRecognition();
  rec.lang = "or-IN";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.onresult = e => onText(e.results[0][0].transcript);
  rec.onerror = () => { setStatus("VOICE INPUT ERROR"); setOrb(""); };
  rec.onend = () => { if (!wakeEnabled) { setStatus("SYSTEM READY"); setOrb(""); } };
  return rec;
}
$("voiceBtn").addEventListener("click", () => {
  const rec = startSpeechInput(text => { $("prompt").value = text; setStatus("VOICE CAPTURED"); });
  if (rec) { setStatus("LISTENING…"); setOrb("listening"); rec.start(); }
});

$("wakeBtn").addEventListener("click", () => {
  if (wakeEnabled) {
    wakeEnabled = false;
    if (wakeRecognition) wakeRecognition.stop();
    $("wakeBtn").textContent = "Enable “Jarvis” wake word";
    setStatus("WAKE WORD OFF");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { addMessage("Wake word is unavailable in this browser. Use a native Android foreground service for reliable wake-word detection.", "bot"); return; }
  wakeEnabled = true;
  $("wakeBtn").textContent = "Disable wake word";
  const listen = () => {
    if (!wakeEnabled) return;
    wakeRecognition = new SpeechRecognition();
    wakeRecognition.lang = "en-IN";
    wakeRecognition.continuous = false;
    wakeRecognition.onresult = e => {
      const heard = e.results[0][0].transcript.toLowerCase();
      if (heard.includes("jarvis")) {
        setStatus("JARVIS ACTIVATED");
        speak("Yes. I am listening.");
        setTimeout(() => $("prompt").focus(), 300);
      }
    };
    wakeRecognition.onend = () => { if (wakeEnabled) setTimeout(listen, 500); };
    wakeRecognition.onerror = () => { if (wakeEnabled) setStatus("WAKE WORD RETRYING"); };
    try { wakeRecognition.start(); setStatus("WAITING FOR JARVIS…"); setOrb("listening"); } catch {}
  };
  listen();
});

$("clearMemory").addEventListener("click", () => {
  localStorage.removeItem(MEMORY_KEY);
  localStorage.removeItem(HISTORY_KEY);
  history = [];
  messages.innerHTML = "";
  addMessage("Conversation history and saved memory cleared.", "bot", false);
});
document.querySelectorAll("[data-tool]").forEach(btn => btn.addEventListener("click", () => {
  const prompts = {
    image: "Help me write a detailed prompt for an AI image generator. Ask what image I want.",
    video: "Help me write a detailed prompt and storyboard for an AI video generator. Ask what video I want.",
    youtube: "I want to analyze a YouTube video. Ask me for its URL and explain that a connected transcript/video analysis service is needed.",
    screen: "I want help analyzing my phone screen. Explain that I need to share a screenshot; this website cannot silently read my screen.",
    weather: "I want current weather. Explain that live weather requires a weather API/service and ask for my city.",
    news: "Give me a way to review current news. Explain that live news requires a connected news/search service."
  };
  $("prompt").value = prompts[btn.dataset.tool] || "";
  $("prompt").focus();
}));

// Optional explicit memory command: "remember that ..." stores a note on this device.
const originalAsk = ask;
async function askWithMemoryCommand() {
  const value = $("prompt").value.trim();
  const match = value.match(/^remember that\s+(.+)$/i);
  if (match && $("memoryEnabled").checked) {
    const notes = safeRead(MEMORY_KEY, []);
    notes.push(match[1].slice(0, 300));
    localStorage.setItem(MEMORY_KEY, JSON.stringify(notes.slice(-30)));
    $("prompt").value = "";
    addMessage(value, "user");
    addMessage("I saved that note on this device. You can clear it with Clear memory.", "bot");
    return;
  }
  return originalAsk();
}
$("sendBtn").removeEventListener("click", ask);
$("sendBtn").addEventListener("click", askWithMemoryCommand);
$("prompt").removeEventListener("keydown", () => {});
$("prompt").addEventListener("keydown", e => { if(e.key==="Enter" && !e.shiftKey){e.preventDefault();askWithMemoryCommand();} });
