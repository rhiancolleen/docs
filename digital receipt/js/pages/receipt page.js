import { PACKAGES, BRANCHES, buildReceipt, createBooking, sampleBooking, peso } from "../receipt.js";
import { guardLinks } from "../links.js";

guardLinks();

const $ = (id) => document.getElementById(id);
const set = (id, text) => { const n = $(id); if (n) n.textContent = text; };
const show = (id, on) => { $(id).style.display = on ? "table-row" : "none"; };
const KEY = "selfPicLatestBooking";

for (const [name, p] of PACKAGES) {
  const o = document.createElement("option");
  o.value = name;
  o.textContent = `${name} (${p.minutes} mins)`;
  $("genPackage").append(o);
}
$("genPackage").value = "SOLO 249";
for (const b of BRANCHES) {
  const o = document.createElement("option");
  o.value = o.textContent = b;
  $("genBranch").append(o);
}
$("genDate").min = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());

function render(booking, sample) {
  const r = buildReceipt(booking);

  const barcode = $("receiptBarcode");
  barcode.innerHTML = r.barcode; // SVG built by our own code from a validated reference code
  const label = document.createElement("div");
  label.textContent = `* ${r.ref} *`;
  barcode.append(label);

  set("rcptRef", r.ref);
  set("rcptCreated", r.createdAt);
  if (r.branch) set("rcptBranch", r.branch);
  if (r.date) set("rcptDate", r.date);
  if (r.time) set("rcptTime", r.time);
  set("rcptTotalTime", r.durationText);

  set("rcptName", r.customer.name);
  if (r.customer.email) set("rcptEmail", r.customer.email);
  if (r.customer.phone) set("rcptPhone", r.customer.phone);
  show("rcptNotesRow", Boolean(r.customer.notes));
  set("rcptNotes", r.customer.notes);

  set("rcptPackage", r.package.name);
  set("rcptInclusions", r.package.inclusions);
  set("rcptPackagePrice", peso(r.package.price));
  set("rcptBackdrops", r.backdrops);
  set("rcptExtraTime", r.extraTime.text);
  set("rcptExtraTimeCost", peso(r.extraTime.cost));
  set("rcptExtraPax", r.extraPax.text);
  set("rcptExtraPaxCost", peso(r.extraPax.cost));
  set("rcptExtraBackdrops", r.extraBackdrops.text);
  set("rcptExtraBackdropsCost", peso(r.extraBackdrops.cost));

  show("rcptHardCopiesRow", Boolean(r.hardCopies));
  if (r.hardCopies) {
    set("rcptHardCopies", r.hardCopies.text);
    set("rcptHardCopiesCost", peso(r.hardCopies.cost));
  }
  show("rcptSpotlightRow", Boolean(r.spotlight));
  if (r.spotlight) set("rcptSpotlightCost", peso(r.spotlight.cost));

  set("rcptTotal", peso(r.total));
  set("rcptPaymentType", `Amount Paid (${r.paymentOption}):`);
  set("rcptAmountPaid", peso(r.amountPaid));
  set("rcptBalanceDue", peso(r.balanceDue));

  const reminder = $("rcptReminderBox");
  reminder.style.display = r.balanceDue > 0 ? "flex" : "none";
  set("rcptReminderBalance", peso(r.balanceDue));

  $("rcptReviewBtn").href =
    `reviews.html?branch=${encodeURIComponent(r.branch)}` +
    `&package=${encodeURIComponent(r.package.name)}&ref=${encodeURIComponent(r.ref)}`;

  $("sampleNote")?.remove();
  if (sample) {
    const note = document.createElement("div");
    note.id = "sampleNote";
    note.className = "alert-box alert-warning no-print";
    note.innerHTML =
      '<div class="alert-icon">&#9888;</div><div class="alert-content"><h4>SAMPLE RECEIPT</h4>' +
      "<p>No reservation found on this device yet. Fill in the form above to create your own receipt.</p></div>";
    $("receiptCard").before(note);
  }
}

function loadBooking() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return { booking: JSON.parse(stored), sample: false };
  } catch { }
  return { booking: sampleBooking(), sample: true };
}

$("receiptForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = (id) => $(id).value;
  const result = createBooking({
    package: v("genPackage"), branch: v("genBranch"), date: v("genDate"), time: v("genTime"),
    name: v("genName"), email: v("genEmail"), phone: v("genPhone"), payment: v("genPayment"),
    extraTimeUnits: v("genExtraTime"), extraPax: v("genExtraPax"),
    backdrops: v("genBackdrops"), extraBackdrops: v("genExtraBackdrops"),
    spotlight: $("genSpotlight").checked, notes: v("genNotes"),
  });

  const err = $("genError");
  if (!result.ok) {
    err.textContent = result.message;
    err.hidden = false;
    return;
  }
  err.hidden = true;
  try { localStorage.setItem(KEY, JSON.stringify(result.booking)); } catch { }
  render(result.booking, false);
  $("receiptCard").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("newReceipt").addEventListener("click", () => {
  $("generator").scrollIntoView({ behavior: "smooth", block: "start" });
  $("genName").focus({ preventScroll: true });
});

const start = loadBooking();
render(start.booking, start.sample);
