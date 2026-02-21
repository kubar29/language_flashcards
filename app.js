function startLearning() {
  window.location.href = "learn.html";
}

let words = [];
let currentWord = null;
let isAnswering = false;


const COOLDOWN_MS = 30000; 

document.addEventListener("DOMContentLoaded", init);

async function init() {
  if (!localStorage.getItem("words")) {
    const res = await fetch("words.json");
    const data = await res.json();

    const initialized = data.map(w => ({
      ...w,
      weight: w.weight ?? 0,
      used: w.used ?? 0,
      lastSeen: w.lastSeen ?? 0
    }));

    localStorage.setItem("words", JSON.stringify(initialized));
  }

  words = JSON.parse(localStorage.getItem("words"));

  if (document.getElementById("word")) {
    showNextWord();
  }

  if (document.getElementById("stats")) {
    showStats();
  }
}


async function requestNotificationPermission() {
  if (!("Notification" in window)) return;

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    sendDailyReminder();
  }
}

function sendDailyReminder() {
  if (Notification.permission !== "granted") return;

  const lastNotified = localStorage.getItem("lastNotification") || 0;

  if (Date.now() - lastNotified > 24 * 60 * 60 * 1000) {
    const notification = new Notification("Flashcards", {
      body: "Czas się dziś pouczyć 📚",
      icon: "./icons/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "daily-reminder"
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "learn.html";
    };

    localStorage.setItem("lastNotification", Date.now());
  }
}

document.addEventListener("DOMContentLoaded", requestNotificationPermission);

function vibrate(pattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function calculatePriority(word) {
  
  const weightScore = 10 - word.weight;
  const usedScore = 1 / (word.used + 1);
  const timeSinceSeen = Date.now() - (word.lastSeen || 0);
  const timeScore = Math.min(timeSinceSeen / 60000, 5);

  return weightScore * 2 + usedScore * 5 + timeScore;
}

function pickWord(words) {
  let candidates = words.filter(
    w => Date.now() - (w.lastSeen || 0) > COOLDOWN_MS
  );

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

function showNextWord() {
  currentWord = pickWord(words);

  document.getElementById("word").textContent = currentWord.word;
  document.getElementById("answer").value = "";
  document.getElementById("feedback").textContent = "";

  const input = document.getElementById("answer");
  const btn = document.getElementById("knowBtn");

  if (input) input.style.display = "none";
  if (btn) btn.textContent = "Znam";

  isAnswering = false;
}


function handleKnow() {
  const input = document.getElementById("answer");
  const btn = document.getElementById("knowBtn");

  if (!isAnswering) {
    input.style.display = "block";
    input.focus();

    btn.textContent = "Sprawdź";
    isAnswering = true;

    return;
  }

  checkAnswer();
}


function checkAnswer() {
  const answer = document
    .getElementById("answer")
    .value
    .toLowerCase()
    .trim();

  if (answer === currentWord.translation.toLowerCase()) {
    document.getElementById("feedback").textContent = "Poprawnie!";
    vibrate(100);
    currentWord.weight = Math.min(currentWord.weight + 1, 10);
  } else {
    document.getElementById("feedback").textContent = `Źle. Poprawna odpowiedź:  ${currentWord.translation}`;
    vibrate([200, 100, 200]);
    currentWord.weight = 0;
  }

  updateUsage(currentWord);
  saveAndContinue();
}

function dontKnow() {
  document.getElementById("feedback").textContent =
    "Poprawna odpowiedź: " + currentWord.translation;
  vibrate([200, 100, 200]);
  currentWord.weight = 0;

  updateUsage(currentWord);
  saveAndContinue();
}

function updateUsage(word) {
  word.used = (word.used || 0) + 1;
  word.lastSeen = Date.now();
}

function saveAndContinue() {
  localStorage.setItem("words", JSON.stringify(words));
  setTimeout(showNextWord, 1500);
}

function formatDate(timestamp) {
  if (!timestamp || timestamp === 0) return "nigdy";

  const date = new Date(timestamp);
  return date.toLocaleString();
}

function showStats() {
  const learned = words.filter(w => w.weight >= 5).length;
  const total = words.length;

  document.getElementById("stats-summary").textContent =
    `Opanowane słowa: ${learned} / ${total}`;

  const tableBody = document.querySelector("#stats-table tbody");
  tableBody.innerHTML = "";

  const sortedWords = [...words].sort((a, b) => b.weight - a.weight);

  sortedWords.forEach(word => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${word.word}</td>
      <td>${word.translation}</td>
      <td>${word.weight}/10</td>
      <td>${word.used || 0}</td>
      <td>${formatDate(word.lastSeen)}</td>
    `;

    tableBody.appendChild(row);
  });
}


