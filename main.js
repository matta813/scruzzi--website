const btn = document.getElementById('nice-btn');
const resetBtn = document.getElementById('reset-btn');
const counterEl = document.getElementById('counter');
const card = document.getElementById('main-card');
const quoteBox = document.getElementById('quote-box');
const progressBar = document.getElementById('progress-bar');
const milestoneEl = document.getElementById('milestone');
const deviceChip = document.getElementById('device-chip');

const milestoneSize = 10;
const deviceStorageKey = 'niceDeviceId';

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

let count = 0;

function createDeviceId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (value) =>
    (Number(value) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(value) / 4).toString(16)
  );
}

function getDeviceId() {
  const existingDeviceId = localStorage.getItem(deviceStorageKey);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const newDeviceId = createDeviceId();
  localStorage.setItem(deviceStorageKey, newDeviceId);
  return newDeviceId;
}

const deviceId = getDeviceId();

function shortDeviceId() {
  return deviceId.split('-')[0];
}

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

function setLoading(isLoading) {
  btn.disabled = isLoading;
  resetBtn.disabled = isLoading;
}

async function requestDeviceState(path = '', options = {}) {
  const response = await fetch(`/api/devices/${deviceId}${path}`, {
    headers: {
      'Accept': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

function applyServerState(serverState) {
  count = serverState.count;
  updateDashboard();
}

function showOfflineHint() {
  const localFallback = Number.parseInt(localStorage.getItem('niceCountFallback'), 10) || 0;
  count = localFallback;
  updateDashboard();
  quoteBox.textContent = 'Server gerade nicht erreichbar. Lokaler Fallback aktiv.';
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

btn.addEventListener('click', async () => {
  setLoading(true);

  try {
    const serverState = await requestDeviceState('/increment', { method: 'POST' });
    applyServerState(serverState);
    localStorage.setItem('niceCountFallback', count);
    celebrateMilestone();
    pulseCard();

    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteBox.textContent = randomQuote;
  } catch (error) {
    quoteBox.textContent = 'Speichern fehlgeschlagen. Bitte Server prüfen.';
  } finally {
    setLoading(false);
  }
});

resetBtn.addEventListener('click', async () => {
  setLoading(true);

  try {
    const serverState = await requestDeviceState('/reset', { method: 'POST' });
    applyServerState(serverState);
    localStorage.setItem('niceCountFallback', count);
    quoteBox.textContent = 'Zurück auf Start. Der Bauch bleibt trotzdem nice.';
    pulseCard();
  } catch (error) {
    quoteBox.textContent = 'Reset fehlgeschlagen. Bitte Server prüfen.';
  } finally {
    setLoading(false);
  }
});

async function boot() {
  deviceChip.textContent = `Gerät ${shortDeviceId()}`;

  try {
    setLoading(true);
    const serverState = await requestDeviceState();
    applyServerState(serverState);
    localStorage.setItem('niceCountFallback', count);
    quoteBox.textContent = 'Server-Speicher verbunden. Bereit für die nächste Streicheleinheit.';
  } catch (error) {
    showOfflineHint();
  } finally {
    setLoading(false);
  }
}

updateDashboard();
boot();
