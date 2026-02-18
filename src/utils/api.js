// ─────────────────────────────────────────────────────────────
// utils/api.js  –  Central API call utility for Lendwise
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * callApi – makes an HTTP request with auto-injected headers.
 *
 * @param {object} options
 * @param {string}  options.url             - Endpoint path, e.g. "/api/auth/login"
 * @param {"GET"|"POST"|"PUT"|"DELETE"|"PATCH"} [options.method="GET"]
 * @param {object}  [options.body]          - Request body (auto-stringified)
 * @param {object}  [options.headers]       - Additional headers
 * @param {boolean} [options.validateResponse=false]
 *   - true  → checks apiResponseCode === 200, shows toast, returns apiResponseData on success
 *   - false → returns the full raw response object
 * @param {Function} [options.showToast]    - Toast function from useToast(); required when validateResponse=true
 *
 * @returns {Promise<any>} Parsed response data
 */
export async function callApi({
  url,
  method = "GET",
  body = null,
  headers = {},
  validateResponse = false,
  showToast = null,
}) {
  // ── 1. Build headers ──────────────────────────────────────
  const defaultHeaders = {
    "Content-Type": "application/json",
    urn: "LENDWISE_WEB", // Auto-injected "urn" header
  };

  // Auto-inject authToken from sessionStorage if present
  const authToken = sessionStorage.getItem("authToken");
  if (authToken) {
    defaultHeaders["Authorization"] = `Bearer ${authToken}`;
  }

  const finalHeaders = { ...defaultHeaders, ...headers };

  // ── 2. Build fetch config ─────────────────────────────────
  const config = {
    method,
    headers: finalHeaders,
  };

  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }

  // ── 3. Call the API ───────────────────────────────────────
  let response;
  try {
    response = await fetch(`${BASE_URL}${url}`, config);
  } catch (networkError) {
    const message = "Network error. Please check your connection.";
    if (showToast) showToast(message, "error");
    throw new Error(message);
  }

  // ── 4. Parse JSON ─────────────────────────────────────────
  let json;
  try {
    json = await response.json();
  } catch {
    const message = "Unexpected response from server.";
    if (showToast) showToast(message, "error");
    throw new Error(message);
  }

  // ── 5. Validate response (optional) ──────────────────────
  if (validateResponse) {
    if (json.apiResponseCode === 200) {
      // Success – show success toast if message exists
      if (json.apiResponseMessage && showToast) {
        showToast(json.apiResponseMessage, "success");
      }
      // Return only the inner apiResponseData
      return json.apiResponseData;
    } else {
      // Failure – show error toast
      const errorMsg = json.apiResponseMessage || "Something went wrong.";
      if (showToast) showToast(errorMsg, "error");
      throw new Error(errorMsg);
    }
  }

  // ── 6. No validation – return full response ───────────────
  return json;
}