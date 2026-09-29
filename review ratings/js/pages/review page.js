import { guardLinks } from "../links.js";

guardLinks();

import { createReviewStore, SEED_REVIEWS } from "../review.js";

const KEY = "selfPicReviews";
const $ = (id) => document.getElementById(id);

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { }
  return SEED_REVIEWS;
}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store.toJSON())); } catch { } };

const store = createReviewStore(load());
const filters = { branch: "all", rating: "all" };

function el(tag, text, cls, style) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text; // textContent keeps user input safe
  if (cls) e.className = cls;
  if (style) e.setAttribute("style", style);
  return e;
}
const stars = (n) => "\u2605".repeat(n) + "\u2606".repeat(5 - n);

function renderStats() {
  const s = store.stats();
  $("ratingScore").textContent = s.count ? s.average.toFixed(1) : "-";
  $("ratingStars").textContent = stars(Math.round(s.average));
  $("ratingCount").textContent = String(s.count);

  const box = $("ratingBreakdown");
  box.replaceChildren();
  for (let star = 5; star >= 1; star--) {
    const pct = s.percent[star - 1];
    const row = el("div", undefined, "breakdown-row");
    const bar = el("div", undefined, "breakdown-bar");
    bar.append(el("div", undefined, "breakdown-fill", `width: ${pct}%;`));
    row.append(
      el("span", `${star} Star${star > 1 ? "s" : ""}`, undefined, "width: 50px; font-weight: 700;"),
      bar,
      el("span", `${pct}%`, undefined, "width: 45px; text-align: right; color: #666;")
    );
    box.append(row);
  }
}

function renderReviews() {
  const box = $("reviewsContainer");
  box.replaceChildren();
  const rows = store.list(filters);

  if (rows.length === 0) {
    const empty = el("div", undefined, undefined,
      "grid-column: 1 / -1; text-align: center; padding: 48px 20px; border: 2px dashed #999; border-radius: 8px;");
    empty.append(
      el("h3", "No Reviews Matching Filter"),
      el("p", 'Try selecting "All Branches" or "All" ratings to view more reviews.', "text-muted")
    );
    box.append(empty);
    return;
  }

  for (const rev of rows) {
    const card = el("article", undefined, "review-card");
    const top = el("div");

    const head = el("div", undefined, "review-card-header");
    const who = el("div");
    const nameWrap = el("div", undefined, "review-client-name");
    nameWrap.append(el("span", rev.name));
    who.append(nameWrap, el("div", rev.date, "review-date"));
    head.append(who, el("div", stars(rev.rating), "stars-gold", "font-size: 1rem;"));

    const pills = el("div", undefined, "review-meta-pills");
    pills.append(el("span", `Branch: ${rev.branch}`, "review-pill"), el("span", `Package: ${rev.package}`, "review-pill"));
    if (rev.tag) pills.append(el("span", rev.tag, "review-pill", "font-weight: 700;"));

    top.append(head, pills, el("p", `"${rev.comment}"`, "review-comment"));
    card.append(
      top,
      el("div", "Session booked via Self-Pic Online Reservation System", undefined,
        "border-top: 1px solid #eee; padding-top: 10px; font-size: 0.75rem; color: #888;")
    );
    box.append(card);
  }
}

function wireFilter(groupId, key, attr) {
  const buttons = document.querySelectorAll(`#${groupId} .filter-pill-btn`);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filters[key] = btn.dataset[attr];
      renderReviews();
    });
  });
}
wireFilter("branchFilterGroup", "branch", "branch");
wireFilter("ratingFilterGroup", "rating", "rating");

const modal = $("reviewModal");
const openModal = () => modal.classList.add("active");
const closeModal = () => modal.classList.remove("active");
$("openReview").addEventListener("click", openModal);
$("closeReview").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

const starItems = document.querySelectorAll("#starPicker .star-item");
function setStars(val) {
  $("revStars").value = val;
  starItems.forEach((s) => s.classList.toggle("selected", Number(s.dataset.value) <= val));
}
starItems.forEach((item) => item.addEventListener("click", () => setStars(Number(item.dataset.value))));

$("reviewForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("reviewMessage");
  const result = store.submit({
    name: $("revName").value,
    rating: parseInt($("revStars").value, 10),
    comment: $("revComment").value,
    branch: $("revBranch").value,
    package: $("revPackage").value,
    ref: $("revRef").value,
  });

  if (!result.ok) {
    msg.textContent = result.message;
    msg.style.display = "block";
    return;
  }
  msg.style.display = "none";
  save();
  closeModal();
  renderStats();
  renderReviews();
  e.target.reset();
  setStars(5);
  alert(result.message);
});

function prefill(selectId, value) {
  const select = $(selectId);
  if (value && [...select.options].some((o) => o.value === value)) select.value = value;
}
const params = new URLSearchParams(window.location.search);
if (params.get("branch") || params.get("package") || params.get("ref")) {
  prefill("revBranch", params.get("branch"));
  prefill("revPackage", params.get("package"));
  if (params.get("ref")) $("revRef").value = params.get("ref");
  openModal();
}

renderStats();
renderReviews();
