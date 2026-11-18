const visit = document.querySelector(".visit");
const scenes = [...visit.querySelectorAll(".scene")];
const steps = [...visit.querySelectorAll(".scene-nav a")];
const stickyLayout = matchMedia("(min-width: 801px) and (prefers-reduced-motion: no-preference)");
const sceneImages = scenes.map(scene => scene.querySelector(".scene-image"));
const sceneCopies = scenes.map(scene => scene.querySelector(".scene-copy"));
const handpiece = document.querySelector(".scene-object");
const motionToggle = document.querySelector("#motion-toggle");
const video = document.querySelector("#hero-video");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const smallScreen = matchMedia("(max-width: 800px)");
let frame = 0;
let activeScene = -1;

function renderStory() {
  frame = 0;
  if (!stickyLayout.matches) return;

  const track = visit.getBoundingClientRect();
  const stage = visit.querySelector(".visit-frame");
  const height = stage.offsetHeight;
  const top = document.querySelector(".masthead").offsetHeight;
  const progress = Math.min(1, Math.max(0, (top - track.top) / (track.height - height)));
  const phase = progress * scenes.length;
  const outgoing = Math.min(scenes.length - 1, Math.floor(phase));
  const incoming = Math.min(scenes.length - 1, outgoing + 1);
  const blend = outgoing === incoming ? 0 : Math.max(0, (phase - outgoing - 0.32) / 0.68);
  const current = blend > 0.5 ? incoming : outgoing;
  const reveal = blend * blend * (3 - 2 * blend);

  scenes.forEach((scene, index) => {
    const isIncoming = index === incoming && index !== outgoing;
    scene.style.opacity = index === outgoing ? 1 : isIncoming ? reveal : 0;
    scene.style.clipPath = isIncoming ? `inset(${(1 - reveal) * 24}% 0 0 0)` : "";
    const offset = Math.min(scenes.length - 1, phase) - index;
    sceneImages[index].style.transform = `translateY(${offset * 33}px) scale(${1 + Math.abs(offset) * 0.055})`;
    sceneCopies[index].style.transform = `translateY(${offset * -44}px)`;
  });

  const angle = Math.min(2, phase) - 1.25;
  handpiece.style.transform = `translate(${angle * -24}%, ${-48 + angle * 55}%) rotate(${-14 + angle * 45}deg) scale(${1 - Math.abs(angle) * 0.17})`;

  if (current === activeScene) return;
  activeScene = current;
  scenes.forEach((scene, index) => {
    scene.inert = index !== current;
    if (index === current) steps[index].setAttribute("aria-current", "step");
    else steps[index].removeAttribute("aria-current");
  });
}

function queueRender() {
  if (!frame && stickyLayout.matches) frame = requestAnimationFrame(renderStory);
}

function updateLayout() {
  visit.classList.toggle("is-sticky", stickyLayout.matches);
  if (stickyLayout.matches) {
    renderStory();
    return;
  }
  activeScene = -1;
  scenes.forEach((scene, index) => {
    scene.inert = false;
    scene.style.removeProperty("opacity");
    scene.style.removeProperty("clip-path");
    sceneCopies[index].style.removeProperty("transform");
    sceneImages[index].style.removeProperty("transform");
    steps[index].removeAttribute("aria-current");
  });
}

steps.forEach((link, index) => {
  link.addEventListener("click", event => {
    if (!stickyLayout.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const track = visit.getBoundingClientRect();
    const stage = visit.querySelector(".visit-frame");
    const headerHeight = document.querySelector(".masthead").offsetHeight;
    window.scrollTo({
      top: window.scrollY + track.top - headerHeight + (track.height - stage.offsetHeight) * index / scenes.length,
      behavior: "smooth"
    });
  });
});

const connection = navigator.connection;
let motionPaused = false;
let heroVisible = false;

function updateVideo() {
  if (reducedMotion.matches || smallScreen.matches || connection?.saveData) {
    video.pause();
    motionToggle.hidden = true;
    return;
  }
  if (!heroVisible || motionPaused) {
    video.pause();
    return;
  }
  if (!video.hasAttribute("src")) video.src = video.dataset.src;
  video.play().catch(() => {});
}

motionToggle.addEventListener("click", () => {
  motionPaused = !motionPaused;
  motionToggle.textContent = motionPaused ? "Включить видео" : "Пауза видео";
  updateVideo();
});
video.addEventListener("playing", () => {
  video.classList.add("is-playing");
  motionToggle.hidden = false;
});
video.addEventListener("error", () => video.classList.remove("is-playing"));
if ("IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    updateVideo();
  });
  heroObserver.observe(document.querySelector(".hero"));

  const mobileScenes = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || !smallScreen.matches) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  scenes.forEach(scene => mobileScenes.observe(scene));
}

reducedMotion.addEventListener("change", updateVideo);
smallScreen.addEventListener("change", updateVideo);
connection?.addEventListener("change", updateVideo);
stickyLayout.addEventListener("change", updateLayout);
window.addEventListener("scroll", queueRender, { passive: true });
window.addEventListener("resize", queueRender, { passive: true });
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
