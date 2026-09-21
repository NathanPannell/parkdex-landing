import './style.css';

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
  joinLabel.textContent = 'Join the waitlist';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (pending) return;
  email.value = email.value.trim();
  touched = true;
  if (!validate()) { email.focus(); return; }
  pending = true;
  join.disabled = true;
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
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      if (result.error === 'invalid_email') {
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
    join.disabled = false;
    form.removeAttribute('aria-busy');
  }
});

const viewer = document.querySelector<HTMLDialogElement>('#screenshot-viewer')!;
const viewerImage = document.querySelector<HTMLImageElement>('#viewer-image')!;
const viewerTitle = document.querySelector('#viewer-title')!;
const viewerDescription = document.querySelector('#viewer-description')!;
const screenshots = {
  map: { src: '/images/map-overview.webp', title: 'The whole island, at a glance.', description: 'Find a park for your next day out.', alt: 'Parkdex map showing parks across Vancouver Island', width: 1440, height: 820 },
  park: { src: '/images/park-detail.webp', title: 'That one goes on the wishlist.', description: 'Look up a park, save it for later, or mark your visit.', alt: 'Elk Falls Park detail with a waterfall photo and wishlist controls', width: 828, height: 1280 },
  visited: { src: '/images/visited-map.webp', title: 'A growing record of your adventures.', description: 'See the places you’ve visited on your own island map.', alt: 'Vancouver Island map showing visited parks with checkmarks', width: 534, height: 1254 },
} as const;

function showScreenshot(key: keyof typeof screenshots) {
  const shot = screenshots[key];
  viewerTitle.textContent = shot.title;
  viewerDescription.textContent = shot.description;
  viewerImage.src = shot.src;
  viewerImage.alt = shot.alt;
  viewerImage.width = shot.width;
  viewerImage.height = shot.height;
  viewer.querySelectorAll<HTMLElement>('[data-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.view === key)));
  if (!viewer.open) viewer.showModal();
}
document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.view as keyof typeof screenshots;
    if (key in screenshots) showScreenshot(key);
  });
});
viewer.querySelector('.close-viewer')!.addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => { if (event.target === viewer) { const box = viewer.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) viewer.close(); } });
