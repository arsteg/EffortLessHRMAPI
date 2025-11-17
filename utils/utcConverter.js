/**
 * Converts any valid date input to a UTC Date object
 * Safe for MongoDB storage, works on any server timezone
 * 
 * @param {string | Date | number} input - Any date-like input
 * @returns {Date} - A proper UTC Date object
 * @throws {Error} - If input is invalid
 */
function toUTCDate(input) {
  if (!input) {
    throw new Error('Invalid date input: input is null or undefined');
  }

  let date;

  // Case 1: Already a Date object
  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      throw new Error('Invalid Date object');
    }
    date = input;
  }
  // Case 2: Number (timestamp)
  else if (typeof input === 'number') {
    date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp');
    }
  }
  // Case 3: String (ISO, RFC, etc.)
  else if (typeof input === 'string') {
    // Trim whitespace
    const trimmed = input.trim();
    if (!trimmed) {
      throw new Error('Empty date string');
    }

    // Try parsing with Date first (handles ISO 8601 with Z or offset)
    date = new Date(trimmed);

    // If invalid, try manual parsing for common formats
    if (isNaN(date.getTime())) {
      // Optional: Add fallback parsing for formats like "DD-MM-YYYY"
      // For now, we rely on built-in parser (covers most cases)
      throw new Error(`Invalid date string: ${trimmed}`);
    }
  } else {
    throw new Error(`Unsupported input type: ${typeof input}`);
  }

  // FINAL STEP: Ensure it's a proper UTC-based Date
  // Create a new Date from UTC components to avoid local timezone interference
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ));
}

// async function toUTC(dateString) {
//     const date = new Date(dateString);

//     // If only a date is sent (YYYY-MM-DD), time becomes 00:00:00 local.
//     // Convert it to true UTC.
//     return new Date(Date.UTC(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate(),
//       date.getHours(),
//       date.getMinutes(),
//       date.getSeconds(),
//       date.getMilliseconds()
//     ));
//   }

module.exports = {
    toUTCDate
};