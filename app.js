let verbs = [];
let intervalId = null;
let currentIndex = 0;
let currentMode = null;
let isRunning = false;

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

async function runLoop(mode) {
  isRunning = true;
  display.classList.remove("hidden");

  const filtered = verbs.filter(v =>
    mode === "sein"
      ? v.perfekt.startsWith("ist")
      : v.perfekt.startsWith("hat")
  );

  while (isRunning) {
    const v = filtered[currentIndex];

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

    currentIndex = (currentIndex + 1) % filtered.length;
  }
}

function stopLoop() {
  isRunning = false;
  speechSynthesis.cancel();
  display.classList.add("hidden");
  currentIndex = 0;
}

seinBtn.onclick = () => {
  if (isRunning && currentMode === "sein") {
    stopLoop();
  } else {
    stopLoop();
    currentMode = "sein";
    runLoop("sein");
  }
};

habenBtn.onclick = () => {
  if (isRunning && currentMode === "haben") {
    stopLoop();
  } else {
    stopLoop();
    currentMode = "haben";
    runLoop("haben");
  }
};
