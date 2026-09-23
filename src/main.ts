import './shared-base.css';
import './poster-page.css';
import './device-frame.css';

const dialogs = [...document.querySelectorAll<HTMLDialogElement>('.outdoor-dialog')];
function revealLinkedDialog() {
  const dialog = dialogs.find((item) => `#${item.id}` === location.hash);
  if (dialog && !dialog.open) dialog.showModal();
}
document.querySelectorAll<HTMLButtonElement>('[data-dialog-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.getElementById(button.dataset.dialogOpen || '') as HTMLDialogElement | null;
    if (dialog && !dialog.open) dialog.showModal();
  });
});
dialogs.forEach((dialog) => {
  dialog.querySelector<HTMLButtonElement>('[data-dialog-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (event.target === dialog && outside) dialog.close();
  });
});
revealLinkedDialog();
window.addEventListener('hashchange', revealLinkedDialog);
window.addEventListener('pageshow', revealLinkedDialog);

const appUrl = import.meta.env.VITE_APP_URL || 'https://web.parkdex.app';
document.querySelectorAll<HTMLAnchorElement>('[data-app-link]').forEach((link) => { link.href = appUrl; });

const form = document.querySelector<HTMLFormElement>('#waitlist-form')!;
const email = document.querySelector<HTMLInputElement>('#email')!;
const company = document.querySelector<HTMLInputElement>('#company')!;
const message = document.querySelector<HTMLParagraphElement>('#form-message')!;
const join = document.querySelector<HTMLButtonElement>('#join-button')!;
const joinLabel = join.querySelector('span')!;
let touched = false;
let pending = false;

function validate(): boolean {
  const valid = email.validity.valid && email.value.trim().length > 0;
  email.setAttribute('aria-invalid', String(!valid));
  if (!valid) {
    form.dataset.state = 'error';
    message.textContent = 'Add a valid email address, like you@example.com.';
  }
  return valid;
}

email.addEventListener('blur', () => { if (email.value && !pending) { touched = true; validate(); } });
email.addEventListener('input', () => {
  if (pending) return;
  if (touched && !validate()) return;
  form.dataset.state = 'idle';
  email.setAttribute('aria-invalid', 'false');
  message.textContent = '';
  joinLabel.textContent = 'Join the waitlist';
  join.disabled = removing;
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (pending) return;
  if (removing) { message.textContent = 'Please wait for the email removal to finish.'; return; }
  email.value = email.value.trim();
  touched = true;
  if (!validate()) { email.focus(); return; }
  pending = true;
  join.disabled = true;
  removeButton.disabled = true;
  email.readOnly = true;
  form.dataset.state = 'loading';
  form.setAttribute('aria-busy', 'true');
  joinLabel.textContent = 'Joining…';
  message.textContent = 'Saving your spot on the list…';
  const submittedEmail = email.value;
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: submittedEmail, company: company.value }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) {
      if (result?.error === 'invalid_email') {
        email.setAttribute('aria-invalid', 'true');
        throw new Error('Check your email address and try again.');
      }
      if (response.status === 429) throw new Error('A few too many tries. Please try again in a little while.');
      throw new Error('Your email wasn’t saved. Please try again in a moment.');
    }
    form.dataset.state = 'success';
    joinLabel.textContent = 'You’re on the list';
    message.textContent = `${submittedEmail} is on the list. I’ll email you when Android is ready.`;
  } catch (error) {
    form.dataset.state = 'error';
    joinLabel.textContent = 'Try again';
    message.textContent = error instanceof Error && !['TimeoutError', 'TypeError', 'AbortError'].includes(error.name)
      ? error.message : 'Couldn’t reach the waitlist. Check your connection and try again.';
  } finally {
    pending = false;
    email.readOnly = false;
    join.disabled = form.dataset.state === 'success';
    removeButton.disabled = removeForm.dataset.state === 'success';
    form.removeAttribute('aria-busy');
  }
});

const removeForm = document.querySelector<HTMLFormElement>('#remove-form')!;
const removeEmail = document.querySelector<HTMLInputElement>('#remove-email')!;
const removeCompany = document.querySelector<HTMLInputElement>('#remove-company')!;
const removeButton = document.querySelector<HTMLButtonElement>('#remove-button')!;
const removeMessage = document.querySelector<HTMLParagraphElement>('#remove-message')!;
let removing = false;

removeEmail.addEventListener('input', () => {
  if (removing) return;
  removeForm.dataset.state = 'idle';
  removeEmail.setAttribute('aria-invalid', 'false');
  removeButton.textContent = "I'd like to leave the waitlist";
  removeButton.disabled = pending;
  removeMessage.textContent = '';
});

removeForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (removing) return;
  if (pending) { removeMessage.textContent = 'Please wait for the signup to finish, then remove your email.'; return; }
  removeEmail.value = removeEmail.value.trim();
  if (!removeEmail.validity.valid || !removeEmail.value) {
    removeForm.dataset.state = 'error';
    removeEmail.setAttribute('aria-invalid', 'true');
    removeMessage.textContent = 'Add the email address you used to join, like you@example.com.';
    removeEmail.focus();
    return;
  }
  removing = true;
  removeEmail.setAttribute('aria-invalid', 'false');
  removeEmail.readOnly = true;
  removeButton.disabled = true;
  join.disabled = true;
  removeButton.textContent = 'Removing…';
  removeForm.dataset.state = 'loading';
  removeForm.setAttribute('aria-busy', 'true');
  removeMessage.textContent = 'Removing this address from the waitlist…';
  const submittedEmail = removeEmail.value;
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: submittedEmail, action: 'remove', company: removeCompany.value }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) {
      if (result?.error === 'invalid_email') {
        removeEmail.setAttribute('aria-invalid', 'true');
        throw new Error('Check your email address and try again.');
      }
      if (response.status === 429) throw new Error('A few too many tries. Please try again in a little while.');
      throw new Error('We couldn’t remove this address. Please try again in a moment.');
    }
    removeForm.dataset.state = 'success';
    removeButton.textContent = 'Done';
    removeMessage.textContent = 'If this address was on the waitlist, it has been removed. You can join again anytime.';
    if (email.value.trim().toLowerCase() === submittedEmail.toLowerCase() && !pending) {
      form.dataset.state = 'idle';
      joinLabel.textContent = 'Join the waitlist';
      join.disabled = false;
      message.textContent = '';
    }
  } catch (error) {
    removeForm.dataset.state = 'error';
    removeButton.textContent = 'Try again';
    removeMessage.textContent = error instanceof Error && !['TimeoutError', 'TypeError', 'AbortError'].includes(error.name)
      ? error.message : 'Couldn’t reach the waitlist. Check your connection and try again.';
  } finally {
    removing = false;
    removeEmail.readOnly = false;
    removeButton.disabled = removeForm.dataset.state === 'success';
    join.disabled = form.dataset.state === 'success';
    removeForm.removeAttribute('aria-busy');
  }
});

const countTrigger = document.querySelector<HTMLButtonElement>('#park-count-trigger')!;
const countPopover = document.querySelector<HTMLDivElement>('#park-count-popover')!;
const heroInner = document.querySelector<HTMLDivElement>('.outdoor-hero-inner')!;
const categoryCounts = [...countPopover.querySelectorAll<HTMLElement>('dd')].map((element) => ({
  element,
  target: Number(element.textContent?.trim()),
}));
let categoryCountFrame: number | undefined;

function animateCategoryCounts() {
  if (categoryCountFrame !== undefined) cancelAnimationFrame(categoryCountFrame);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    categoryCounts.forEach(({ element, target }) => { element.textContent = String(target); });
    return;
  }
  categoryCounts.forEach(({ element }) => { element.textContent = '0'; });
  let start: number | undefined;
  const update = (time: number) => {
    start ??= time;
    const progress = Math.min((time - start) / 300, 1);
    categoryCounts.forEach(({ element, target }) => { element.textContent = String(Math.round(target * progress)); });
    categoryCountFrame = progress < 1 ? requestAnimationFrame(update) : undefined;
  };
  categoryCountFrame = requestAnimationFrame(update);
}

const parkCount = Number(countTrigger.dataset.count);
if (Number.isFinite(parkCount) && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let countStart: number | undefined;
  const countDuration = 1000;
  const updateCount = (time: number) => {
    countStart ??= time;
    const progress = Math.min((time - countStart) / countDuration, 1);
    countTrigger.textContent = String(Math.round(parkCount * progress)).padStart(3, '0');
    if (progress < 1) requestAnimationFrame(updateCount);
  };
  requestAnimationFrame(updateCount);
} else if (Number.isFinite(parkCount)) {
  countTrigger.textContent = String(parkCount);
}
let countPinned = false;
let countCloseTimer: ReturnType<typeof setTimeout> | undefined;

function positionCountPopover() {
  const anchor = countTrigger.getBoundingClientRect();
  const parent = heroInner.getBoundingClientRect();
  const left = Math.max(8, Math.min(anchor.left - parent.left, parent.width - countPopover.offsetWidth - 8));
  const below = anchor.bottom + 8;
  const viewportTop = below + countPopover.offsetHeight <= innerHeight - 8 ? below : anchor.top - countPopover.offsetHeight - 8;
  countPopover.style.left = `${left}px`;
  countPopover.style.top = `${Math.max(8, viewportTop - parent.top)}px`;
}

function showCountPopover(pinned: boolean) {
  clearTimeout(countCloseTimer);
  const wasHidden = countPopover.hidden;
  countPopover.hidden = false;
  countPinned = pinned;
  countTrigger.setAttribute('aria-expanded', 'true');
  countTrigger.setAttribute('aria-describedby', 'park-count-popover');
  positionCountPopover();
  if (wasHidden) animateCategoryCounts();
}

function closeCountPopover() {
  clearTimeout(countCloseTimer);
  if (categoryCountFrame !== undefined) cancelAnimationFrame(categoryCountFrame);
  categoryCountFrame = undefined;
  countPopover.hidden = true;
  countPinned = false;
  countTrigger.setAttribute('aria-expanded', 'false');
  countTrigger.removeAttribute('aria-describedby');
}

function scheduleCountClose() {
  clearTimeout(countCloseTimer);
  if (!countPinned) countCloseTimer = setTimeout(closeCountPopover, 180);
}

countTrigger.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse' && !countPinned) showCountPopover(false);
});
countTrigger.addEventListener('pointerleave', scheduleCountClose);
countPopover.addEventListener('pointerenter', () => clearTimeout(countCloseTimer));
countPopover.addEventListener('pointerleave', scheduleCountClose);
countTrigger.addEventListener('click', () => {
  if (countPinned) closeCountPopover();
  else showCountPopover(true);
});
countTrigger.addEventListener('focus', () => {
  if (!countPinned) showCountPopover(false);
});
countTrigger.addEventListener('blur', () => setTimeout(() => {
  if (document.activeElement !== countTrigger) closeCountPopover();
}, 0));
addEventListener('resize', () => { if (!countPopover.hidden) positionCountPopover(); });

const categoryExamples = {
  national: {
    title: 'Pacific Rim National Park Reserve',
    description: 'Long Beach and forested headlands.',
    image: '/images/pacific-rim.webp',
  },
  provincial: {
    title: 'Strathcona Park',
    description: 'Paradise Meadows boardwalk and mountain meadow.',
    image: '/images/strathcona.webp',
  },
  regional: {
    title: 'Little Huson Cave Regional Park',
    description: 'Natural bridge over Atluck Creek.',
    image: '/images/little-huson.webp',
  },
  islands: {
    title: 'Cortes Island',
    description: 'Squirrel Cove shoreline and oyster beds.',
    image: '/images/cortes-island.webp',
  },
} as const;

type Category = keyof typeof categoryExamples;
const categoryTriggers = [...document.querySelectorAll<HTMLButtonElement>('.outdoor-category-trigger')];
const preview = document.querySelector<HTMLDivElement>('#category-preview')!;
const mapSection = document.querySelector<HTMLElement>('.outdoor-section--map')!;
const previewImage = document.querySelector<HTMLImageElement>('#category-preview-image')!;
const previewTitle = document.querySelector<HTMLElement>('#category-preview-title')!;
const previewDescription = document.querySelector<HTMLElement>('#category-preview-description')!;
let previewPinned = false;
let previewCloseTimer: ReturnType<typeof setTimeout> | undefined;

function closePreview() {
  clearTimeout(previewCloseTimer);
  preview.hidden = true;
  previewPinned = false;
  categoryTriggers.forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
    button.removeAttribute('aria-describedby');
  });
}

function positionPreview(button: HTMLButtonElement) {
  const anchor = button.getBoundingClientRect();
  const parent = mapSection.getBoundingClientRect();
  const left = Math.max(8, Math.min(anchor.left - parent.left, parent.width - preview.offsetWidth - 8));
  const below = anchor.bottom + 8;
  const viewportTop = below + preview.offsetHeight <= innerHeight - 8 ? below : anchor.top - preview.offsetHeight - 8;
  preview.style.left = `${left}px`;
  preview.style.top = `${Math.max(8, viewportTop - parent.top)}px`;
}

function showPreview(category: Category, pinned: boolean) {
  clearTimeout(previewCloseTimer);
  const example = categoryExamples[category];
  previewTitle.textContent = example.title;
  previewDescription.textContent = example.description;
  previewImage.src = example.image;
  previewImage.alt = example.description;
  preview.hidden = false;
  previewPinned = pinned;
  preview.dataset.category = category;
  categoryTriggers.forEach((button) => {
    const active = button.dataset.category === category;
    button.setAttribute('aria-expanded', String(active));
    if (active) button.setAttribute('aria-describedby', 'category-preview');
    else button.removeAttribute('aria-describedby');
  });
  const button = categoryTriggers.find((item) => item.dataset.category === category);
  if (button) positionPreview(button);
}

function schedulePreviewClose() {
  clearTimeout(previewCloseTimer);
  if (!previewPinned) previewCloseTimer = setTimeout(closePreview, 220);
}

categoryTriggers.forEach((button) => {
  const category = button.dataset.category as Category;
  button.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && !previewPinned) showPreview(category, false);
  });
  button.addEventListener('pointerleave', schedulePreviewClose);
  button.addEventListener('click', () => {
    if (!preview.hidden && previewPinned && button.getAttribute('aria-expanded') === 'true') closePreview();
    else showPreview(category, true);
  });
  button.addEventListener('focus', () => {
    showPreview(category, previewPinned);
  });
  button.addEventListener('blur', () => {
    setTimeout(() => {
      if (!categoryTriggers.some((item) => item === document.activeElement)) closePreview();
    }, 0);
  });
});
preview.addEventListener('pointerenter', () => clearTimeout(previewCloseTimer));
preview.addEventListener('pointerleave', schedulePreviewClose);
document.addEventListener('pointerdown', (event) => {
  if (!countPopover.contains(event.target as Node) && !countTrigger.contains(event.target as Node)) closeCountPopover();
  if (!preview.contains(event.target as Node) && !categoryTriggers.some((button) => button.contains(event.target as Node))) closePreview();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeCountPopover();
    closePreview();
  }
});
addEventListener('resize', () => {
  const expanded = categoryTriggers.find((button) => button.getAttribute('aria-expanded') === 'true');
  if (expanded && !preview.hidden) positionPreview(expanded);
});
