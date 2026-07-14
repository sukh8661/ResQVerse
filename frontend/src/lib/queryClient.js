import { QueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function apiUrl(url) {
  if (!API_BASE_URL || /^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = await res.text() || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}
async function apiRequest(method, url, data) {
  const res = await fetch(apiUrl(url), {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {})
    },
    body: data ? JSON.stringify(data) : void 0,
    credentials: "include"
  });
  await throwIfResNotOk(res);
  return res;
}
const getQueryFn = ({ on401: unauthorizedBehavior }) => async ({ queryKey }) => {
  const res = await fetch(apiUrl(queryKey.join("/")), {
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
    credentials: "include"
  });
  if (unauthorizedBehavior === "returnNull" && res.status === 401) {
    return null;
  }
  await throwIfResNotOk(res);
  return await res.json();
};
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false
    },
    mutations: {
      retry: false
    }
  }
});
export {
  apiUrl,
  apiRequest,
  getQueryFn,
  queryClient
};
