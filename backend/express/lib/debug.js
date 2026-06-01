/**
 * Debug logging utility untuk tracking
 */

const LOG_PREFIX = '[EVALIFY]';

function logRequest(endpoint, method, payload = {}) {
  console.log(`${LOG_PREFIX} ${method} ${endpoint}`, JSON.stringify(payload, null, 2));
}

function logError(endpoint, error) {
  console.error(`${LOG_PREFIX} ERROR ${endpoint}`, {
    message: error?.message,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
    fullError: error?.toString(),
  });
}

function logDatabase(operation, table, data, result) {
  console.log(`${LOG_PREFIX} DB ${operation.toUpperCase()} ${table}`, {
    data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
    result: result?.data ? `✅ Success (${result.data.length} rows)` : `❌ ${result?.error?.message}`,
  });
}

function logAuthFail(reason) {
  console.error(`${LOG_PREFIX} AUTH FAIL: ${reason}`);
}

function logSuccess(endpoint, message = '') {
  console.log(`${LOG_PREFIX} ✅ ${endpoint} ${message}`);
}

module.exports = {
  logRequest,
  logError,
  logDatabase,
  logAuthFail,
  logSuccess,
};
