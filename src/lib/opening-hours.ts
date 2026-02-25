/**
 * Utilities for calculating restaurant opening hours
 */

/**
 * Checks if the kitchen is currently open based on the opening hours string.
 * Supports formats like "Mon-Sat: 11am - 3am", "Daily: 10:00 - 22:00", etc.
 */
export function isKitchenOpen(openingHours: string): boolean {
  if (!openingHours) return true;

  try {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    // Map day numbers to names
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Normalize string
    const normalized = openingHours.toLowerCase().trim();

    // Handle "daily" or "everyday"
    const isDaily =
      normalized.includes("daily") || normalized.includes("everyday");

    // Extract range of days if not daily
    let daysOpen = [1, 2, 3, 4, 5, 6]; // Default Mon-Sat
    if (!isDaily) {
      if (normalized.includes("mon-sat")) {
        daysOpen = [1, 2, 3, 4, 5, 6];
      } else if (
        normalized.includes("mon-sun") ||
        normalized.includes("all week")
      ) {
        daysOpen = [0, 1, 2, 3, 4, 5, 6];
      }
      // Simple day name check
      const dayToday = dayNames[day].toLowerCase();
      if (
        !isDaily &&
        normalized.includes(":") &&
        !normalized.split(":")[0].includes(dayToday)
      ) {
        // This is a bit naive but might work for simple strings like "Mon-Sat: ..."
        const daysPart = normalized.split(":")[0];
        if (!daysPart.includes(dayToday) && !isDayInRange(dayToday, daysPart)) {
          // We'll check for ranges like "Mon-Fri"
        }
      }
    }

    // Extract time part
    const timeMatch = openingHours.match(
      /(\d+(?::\d+)?\s*(?:am|pm)?)\s*-\s*(\d+(?::\d+)?\s*(?:am|pm)?)/i,
    );
    if (!timeMatch) return true; // Can't parse, default to open

    const startTime = parseTimeToMinutes(timeMatch[1]);
    const endTime = parseTimeToMinutes(timeMatch[2]);

    // Handle overnight hours (e.g., 11am - 3am)
    if (endTime < startTime) {
      // If current time is after start time (today) OR before end time (technically tomorrow morning)
      const isOpenNow =
        currentTimeMinutes >= startTime || currentTimeMinutes <= endTime;

      if (!isOpenNow) return false;

      // If we are in the "morning" part (0:00 to 3:00), we need to check if YESTERDAY was an open day
      if (currentTimeMinutes <= endTime) {
        const yesterday = (day + 6) % 7;
        return isDayOpen(yesterday, openingHours);
      }

      // If we are in the "evening" part (11:00 to 23:59), we check if TODAY is an open day
      return isDayOpen(day, openingHours);
    } else {
      // Normal hours (e.g., 10am - 10pm)
      const isOpenTime =
        currentTimeMinutes >= startTime && currentTimeMinutes <= endTime;
      if (!isOpenTime) return false;
      return isDayOpen(day, openingHours);
    }
  } catch (error) {
    console.error("Error parsing opening hours:", error);
    return true; // Fallback to open
  }
}

/**
 * Parses time strings like "11am", "3:30 PM", "14:00" to minutes from midnight
 */
function parseTimeToMinutes(timeStr: string): number {
  timeStr = timeStr.toLowerCase().trim();
  let hours = 0;
  let minutes = 0;

  const match = timeStr.match(/(\d+)(?::(\d+))?\s*(am|pm)?/);
  if (!match) return 0;

  hours = parseInt(match[1]);
  minutes = match[2] ? parseInt(match[2]) : 0;
  const ampm = match[3];

  if (ampm === "pm" && hours < 12) hours += 12;
  if (ampm === "am" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Checks if a specific day is included in the opening hours string
 */
function isDayOpen(day: number, openingHours: string): boolean {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = dayNames[day].toLowerCase();
  const normalized = openingHours.toLowerCase();

  if (normalized.includes("daily") || normalized.includes("everyday"))
    return true;

  const daysPart = normalized.includes(":")
    ? normalized.split(":")[0]
    : normalized;

  if (daysPart.includes("mon-sat") && day >= 1 && day <= 6) return true;
  if (daysPart.includes("mon-sun") || daysPart.includes("all week"))
    return true;
  if (daysPart.includes(dayName)) return true;

  // Check for ranges like "mon-fri"
  const rangeMatch = daysPart.match(
    /(mon|tue|wed|thu|fri|sat|sun)-(mon|tue|wed|thu|fri|sat|sun)/,
  );
  if (rangeMatch) {
    const startIdx = dayNames
      .map((d) => d.toLowerCase())
      .indexOf(rangeMatch[1]);
    const endIdx = dayNames.map((d) => d.toLowerCase()).indexOf(rangeMatch[2]);

    if (startIdx <= endIdx) {
      return day >= startIdx && day <= endIdx;
    } else {
      // Range wraps around week (uncommon but possible)
      return day >= startIdx || day <= endIdx;
    }
  }

  return false;
}

function isDayInRange(dayName: string, daysPart: string): boolean {
  // Already handled in isDayOpen
  return false;
}
