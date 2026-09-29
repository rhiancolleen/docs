export const PACKAGES = new Map([
  ["SOLO 199", { price: 199, minutes: 10, inclusions: "1 pax \u2022 10 mins photo shoot \u2022 Included backdrops \u2022 1 pc 3R solo print \u2022 ALL soft copies included" }],
  ["SOLO 249", { price: 249, minutes: 20, inclusions: "1 pax \u2022 20 mins photo shoot \u2022 Included backdrops \u2022 1 pc 3R solo + 1 pc 3R quadro print \u2022 ALL soft copies included" }],
  ["DUO 249", { price: 249, minutes: 10, inclusions: "2 pax \u2022 10 mins photo shoot \u2022 Included backdrops \u2022 2 pcs 3R strips \u2022 ALL soft copies included" }],
  ["DUO 399", { price: 399, minutes: 25, inclusions: "2 pax \u2022 25 mins photo shoot \u2022 Included backdrops \u2022 2 pcs 4R strips \u2022 ALL soft copies included" }],
  ["TRIO 349", { price: 349, minutes: 10, inclusions: "3 pax \u2022 10 mins photo shoot \u2022 Included backdrops \u2022 3 pcs 3R strips \u2022 ALL soft copies included" }],
  ["TRIO 499", { price: 499, minutes: 25, inclusions: "3 pax \u2022 25 mins photo shoot \u2022 Included backdrops \u2022 3 pcs 4R strips \u2022 ALL soft copies included" }],
  ["GRUPO 449", { price: 449, minutes: 10, inclusions: "4-5 pax \u2022 10 mins photo shoot \u2022 Included backdrops \u2022 5 pcs 3R strips \u2022 ALL soft copies included" }],
  ["GRUPO 599", { price: 599, minutes: 25, inclusions: "4-5 pax \u2022 25 mins photo shoot \u2022 Included backdrops \u2022 5 pcs 4R strips \u2022 ALL soft copies included" }],
  ["RENT DUO 799", { price: 799, minutes: 60, inclusions: "1-2 pax \u2022 1 hour unli shoot \u2022 4 backdrops \u2022 2pcs 3R + 2pcs 4R strips \u2022 ALL soft copies included" }],
  ["RENT GRUPO 1199", { price: 1199, minutes: 60, inclusions: "3-5 pax \u2022 1 hour unli shoot \u2022 4 backdrops \u2022 5pcs 3R + 5pcs 4R strips \u2022 ALL soft copies included" }],
]);

const CODE39 = new Map(Object.entries({
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn", "4": "nnnwwnnnw",
  "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw", "8": "wnnwnnwnn", "9": "nnwwnnwnn",
  A: "wnnnnwnnw", B: "nnwnnwnnw", C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn",
  F: "nnwnwwnnn", G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww", O: "wnnnwnnwn",
  P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn", S: "nnwnnnwwn", T: "nnnnwnwwn",
  U: "wwnnnnnnw", V: "nwwnnnnnw", W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn",
  Z: "nwwnwnnnn", "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
}));
export { CODE39 };

const ALLOWED = /^[0-9A-Z\-. ]+$/;

export function encodeCode39(text) {
  const value = String(text).toUpperCase();
  if (!ALLOWED.test(value)) {
    throw new Error("Code 39 supports only 0-9, A-Z, dash, dot and space");
  }
  const full = `*${value}*`; // start and stop characters
  const modules = [];
  for (let i = 0; i < full.length; i++) { // O(L)
    const pattern = CODE39.get(full[i]);
    for (let j = 0; j < 9; j++) {
      modules.push({ bar: j % 2 === 0, wide: pattern[j] === "w" });
    }
    if (i < full.length - 1) modules.push({ bar: false, wide: false }); // gap between characters
  }
  return modules;
}

export function barcodeSVG(text, { narrow = 2, wide = 5, height = 60, quiet = 20 } = {}) {
  const value = String(text).toUpperCase();
  const modules = encodeCode39(value);
  let x = quiet;
  let bars = "";
  for (const m of modules) {
    const w = m.wide ? wide : narrow;
    if (m.bar) bars += `<rect x="${x}" y="0" width="${w}" height="${height}"/>`;
    x += w;
  }
  const width = x + quiet;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Barcode ${value}" ` +
    `width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="${width}" height="${height}" fill="#fff"/><g fill="#000">${bars}</g></svg>`
  );
}

export const peso = (n) => `\u20B1${Number(n || 0).toLocaleString("en-US")} PHP`;

export function makeReference() {
  return `SP-${Math.floor(100000 + Math.random() * 900000)}`;
}

const REF_OK = /^[A-Z0-9\-]{3,20}$/;

export function buildReceipt(booking = {}, now = new Date()) {
  const pkgName = booking.package || "SOLO 249";
  const pkg = PACKAGES.get(pkgName);

  const packagePrice = Number(booking.packagePrice ?? pkg?.price ?? 0);
  const extraMins = Number(booking.extraTimeMinutes || 0);
  const extraTimeCost = Number(booking.extraTimeCost || 0);
  const extraPax = Number(booking.extraPaxCount || 0);
  const extraPaxCost = Number(booking.extraPaxCost || 0);
  const extraBackdrops = booking.extraBackdrops || [];
  const backdropCost = Number(booking.backdropCost || 0);
  const hardCopies = booking.hardCopies || [];
  const hardCopiesCost = Number(booking.hardCopiesCost || 0);
  const spotlight = Boolean(booking.spotlight);
  const spotlightCost = spotlight ? Number(booking.spotlightCost || 200) : 0;

  const lines = [packagePrice, extraTimeCost, extraPaxCost, backdropCost, hardCopiesCost, spotlightCost];
  const computedTotal = lines.reduce((sum, n) => sum + n, 0);
  const total = Number.isFinite(Number(booking.total)) && booking.total > 0 ? Number(booking.total) : computedTotal;

  const paymentOption = booking.paymentOption || "50% Downpayment";
  const defaultPaid = /full/i.test(paymentOption) ? total : Math.round(total / 2);
  const amountPaid = Math.min(total, Number(booking.amountPaid ?? defaultPaid));
  const balanceDue = booking.balanceDue !== undefined ? Number(booking.balanceDue) : Math.max(0, total - amountPaid);

  const totalMinutes = Number(booking.totalDuration ?? (booking.packageDuration ?? pkg?.minutes ?? 20) + extraMins);
  const baseMinutes = Number(booking.packageDuration ?? (booking.totalDuration != null ? totalMinutes - extraMins : pkg?.minutes ?? 20));

  const ref = REF_OK.test(String(booking.referenceCode || "").toUpperCase())
    ? String(booking.referenceCode).toUpperCase()
    : makeReference();

  const included = booking.includedBackdrops || [];
  const allBackdrops = [...included, ...extraBackdrops.map((b) => `${b} (Extra)`)];

  return {
    ref,
    barcode: barcodeSVG(ref),
    createdAt: booking.createdAt || now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    branch: booking.branch || "",
    date: booking.bookingDate || "",
    time: booking.bookingTime || "",
    durationText: `${totalMinutes} mins (${baseMinutes}m shoot + ${extraMins}m extra)`,
    customer: {
      name: booking.customerName || "Guest Client",
      email: booking.customerEmail || "",
      phone: booking.customerPhone || "",
      notes: (booking.notes || "").trim(),
    },
    package: {
      name: pkgName,
      inclusions: pkg?.inclusions || "Full studio session inclusions (ALL soft copies included)",
      price: packagePrice,
    },
    backdrops: allBackdrops.length ? allBackdrops.join(", ") : "Standard Studio Colors",
    extraTime: { text: extraMins > 0 ? `+${extraMins} mins` : "None (+0 mins)", cost: extraTimeCost },
    extraPax: { text: extraPax > 0 ? `+${extraPax} extra pax` : "None (+0 pax)", cost: extraPaxCost },
    extraBackdrops: { text: extraBackdrops.length ? extraBackdrops.join(", ") : "None", cost: backdropCost },
    hardCopies: hardCopies.length ? { text: hardCopies.join(", "), cost: hardCopiesCost } : null,
    spotlight: spotlight ? { cost: spotlightCost } : null,
    total,
    paymentOption,
    amountPaid,
    balanceDue,
  };
}

export function sampleBooking() {
  return {
    branch: "Sta. Maria Bulacan",
    package: "SOLO 249",
    bookingDate: "September 20, 2026",
    bookingTime: "02:00 PM",
    includedBackdrops: ["Storm", "Abstract Pink", "Cloud"],
    customerName: "Maria Santos",
    customerEmail: "mariasantos@gmail.com",
    customerPhone: "+63 917 555 0199",
    total: 249,
    paymentOption: "50% Downpayment",
  };
}

export const BRANCHES = ["Sta. Maria Bulacan", "Muzon, San Jose Del Monte", "Pandi Bulacan"];
export const PRICES = { extraTimeUnit: { minutes: 10, cost: 100 }, extraPax: 50, extraBackdrop: 100, spotlight: 200 };
export const STUDIO = { open: 10 * 60, close: 19 * 60 }; // minutes since midnight
export const BOOKING_WINDOW = { from: "2026-09-01", to: "2027-09-01" };

function manilaNow(now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

const longDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function normalizePhone(input) {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.startsWith("63")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^9\d{9}$/.test(d)) return null;
  return `+63 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

const splitList = (text) =>
  String(text ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export function createBooking(form, now = new Date()) {
  const fail = (message) => ({ ok: false, message });

  const pkg = PACKAGES.get(form.package);
  if (!pkg) return fail("Please choose a package.");
  if (!BRANCHES.includes(form.branch)) return fail("Please choose a studio branch.");

  const name = String(form.name ?? "").trim();
  if (name.length < 2 || name.length > 60) return fail("Please enter your full name (2 to 60 characters).");

  const email = String(form.email ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid email address.");

  const phone = normalizePhone(form.phone);
  if (!phone) return fail("Please enter a valid Philippine mobile number, for example 917 555 0199.");

  const extraUnits = Number(form.extraTimeUnits || 0);
  const extraPax = Number(form.extraPax || 0);
  if (!Number.isInteger(extraUnits) || extraUnits < 0 || extraUnits > 6) return fail("Extra time must be between 0 and 6 blocks of 10 minutes.");
  if (!Number.isInteger(extraPax) || extraPax < 0 || extraPax > 5) return fail("Extra persons must be between 0 and 5.");

  const extraBackdrops = splitList(form.extraBackdrops);
  const included = splitList(form.backdrops);
  if (extraBackdrops.length > 5 || included.length > 8 || [...extraBackdrops, ...included].some((b) => b.length > 30)) {
    return fail("Backdrop lists are too long. Use short names separated by commas.");
  }
  const notes = String(form.notes ?? "").trim();
  if (notes.length > 200) return fail("Special notes must be 200 characters or fewer.");

  const today = manilaNow(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(form.date ?? ""))) return fail("Please choose a shoot date.");
  if (form.date < today.date) return fail("The shoot date cannot be in the past.");
  if (form.date < BOOKING_WINDOW.from || form.date > BOOKING_WINDOW.to) {
    return fail("Bookings are valid from September 1, 2026 to September 1, 2027.");
  }
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(String(form.time ?? ""));
  if (!timeMatch) return fail("Please choose a shoot time.");
  const start = Number(timeMatch[1]) * 60 + Number(timeMatch[2]);

  const extraMinutes = extraUnits * PRICES.extraTimeUnit.minutes;
  const totalMinutes = pkg.minutes + extraMinutes;
  if (start < STUDIO.open) return fail("The studio opens at 10:00 AM.");
  if (start + totalMinutes > STUDIO.close) {
    return fail(`A ${totalMinutes}-minute session starting at ${formatTime(start)} would end after closing time (7:00 PM).`);
  }
  if (form.date === today.date && start <= today.minutes) return fail("That time has already passed today.");

  const extraTimeCost = extraUnits * PRICES.extraTimeUnit.cost;
  const extraPaxCost = extraPax * PRICES.extraPax;
  const backdropCost = extraBackdrops.length * PRICES.extraBackdrop;
  const spotlight = Boolean(form.spotlight);
  const spotlightCost = spotlight ? PRICES.spotlight : 0;
  const total = [pkg.price, extraTimeCost, extraPaxCost, backdropCost, spotlightCost].reduce((a, b) => a + b, 0);

  const full = form.payment === "full";
  const amountPaid = full ? total : Math.round(total / 2);

  return {
    ok: true,
    booking: {
      referenceCode: makeReference(),
      createdAt: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      branch: form.branch,
      package: form.package,
      packagePrice: pkg.price,
      packageDuration: pkg.minutes,
      includedBackdrops: included,
      extraBackdrops,
      backdropCost,
      hardCopies: [],
      hardCopiesCost: 0,
      spotlight,
      spotlightCost,
      extraTimeMinutes: extraMinutes,
      extraTimeCost,
      totalDuration: totalMinutes,
      extraPaxCount: extraPax,
      extraPaxCost,
      bookingDate: longDate(form.date),
      bookingTime: formatTime(start),
      total,
      paymentOption: full ? "Full Payment" : "50% Downpayment",
      amountPaid,
      balanceDue: total - amountPaid,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      notes,
    },
  };
}
