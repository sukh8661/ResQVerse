export function getAuthSession() {
  try {
    return JSON.parse(localStorage.getItem("authSession") || "null");
  } catch {
    return null;
  }
}

export function setAuthSession(session) {
  localStorage.setItem("authSession", JSON.stringify(session));
  if (session?.user?.role === "ngo") {
    localStorage.setItem("ngoAuth", JSON.stringify(session));
  }
}

export function clearAuthSession() {
  localStorage.removeItem("authSession");
  localStorage.removeItem("ngoAuth");
}

export function getAuthToken() {
  return getAuthSession()?.token || "";
}

export function dashboardPathForRole(role) {
  if (role === "admin") return "/admin-dashboard";
  if (role === "volunteer") return "/volunteer-dashboard";
  if (role === "ngo") return "/ngo-dashboard";
  return "/";
}
