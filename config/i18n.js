const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en-IN', 'hi-IN'], // Supported locales
  directory: path.join(__dirname, '../locales'), // Path to translation files
  defaultLocale: 'en-IN', // Fallback locale
  objectNotation: true, // Allows nested keys (e.g., "error.generic")
  updateFiles: false, // Prevents auto-updating translation files
  queryParameter: 'locale', // Allows ?locale=hi-IN in URLs
  api: {
    '__': 't', // Alias for translation function (req.t instead of req.__)
  },
});

module.exports = i18n;