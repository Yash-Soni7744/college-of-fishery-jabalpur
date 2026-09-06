const { AsyncLocalStorage } = require('async_hooks');

const requestStorage = new AsyncLocalStorage();

// Express middleware to initialize request context
function requestContextMiddleware(req, res, next) {
  requestStorage.run({ req }, () => {
    next();
  });
}

// Helper to retrieve current request anywhere in the call stack
function getCurrentRequest() {
  const store = requestStorage.getStore();
  return store ? store.req : null;
}

module.exports = {
  requestContextMiddleware,
  getCurrentRequest
};
