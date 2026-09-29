export const routes = new Map([
  ["book", "booking.html"],
  ["explore", "home.html"],
  ["packages", "packages.html"],
  ["reviews", "reviews.html"],
  ["staff", "admin/login.html"],
]);

export const STAFF_HOME = "admin/index.html";

export const HOURS = { open: 10 * 60, close: 19 * 60 };

export function resolveEntry(intent, { adminLoggedIn = false } = {}) {
  if (!routes.has(intent)) {
    return { ok: false, message: "Unknown entry point" };
  }

  if (intent === "staff" && adminLoggedIn) {
    return { ok: true, url: STAFF_HOME };
  }
  return { ok: true, url: routes.get(intent) };
}

function manilaMinutes(now) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour").value) % 24;
  const minute = Number(parts.find((p) => p.type === "minute").value);
  return hour * 60 + minute;
}

export function studioStatus(now = new Date()) {
  const t = manilaMinutes(now);
  if (t >= HOURS.open && t < HOURS.close) {
    return { open: true, message: "Open now \u2022 Closes 7:00 PM" };
  }
  if (t < HOURS.open) {
    return { open: false, message: "Closed \u2022 Opens today at 10:00 AM" };
  }
  return { open: false, message: "Closed \u2022 Opens tomorrow at 10:00 AM" };
}

