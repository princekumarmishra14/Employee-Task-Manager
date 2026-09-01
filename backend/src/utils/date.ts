/**
 * Formats a Date object or string into a standardized, executive-friendly date string (e.g. "24 Jun 2026").
 * Supports locale and timezone overrides for future localization.
 * 
 * @param date The Date object or ISO string to format.
 * @param options Configurations for formatting overrides.
 * @returns A formatted string.
 */
export function formatDate(
  date: Date | string,
  options: {
    locale?: string;
    timeZone?: string;
    monthFormat?: "short" | "long" | "numeric";
  } = {}
): string {
  const { locale = "en-GB", timeZone, monthFormat = "short" } = options;
  const d = typeof date === "string" ? new Date(date) : date;

  // Verify date validity
  if (isNaN(d.getTime())) {
    return "-";
  }

  try {
    const formatter = new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: monthFormat,
      year: "numeric",
      timeZone: timeZone,
    });

    // Format parts to ensure "Day Month Year" layout structure
    const parts = formatter.formatToParts(d);
    const day = parts.find((p) => p.type === "day")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const year = parts.find((p) => p.type === "year")?.value || "";

    // Specific formatting for Arabic locale
    if (locale.startsWith("ar")) {
      return `${day} ${month} ${year}`;
    }

    return `${day} ${month} ${year}`;
  } catch (error) {
    // Basic fallback if Intl.DateTimeFormat configuration fails
    return d.toLocaleDateString();
  }
}
