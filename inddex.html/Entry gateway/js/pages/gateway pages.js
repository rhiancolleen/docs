import { resolveEntry, studioStatus } from "../gateway.js";
import { pageExists } from "../links.js";

const notice = document.getElementById("gatewayNotice");

const adminLoggedIn = () => {
  try { return sessionStorage.getItem("selfPicAdminLoggedIn") === "true"; } catch { return false; }
};

document.querySelectorAll("[data-entry]").forEach((link) => {
  link.addEventListener("click", async (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const result = resolveEntry(link.dataset.entry, { adminLoggedIn: adminLoggedIn() });
    if (!result.ok) return;
    e.preventDefault();

    if (await pageExists(result.url)) {
      window.location.href = result.url;
    } else {
      notice.textContent = `Routed to ${result.url}. That page is not part of this module, so it cannot open here.`;
      notice.hidden = false;
    }
  });
});

const status = document.getElementById("studioStatus");
if (status) {
  const s = studioStatus();
  status.textContent = s.message;
  status.classList.add(s.open ? "is-open" : "is-closed");
}
