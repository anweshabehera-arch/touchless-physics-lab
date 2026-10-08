const STORAGE_KEY = "touchless_physics_auth";
const SESSION_KEY = "touchless_physics_session";
const GUEST_KEY = "touchless_physics_guest";

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getUser() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function loginUser(email, password) {
  const user = getUser();

  if (!user) {
    return null;
  }

  if (user.email === email && user.password === password) {
    return user;
  }

  return null;
}

export function authenticate(email, password) {
  return loginUser(email, password);
}

export function setSession(user, remember = true) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));

  if (!remember) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function getSession() {
  const data =
    sessionStorage.getItem(SESSION_KEY) ||
    localStorage.getItem(SESSION_KEY);

  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(GUEST_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(GUEST_KEY);
}

export function continueAsGuest() {
  localStorage.setItem(GUEST_KEY, "true");
}

export function isGuest() {
  return localStorage.getItem(GUEST_KEY) === "true";
}

export function getDisplayName() {
  const user = getSession();

  if (!user) {
    return "Guest";
  }

  return user.name || user.fullName || user.email || "User";
}

export function getInitials() {
  const name = getDisplayName();

  if (!name || name === "Guest") {
    return "G";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}