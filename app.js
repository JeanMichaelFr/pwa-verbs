let verbs = [];
let filteredVerbs = [];
let currentIndex = 0;
let currentMode = null;
let isRunning = false;
let isSpeaking = false;
let autoPlay = true;

const display = document.getElementById("display");
const seinBtn = document.getElementById("seinBtn");
const habenBtn = document.getElementById("habenBtn");

fetch("verben.json")
  .then(res => res.json())
  .then(data => verbs = data);

function speak(text, lang) {
  return new Promise(resolve => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.8;
    utter.onend = resolve;
    speechSynthesis.speak(utter);
  });
}

async function speakVerb(index) {
  if (!isRunning) return;

  const v = filteredVerbs[index];
  isSpeaking = true;

  display.innerHTML = `
    <p><strong>PL:</strong> ${v.polish_infinitive}</p>
    <p><strong>DE:</strong> ${v.german_infinitive}</p>
    <p>${v.praeteritum}</p>
    <p>${v.perfekt}</p>
  `;

  await speak(v.polish_infinitive, "pl-PL");
  await speak(v.german_infinitive, "de-DE");
  await speak(v.praeteritum, "de-DE");
  await speak(v.perfekt, "de-DE");

  isSpeaking = false;

  if (isRunning && autoPlay) {
    currentIndex = (currentIndex + 1) % filteredVerbs.length;
    speakVerb(currentIndex);
  }
}

function startMode(mode) {
  stopAll();

  currentMode = mode;
  isRunning = true;
  autoPlay = true;
  display.classList.remove("hidden");

  filteredVerbs = verbs.filter(v =>
    mode === "sein"
      ? v.perfekt.startsWith("ist")
      : v.perfekt.startsWith("hat")
  );

  currentIndex = 0;
  speakVerb(currentIndex);
}

function stopAll() {
  isRunning = false;
  autoPlay = false;
  isSpeaking = false;
  speechSynthesis.cancel();
  display.classList.add("hidden");
  currentIndex = 0;
}

seinBtn.onclick = () => {
  if (isRunning && currentMode === "sein") {
    stopAll();
  } else {
    startMode("sein");
  }
};

habenBtn.onclick = () => {
  if (isRunning && currentMode === "haben") {
    stopAll();
  } else {
    startMode("haben");
  }
};

/* 🔥 RELIABLE MOBILE NAVIGATION */
document.addEventListener("pointerdown", e => {
  if (!isRunning) return;

  e.preventDefault();
  autoPlay = false;
  speechSynthesis.cancel();

  const screenWidth = window.innerWidth;
  const x = e.clientX;

  if (x < screenWidth / 2) {
    // LEFT → previous
    currentIndex =
      (currentIndex - 1 + filteredVerbs.length) % filteredVerbs.length;
  } else {
    // RIGHT → next
    currentIndex =
      (currentIndex + 1) % filteredVerbs.length;
  }

  speakVerb(currentIndex);
});
