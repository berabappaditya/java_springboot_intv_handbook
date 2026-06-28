// =============================================================
// search.js — Search and filter logic
// =============================================================

/**
 * Filter questions from all categories based on:
 * - active category (or "all")
 * - difficulty filter ("all" | "easy" | "medium" | "hard")
 * - search query (matches question text, answer text, tags)
 *
 * Returns an array of { category, question } objects.
 */
function filterQuestions(data, { categoryId, difficulty, query }) {
  const results = [];
  const normalizedQuery = query.trim().toLowerCase();

  for (const category of data) {
    if (categoryId !== "all" && category.id !== categoryId) continue;

    for (const q of category.questions) {
      if (difficulty !== "all" && q.difficulty !== difficulty) continue;

      if (normalizedQuery && !matchesQuery(q, normalizedQuery)) continue;

      results.push({ category, question: q });
    }
  }

  return results;
}

/**
 * Check if a question matches the search query.
 * Searches: question text, answer text, tags.
 */
function matchesQuery(question, query) {
  return (
    question.question.toLowerCase().includes(query) ||
    question.answer.toLowerCase().includes(query) ||
    question.tags.some(tag => tag.toLowerCase().includes(query))
  );
}

/**
 * Wrap all occurrences of `term` in the given text with <mark> tags.
 * Returns the marked-up text (HTML string). Safe: escapes the text first.
 */
function highlightText(text, term) {
  if (!term) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const escapedTerm = escapeRegExp(term);
  const re = new RegExp(`(${escapedTerm})`, "gi");
  return escaped.replace(re, "<mark>$1</mark>");
}

/** Escape HTML special characters to prevent XSS. */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Escape special regex chars so user input is treated literally. */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
