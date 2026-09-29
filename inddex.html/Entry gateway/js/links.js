export async function pageExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

function toast(message) {
  let t = document.getElementById("moduleToast");
  if (!t) {
    t = document.createElement("div");
    t.id = "moduleToast";
    t.className = "module-toast no-print";
    t.setAttribute("role", "status");
    document.body.append(t);
  }
  t.textContent = message;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, 4500);
}

export function guardLinks() {
  const here = window.location.pathname.split("/").pop() || "index.html";
  document.addEventListener("click", async (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = e.target.closest("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!/^[^:#?]+\.html(\?.*)?$/.test(href)) return; // only local .html pages
    const path = href.split("?")[0];
    if (path === here) return;
    e.preventDefault();
    if (await pageExists(path)) window.location.href = a.href;
    else toast(`"${path}" is not part of this module, so it cannot open here.`);
  });
}
