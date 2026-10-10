const STORAGE_KEY = "touchless_physics_auth";
const SESSION_KEY = "touchless_physics_session";
const GUEST_KEY = "touchless_physics_guest";
const USERS_DB_KEY = "touchless_physics_users_db";
const LEGACY_OWNER_KEY = "touchless_physics_legacy_owner";

/**
 * Retrieve all registered users from the local database.
 * Falls back to any legacy single-user record to ensure backward compatibility.
 */
export function getAllUsers() {
  const users = [];
  try {
    const data = localStorage.getItem(USERS_DB_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}

  // Check legacy single user in STORAGE_KEY
  try {
    const legacyData = localStorage.getItem(STORAGE_KEY);
    if (legacyData) {
      const legacyUser = JSON.parse(legacyData);
      if (legacyUser && legacyUser.email) {
        users.push(legacyUser);
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        // Lock this original account as the legacy owner
        if (!localStorage.getItem(LEGACY_OWNER_KEY)) {
          localStorage.setItem(LEGACY_OWNER_KEY, legacyUser.email.trim().toLowerCase());
        }
      }
    }
  } catch (_) {}

  return users;
}

/**
 * Get the email of the original account that created pre-existing experiment progress.
 */
export function getLegacyAccountEmail() {
  try {
    const locked = localStorage.getItem(LEGACY_OWNER_KEY);
    if (locked) return locked.trim().toLowerCase();

    // Check users database: users[0] is the original account (Account A)
    const users = getAllUsers();
    if (users.length > 0 && users[0].email) {
      const email = users[0].email.trim().toLowerCase();
      localStorage.setItem(LEGACY_OWNER_KEY, email);
      return email;
    }

    const legacyAuth = localStorage.getItem(STORAGE_KEY);
    if (legacyAuth) {
      const email = JSON.parse(legacyAuth)?.email?.trim()?.toLowerCase();
      if (email) {
        localStorage.setItem(LEGACY_OWNER_KEY, email);
        return email;
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Register or update a user account in the database.
 * NEVER overwrites the original account in STORAGE_KEY with subsequent users.
 */
export function saveUser(user) {
  if (!user || !user.email) {
    throw new Error("Invalid user account data.");
  }

  const normalizedEmail = String(user.email).trim().toLowerCase();
  const users = getAllUsers();

  // If this is the very first user ever registered, designate as legacy owner
  if (users.length === 0 && !localStorage.getItem(LEGACY_OWNER_KEY)) {
    localStorage.setItem(LEGACY_OWNER_KEY, normalizedEmail);
  }

  const existingIdx = users.findIndex(
    (u) => u.email && u.email.trim().toLowerCase() === normalizedEmail
  );

  const newUser = {
    id: user.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: (user.name || "Student").trim(),
    email: normalizedEmail,
    password: user.password,
    createdAt: user.createdAt || new Date().toISOString()
  };

  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...newUser };
  } else {
    users.push(newUser);
  }

  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

  // Only set legacy STORAGE_KEY if not already set (preserve Account A)
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  }

  return newUser;
}

/**
 * Get user object for current session or legacy storage.
 */
export function getUser() {
  const session = getSession();
  if (session && session.email) {
    const normEmail = session.email.trim().toLowerCase();
    const users = getAllUsers();
    const found = users.find((u) => u.email && u.email.trim().toLowerCase() === normEmail);
    if (found) return found;
  }

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Authenticate against the registered users database.
 */
export function loginUser(email, password) {
  if (!email || !password) return null;
  const normEmail = String(email).trim().toLowerCase();
  const users = getAllUsers();

  const found = users.find(
    (u) => u.email && u.email.trim().toLowerCase() === normEmail && u.password === password
  );
  if (found) return found;

  // Fallback to legacy single-user
  const legacy = getUser();
  if (
    legacy &&
    legacy.email &&
    legacy.email.trim().toLowerCase() === normEmail &&
    legacy.password === password
  ) {
    return legacy;
  }

  return null;
}

export function authenticate(email, password) {
  return loginUser(email, password);
}

/**
 * Store active authenticated session.
 */
export function setSession(user, remember = true) {
  const sessionData = {
    id: user.id || `usr_${Date.now()}`,
    name: user.name || "User",
    email: user.email ? String(user.email).trim().toLowerCase() : "",
    guest: Boolean(user.guest)
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

  if (!remember) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  }
}

/**
 * Retrieve active authenticated session.
 */
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

/**
 * Get unique identifier key for current user (normalized email or user id).
 */
export function getCurrentUserKey() {
  const session = getSession();
  if (!session) {
    if (isGuest()) return "guest";
    return "anonymous";
  }
  return session.email ? session.email.trim().toLowerCase() : (session.id || "guest");
}

/**
 * End session without wiping registered accounts from the database.
 */
export function logoutUser() {
  clearSession();
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

export function getDisplayName(sessionObj = null) {
  const user = sessionObj || getSession();

  if (!user) {
    return "Guest";
  }

  return user.name || user.fullName || user.email || "User";
}

export function getInitials(sessionObj = null) {
  const name = getDisplayName(sessionObj);

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