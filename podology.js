const visit = document.querySelector(".visit");
const stage = visit.querySelector(".visit-frame");
const header = document.querySelector(".masthead");
const scenes = [...visit.querySelectorAll(".scene")];
const steps = [...visit.querySelectorAll(".scene-nav a")];
const stickyLayout = matchMedia("(min-width: 901px) and (min-height: 580px) and (prefers-reduced-motion: no-preference)");
let frame = 0;
let activeScene = -1;

function setActiveScene(current) {
  if (current === activeScene) return;
  activeScene = current;
  scenes.forEach((scene, index) => {
    scene.inert = current >= 0 && index !== current;
    if (index === current) steps[index].setAttribute("aria-current", "step");
    else steps[index].removeAttribute("aria-current");
  });
}

function renderStory() {
  frame = 0;
  if (!stickyLayout.matches) return;

  const track = visit.getBoundingClientRect();
  const distance = Math.max(1, track.height - stage.offsetHeight);
  const progress = Math.min(1, Math.max(0, (header.offsetHeight - track.top) / distance));
  const phase = progress * scenes.length;
  const outgoing = Math.min(scenes.length - 1, Math.floor(phase));
  const incoming = Math.min(scenes.length - 1, outgoing + 1);
  const blend = outgoing === incoming ? 0 : Math.max(0, (phase - outgoing - 0.30) / 0.70);
  const reveal = blend * blend * (3 - 2 * blend);

  scenes.forEach((scene, index) => {
    const isIncoming = index === incoming && index !== outgoing;
    scene.style.opacity = index === outgoing ? 1 : isIncoming ? Math.min(1, reveal * 1.3) : 0;
    scene.style.setProperty("--image-reveal", isIncoming ? `${100 * (1 - reveal)}%` : "0%");
    scene.style.setProperty("--image-shift", `${isIncoming ? (1 - reveal) * 36 : reveal * -26}px`);
    scene.style.setProperty("--image-scale", String(isIncoming ? 1.07 + (1 - reveal) * 0.14 : 1.07 + reveal * 0.10));
    scene.style.setProperty("--copy-opacity", String(isIncoming ? Math.max(0, (reveal - 0.35) / 0.65) : Math.max(0, 1 - reveal * 2)));
    scene.style.setProperty("--copy-shift", `${isIncoming ? (1 - reveal) * 38 : reveal * -36}px`);
  });

  stage.style.setProperty("--light-top", `${100 * (1 - reveal)}%`);
  stage.style.setProperty("--light-opacity", String(Math.sin(Math.PI * reveal) * 0.72));
  setActiveScene(reveal >= 0.5 ? incoming : outgoing);
}

function queueRender() {
  if (!frame && stickyLayout.matches) frame = requestAnimationFrame(renderStory);
}

function updateLayout() {
  visit.classList.toggle("is-sticky", stickyLayout.matches);
  if (stickyLayout.matches) {
    renderStory();
  } else {
    setActiveScene(-1);
    scenes.forEach(scene => scene.removeAttribute("style"));
  }
}

function goToScene(index, behavior) {
  const track = visit.getBoundingClientRect();
  const distance = track.height - stage.offsetHeight;
  window.scrollTo({
    top: window.scrollY + track.top - header.offsetHeight + distance * index / scenes.length + 1,
    behavior
  });
}

function restoreScene() {
  if (!stickyLayout.matches) return;
  const index = scenes.findIndex(scene => `#${scene.id}` === location.hash);
  if (index >= 0) goToScene(index, "instant");
}

steps.forEach((link, index) => {
  link.addEventListener("click", event => {
    if (!stickyLayout.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    goToScene(index, "smooth");
  });
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || stickyLayout.matches) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  scenes.slice(1).forEach(scene => observer.observe(scene));
}

stickyLayout.addEventListener("change", updateLayout);
window.addEventListener("scroll", queueRender, { passive: true });
window.addEventListener("resize", queueRender, { passive: true });
window.addEventListener("hashchange", restoreScene);
window.addEventListener("load", restoreScene, { once: true });
updateLayout();

const mobileMenu = document.querySelector(".mobile-menu");
mobileMenu.addEventListener("click", event => {
  if (event.target.closest("a")) mobileMenu.open = false;
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || !mobileMenu.open) return;
  mobileMenu.open = false;
  mobileMenu.querySelector("summary").focus();
});
