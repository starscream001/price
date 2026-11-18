const visit = document.querySelector(".visit");
const stage = visit.querySelector(".visit-frame");
const header = document.querySelector(".masthead");
const scenes = [...visit.querySelectorAll(".scene")];
const steps = [...visit.querySelectorAll(".scene-nav a")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const storyFits = matchMedia("(min-width: 801px) and (min-height: 580px), (max-width: 800px) and (min-height: 640px)");

// The intervals include a brief rest between cuts so that each scene can be read.
const cuts = [
  { start: 0.105, end: 0.44 },
  { start: 0.53, end: 0.865 }
];
const stops = [0, cuts[0].end, cuts[1].end];
let frame = 0;
let activeScene = -1;

const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => value * value * (3 - 2 * value);
const ramp = (value, from, to) => smooth(clamp((value - from) / (to - from)));

function setActiveScene(current) {
  if (current === activeScene) return;
  activeScene = current;
  scenes.forEach((scene, index) => {
    scene.inert = current >= 0 && index !== current;
    if (index === current) steps[index].setAttribute("aria-current", "step");
    else steps[index].removeAttribute("aria-current");
  });
}

function placeScene(scene, { cut, angle, photoY, photoScale, titleY, secondY, titleAlpha, detail, detailY, copyY }) {
  const style = scene.style;
  style.setProperty("--cut", `${cut}%`);
  style.setProperty("--angle", `${angle}%`);
  style.setProperty("--photo-y", `${photoY}%`);
  style.setProperty("--photo-scale", photoScale);
  style.setProperty("--title-y", `${titleY}%`);
  style.setProperty("--title-second-y", `${secondY}%`);
  style.setProperty("--title-alpha", titleAlpha);
  style.setProperty("--detail-alpha", detail);
  style.setProperty("--detail-y", `${detailY}px`);
  style.setProperty("--copy-y", `${copyY}px`);
}

function renderStory() {
  frame = 0;
  if (!visit.classList.contains("is-sticky")) return;

  const track = visit.getBoundingClientRect();
  const distance = Math.max(1, track.height - stage.offsetHeight);
  const progress = clamp((header.offsetHeight - track.top) / distance);
  const current = cuts.filter(cut => progress >= cut.end).length;
  const interval = cuts[current];
  const time = interval ? clamp((progress - interval.start) / (interval.end - interval.start)) : 0;
  const wipe = ramp(time, 0, 1);
  const sweep = Math.sin(Math.PI * wipe);
  const inCut = time > 0;
  const arriving = inCut ? current + 1 : -1;
  const departure = ramp(time, 0.09, 0.66);
  const earlyDrift = interval ? clamp((progress - stops[current]) / Math.max(0.01, interval.start - stops[current])) : 0;

  scenes.forEach((scene, index) => {
    const next = index === arriving;
    scene.classList.toggle("is-in-frame", index === current || next);
    if (next) {
      const firstLine = ramp(time, 0.31, 0.88);
      const secondLine = ramp(time, 0.40, 0.97);
      const detail = ramp(time, 0.54, 1);
      placeScene(scene, {
        cut: 100 * (1 - wipe), angle: sweep * 7,
        photoY: 10 * (1 - wipe), photoScale: 1.05 + 0.17 * (1 - wipe),
        titleY: 108 * (1 - firstLine), secondY: 108 * (1 - secondLine),
        titleAlpha: ramp(time, 0.30, 0.61), detail, detailY: 26 * (1 - detail), copyY: 14 * (1 - wipe)
      });
    } else if (index === current) {
      placeScene(scene, {
        cut: 0, angle: 0,
        photoY: -6 * wipe, photoScale: 1.05 + 0.025 * earlyDrift + 0.13 * wipe,
        titleY: -103 * departure, secondY: -106 * ramp(time, 0.17, 0.73),
        titleAlpha: 1 - ramp(time, 0.34, 0.73), detail: 1 - ramp(time, 0.04, 0.52),
        detailY: -22 * departure, copyY: -16 * wipe
      });
    }
  });

  stage.style.setProperty("--light-y", `${100 * (1 - wipe)}%`);
  stage.style.setProperty("--light-opacity", sweep * 0.32);
  stage.style.setProperty("--story-progress", `${progress * 100}%`);
  setActiveScene(time >= 0.5 ? arriving : current);
}

function queueRender() {
  if (!frame && visit.classList.contains("is-sticky")) frame = requestAnimationFrame(renderStory);
}

function goToScene(index, behavior) {
  const track = visit.getBoundingClientRect();
  const distance = track.height - stage.offsetHeight;
  window.scrollTo({
    top: window.scrollY + track.top - header.offsetHeight + distance * stops[index] + 1,
    behavior
  });
}

function restoreScene() {
  if (!visit.classList.contains("is-sticky")) return;
  const index = scenes.findIndex(scene => `#${scene.id}` === location.hash);
  if (index >= 0) goToScene(index, "instant");
}

function updateLayout() {
  const cinematic = storyFits.matches && !reduceMotion.matches;
  visit.classList.toggle("is-sticky", cinematic);
  if (cinematic) {
    renderStory();
  } else {
    setActiveScene(-1);
    scenes.forEach(scene => {
      scene.classList.remove("is-in-frame");
      scene.removeAttribute("style");
    });
  }
}

steps.forEach((link, index) => {
  link.addEventListener("click", event => {
    if (!visit.classList.contains("is-sticky") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    goToScene(index, "smooth");
  });
});

storyFits.addEventListener("change", updateLayout);
reduceMotion.addEventListener("change", updateLayout);
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
