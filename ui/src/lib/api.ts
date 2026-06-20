import { mockFetch } from "./demo/mockApi";

/**
 * Base URL for the backend API. Configured via the VITE_API_URL environment
 * variable at build time. Falls back to the local dev server so `npm run dev`
 * keeps working with no extra setup.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");

const DEMO_FLAG_KEY = "demo";

/**
 * Whether the app is currently running in demo mode. Demo mode can be forced
 * for an entire deployment via VITE_DEMO_MODE=true, or toggled per-session by
 * the "Try the demo" button on the login page (stored in localStorage).
 */
export function isDemo(): boolean {
  if (import.meta.env.VITE_DEMO_MODE === "true") return true;
  try {
    return localStorage.getItem(DEMO_FLAG_KEY) === "true";
  } catch {
    return false;
  }
}

/** Start a demo session: sets the demo flag and a placeholder auth token. */
export function enterDemo(): void {
  try {
    localStorage.setItem(DEMO_FLAG_KEY, "true");
    localStorage.setItem("token", "demo-token");
  } catch {
    /* ignore storage errors */
  }
}

/** Clear the demo session flag (called on logout). */
export function exitDemo(): void {
  try {
    localStorage.removeItem(DEMO_FLAG_KEY);
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Drop-in replacement for `fetch` against the backend. Callers pass a leading
 * path (e.g. "/orders/2026-01-01") instead of a full URL.
 *
 * In demo mode the request is served from an in-memory mock instead of the
 * network, so the static UI can be deployed and explored with no backend.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (isDemo()) {
    return mockFetch(path, init);
  }
  return fetch(`${API_BASE}${path}`, init);
}
