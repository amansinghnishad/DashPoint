const STORAGE_KEYS = Object.freeze({
  userData: "userData",
  isFirstTimeUser: "isFirstTimeUser",
  newlyRegisteredUser: "newlyRegisteredUser",
});

let inMemoryAccessToken = null;

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readItem(key) {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeItem(key, value) {
  try {
    if (value === null || value === undefined) {
      getStorage()?.removeItem(key);
      return;
    }
    getStorage()?.setItem(key, value);
  } catch {
    // ignore storage write failures
  }
}

export function getAuthToken() {
  return inMemoryAccessToken;
}

export function setAuthSession(token, user) {
  inMemoryAccessToken = token || null;
  writeItem(STORAGE_KEYS.userData, JSON.stringify(user || null));
}

export function clearAuthSession() {
  inMemoryAccessToken = null;
  writeItem(STORAGE_KEYS.userData, null);
  clearFirstTimeUserFlag();
  clearNewlyRegisteredUser();
}

export function getFirstTimeUserFlag() {
  return readItem(STORAGE_KEYS.isFirstTimeUser) === "true";
}

export function setFirstTimeUserFlag(value) {
  if (value) {
    writeItem(STORAGE_KEYS.isFirstTimeUser, "true");
    return;
  }
  clearFirstTimeUserFlag();
}

export function clearFirstTimeUserFlag() {
  writeItem(STORAGE_KEYS.isFirstTimeUser, null);
}

export function getNewlyRegisteredUser() {
  return readItem(STORAGE_KEYS.newlyRegisteredUser);
}

export function setNewlyRegisteredUser(email) {
  writeItem(STORAGE_KEYS.newlyRegisteredUser, email || null);
}

export function clearNewlyRegisteredUser() {
  writeItem(STORAGE_KEYS.newlyRegisteredUser, null);
}
