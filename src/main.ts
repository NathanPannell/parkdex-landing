import './shared-base.css';
import './poster-page.css';
import './device-frame.css';
import './signup-footer.css';

const dialogs = [...document.querySelectorAll<HTMLDialogElement>('.outdoor-dialog, .outdoor-signup')];
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

type WaitlistList = 'android_beta' | 'app_store';

const listCopy: Record<WaitlistList, { title: string; lede: string; submit: string; done: string; saved: (email: string) => string }> = {
  android_beta: {
    title: 'Get access to the Android beta',
    lede: 'I’ll email you when a beta spot opens.',
    submit: 'Join the Android beta list',
    done: 'You’re on the beta list',
    saved: (email) => `${email} is on the Android beta list. I’ll email you when a spot opens.`,
  },
  app_store: {
    title: 'Join the App Store waitlist',
    lede: 'I’ll email you once when Parkdex reaches the App Store.',
    submit: 'Join the App Store waitlist',
    done: 'You’re on the App Store list',
    saved: (email) => `${email} is on the App Store waitlist. I’ll email you when Parkdex reaches the App Store.`,
  },
};

const signupDialog = document.querySelector<HTMLDialogElement>('#signup-dialog')!;
const signupForm = document.querySelector<HTMLFormElement>('#signup-form')!;
const signupTitle = document.querySelector<HTMLElement>('#signup-title')!;
const signupLede = document.querySelector<HTMLElement>('#signup-lede')!;
const signupEmail = document.querySelector<HTMLInputElement>('#signup-email')!;
const signupCompany = document.querySelector<HTMLInputElement>('#signup-company')!;
const signupSubmit = document.querySelector<HTMLButtonElement>('#signup-submit')!;
const signupSubmitLabel = signupSubmit.querySelector<HTMLSpanElement>('span')!;
const signupMessage = document.querySelector<HTMLParagraphElement>('#signup-message')!;
const signupKip = document.querySelector<HTMLImageElement>('.outdoor-signup-kip')!;
const listInputs = [...signupForm.querySelectorAll<HTMLInputElement>('input[name="list"]')];
const removeForm = document.querySelector<HTMLFormElement>('#remove-form')!;
const removeEmail = document.querySelector<HTMLInputElement>('#remove-email')!;
const removeCompany = document.querySelector<HTMLInputElement>('#remove-company')!;
const removeButton = document.querySelector<HTMLButtonElement>('#remove-button')!;
const removeMessage = document.querySelector<HTMLParagraphElement>('#remove-message')!;
// Lists joined in this page view, so switching lists shows the right state.
const joined = new Set<string>();
let pending = false;
let removing = false;

function selectedList(): WaitlistList {
  return (listInputs.find((input) => input.checked)?.value ?? 'android_beta') as WaitlistList;
}

function renderSignup() {
  const list = selectedList();
  const copy = listCopy[list];
  const isJoined = joined.has(`${list}:${signupEmail.value.trim().toLowerCase()}`);
  signupTitle.textContent = copy.title;
  signupLede.textContent = copy.lede;
  if (!pending) signupSubmitLabel.textContent = isJoined ? copy.done : copy.submit;
  signupSubmit.disabled = pending || removing || isJoined;
  signupKip.src = isJoined ? signupKip.dataset.kipDone! : signupKip.dataset.kipIdle!;
}

function openSignup(list: WaitlistList) {
  listInputs.forEach((input) => { input.checked = input.value === list; });
  if (!pending) {
    signupForm.dataset.state = 'idle';
    signupMessage.textContent = '';
  }
  renderSignup();
  if (!signupDialog.open) signupDialog.showModal();
  signupEmail.focus();
}

document.querySelectorAll<HTMLButtonElement>('[data-signup-open]').forEach((button) => {
  button.addEventListener('click', () => openSignup(button.dataset.signupOpen as WaitlistList));
});
listInputs.forEach((input) => input.addEventListener('change', () => {
  if (pending) return;
  signupForm.dataset.state = 'idle';
  signupMessage.textContent = '';
  renderSignup();
}));

signupEmail.addEventListener('input', () => {
  if (pending) return;
  signupForm.dataset.state = 'idle';
  signupEmail.setAttribute('aria-invalid', 'false');
  signupMessage.textContent = '';
  renderSignup();
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (pending) return;
  if (removing) { signupMessage.textContent = 'Please wait for the email removal to finish.'; return; }
  const list = selectedList();
  signupEmail.value = signupEmail.value.trim();
  if (!signupEmail.validity.valid || !signupEmail.value) {
    signupForm.dataset.state = 'error';
    signupEmail.setAttribute('aria-invalid', 'true');
    signupMessage.textContent = 'Add a valid email address, like you@example.com.';
    signupEmail.focus();
    return;
  }
  pending = true;
  signupSubmitLabel.textContent = 'Joining…';
  renderSignup();
  removeButton.disabled = true;
  signupEmail.readOnly = true;
  signupForm.dataset.state = 'loading';
  signupForm.setAttribute('aria-busy', 'true');
  signupMessage.textContent = 'Saving your spot on the list…';
  const submittedEmail = signupEmail.value;
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: submittedEmail, list, company: signupCompany.value }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.ok !== true) {
      if (result?.error === 'invalid_email') {
        signupEmail.setAttribute('aria-invalid', 'true');
        throw new Error('Check your email address and try again.');
      }
      if (response.status === 429) throw new Error('A few too many tries. Please try again in a little while.');
      throw new Error('Your email wasn’t saved. Please try again in a moment.');
    }
    joined.add(`${list}:${submittedEmail.toLowerCase()}`);
    signupForm.dataset.state = 'success';
    signupMessage.textContent = listCopy[list].saved(submittedEmail);
  } catch (error) {
    signupForm.dataset.state = 'error';
    signupMessage.textContent = error instanceof Error && !['TimeoutError', 'TypeError', 'AbortError'].includes(error.name)
      ? error.message : 'Couldn’t reach the waitlist. Check your connection and try again.';
  } finally {
    pending = false;
    signupEmail.readOnly = false;
    removeButton.disabled = removeForm.dataset.state === 'success';
    signupForm.removeAttribute('aria-busy');
    renderSignup();
  }
});

removeEmail.addEventListener('input', () => {
  if (removing) return;
  removeForm.dataset.state = 'idle';
  removeEmail.setAttribute('aria-invalid', 'false');
  removeButton.textContent = "Remove me from both lists";
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
  renderSignup();
  removeButton.textContent = 'Removing…';
  removeForm.dataset.state = 'loading';
  removeForm.setAttribute('aria-busy', 'true');
  removeMessage.textContent = 'Removing this address from both lists…';
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
    removeMessage.textContent = 'If this address was on either list, it has been removed. You can join again anytime.';
    const removedEmail = submittedEmail.toLowerCase();
    for (const key of [...joined]) if (key.endsWith(`:${removedEmail}`)) joined.delete(key);
    if (signupEmail.value.trim().toLowerCase() === removedEmail) {
      signupForm.dataset.state = 'idle';
      signupMessage.textContent = '';
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
    renderSignup();
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
const countDigits = String(parkCount).length;
// Pad to the final width so the headline does not reflow while counting.
const formatCount = (value: number) => String(value).padStart(countDigits, '0').replace(/\B(?=(\d{3})+$)/g, ',');
if (Number.isFinite(parkCount) && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let countStart: number | undefined;
  const countDuration = 1000;
  const updateCount = (time: number) => {
    countStart ??= time;
    const progress = Math.min((time - countStart) / countDuration, 1);
    countTrigger.textContent = formatCount(Math.round(parkCount * progress));
    if (progress < 1) requestAnimationFrame(updateCount);
  };
  requestAnimationFrame(updateCount);
} else if (Number.isFinite(parkCount)) {
  countTrigger.textContent = formatCount(parkCount);
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
