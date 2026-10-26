(() => {
  const crt = document.createElement("div");
  crt.className = "crt-overlay";
  crt.setAttribute("aria-hidden", "true");
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.prepend(glow);
  document.body.prepend(crt);

  document.querySelectorAll(".side-nav a").forEach((link, index) => link.style.setProperty("--nav-index", index));
  const elements = document.querySelectorAll(".page-content section,.page-hero>* ,.game-select-card,.event-cards article,.recorder-panel,.photo-upload,.admin-page section");
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), { threshold: .09, rootMargin: "0px 0px -6%" });
  elements.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    element.dataset.reveal = ["up", "left", "right", "zoom"][index % 4];
    observer.observe(element);
  });

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || anchor.target === "_blank" || url.pathname === location.pathname) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(url.href);
  }, true);

  addEventListener("pointermove", event => {
    document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
  }, { passive: true });
})();

