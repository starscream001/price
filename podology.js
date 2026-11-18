const visit = document.querySelector(".visit");
const stage = visit.querySelector(".visit-frame");
const header = document.querySelector(".masthead");
const video = stage.querySelector("video");
const scenes = [...visit.querySelectorAll(".scene")];
const steps = [...visit.querySelectorAll(".scene-nav a")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const storyFits = matchMedia("(min-width: 801px) and (min-height: 580px), (max-width: 800px) and (min-height: 560px)");

// The times match the approved clip. Links land after a hand has completed its entrance.
const duration = 10.2;
const chapterStarts = [0, 2.95, 7.22];
const chapterStops = [0, 3.7, 9.2];
const frameTime = 1 / 30;
let scrollFrame = 0;
let activeScene = -1;
let targetTime = 0;
let videoFailed = false;

function setActiveScene(current) {
  if (current === activeScene) return;
  activeScene = current;
  scenes.forEach((scene, index) => {
    scene.inert = current >= 0 && index !== current;
    scene.classList.toggle("is-in-frame", index === current);
    if (index === current) steps[index].setAttribute("aria-current", "step");
    else steps[index].removeAttribute("aria-current");
  });
}

function showChapter(time) {
  const next = chapterStarts.findIndex(start => time < start);
  setActiveScene(next < 0 ? scenes.length - 1 : Math.max(0, next - 1));
}

function syncVideo() {
  if (!visit.classList.contains("is-sticky") || videoFailed || video.readyState < 1 || video.seeking) return;
  const time = Math.min(targetTime, video.duration - frameTime);
  if (Number.isFinite(time) && Math.abs(time - video.currentTime) >= frameTime * 0.65) {
    video.currentTime = Math.max(0, time);
  }
}

function renderStory() {
  scrollFrame = 0;
  if (!visit.classList.contains("is-sticky")) return;

  const track = visit.getBoundingClientRect();
  const distance = Math.max(1, track.height - stage.offsetHeight);
  const progress = Math.min(1, Math.max(0, (header.offsetHeight - track.top) / distance));
  targetTime = progress * duration;
  stage.style.setProperty("--story-progress", `${progress * 100}%`);
  if (!visit.classList.contains("has-film")) showChapter(targetTime);
  syncVideo();
}

function queueRender() {
  if (!scrollFrame && visit.classList.contains("is-sticky")) {
    scrollFrame = requestAnimationFrame(renderStory);
  }
}

function presentFrame() {
  if (!visit.classList.contains("is-sticky") || videoFailed || video.seeking || video.readyState < 2) return;
  visit.classList.add("has-film");
  showChapter(video.currentTime);
  syncVideo();
}

function goToScene(index, behavior) {
  const track = visit.getBoundingClientRect();
  const distance = track.height - stage.offsetHeight;
  window.scrollTo({
    top: window.scrollY + track.top - header.offsetHeight + distance * (chapterStops[index] / duration),
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
    if (!video.getAttribute("src") && !videoFailed) {
      video.preload = "auto";
      video.src = video.dataset.src;
    }
    renderStory();
    presentFrame();
  } else {
    visit.classList.remove("has-film");
    setActiveScene(-1);
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

video.addEventListener("loadedmetadata", syncVideo);
video.addEventListener("loadeddata", presentFrame);
video.addEventListener("seeked", presentFrame);
video.addEventListener("error", () => {
  videoFailed = true;
  visit.classList.remove("has-film");
  renderStory();
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
