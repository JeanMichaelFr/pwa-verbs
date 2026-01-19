let verbs = [];
let filteredVerbs = [];
let currentIndex = 0;
let currentMode = null;
let isRunning = false;
let isSpeaking = false;

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

  if (isRunning) {
    currentIndex = (currentIndex + 1) % filteredVerbs.length;
    speakVerb(currentIndex);
  }
}

function startMode(mode) {
  stopAll();

  currentMode = mode;
  isRunning = true;
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

document.addEventListener("touchstart", e => {
  if (!isRunning || isSpeaking) return;

  const touchX = e.touches[0].clientX;
  const screenWidth = window.innerWidth;

  speechSynthesis.cancel();

  if (touchX < screenWidth / 2) {
    // LEFT SIDE → previous
    currentIndex =
      (currentIndex - 1 + filteredVerbs.length) % filteredVerbs.length;
  } else {
    // RIGHT SIDE → next
    currentIndex =
      (currentIndex + 1) % filteredVerbs.length;
  }

  speakVerb(currentIndex);
});
