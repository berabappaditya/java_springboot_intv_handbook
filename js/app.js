// =============================================================
// app.js — Main application logic
// Depends on: data.js (HANDBOOK_DATA), search.js (filterQuestions,
//             highlightText, escapeHtml)
// =============================================================

// ─── State ───────────────────────────────────────────────────
const state = {
  categoryId:  "all",
  difficulty:  "all",
  query:       "",
  reviewed:    JSON.parse(localStorage.getItem("reviewed") || "{}"),
  expanded:    {}, // questionId → boolean
};

// ─── DOM refs ────────────────────────────────────────────────
const els = {
  sidebar:         document.getElementById("sidebar"),
  overlay:         document.getElementById("overlay"),
  hamburger:       document.getElementById("hamburger"),
  navList:         document.getElementById("nav-list"),
  searchInput:     document.getElementById("search-input"),
  searchClear:     document.getElementById("search-clear"),
  difficultyBtns:  document.querySelectorAll("[data-difficulty]"),
  questionsContainer: document.getElementById("questions-container"),
  progressBar:     document.getElementById("progress-bar"),
  progressText:    document.getElementById("progress-text"),
  progressCount:   document.getElementById("progress-count"),
  expandAllBtn:    document.getElementById("expand-all"),
  collapseAllBtn:  document.getElementById("collapse-all"),
  resultCount:     document.getElementById("result-count"),
};

// ─── Initialise ──────────────────────────────────────────────
// (Theme handling lives in js/theme.js, shared by all pages.)
function init() {
  buildNav();
  bindEvents();
  render();
}

// ─── Navigation ──────────────────────────────────────────────
function buildNav() {
  const allItem = createNavItem({ id: "all", title: "All Categories", icon: "📚" }, true);
  els.navList.appendChild(allItem);

  for (const cat of HANDBOOK_DATA) {
    els.navList.appendChild(createNavItem(cat, false));
  }
}

function createNavItem(cat, isActive) {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.className = "nav-btn" + (isActive ? " active" : "");
  btn.dataset.category = cat.id;
  btn.setAttribute("aria-pressed", String(isActive));

  const count = cat.id === "all"
    ? HANDBOOK_DATA.reduce((s, c) => s + c.questions.length, 0)
    : (HANDBOOK_DATA.find(c => c.id === cat.id)?.questions.length ?? 0);

  btn.innerHTML = `
    <span class="nav-icon">${cat.icon}</span>
    <span class="nav-label">${escapeHtml(cat.title)}</span>
    <span class="nav-count">${count}</span>
  `;
  btn.addEventListener("click", () => selectCategory(cat.id));
  li.appendChild(btn);
  return li;
}

function selectCategory(id) {
  state.categoryId = id;
  // Update active state on all nav buttons
  els.navList.querySelectorAll(".nav-btn").forEach(btn => {
    const active = btn.dataset.category === id;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  closeSidebar();
  render();
}

// ─── Events ──────────────────────────────────────────────────
function bindEvents() {
  // Search
  els.searchInput.addEventListener("input", () => {
    state.query = els.searchInput.value;
    els.searchClear.style.display = state.query ? "flex" : "none";
    render();
  });
  els.searchClear.addEventListener("click", () => {
    state.query = "";
    els.searchInput.value = "";
    els.searchClear.style.display = "none";
    els.searchInput.focus();
    render();
  });

  // Difficulty filters
  els.difficultyBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.difficulty = btn.dataset.difficulty;
      els.difficultyBtns.forEach(b => {
        b.classList.toggle("active", b.dataset.difficulty === state.difficulty);
        b.setAttribute("aria-pressed", String(b.dataset.difficulty === state.difficulty));
      });
      render();
    });
  });

  // Expand / Collapse all
  els.expandAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".accordion-item").forEach(item => {
      const id = item.dataset.id;
      state.expanded[id] = true;
      openAccordion(item);
    });
  });
  els.collapseAllBtn.addEventListener("click", () => {
    document.querySelectorAll(".accordion-item").forEach(item => {
      const id = item.dataset.id;
      state.expanded[id] = false;
      closeAccordion(item);
    });
  });

  // Hamburger menu
  els.hamburger.addEventListener("click", toggleSidebar);
  els.overlay.addEventListener("click", closeSidebar);

  // Keyboard: close sidebar on Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeSidebar();
  });
}

// ─── Sidebar (mobile) ────────────────────────────────────────
function toggleSidebar() {
  const open = els.sidebar.classList.toggle("open");
  els.overlay.classList.toggle("visible", open);
  els.hamburger.setAttribute("aria-expanded", String(open));
}
function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.overlay.classList.remove("visible");
  els.hamburger.setAttribute("aria-expanded", "false");
}

// ─── Render ──────────────────────────────────────────────────
function render() {
  const results = filterQuestions(HANDBOOK_DATA, {
    categoryId: state.categoryId,
    difficulty: state.difficulty,
    query: state.query.toLowerCase(),
  });

  renderProgress();
  renderResultCount(results.length);

  if (results.length === 0) {
    els.questionsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>No questions match your filters.</p>
        <button class="btn-link" onclick="clearFilters()">Clear all filters</button>
      </div>
    `;
    return;
  }

  // Group results by category for section headers
  const grouped = new Map();
  for (const item of results) {
    const key = item.category.id;
    if (!grouped.has(key)) grouped.set(key, { category: item.category, questions: [] });
    grouped.get(key).questions.push(item.question);
  }

  const fragment = document.createDocumentFragment();

  for (const [, { category, questions }] of grouped) {
    // Only show category header if "All" is selected
    if (state.categoryId === "all") {
      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `<span class="cat-icon">${category.icon}</span><h2>${escapeHtml(category.title)}</h2>`;
      fragment.appendChild(header);
    }

    for (const q of questions) {
      fragment.appendChild(buildAccordionItem(q, state.query));
    }
  }

  els.questionsContainer.innerHTML = "";
  els.questionsContainer.appendChild(fragment);
}

function renderProgress() {
  const total = HANDBOOK_DATA.reduce((s, c) => s + c.questions.length, 0);
  const done  = Object.values(state.reviewed).filter(Boolean).length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  els.progressBar.style.width = pct + "%";
  els.progressBar.setAttribute("aria-valuenow", pct);
  els.progressText.textContent = pct + "%";
  els.progressCount.textContent = `${done} / ${total} reviewed`;
}

function renderResultCount(count) {
  els.resultCount.textContent = `${count} question${count !== 1 ? "s" : ""}`;
}

// ─── Accordion ───────────────────────────────────────────────
function buildAccordionItem(q, searchQuery) {
  const isReviewed = !!state.reviewed[q.id];
  const isExpanded = !!state.expanded[q.id];

  const item = document.createElement("div");
  item.className = "accordion-item" + (isReviewed ? " reviewed" : "");
  item.dataset.id = q.id;

  const diffClass = { easy: "diff-easy", medium: "diff-medium", hard: "diff-hard" }[q.difficulty];
  const diffLabel = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
  const questionHtml = searchQuery ? highlightText(q.question, searchQuery) : escapeHtml(q.question);

  item.innerHTML = `
    <div class="accordion-header" role="button" tabindex="0"
         aria-expanded="${isExpanded}"
         aria-controls="answer-${q.id}">
      <div class="accordion-header-left">
        <span class="diff-badge ${diffClass}">${diffLabel}</span>
        <span class="question-text">${questionHtml}</span>
      </div>
      <div class="accordion-header-right">
        <label class="reviewed-label" title="Mark as reviewed" aria-label="Mark as reviewed">
          <input type="checkbox" class="reviewed-checkbox" data-id="${q.id}" ${isReviewed ? "checked" : ""}>
          <span class="checkmark"></span>
        </label>
        <span class="accordion-arrow" aria-hidden="true">${isExpanded ? "▲" : "▼"}</span>
      </div>
    </div>
    <div class="accordion-body" id="answer-${q.id}" ${isExpanded ? "" : 'style="display:none"'}>
      <div class="accordion-content">
        ${renderAnswer(q.answer, searchQuery)}
        <div class="tags">
          ${q.tags.map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join("")}
        </div>
      </div>
    </div>
  `;

  // Toggle accordion on header click / keyboard
  const header = item.querySelector(".accordion-header");
  header.addEventListener("click", e => {
    // Don't toggle if clicking the checkbox label
    if (e.target.closest(".reviewed-label")) return;
    toggleAccordion(item, q.id);
  });
  header.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!e.target.closest(".reviewed-label")) toggleAccordion(item, q.id);
    }
  });

  // Reviewed checkbox — stop propagation so it doesn't toggle accordion
  const checkbox = item.querySelector(".reviewed-checkbox");
  checkbox.addEventListener("change", e => {
    e.stopPropagation();
    state.reviewed[q.id] = checkbox.checked;
    localStorage.setItem("reviewed", JSON.stringify(state.reviewed));
    item.classList.toggle("reviewed", checkbox.checked);
    renderProgress();
  });
  checkbox.addEventListener("click", e => e.stopPropagation());

  // Copy buttons for code blocks
  item.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const code = btn.nextElementSibling?.textContent ?? "";
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "✓ Copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("copied"); }, 2000);
      });
    });
  });

  return item;
}

function toggleAccordion(item, id) {
  const body = item.querySelector(".accordion-body");
  const header = item.querySelector(".accordion-header");
  const arrow = item.querySelector(".accordion-arrow");
  const isOpen = body.style.display !== "none";

  if (isOpen) {
    closeAccordion(item);
    state.expanded[id] = false;
  } else {
    openAccordion(item);
    state.expanded[id] = true;
  }
}

function openAccordion(item) {
  const body = item.querySelector(".accordion-body");
  const header = item.querySelector(".accordion-header");
  const arrow = item.querySelector(".accordion-arrow");
  body.style.display = "block";
  header.setAttribute("aria-expanded", "true");
  if (arrow) arrow.textContent = "▲";
}

function closeAccordion(item) {
  const body = item.querySelector(".accordion-body");
  const header = item.querySelector(".accordion-header");
  const arrow = item.querySelector(".accordion-arrow");
  body.style.display = "none";
  header.setAttribute("aria-expanded", "false");
  if (arrow) arrow.textContent = "▼";
}

// ─── Answer Rendering ────────────────────────────────────────
/**
 * Convert markdown-like answer text into HTML.
 * Supports:
 *   ```java ... ``` → <pre><code> with Copy button
 *   **bold**        → <strong>
 *   `inline code`   → <code>
 *   | table |       → <table>
 *   - item          → <ul><li>
 *   1. item         → <ol><li>
 *   Blank lines     → paragraph breaks
 */
function renderAnswer(raw, searchQuery) {
  // 1. Extract code blocks first (to avoid applying other transforms inside them)
  const codeBlocks = [];
  let text = raw.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || "java", code: code.trimEnd() });
    return `\x00CODE_BLOCK_${idx}\x00`;
  });

  // 2. Process line-by-line for tables, lists, paragraphs
  const lines = text.split("\n");
  const htmlLines = [];
  let inUl = false, inOl = false, inTable = false, tableHead = false;

  function closeList() {
    if (inUl) { htmlLines.push("</ul>"); inUl = false; }
    if (inOl) { htmlLines.push("</ol>"); inOl = false; }
  }
  function closeTable() {
    if (inTable) { htmlLines.push("</tbody></table>"); inTable = false; tableHead = false; }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block placeholder — emit as-is
    if (line.includes("\x00CODE_BLOCK_")) {
      closeList(); closeTable();
      htmlLines.push(line);
      continue;
    }

    // Table row
    if (line.trim().startsWith("|")) {
      closeList();
      const cells = line.split("|").slice(1, -1).map(c => c.trim());
      // Separator row like |---|---|
      if (cells.every(c => /^[-:]+$/.test(c))) {
        tableHead = false; // next rows are body
        continue;
      }
      if (!inTable) {
        htmlLines.push('<table class="answer-table"><thead>');
        inTable = true; tableHead = true;
      } else if (tableHead) {
        htmlLines.push("</thead><tbody>");
        tableHead = false;
      }
      const tag = tableHead ? "th" : "td";
      htmlLines.push("<tr>" + cells.map(c => `<${tag}>${inlineFormat(c)}</${tag}>`).join("") + "</tr>");
      continue;
    }

    if (inTable) { closeTable(); }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/);
    if (ulMatch) {
      closeTable();
      if (!inUl) { htmlLines.push("<ul>"); inUl = true; }
      htmlLines.push(`<li>${inlineFormat(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      closeTable();
      if (!inOl) { htmlLines.push("<ol>"); inOl = true; }
      htmlLines.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    closeList();

    // Blank line → paragraph break
    if (line.trim() === "") {
      htmlLines.push('<br>');
      continue;
    }

    // Regular text
    htmlLines.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeList(); closeTable();

  let html = htmlLines.join("\n");

  // 3. Re-insert code blocks
  html = html.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_, idx) => {
    const { lang, code } = codeBlocks[parseInt(idx)];
    const escaped = escapeHtml(code);
    return `
      <div class="code-block">
        <div class="code-header">
          <span class="code-lang">${escapeHtml(lang)}</span>
          <button class="copy-btn" type="button">Copy</button>
        </div>
        <pre><code class="language-${escapeHtml(lang)}">${escaped}</code></pre>
      </div>`;
  });

  // 4. Highlight search terms in text nodes (not inside <code> blocks)
  if (searchQuery) {
    // Only highlight outside of code blocks
    html = html.replace(/(<div class="code-block">[\s\S]*?<\/div>)|([^<]+)/g, (match, codeBlock, text) => {
      if (codeBlock) return codeBlock; // leave code blocks untouched
      if (text) return highlightText(text, searchQuery).replace(/&amp;/g, "&"); // undo double-escape
      return match;
    });
  }

  return html;
}

/** Apply inline markdown: **bold**, *italic*, `code` */
function inlineFormat(text) {
  let s = escapeHtml(text);

  // Protect inline code spans first so * inside them is left alone
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return `\x00INLINE_CODE_${codes.length - 1}\x00`;
  });

  s = s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\s][^*\n]*?)\*/g, "<em>$1</em>");

  return s.replace(/\x00INLINE_CODE_(\d+)\x00/g, (_, i) => `<code>${codes[+i]}</code>`);
}

// ─── Utility ─────────────────────────────────────────────────
function clearFilters() {
  state.query = "";
  state.difficulty = "all";
  state.categoryId = "all";
  els.searchInput.value = "";
  els.searchClear.style.display = "none";

  els.difficultyBtns.forEach(b => {
    b.classList.toggle("active", b.dataset.difficulty === "all");
    b.setAttribute("aria-pressed", String(b.dataset.difficulty === "all"));
  });
  els.navList.querySelectorAll(".nav-btn").forEach(btn => {
    const active = btn.dataset.category === "all";
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  render();
}

// ─── Boot ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
