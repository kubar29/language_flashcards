function startLearning() {
  window.location.href = "learn.html";
}

let words = [];
let currentWord = null;

const COOLDOWN_MS = 30000; // 30s przerwy zanim słowo może wrócić

// inicjalizacja przy starcie strony
document.addEventListener("DOMContentLoaded", init);

async function init() {
  // jeśli nie ma danych — wczytaj z JSON
  if (!localStorage.getItem("words")) {
    const res = await fetch("words.json");
    const data = await res.json();

    // upewnij się że każde słowo ma wymagane pola
    const initialized = data.map(w => ({
      ...w,
      weight: w.weight ?? 0,
      used: w.used ?? 0,
      lastSeen: w.lastSeen ?? 0
    }));

    localStorage.setItem("words", JSON.stringify(initialized));
  }

  words = JSON.parse(localStorage.getItem("words"));

  // jeśli jesteśmy na learn.html
  if (document.getElementById("word")) {
    showNextWord();
  }

  // jeśli jesteśmy na stats.html
  if (document.getElementById("stats")) {
    showStats();
  }
}

////////////////////////////////////////////////////////////
// ⭐ INTELIGENTNY WYBÓR SŁOWA
////////////////////////////////////////////////////////////

function calculatePriority(word) {
  // im mniejsza waga tym większy priorytet
  const weightScore = 10 - word.weight;

  // rzadko używane mają większy priorytet
  const usedScore = 1 / (word.used + 1);

  // im dawno widziane tym większy priorytet
  const timeSinceSeen = Date.now() - (word.lastSeen || 0);
  const timeScore = Math.min(timeSinceSeen / 60000, 5); // max 5

  return weightScore * 2 + usedScore * 5 + timeScore;
}

function pickWord(words) {
  // filtr — unikamy świeżo pokazanych słów
  let candidates = words.filter(
    w => Date.now() - (w.lastSeen || 0) > COOLDOWN_MS
  );

  // jeśli wszystkie są w cooldownie — użyj wszystkich
  if (candidates.length === 0) candidates = words;

  const scores = candidates.map(w => calculatePriority(w));
  const sum = scores.reduce((a, b) => a + b, 0);

  let r = Math.random() * sum;

  for (let i = 0; i < candidates.length; i++) {
    r -= scores[i];
    if (r <= 0) return candidates[i];
  }

  return candidates[0];
}

////////////////////////////////////////////////////////////
// UI
////////////////////////////////////////////////////////////

function showNextWord() {
  currentWord = pickWord(words);

  document.getElementById("word").textContent = currentWord.word;
  document.getElementById("answer").value = "";
  document.getElementById("feedback").textContent = "";
}

function checkAnswer() {
  const answer = document
    .getElementById("answer")
    .value
    .toLowerCase()
    .trim();

  if (answer === currentWord.translation.toLowerCase()) {
    document.getElementById("feedback").textContent = "Poprawnie!";

    currentWord.weight = Math.min(currentWord.weight + 1, 10);
  } else {
    document.getElementById("feedback").textContent =
      "Źle. Poprawna odpowiedź: " + currentWord.translation;

    currentWord.weight = 0;
  }

  updateUsage(currentWord);
  saveAndContinue();
}

function dontKnow() {
  document.getElementById("feedback").textContent =
    "Poprawna odpowiedź: " + currentWord.translation;

  currentWord.weight = 0;

  updateUsage(currentWord);
  saveAndContinue();
}

////////////////////////////////////////////////////////////
// aktualizacja statystyk słowa
////////////////////////////////////////////////////////////

function updateUsage(word) {
  word.used = (word.used || 0) + 1;
  word.lastSeen = Date.now();
}

function saveAndContinue() {
  localStorage.setItem("words", JSON.stringify(words));
  setTimeout(showNextWord, 1500);
}

////////////////////////////////////////////////////////////
// statystyki
////////////////////////////////////////////////////////////

function showStats() {
  const learned = words.filter(w => w.weight >= 5).length;
  const total = words.length;

  document.getElementById("stats").textContent =
    `Opanowane słowa: ${learned} / ${total}`;
}
