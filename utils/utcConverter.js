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

const combineDateAndTime = (dateString, timeDateObj) => {
  if (!timeDateObj) return new Date(dateString);

  const base = new Date(dateString);
  const time = new Date(timeDateObj);

  base.setHours(
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds()
  );

  return base;
};


// Convert ANY input date to a pure UTC date-only (00:00:00.000Z)
function toUtcDateOnly(dateInput) {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

// Create a UTC date-only from Y-M-D
function toUtcDateOnlyFromYMD(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

// Current UTC timestamp
function nowUtc() {
  return new Date();   // JS always stores dates internally in UTC
}

// Get month start/end in pure UTC (perfect for Mongo range queries)
function getMonthRangeUtc(year, month) {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // last day of month
  return { startDate, endDate };
}

//Search for a full day (date-only) how to use
// const start = toUtcDateOnly(req.query.date);
// const end = new Date(start);
// end.setUTCHours(23, 59, 59, 999);

// Model.find({
//   attendanceDate: { $gte: start, $lte: end }
// });

module.exports = {
    toUTCDate,
    combineDateAndTime,
    toUtcDateOnly,
    nowUtc,
    getMonthRangeUtc,
    toUtcDateOnlyFromYMD 
};