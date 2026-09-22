import './shared-base.css';
import './poster-page.css';
import './device-frame.css';

const emailPrivacy = document.querySelector<HTMLDetailsElement>('#email-privacy');
function revealEmailPrivacy() {
  if (location.hash === '#email-privacy' && emailPrivacy) emailPrivacy.open = true;
}
revealEmailPrivacy();
window.addEventListener('hashchange', revealEmailPrivacy);
window.addEventListener('pageshow', revealEmailPrivacy);

const appUrl = import.meta.env.VITE_APP_URL || 'https://parkdex.app';
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
  message.textContent = 'One email when the Android app is ready.';
  joinLabel.textContent = 'Join the Android waitlist';
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
  removeButton.textContent = 'Remove my email';
  removeButton.disabled = pending;
  removeMessage.textContent = 'You can join again whenever you like.';
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
      joinLabel.textContent = 'Join the Android waitlist';
      join.disabled = false;
      message.textContent = 'One email when the Android app is ready.';
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

const viewer = document.querySelector<HTMLDialogElement>('#screenshot-viewer')!;
const viewerImage = document.querySelector<HTMLImageElement>('#viewer-image')!;
const viewerTitle = document.querySelector('#viewer-title')!;
const viewerDescription = document.querySelector('#viewer-description')!;
const screenshots = {
  review: { src: '/images/visit-review.png', title: 'Keep a photo from your visit.', description: 'Android preview. Demonstration photo in the upcoming visit flow.', alt: 'Android photo review with Keep this one and Save my visit controls', width: 375, height: 844 },
  postcard: { src: '/images/visit-postcard.png', title: 'A little proof you were there.', description: 'Android preview. Demonstration photo in a private visit postcard.', alt: 'Parkdex visit saved as a photograph postcard with Back to map and See my collection actions', width: 375, height: 844 },
  map: { src: '/images/staging-map.webp', title: 'Explore the island by map.', description: 'Find your next park across Vancouver Island.', alt: 'Parkdex map showing parks across Vancouver Island', width: 1440, height: 900 },
  badges: { src: '/images/badge-reward.webp', title: 'Claim badges for the places you find.', description: 'Collect local wildlife discoveries as you explore.', alt: 'Parkdex badge screen showing a new river otter discovery', width: 714, height: 1354 },
  parks: { src: '/images/park-search.webp', title: 'Find parks without the guesswork.', description: 'Search national, provincial and regional parks, plus islands.', alt: 'Parkdex places screen listing regional and provincial parks', width: 712, height: 1359 },
  wishlist: { src: '/images/park-detail.webp', title: 'Save a wishlist for later.', description: 'Keep the places that caught your eye close.', alt: 'Elk Falls Park detail with a waterfall photo and wishlist controls', width: 828, height: 1276 },
  progress: { src: '/images/island-progress.webp', title: 'Your island, in progress.', description: 'See your visited parks and growing collection.', alt: 'Parkdex map showing visited parks and progress across Vancouver Island', width: 1662, height: 1092 },
} as const;

type ScreenshotKey = keyof typeof screenshots;
let lastTrigger: HTMLButtonElement | null = null;

function isScreenshotKey(value: string | undefined): value is ScreenshotKey {
  return value !== undefined && value in screenshots;
}

function showScreenshot(key: ScreenshotKey, trigger?: HTMLButtonElement) {
  const shot = screenshots[key];
  if (trigger && !viewer.contains(trigger)) lastTrigger = trigger;
  viewerTitle.textContent = shot.title;
  viewerDescription.textContent = shot.description;
  viewerImage.src = shot.src;
  viewerImage.alt = shot.alt;
  viewerImage.width = shot.width;
  viewerImage.height = shot.height;
  viewer.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === key)));
  if (!viewer.open) viewer.showModal();
}

document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.view;
    if (isScreenshotKey(key)) showScreenshot(key, button);
  });
});

viewer.querySelector<HTMLButtonElement>('.close-viewer')!.addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) {
    const box = viewer.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close();
  }
});
viewer.addEventListener('close', () => { lastTrigger?.focus(); });
