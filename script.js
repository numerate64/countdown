const STORAGE_KEYS = {
  name: "countdown.event.name",
  description: "countdown.event.description",
  date: "countdown.event.date",
  time: "countdown.event.time",
  theme: "countdown.theme"
};

const DEFAULT_NAME = "Coming Soon";
const DEFAULT_DESCRIPTION = "The next milestone is on the clock.";
const DEFAULT_TIME = "18:00";
const THEMES = {
  light: "light",
  dark: "dark"
};

function formatDatePart(value) {
  return String(value).padStart(2, "0");
}

function getDefaultFutureDate() {
  const future = new Date();
  future.setDate(future.getDate() + 30);

  return [
    future.getFullYear(),
    formatDatePart(future.getMonth() + 1),
    formatDatePart(future.getDate())
  ].join("-");
}

function getDefaultConfig() {
  return {
    name: DEFAULT_NAME,
    description: DEFAULT_DESCRIPTION,
    date: getDefaultFutureDate(),
    time: DEFAULT_TIME
  };
}

function readStoredConfig() {
  const defaults = getDefaultConfig();

  return {
    name: (localStorage.getItem(STORAGE_KEYS.name) || defaults.name).trim() || defaults.name,
    description: (localStorage.getItem(STORAGE_KEYS.description) || defaults.description).trim() || defaults.description,
    date: (localStorage.getItem(STORAGE_KEYS.date) || defaults.date).trim() || defaults.date,
    time: (localStorage.getItem(STORAGE_KEYS.time) || defaults.time).trim() || defaults.time
  };
}

function writeStoredConfig(config) {
  localStorage.setItem(STORAGE_KEYS.name, config.name);
  localStorage.setItem(STORAGE_KEYS.description, config.description);
  localStorage.setItem(STORAGE_KEYS.date, config.date);
  localStorage.setItem(STORAGE_KEYS.time, config.time);
}

function buildTargetDate(dateValue, timeValue) {
  const target = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(target.getTime()) ? null : target;
}

function formatTargetForDisplay(target) {
  if (!target) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(target);
}

function padUnit(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function showElement(element, shouldShow) {
  if (!element) {
    return;
  }

  element.classList.toggle("is-hidden", !shouldShow);
}

function getPreferredTheme() {
  const storedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (storedTheme === THEMES.light || storedTheme === THEMES.dark) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? THEMES.light : THEMES.dark;
}

function applyTheme(theme) {
  const nextTheme = theme === THEMES.light ? THEMES.light : THEMES.dark;
  const toggle = document.getElementById("themeToggle");
  const toggleText = document.getElementById("themeToggleText");
  const isLight = nextTheme === THEMES.light;

  document.documentElement.dataset.theme = nextTheme;

  if (toggle) {
    toggle.setAttribute("aria-pressed", String(isLight));
    toggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  }

  if (toggleText) {
    toggleText.textContent = isLight ? "Dark" : "Light";
  }
}

function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");

  applyTheme(getPreferredTheme());

  if (!toggle) {
    return;
  }

  toggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === THEMES.light ? THEMES.light : THEMES.dark;
    const nextTheme = currentTheme === THEMES.light ? THEMES.dark : THEMES.light;

    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
    applyTheme(nextTheme);
  });
}

function initCountdownPage() {
  const title = document.getElementById("eventTitle");
  const subtitle = document.getElementById("eventSubtitle");
  const targetDisplay = document.getElementById("targetDisplay");
  const countdownGrid = document.getElementById("countdownGrid");
  const expiredState = document.getElementById("expiredState");
  const days = document.getElementById("days");
  const hours = document.getElementById("hours");
  const minutes = document.getElementById("minutes");
  const seconds = document.getElementById("seconds");

  if (!title || !subtitle || !targetDisplay || !countdownGrid || !expiredState) {
    return;
  }

  const render = () => {
    const config = readStoredConfig();
    const target = buildTargetDate(config.date, config.time);
    const now = new Date();

    title.textContent = config.name;
    subtitle.textContent = config.description;
    targetDisplay.textContent = formatTargetForDisplay(target);

    if (!target) {
      showElement(countdownGrid, false);
      showElement(expiredState, true);
      expiredState.querySelector(".status-title").textContent = "Invalid target date";
      expiredState.querySelector(".status-copy").textContent = "Open the admin page and save a valid date and time.";
      return;
    }

    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      showElement(countdownGrid, false);
      showElement(expiredState, true);
      expiredState.querySelector(".status-title").textContent = "It's time!";
      expiredState.querySelector(".status-copy").textContent = "The scheduled moment has arrived.";
      return;
    }

    showElement(countdownGrid, true);
    showElement(expiredState, false);

    const totalSeconds = Math.floor(difference / 1000);
    const dayValue = Math.floor(totalSeconds / 86400);
    const hourValue = Math.floor((totalSeconds % 86400) / 3600);
    const minuteValue = Math.floor((totalSeconds % 3600) / 60);
    const secondValue = totalSeconds % 60;

    days.textContent = padUnit(dayValue);
    hours.textContent = padUnit(hourValue);
    minutes.textContent = padUnit(minuteValue);
    seconds.textContent = padUnit(secondValue);
  };

  render();
  window.setInterval(render, 1000);
  window.addEventListener("storage", render);
}

function initAdminPage() {
  const form = document.getElementById("adminForm");
  const saveMessage = document.getElementById("saveMessage");
  const eventName = document.getElementById("eventName");
  const eventDescription = document.getElementById("eventDescription");
  const targetDate = document.getElementById("targetDate");
  const targetTime = document.getElementById("targetTime");

  if (!form || !eventName || !eventDescription || !targetDate || !targetTime) {
    return;
  }

  const populateFields = () => {
    const config = readStoredConfig();
    eventName.value = config.name;
    eventDescription.value = config.description;
    targetDate.value = config.date;
    targetTime.value = config.time;
  };

  const hideMessage = () => showElement(saveMessage, false);

  populateFields();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!targetDate.value) {
      targetDate.reportValidity();
      return;
    }

    if (!targetTime.value) {
      targetTime.reportValidity();
      return;
    }

    const config = {
      name: eventName.value.trim() || DEFAULT_NAME,
      description: eventDescription.value.trim() || DEFAULT_DESCRIPTION,
      date: targetDate.value,
      time: targetTime.value
    };

    writeStoredConfig(config);
    showElement(saveMessage, true);
  });

  [eventName, eventDescription, targetDate, targetTime].forEach((field) => {
    field.addEventListener("input", hideMessage);
    field.addEventListener("change", hideMessage);
  });
}

initThemeToggle();

if (document.body.classList.contains("page-countdown")) {
  initCountdownPage();
}

if (document.body.classList.contains("page-admin")) {
  initAdminPage();
}
