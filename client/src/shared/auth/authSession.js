const STORAGE_KEYS = Object.freeze({
  userData: "userData",
  isFirstTimeUser: "isFirstTimeUser",
  newlyRegisteredUser: "newlyRegisteredUser",
});

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

export function getUserData() {
  const data = readItem(STORAGE_KEYS.userData);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setAuthSession(user) {
  writeItem(STORAGE_KEYS.userData, JSON.stringify(user || null));
}

export function clearAuthSession() {
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
