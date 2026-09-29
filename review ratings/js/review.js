export const BRANCHES = ["Sta. Maria Bulacan", "Muzon, San Jose Del Monte", "Pandi Bulacan"];

export const SEED_REVIEWS = [
  { id: "rev-1", name: "Maria Santos", rating: 5, date: "September 14, 2026", branch: "Sta. Maria Bulacan", package: "SOLO 249", tag: "Solo Creative", comment: "Such an empowering experience! Being alone in the studio room with the wireless clicker let me relax and pose naturally. The 3R solo and quadro grid prints came out crystal clear!" },
  { id: "rev-2", name: "Gabriel & Hannah", rating: 5, date: "September 12, 2026", branch: "Muzon, San Jose Del Monte", package: "RENT DUO 799", tag: "Couple Anniversary", comment: "We booked the 1-hour studio rental for our 3rd anniversary. Having unlimited photos, 4 backdrop choices, and all Google Drive raw soft copies included is unmatched value anywhere in Bulacan." },
  { id: "rev-3", name: "Alyssa Rivera", rating: 5, date: "September 10, 2026", branch: "Pandi Bulacan", package: "DUO 399", tag: "Besties Shoot", comment: "Super easy online reservation process. The 4R strip prints are high quality, and switching backdrops between pink and gray was so smooth. The vanity mirrors made touch-ups quick!" },
  { id: "rev-4", name: "Mark Bautista & Barkada", rating: 5, date: "September 08, 2026", branch: "Sta. Maria Bulacan", package: "GRUPO 599", tag: "Graduation Squad", comment: "Took graduation pictures with my barkada of 5. The Godox lighting was already calibrated perfectly. We loved the 5 pcs 4R strips printed immediately after our shoot!" },
  { id: "rev-5", name: "Chloe Cruz", rating: 4, date: "September 05, 2026", branch: "Muzon, San Jose Del Monte", package: "SOLO 199", tag: "Birthday Milestone", comment: "Fast, affordable, and clean studio. 10 minutes goes by quick so plan your poses ahead! Staff in Muzon were accommodating and prints were ready in minutes." },
  { id: "rev-6", name: "Kenneth & Friends", rating: 5, date: "September 02, 2026", branch: "Pandi Bulacan", package: "TRIO 499", tag: "Trio Shoot", comment: "The remote clicker makes group photos so much fun without feeling rushed by an in-room photographer. Best photo studio in Pandi Bulacan!" },
];

const REF_FORMAT = /^SP-\d{6}$/;

export function createReviewStore(initial = []) {
  const items = []; // oldest -> newest internally
  const refs = new Set();
  const distribution = [0, 0, 0, 0, 0]; // index 0 = 1 star ... index 4 = 5 stars
  let sum = 0;

  function add(review) {
    items.push(review);
    sum += review.rating;
    distribution[review.rating - 1]++;
    if (review.ref) refs.add(review.ref);
  }
  for (let i = initial.length - 1; i >= 0; i--) add(initial[i]);

  function submit({ name, rating, comment, branch, package: pkg, ref = "" }, now = new Date()) {
    const cleanName = String(name ?? "").trim();
    const cleanComment = String(comment ?? "").trim();
    const cleanRef = String(ref ?? "").trim().toUpperCase();

    if (!cleanName || !cleanComment) {
      return { ok: false, message: "Please enter your name and your review comments." };
    }
    if (cleanName.length > 60 || cleanComment.length > 500) {
      return { ok: false, message: "Name must be 60 characters or fewer and comments 500 or fewer." };
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { ok: false, message: "Please choose a rating from 1 to 5 stars." };
    }
    if (cleanRef && !REF_FORMAT.test(cleanRef)) {
      return { ok: false, message: "Booking reference should look like SP-894210." };
    }
    if (cleanRef && refs.has(cleanRef)) { // O(1) average
      return { ok: false, message: "This booking reference already has a review." };
    }

    const review = {
      id: `rev-${now.getTime()}-${items.length}`,
      name: cleanName,
      rating,
      date: now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      branch,
      package: pkg,
      tag: "Recent Client",
      comment: cleanComment,
      ref: cleanRef,
    };
    add(review);
    return { ok: true, review, message: "Thank you for your review! Your rating has been posted." };
  }

  function list({ branch = "all", rating = "all" } = {}) {
    const out = [];
    for (let i = items.length - 1; i >= 0; i--) {
      const r = items[i];
      if (branch !== "all" && r.branch !== branch) continue;
      if (rating !== "all" && r.rating !== Number(rating)) continue;
      out.push(r);
    }
    return out;
  }

  function stats() {
    const count = items.length;
    return {
      count,
      average: count ? +(sum / count).toFixed(1) : 0,
      distribution: [...distribution],
      percent: distribution.map((n) => (count ? Math.round((n / count) * 100) : 0)),
    };
  }

  const toJSON = () => list();

  return { submit, list, stats, toJSON };
}

