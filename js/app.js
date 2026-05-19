/* img2.gallery — gallery + chat panel */

// ---------- config ----------
// Where the "Try in Capy" button should send users.
// Pre-fills a Happycapy chat with the chosen prompt via the standard ?q= query parameter.
const CAPY_CHAT_URL = "https://www.happycapy.ai/?q=";

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ---------- state ----------
const state = {
  data: null,
  filteredIds: [],
  category: "all",
  difficulty: "all",
  sort: "featured",
  query: "",
};

// ---------- icons ----------
const ICONS = {
  sparkles: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>',
  camera: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="4"/></svg>',
  poster: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  package: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
  film: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 7h18M3 17h18M7 3v18M17 3v18"/></svg>',
  "user-square": '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="12" cy="10" r="3"/><path d="M7 19c1-3 3-4 5-4s4 1 5 4"/></svg>',
  layout: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg>',
  shapes: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21l5-9 5 9z"/><circle cx="17.5" cy="7.5" r="3.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  chart: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21V3M21 21H3M7 17v-5M11 17V9M15 17v-3M19 17V7"/></svg>',
  grid: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
  compass: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M16 8l-2 6-6 2 2-6z"/></svg>',
  gamepad: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9h2v2h2V9h2v2h2V9h2a4 4 0 014 4v2a4 4 0 01-4 4H6a4 4 0 01-4-4v-2a4 4 0 014-4z"/></svg>',
  shirt: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7l4-4h2a2 2 0 004 0h2l4 4-3 3v10H7V10z"/></svg>',
  utensils: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 3v8a2 2 0 002 2v8M9 3v8a2 2 0 01-2 2M15 3c-1 2-1 5 0 7v11"/></svg>',
};

// ---------- bootstrap ----------
async function init() {
  const data = await fetch("data/prompts.json").then(r => r.json());
  state.data = data;

  $("#statTotal").textContent = data.meta.total;
  $("#heroDate").textContent = formatDate(data.meta.updated_at);

  renderCategoryChips();
  renderDifficultyChips();
  apply();
  bindEvents();
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
}

// ---------- chip rendering ----------
function categoryCounts() {
  const c = { all: state.data.prompts.length };
  for (const p of state.data.prompts) c[p.category] = (c[p.category] || 0) + 1;
  return c;
}
function difficultyCounts() {
  const c = { all: state.data.prompts.length };
  for (const p of state.data.prompts) c[p.difficulty] = (c[p.difficulty] || 0) + 1;
  return c;
}

function renderCategoryChips() {
  const counts = categoryCounts();
  const wrap = $("#categoryChips");
  wrap.innerHTML = state.data.meta.categories.map(c => `
    <button class="chip" role="tab"
      aria-selected="${state.category === c.id}"
      data-cat="${c.id}">
      ${ICONS[c.icon] || ""}
      <span>${c.label}</span>
      <span class="chip__count">${counts[c.id] || 0}</span>
    </button>
  `).join("");
}

function renderDifficultyChips() {
  const counts = difficultyCounts();
  const items = [{ id: "all", label: "Any difficulty" }, ...state.data.meta.difficulty_levels];
  const wrap = $("#difficultyChips");
  wrap.innerHTML = items.map(d => `
    <button class="chip" role="tab"
      aria-selected="${state.difficulty === d.id}"
      data-diff="${d.id}">
      <span>${d.label}</span>
      <span class="chip__count">${counts[d.id] || 0}</span>
    </button>
  `).join("");
}

// ---------- filtering / sort ----------
function apply() {
  let list = state.data.prompts.slice();
  if (state.category !== "all") list = list.filter(p => p.category === state.category);
  if (state.difficulty !== "all") list = list.filter(p => p.difficulty === state.difficulty);
  if (state.query) {
    const q = state.query.toLowerCase();
    list = list.filter(p => {
      return p.title.toLowerCase().includes(q)
        || p.description.toLowerCase().includes(q)
        || p.prompt.toLowerCase().includes(q)
        || (p.tags || []).some(t => t.toLowerCase().includes(q));
    });
  }
  switch (state.sort) {
    case "featured":
      list.sort((a, b) => (b.featured - a.featured) || (b.trending_score - a.trending_score));
      break;
    case "trending":
      list.sort((a, b) => b.trending_score - a.trending_score);
      break;
    case "newest":
      list.reverse();
      break;
    case "random":
      list.sort(() => Math.random() - 0.5);
      break;
    case "copies":
      list.sort((a, b) => (b.copies || 0) - (a.copies || 0));
      break;
  }
  state.filteredIds = list.map(p => p.id);
  renderGrid(list);
}

// ---------- card rendering ----------
function diffLabel(id) {
  const d = state.data.meta.difficulty_levels.find(x => x.id === id);
  return d ? d.label : id;
}

function renderGrid(list) {
  const grid = $("#grid");
  if (!list.length) {
    grid.innerHTML = "";
    $("#empty").hidden = false;
    return;
  }
  $("#empty").hidden = true;
  grid.innerHTML = list.map(cardHtml).join("");
  $$(".card", grid).forEach(card => {
    card.addEventListener("click", e => {
      // ignore clicks on action buttons or links
      if (e.target.closest(".card__btn") || e.target.closest("a")) return;
      card.classList.toggle("is-open");
    });
  });
  $$(".js-copy", grid).forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    const id = b.dataset.id;
    const p = state.data.prompts.find(x => x.id === id);
    if (!p) return;
    navigator.clipboard.writeText(p.prompt).then(() => toast("Prompt copied to clipboard"));
  }));
  $$(".js-try", grid).forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    const id = b.dataset.id;
    const p = state.data.prompts.find(x => x.id === id);
    if (!p) return;
    openChatWithPrompt(p);
  }));
  $$(".js-open", grid).forEach(b => b.addEventListener("click", e => {
    e.stopPropagation();
    const card = b.closest(".card");
    card.classList.toggle("is-open");
  }));
}

function cardHtml(p) {
  const tags = (p.tags || []).slice(0, 3).map(t => `<span class="tag">#${t}</span>`).join("");
  const featuredBadge = p.featured ? `<span class="badge badge--featured">★ Featured</span>` : "";
  const tplBadge = p.is_template ? `<span class="badge badge--tpl">Template</span>` : "";
  const refBadge = p.requires_reference_image ? `<span class="badge badge--ref">Needs ref</span>` : "";
  const ratioBadge = p.aspect_ratio ? `<span class="badge badge--ratio">${p.aspect_ratio}</span>` : "";
  const diffBadge = `<span class="badge badge--diff" data-d="${p.difficulty}">${diffLabel(p.difficulty)}</span>`;
  const promptText = escapeHtml(p.prompt);

  return `
  <article class="card" data-ratio="${p.aspect_ratio || "4:5"}" data-id="${p.id}">
    <div class="card__media">
      <img class="card__img"
           loading="lazy"
           alt="${escapeAttr(p.title)}"
           src="${p.preview_image_url ? p.preview_image_url : `data:image/svg+xml;utf8,${fallbackSvg(p)}`}"
           onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${fallbackSvg(p)}'" />
      <div class="card__badges">
        ${featuredBadge}${diffBadge}${tplBadge}${refBadge}
      </div>
      <div class="card__top-right">
        ${ratioBadge}
      </div>
      <div class="card__quick">
        <button class="card__quickBtn js-copy" data-id="${p.id}" type="button" aria-label="Copy prompt">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
          Copy
        </button>
        <button class="card__quickBtn card__quickBtn--primary js-try" data-id="${p.id}" type="button" aria-label="Try in Capy">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
          Try
        </button>
      </div>
    </div>
    <div class="card__body">
      <div class="card__title">${escapeHtml(p.title)}</div>
      <div class="card__desc">${escapeHtml(p.description)}</div>
      <div class="card__meta">${tags}</div>
      <div class="card__footer">
        <span class="card__source"></span>
        <div class="card__actions">
          <button class="card__btn js-open" type="button">View</button>
          <button class="card__btn js-copy" data-id="${p.id}" type="button">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
            Copy
          </button>
          <button class="card__btn card__btn--primary js-try" data-id="${p.id}" type="button">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            Try in Capy
          </button>
        </div>
      </div>
    </div>
    <div class="card__drawer">
      <div class="card__prompt">${promptText}</div>
      <div class="card__drawer-actions">
        <button class="card__btn js-copy" data-id="${p.id}" type="button">Copy prompt</button>
        <button class="card__btn card__btn--primary js-try" data-id="${p.id}" type="button">Open in Capy chat →</button>
      </div>
    </div>
  </article>`;
}

function fallbackSvg(p) {
  // Deterministic gradient fallback if the preview image hasn't been generated yet.
  const h1 = hash(p.id) % 360;
  const h2 = (h1 + 60) % 360;
  const w = 800;
  const h = ratioH(p.aspect_ratio, w);
  const text = encodeURIComponent(p.title.slice(0, 36));
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0' stop-color='hsl(${h1},70%,55%)'/><stop offset='1' stop-color='hsl(${h2},80%,40%)'/></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g)'/><text x='50%' y='50%' fill='white' font-family='Inter,Arial,sans-serif' font-size='34' font-weight='700' text-anchor='middle' dominant-baseline='middle' opacity='0.92'>${text}</text></svg>`;
  return svg;
}
function ratioH(r, w) {
  if (!r) return Math.round(w * 1.25);
  const [a, b] = r.split(":").map(Number);
  return Math.round(w * b / a);
}
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function escapeHtml(s = "") { return s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])); }
function escapeAttr(s = "") { return s.replace(/"/g, "&quot;"); }

// ---------- events ----------
function bindEvents() {
  $("#categoryChips").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    state.category = b.dataset.cat;
    $$("[data-cat]").forEach(x => x.setAttribute("aria-selected", x.dataset.cat === state.category));
    apply();
  });
  $("#difficultyChips").addEventListener("click", e => {
    const b = e.target.closest("[data-diff]");
    if (!b) return;
    state.difficulty = b.dataset.diff;
    $$("[data-diff]").forEach(x => x.setAttribute("aria-selected", x.dataset.diff === state.difficulty));
    apply();
  });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; apply(); });
  $("#search").addEventListener("input", e => { state.query = e.target.value.trim(); apply(); });

  // shortcut: focus search on /
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      $("#search").focus();
    }
    if (e.key === "Escape") closeChat();
  });

  // theme toggle (cream <-> dark)
  $("#themeToggle").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "cream";
    const next = cur === "dark" ? "cream" : "dark";
    if (next === "cream") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("img2-theme", next); } catch {}
  });
  // hydrate theme
  try {
    const saved = localStorage.getItem("img2-theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch {}

  // chat panel
  $("#openChatBtn").addEventListener("click", () => openChatWithPrompt(null));
  $("#chatClose").addEventListener("click", closeChat);
  $("#scrim").addEventListener("click", closeChat);
  $("#chatForm").addEventListener("submit", e => {
    e.preventDefault();
    sendMessage();
  });
  $("#chatInput").addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

// ---------- chat ----------
function openChatWithPrompt(p) {
  $("#chat").classList.add("is-open");
  $("#chat").setAttribute("aria-hidden", "false");
  $("#scrim").hidden = false;
  if (p) {
    addPromptCard(p);
    $("#chatInput").value = "Run the prompt above with GPT Image 2.";
    setTimeout(() => $("#chatInput").focus(), 250);
  } else {
    setTimeout(() => $("#chatInput").focus(), 250);
  }
}
function closeChat() {
  $("#chat").classList.remove("is-open");
  $("#chat").setAttribute("aria-hidden", "true");
  $("#scrim").hidden = true;
}

function addPromptCard(p) {
  const body = $("#chatBody");
  const div = document.createElement("div");
  div.className = "msg msg--prompt";
  const url = CAPY_CHAT_URL + encodeURIComponent(p.prompt);
  div.innerHTML = `
    <header>
      <strong>${escapeHtml(p.title)}</strong>
      <span>${p.aspect_ratio || ""} · ${diffLabel(p.difficulty)}</span>
    </header>
    ${escapeHtml(p.prompt)}
    <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
      <button class="card__btn" data-copy="${p.id}">Copy</button>
      <a class="card__btn card__btn--primary" target="_blank" rel="noopener" href="${url}">Send to Capy →</a>
    </div>
  `;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  div.querySelector("[data-copy]").addEventListener("click", () => {
    navigator.clipboard.writeText(p.prompt).then(() => toast("Prompt copied"));
  });
}

function sendMessage() {
  const input = $("#chatInput");
  const text = input.value.trim();
  if (!text) return;
  pushMsg("me", text);
  input.value = "";

  // try to find a prompt card recently added
  const lastPrompt = $$(".msg--prompt", $("#chatBody")).pop();
  const promptText = lastPrompt ? lastPrompt.textContent.replace(/\s+/g, " ").slice(0, 600) : "";

  // simulate a Capy reply (the real chat lives on happycapy.ai)
  setTimeout(() => {
    const reply = botReplyFor(text, promptText);
    pushMsg("bot", reply);

    // if user is asking to run/generate, also surface the deep link.
    if (/run|generate|create|make|跑|画|生成|做/.test(text) && lastPrompt) {
      const a = document.createElement("a");
      a.className = "btn btn--primary btn--sm";
      a.target = "_blank";
      a.rel = "noopener";
      a.style.marginTop = "6px";
      a.href = CAPY_CHAT_URL + encodeURIComponent(lastPrompt.textContent.trim());
      a.textContent = "Open in full Capy chat →";
      $("#chatBody").appendChild(a);
      $("#chatBody").scrollTop = $("#chatBody").scrollHeight;
    }
  }, 450);
}

function pushMsg(role, text) {
  const body = $("#chatBody");
  const div = document.createElement("div");
  div.className = `msg msg--${role}`;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function botReplyFor(_userText, promptText) {
  if (promptText) {
    return "Got it — I'll route this prompt to GPT Image 2. Tap the button below to open it in a full Capy chat where I can actually generate the image and iterate with you.";
  }
  return "Pick any card on the left and tap Try in Capy — I'll load the prompt here so we can tweak it before generating.";
}

// ---------- toast ----------
let toastTimer;
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-show"), 1800);
}

// ---------- polish add-ons ----------
function setupExtras() {
  window.__capyToast = toast;

  // Hero quick searches
  $$(".hero__quicks .quick").forEach(b => b.addEventListener("click", () => {
    const q = b.dataset.q || "";
    const input = $("#search");
    input.value = q;
    state.query = q;
    apply();
    document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  // Hero preview thumbs — sample 6 featured prompts that have a real preview image
  const previews = state.data.prompts
    .filter(p => p.preview_image_url && !/data:image/.test(p.preview_image_url))
    .filter(p => p.featured)
    .slice(0, 6);
  const heroEl = $("#heroPreviews");
  if (heroEl) {
    heroEl.innerHTML = previews.map((p, i) => `
      <a class="hero__previewItem" data-id="${p.id}" style="--i:${i}" title="${escapeAttr(p.title)}">
        <img loading="lazy" src="${p.preview_image_url}" alt="" />
      </a>
    `).join("");
    heroEl.addEventListener("click", e => {
      const a = e.target.closest("[data-id]");
      if (!a) return;
      const p = state.data.prompts.find(x => x.id === a.dataset.id);
      if (p) openChatWithPrompt(p);
    });
  }

  // Featured today strip — 3 hand-picked
  const featured = state.data.prompts
    .filter(p => p.featured && p.preview_image_url)
    .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0))
    .slice(0, 3);
  const featRow = $("#featuredRow");
  if (featRow) {
    featRow.innerHTML = featured.map(p => `
      <article class="featCard" data-id="${p.id}">
        <div class="featCard__media" data-ratio="${p.aspect_ratio || "4:5"}">
          <img loading="lazy" src="${p.preview_image_url}" alt="${escapeAttr(p.title)}" />
          <span class="featCard__chip">${p.aspect_ratio || ""}</span>
        </div>
        <div class="featCard__body">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.description)}</p>
          <div class="featCard__row">
            <span class="featCard__cat">${escapeHtml(prettyCategory(p.category))}</span>
            <button class="card__btn card__btn--primary" data-try="${p.id}">Try in Capy →</button>
          </div>
        </div>
      </article>
    `).join("");
    featRow.addEventListener("click", e => {
      const card = e.target.closest("[data-id]");
      const tryBtn = e.target.closest("[data-try]");
      if (tryBtn) {
        const p = state.data.prompts.find(x => x.id === tryBtn.dataset.try);
        if (p) openChatWithPrompt(p);
        return;
      }
      if (card) {
        const p = state.data.prompts.find(x => x.id === card.dataset.id);
        if (p) openChatWithPrompt(p);
      }
    });
  }

  // Result hint — wrap apply()
  const _apply = apply;
  window.apply = function () {
    _apply();
    const n = state.filteredIds.length;
    const total = state.data.prompts.length;
    const hint = $("#resultHint");
    if (hint) {
      const parts = [];
      if (state.category !== "all") {
        const c = state.data.meta.categories.find(x => x.id === state.category);
        if (c) parts.push(`category <strong>${c.label}</strong>`);
      }
      if (state.difficulty !== "all") parts.push(`<strong>${diffLabel(state.difficulty)}</strong>`);
      if (state.query) parts.push(`matching "<strong>${escapeHtml(state.query)}</strong>"`);
      const where = parts.length ? " · " + parts.join(" · ") : "";
      hint.innerHTML = `Showing <strong>${n}</strong> of ${total} prompts${where}.`;
    }
  };
  // call once
  window.apply();

  // Clear filters
  $("#clearFilters")?.addEventListener("click", () => {
    state.category = "all"; state.difficulty = "all"; state.query = "";
    $("#search").value = "";
    $$("[data-cat]").forEach(x => x.setAttribute("aria-selected", x.dataset.cat === "all"));
    $$("[data-diff]").forEach(x => x.setAttribute("aria-selected", x.dataset.diff === "all"));
    window.apply();
  });

  // Second openChat trigger + FAB
  $("#openChatBtn2")?.addEventListener("click", () => openChatWithPrompt(null));
  $("#fab")?.addEventListener("click", () => openChatWithPrompt(null));

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("is-revealed");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "-40px 0px -40px 0px", threshold: 0.05 });
    $$(".reveal, .why__card, .featCard, .how__card, .tip, .gallery__head").forEach(el => {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // FAB visibility — show after scrolling past hero
  const fab = $("#fab");
  if (fab) {
    const onScroll = () => {
      const y = window.scrollY || 0;
      fab.classList.toggle("is-show", y > 480);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
}

function prettyCategory(id) {
  const c = state.data.meta.categories.find(x => x.id === id);
  return c ? c.label : id;
}

// ---------- start ----------
init()
  .then(setupExtras)
  .catch(err => {
    console.error(err);
    document.body.insertAdjacentHTML("beforeend",
      `<div style="padding:40px;text-align:center;color:#c4564b">Failed to load prompts.json: ${err.message}</div>`);
  });
