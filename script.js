/* ============================================================
   CONSTANTS & STORAGE KEYS
   ============================================================ */
const STORAGE_KEY_NAME = 'countdown_event_name';
const STORAGE_KEY_DATE = 'countdown_target_date';
const STORAGE_KEY_TIME = 'countdown_target_time';

/** Returns a default target date 30 days from now as "YYYY-MM-DD". */
function defaultTargetDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const dd   = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Loads config from localStorage, falling back to sensible defaults. */
function loadConfig() {
  return {
    name:       localStorage.getItem(STORAGE_KEY_NAME) || 'Coming Soon',
    targetDate: localStorage.getItem(STORAGE_KEY_DATE) || defaultTargetDate(),
    targetTime: localStorage.getItem(STORAGE_KEY_TIME) || '00:00',
  };
}

/** Saves config values to localStorage. */
function saveConfig(name, targetDate, targetTime) {
  localStorage.setItem(STORAGE_KEY_NAME, name);
  localStorage.setItem(STORAGE_KEY_DATE, targetDate);
  localStorage.setItem(STORAGE_KEY_TIME, targetTime);
}

/* ============================================================
   COUNTDOWN PAGE LOGIC
   ============================================================ */
function initCountdownPage() {
  const titleEl   = document.getElementById('eventTitle');
  const timerEl   = document.getElementById('timer');
  const expiredEl = document.getElementById('expiredMessage');

  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!titleEl || !timerEl || !expiredEl) return; // not on this page

  /** Pads a number to at least 2 digits. */
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function tick() {
    const config = loadConfig();
    titleEl.textContent = config.name;

    const target = new Date(`${config.targetDate}T${config.targetTime}:00`);
    const now    = new Date();
    const diff   = target - now; // ms

    if (isNaN(target.getTime()) || diff <= 0) {
      // Countdown finished or invalid date
      timerEl.style.display   = 'none';
      expiredEl.style.display = 'block';
      return;
    }

    timerEl.style.display   = '';
    expiredEl.style.display = 'none';

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    daysEl.textContent    = pad(days);
    hoursEl.textContent   = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  // Run immediately, then every second
  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   ADMIN PAGE LOGIC
   ============================================================ */
function initAdminPage() {
  const form         = document.getElementById('adminForm');
  const nameInput    = document.getElementById('eventName');
  const dateInput    = document.getElementById('targetDate');
  const timeInput    = document.getElementById('targetTime');
  const confirmation = document.getElementById('confirmation');

  if (!form || !nameInput || !dateInput || !timeInput) return; // not on this page

  // Pre-populate from localStorage
  const config = loadConfig();
  nameInput.value = config.name !== 'Coming Soon' ? config.name : '';
  dateInput.value = config.targetDate;
  timeInput.value = config.targetTime;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name       = nameInput.value.trim() || 'Coming Soon';
    const targetDate = dateInput.value;
    const targetTime = timeInput.value || '00:00';

    if (!targetDate) {
      dateInput.focus();
      dateInput.reportValidity();
      return;
    }

    saveConfig(name, targetDate, targetTime);

    // Show confirmation
    if (confirmation) {
      confirmation.classList.add('visible');
      // Scroll to confirmation in case form is long
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Hide confirmation when user edits fields again
  [nameInput, dateInput, timeInput].forEach(function (el) {
    el.addEventListener('input', function () {
      if (confirmation) {
        confirmation.classList.remove('visible');
      }
    });
  });
}

/* ============================================================
   ROUTER — detect page and initialise accordingly
   ============================================================ */
(function init() {
  // Use presence of key elements to decide which page we're on
  if (document.body.classList.contains('page-admin')) {
    initAdminPage();
  } else if (document.body.classList.contains('page-countdown')) {
    initCountdownPage();
  }
})();
