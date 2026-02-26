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

/**
 * Get attendance period range based on cutoff day
 * @param {number} year - Payroll year (e.g., 2025)
 * @param {number} month - Payroll month (1-12)
 * @param {string|number} cutoffDay - 'all' or day 1-31
 * @returns {Object} { startDate, endDate, totalDays }
 *
 * Example: cutoffDay=25, month=3, year=2025
 * Returns: Feb 26 00:00:00.000 UTC to Mar 25 23:59:59.999 UTC, totalDays=28
 */
function getAttendancePeriodRange(year, month, cutoffDay) {
  // If 'all', use full calendar month
  if (cutoffDay === 'all' || !cutoffDay) {
    const { startDate, endDate } = getMonthRangeUtc(year, month);
    const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return { startDate, endDate, totalDays };
  }

  const cutoff = parseInt(cutoffDay);
  if (isNaN(cutoff) || cutoff < 1 || cutoff > 31) {
    throw new Error(`Invalid cutoffDay: ${cutoffDay}`);
  }

  // Previous month calculation
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  // Handle months with fewer days (Feb, 30-day months)
  const prevMonthMaxDays = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
  const currentMonthMaxDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prevMonthCutoff = Math.min(cutoff, prevMonthMaxDays);
  const currentMonthCutoff = Math.min(cutoff, currentMonthMaxDays);

  // Start: (cutoff + 1) of previous month at midnight UTC
  const startDate = toUtcDateOnlyFromYMD(prevYear, prevMonth, prevMonthCutoff + 1);

  // End: cutoff of current month at 23:59:59.999 UTC (for inclusive range queries)
  const endDate = new Date(Date.UTC(year, month - 1, currentMonthCutoff, 23, 59, 59, 999));

  // Calculate total days using UTC date-only comparison
  const startDateOnly = toUtcDateOnlyFromYMD(prevYear, prevMonth, prevMonthCutoff + 1);
  const endDateOnly = toUtcDateOnlyFromYMD(year, month, currentMonthCutoff);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((endDateOnly - startDateOnly) / oneDayMs) + 1;

  return { startDate, endDate, totalDays };
}

/**
 * Determine payroll period for attendance sync (used by cron)
 * @param {number} currentYear - Current year
 * @param {number} currentMonth - Current month (1-12)
 * @param {string|number} cutoffDay - 'all' or day 1-31
 * @returns {Object} { year, month }
 *
 * Example: Today is Feb 23, cutoffDay=22
 * Cron should sync February payroll (Jan 23 - Feb 22 attendance) - just completed
 * Returns: { year: 2026, month: 2 }
 *
 * Example: Today is Feb 1, cutoffDay='all'
 * Cron should sync January payroll (Jan 1 - Jan 31 attendance) - now complete
 * Returns: { year: 2026, month: 1 }
 */
function getPayrollPeriodForSync(currentYear, currentMonth, cutoffDay) {
  if (cutoffDay === 'all' || !cutoffDay) {
    // Without cutoff: sync previous month's payroll (full calendar month)
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    return { year: prevYear, month: prevMonth };
  }

  // With cutoff: sync current month's payroll
  // (the period that ends on cutoff day of current month)
  return { year: currentYear, month: currentMonth };
}

/**
 * Generate human-readable period label for display
 * @param {Date} startDate - Period start date
 * @param {Date} endDate - Period end date
 * @returns {string} - Formatted label like "23 Feb - 22 Mar 2024"
 */
function formatPeriodLabel(startDate, endDate) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getUTCDate();
    const month = monthNames[d.getUTCMonth()];

    // Only include year if different from end date year or if both dates shown
    return `${day} ${month}`;
  };

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  const endYear = new Date(endDate).getUTCFullYear();

  return `${start} - ${end} ${endYear}`;
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
    toUtcDateOnlyFromYMD,
    getAttendancePeriodRange,
    getPayrollPeriodForSync,
    formatPeriodLabel
};