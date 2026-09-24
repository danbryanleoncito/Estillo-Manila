// Helpers for tests that stub `fetch`. (CRA resets mocks before every test, so call mockFetch inside
// beforeEach or the test itself.)

export const reply = (status, body) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

// What fetch does when the server cannot be reached at all.
export const offline = () => Promise.reject(new TypeError("Failed to fetch"));

// routes: [["GET /order/my-orders", (url, options) => reply(200, {...})], ...]. The first route whose
// method matches and whose path fragment is in the URL answers; anything else is a 404, so a test
// notices a request it did not expect.
export function mockFetch(routes) {
  global.fetch = jest.fn((url, options = {}) => {
    const method = options.method || "GET";
    for (const [key, handler] of routes) {
      const [routeMethod, fragment] = key.split(" ");
      if (routeMethod === method && url.includes(fragment)) return handler(url, options);
    }
    return reply(404, { message: `no mock for ${method} ${url}` });
  });
  return global.fetch;
}

export const callsTo = (fetchMock, fragment) =>
  fetchMock.mock.calls.filter(([url]) => url.includes(fragment));
