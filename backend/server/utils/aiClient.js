/**
 * Zero-dependency AI Service Client
 * Uses Node.js native fetch with automatic json parsing, timeout, and axios-compatible response structure.
 */

async function post(url, data = {}, config = {}) {
  const timeoutMs = config.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || errBody.message || `HTTP ${res.status}`);
    }

    const responseData = await res.json();
    return { data: responseData, status: res.status };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function get(url, config = {}) {
  const timeoutMs = config.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(config.headers || {}),
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || errBody.message || `HTTP ${res.status}`);
    }

    const responseData = await res.json();
    return { data: responseData, status: res.status };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

module.exports = {
  post,
  get,
};
