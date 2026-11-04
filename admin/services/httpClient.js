const axios = require('axios');

const DEFAULT_TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS || 10000);
const MAX_RETRIES = Number(process.env.HTTP_MAX_RETRIES || 2);

function getPgBaseUrl() {
  const url = process.env.REACT_APP_API_URL || 'http://localhost:1357';
  return String(url).replace(/\/$/, '');
}

function isRetryable(error) {
  const status = error.response?.status;
  if (!status) return true;
  return status >= 500 || status === 429;
}

async function withRetry(requestFn, retries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }

  throw lastError;
}

function createHttpClient(baseURL, options = {}) {
  return axios.create({
    baseURL: baseURL || undefined,
    timeout: options.timeout ?? DEFAULT_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
}

const pgHttp = createHttpClient(getPgBaseUrl());
const externalHttp = createHttpClient('', { timeout: 15000 });

async function requestPg(config) {
  try {
    const response = await withRetry(() => pgHttp.request(config));
    return { ok: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      ok: false,
      status: error.response?.status || 0,
      data: error.response?.data ?? null,
      error: error.message || 'Network error',
    };
  }
}

async function requestExternal(url, config = {}) {
  try {
    const response = await withRetry(() =>
      externalHttp.request({
        url,
        method: config.method || 'GET',
        ...config,
      })
    );
    return { ok: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      ok: false,
      status: error.response?.status || 0,
      data: error.response?.data ?? null,
      error: error.message || 'Network error',
    };
  }
}

module.exports = {
  pgHttp,
  externalHttp,
  withRetry,
  getPgBaseUrl,
  requestPg,
  requestExternal,
};
