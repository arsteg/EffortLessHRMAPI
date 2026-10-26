module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/jest.env.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 20000,
  // These integration tests hit a real (dockerized, disposable) MongoDB instance
  // sequentially against one shared database, so they must not run in parallel.
  maxWorkers: 1,
  // This is a plain CommonJS codebase with no JSX/TS that needs transpiling.
  // Babel's stricter parser rejects some legacy-but-valid-under-Node patterns
  // elsewhere in the codebase (e.g. a duplicate function declaration in
  // leaveController.js), so skip transformation and let Node's native
  // require() load application modules exactly as the real server does.
  transform: {},
  // Fire-and-forget notification/email helpers and the mongoose connection
  // keep the event loop alive after tests finish; force-exit rather than
  // rewriting unrelated modules just to satisfy Jest's open-handle detector.
  forceExit: true,
};
