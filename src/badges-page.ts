import './fan-page.css';

// Filters the badge list as you type. Every word must appear in the badge's
// name, rarity, park type or blurb.
const input = document.querySelector<HTMLInputElement>('#badge-search')!;
const count = document.querySelector<HTMLParagraphElement>('#badge-search-count')!;
const empty = document.querySelector<HTMLParagraphElement>('.badge-search__empty')!;
const entries = [...document.querySelectorAll<HTMLLIElement>('.badge-entry')];

function applySearch() {
  const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  for (const entry of entries) {
    const match = words.every((word) => (entry.dataset.search ?? '').includes(word));
    entry.hidden = !match;
    if (match) shown++;
  }
  count.textContent = words.length ? `${shown} of ${entries.length} badges` : `${entries.length} badges`;
  empty.hidden = shown > 0;
}

input.addEventListener('input', applySearch);
applySearch();
