window.FS = window.FS || {};
FS.State = {
  mode: "menu",
  name: "Kapitän",
  credits: 0,
  fish: [],
  hasBait: true,
  buoyOnDeck: true,
  mapSeed: FS.CFG.worldSeed,
  activeHarbor: null,
  isPiloting: false,
  currentTarget: null,
  toastUntil: 0,
  toastText: "",
  started: false,
  gameBuilt: false,
  savedCamera: null
};
FS.setMode = function(mode) {
  FS.State.mode = mode;
  if (FS.HUD) FS.HUD.syncMode();
};
FS.toast = function(message, seconds=2.8) {
  FS.State.toastText = message;
  FS.State.toastUntil = performance.now() + seconds * 1000;
  const el = document.getElementById("toast");
  if (el) { el.textContent = message; el.classList.remove("hidden"); }
};
FS.setMission = function(message) {
  const el = document.getElementById("mission-text");
  if (el) el.textContent = message;
};
