const btn = document.getElementById('nice-btn');
const resetBtn = document.getElementById('reset-btn');
const counterEl = document.getElementById('counter');
const card = document.getElementById('main-card');
const quoteBox = document.getElementById('quote-box');
const progressBar = document.getElementById('progress-bar');
const milestoneEl = document.getElementById('milestone');

const milestoneSize = 10;

const quotes = [
  "Sehr nice!",
  "Das ist ein guter Bauch.",
  "Stabil!",
  "Unglaubliches Level.",
  "Weiter so!",
  "Bauch-Gefühl: 10/10",
  "Qualitäts-Bauch.",
  "Legendär!",
  "Bauch-tastisch!",
  "Einfach nur WOW.",
  "Ein makelloser Waschbärbauch.",
  "Absolute Wohlfühlzone.",
  "Dieser Bauch verdient einen Orden.",
  "Ein Bauch wie ein Kunstwerk.",
  "Sooo weich und flauschig!",
  "Perfekte Resonanz beim Streicheln.",
  "Erstklassiges Streichel-Feedback.",
  "Jeder Streicherler ein Genuss.",
  "Da steckt viel Liebe (und gutes Essen) drin.",
  "Die reinste Entspannung für die Hände.",
  "Ein meisterhaft gepflegtes Bäuchlein.",
  "Das ist Premium-Qualität.",
  "Spürst du diese Aura?",
  "Ein Bauch für die Geschichtsbücher.",
  "Da kann man direkt neidisch werden.",
  "Einfach himmlisch.",
  "Sanfter als ein Wolkenschloss.",
  "Majestätische Formgebung.",
  "Kein Sixpack, aber ein ganzes Fass voll Glück.",
  "Das nennt man einen echten Wohlstandsbauch!",
  "Streicheleinheiten erfolgreich geloggt.",
  "Mehr davon, bitte!",
  "Der Bauch freut sich sichtlich.",
  "Ein wahrer Traum!"
];

let count = Number.parseInt(localStorage.getItem('niceCount'), 10) || 0;

function updateDashboard() {
  const milestoneProgress = count % milestoneSize;
  const progressPercent = (milestoneProgress / milestoneSize) * 100;

  counterEl.textContent = count;
  milestoneEl.textContent = `${milestoneProgress} / ${milestoneSize}`;
  progressBar.style.width = `${progressPercent}%`;

  if (count > 0 && milestoneProgress === 0) {
    milestoneEl.textContent = `${milestoneSize} / ${milestoneSize}`;
    progressBar.style.width = '100%';
  }
}

function pulseCard() {
  card.classList.remove('pulse');
  void card.offsetWidth;
  card.classList.add('pulse');

  setTimeout(() => {
    card.classList.remove('pulse');
  }, 400);
}

function celebrateMilestone() {
  if (typeof confetti !== 'function' || count % milestoneSize !== 0) {
    return;
  }

  confetti({
    particleCount: 110,
    spread: 76,
    origin: { y: 0.62 },
    colors: ['#38bdf8', '#34d399', '#a78bfa', '#ffffff']
  });
}

btn.addEventListener('click', () => {
  count += 1;
  localStorage.setItem('niceCount', count);

  updateDashboard();
  celebrateMilestone();
  pulseCard();

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteBox.textContent = randomQuote;
});

resetBtn.addEventListener('click', () => {
  count = 0;
  localStorage.setItem('niceCount', count);
  quoteBox.textContent = 'Zurück auf Start. Der Bauch bleibt trotzdem nice.';
  updateDashboard();
  pulseCard();
});

updateDashboard();
