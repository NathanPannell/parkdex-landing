import './fan-page.css';
import './device-frame.css';

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

// The Android beta is self-service: join the Google Group, then opt in on Google Play.
// Both copies of the steps (hero panel and page section) share one progress state.
const betaDialog = document.querySelector<HTMLDialogElement>('#beta-access')!;
const betaKip = betaDialog.querySelector<HTMLImageElement>('.outdoor-signup-kip')!;
const betaStepLists = [...document.querySelectorAll<HTMLOListElement>('[data-beta-steps]')];
const betaProgressKey = 'parkdex-beta-progress';

function readBetaProgress(): number {
  try { return Number(sessionStorage.getItem(betaProgressKey)) || 0; } catch { return 0; }
}

function renderBetaProgress(progress: number) {
  betaStepLists.forEach((list) => {
    list.dataset.progress = String(progress);
    list.querySelectorAll<HTMLLIElement>('[data-beta-step]').forEach((item) => {
      const step = Number(item.dataset.betaStep);
      const state = step <= progress ? 'done' : step === progress + 1 ? 'current' : 'next';
      item.dataset.state = state;
      const link = item.querySelector<HTMLAnchorElement>('a')!;
      if (state === 'current') link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  });
  betaKip.src = progress >= 2 ? betaKip.dataset.kipDone! : betaKip.dataset.kipIdle!;
}

let betaProgress = readBetaProgress();
renderBetaProgress(betaProgress);

document.querySelectorAll<HTMLAnchorElement>('[data-beta-link]').forEach((link) => {
  link.addEventListener('click', () => {
    betaProgress = Math.max(betaProgress, Number(link.dataset.betaLink));
    try { sessionStorage.setItem(betaProgressKey, String(betaProgress)); } catch { /* progress stays in memory */ }
    renderBetaProgress(betaProgress);
  });
});

function openBeta() {
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => { if (dialog !== betaDialog) dialog.close(); });
  if (!betaDialog.open) betaDialog.showModal();
  const current = betaDialog.querySelector<HTMLAnchorElement>('[data-state="current"] a') ?? betaDialog.querySelector<HTMLAnchorElement>('[data-beta-link]');
  current?.focus();
}

document.querySelectorAll<HTMLButtonElement>('[data-beta-open]').forEach((button) => {
  button.addEventListener('click', openBeta);
});

// The App Store waitlist still collects an email address.
const list = 'app_store';
const listCopy = {
  submit: 'Join the App Store waitlist',
  done: 'You’re on the App Store list',
  saved: (email: string) => `${email} is on the App Store waitlist. I’ll email you when Parkdex reaches the App Store.`,
};

const signupDialog = document.querySelector<HTMLDialogElement>('#signup-dialog')!;
const signupForm = document.querySelector<HTMLFormElement>('#signup-form')!;
const signupEmail = document.querySelector<HTMLInputElement>('#signup-email')!;
const signupCompany = document.querySelector<HTMLInputElement>('#signup-company')!;
const signupSubmit = document.querySelector<HTMLButtonElement>('#signup-submit')!;
const signupSubmitLabel = signupSubmit.querySelector<HTMLSpanElement>('span')!;
const signupMessage = document.querySelector<HTMLParagraphElement>('#signup-message')!;
const signupKip = signupDialog.querySelector<HTMLImageElement>('.outdoor-signup-kip')!;
const removeForm = document.querySelector<HTMLFormElement>('#remove-form')!;
const removeEmail = document.querySelector<HTMLInputElement>('#remove-email')!;
const removeCompany = document.querySelector<HTMLInputElement>('#remove-company')!;
const removeButton = document.querySelector<HTMLButtonElement>('#remove-button')!;
const removeMessage = document.querySelector<HTMLParagraphElement>('#remove-message')!;
// Addresses joined in this page view, so the button reflects the saved state.
const joined = new Set<string>();
let pending = false;
let removing = false;

function renderSignup() {
  const isJoined = joined.has(signupEmail.value.trim().toLowerCase());
  if (!pending) signupSubmitLabel.textContent = isJoined ? listCopy.done : listCopy.submit;
  signupSubmit.disabled = pending || removing || isJoined;
  signupKip.src = isJoined ? signupKip.dataset.kipDone! : signupKip.dataset.kipIdle!;
}

function openSignup() {
  if (betaDialog.open) betaDialog.close();
  if (!pending) {
    signupForm.dataset.state = 'idle';
    signupMessage.textContent = '';
  }
  renderSignup();
  if (!signupDialog.open) signupDialog.showModal();
  signupEmail.focus();
}

document.querySelectorAll<HTMLButtonElement>('[data-signup-open]').forEach((button) => {
  button.addEventListener('click', openSignup);
});

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
    joined.add(submittedEmail.toLowerCase());
    signupForm.dataset.state = 'success';
    signupMessage.textContent = listCopy.saved(submittedEmail);
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
    joined.delete(removedEmail);
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

// The badge wall tilts a little toward the pointer.
const wall = document.querySelector<HTMLElement>('.badge-wall');
const wallTiles = wall?.querySelector<HTMLElement>('.badge-wall__tiles');
if (wall && wallTiles && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  wall.addEventListener('pointermove', (event) => {
    const bounds = wall.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    wallTiles.style.setProperty('--tilt-y', `${(x * 8).toFixed(2)}deg`);
    wallTiles.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`);
  });
  wall.addEventListener('pointerleave', () => {
    wallTiles.style.setProperty('--tilt-y', '0deg');
    wallTiles.style.setProperty('--tilt-x', '0deg');
  });
}
