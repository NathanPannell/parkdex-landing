const shots = {
  map: { image: 'staging-map.webp', width: 1440, height: 900, phone: false, alt: 'Parks across Vancouver Island in the Parkdex map', caption: 'Parks across Vancouver Island, all in one place.' },
  parks: { image: 'park-search.webp', width: 712, height: 1359, phone: true, alt: 'National, provincial and regional park categories, with Cowichan Valley parks expanded', caption: 'Browse by park type or region. Cowichan Valley is a good place to start.' },
  wishlist: { image: 'park-detail.webp', width: 828, height: 1276, phone: true, alt: 'Elk Falls Park detail with a waterfall photograph and wishlist control', caption: 'Elk Falls caught your eye? Save it for the next time you head north.' },
  progress: { image: 'island-progress.webp', width: 1662, height: 1092, phone: false, alt: 'Personal Parkdex map showing island visit progress', caption: 'Your visits stay on your map. There’s no deadline to fill it in.' },
  badges: { image: 'badge-reward.webp', width: 714, height: 1354, phone: true, alt: 'River Otter Rookie badge for collecting a first place', caption: 'Your first place earns River Otter Rookie. A small souvenir of getting out there.' },
};
const image = document.querySelector<HTMLImageElement>('#preview-image')!;
const device = document.querySelector('#preview-device')!;
document.querySelectorAll<HTMLButtonElement>('[data-shot]').forEach(button => button.addEventListener('click', () => {
  const shot = shots[button.dataset.shot as keyof typeof shots];
  image.src = '/images/' + shot.image;
  image.alt = shot.alt;
  image.width = shot.width;
  image.height = shot.height;
  device.classList.toggle('is-phone', shot.phone);
  document.querySelector('#shot-caption')!.textContent = shot.caption;
  document.querySelector<HTMLAnchorElement>('#original-image')!.href = image.src;
  document.querySelectorAll('[data-shot]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
document.querySelectorAll<HTMLFormElement>('[data-prototype-form]').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  form.querySelector('[role=status]')!.textContent = 'Design preview only. No email was sent or changed.';
}));
