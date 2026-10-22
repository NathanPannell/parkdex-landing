const options = document.querySelector<HTMLElement>(".compare-options")!;
function fitPreviews() {
  const phone = options.dataset.size === "phone";
  const width = phone ? 390 : 1440;
  const height = phone ? 844 : 900;
  document.querySelectorAll<HTMLElement>(".compare-viewport").forEach((viewport) => {
    const frame = viewport.querySelector("iframe")!;
    const scale = viewport.clientWidth / width;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.transform = `scale(${scale})`;
    viewport.style.height = `${height * scale}px`;
  });
}
document.querySelectorAll<HTMLButtonElement>("button[data-size]").forEach((button) =>
  button.addEventListener("click", () => {
    options.dataset.size = button.dataset.size;
    document
      .querySelectorAll<HTMLButtonElement>("button[data-size]")
      .forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    fitPreviews();
  }),
);
new ResizeObserver(fitPreviews).observe(options);
fitPreviews();
