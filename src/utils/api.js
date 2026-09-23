// One place for talking to the backend. Every failed request (network error or a non-2xx
// status) becomes an ApiError that keeps the status and the parsed body, so callers can react
// to things like a 409 stock conflict (`err.data.outOfStock`, `err.data.available`).

export class ApiError extends Error {
  constructor(status, data, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// The backend answers errors in a few shapes: {message}, {error:{message}}, {auth}.
export function errorMessage(data, fallback = "Something went wrong. Please try again.") {
  if (!data || typeof data !== "object") return fallback;
  if (typeof data.message === "string") return data.message;
  if (data.error && typeof data.error.message === "string") return data.error.message;
  if (typeof data.error === "string") return data.error;
  if (typeof data.auth === "string") return data.auth;
  return fallback;
}

// `emptyOn404`: some endpoints answer 404 for "nothing here yet" (empty cart, no orders, no
// search results). Pass the value to return in that case (e.g. `[]` or `null`).
export async function api(path, { method = "GET", body, auth = true, emptyOn404 } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${process.env.REACT_APP_API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, null, "Cannot reach the server. Check your connection and try again.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }

  // `=== false` (not `!res.ok`) so a bare fetch stub without an `ok` field still counts as success.
  if (res.ok === false) {
    if (res.status === 404 && emptyOn404 !== undefined) return emptyOn404;
    throw new ApiError(res.status, data, errorMessage(data));
  }
  return data;
}

// A 409 from the backend that lists the items that are not available.
export const isStockConflict = (err) =>
  err instanceof ApiError && err.status === 409 && Array.isArray(err.data && err.data.outOfStock);
