function initVisit(visit) {
  const stage = visit.querySelector(".visit-frame");
  const header = document.querySelector(".masthead");
  const video = stage.querySelector("video");
  const scenes = [...visit.querySelectorAll(".scene")];
  const steps = [...visit.querySelectorAll(".scene-nav a")];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const storyFits = matchMedia("(min-width: 801px) and (min-height: 580px), (max-width: 800px) and (min-height: 560px)");

  // Chapter links land during a pause, after the visible hand has arrived.
  const duration = 11.2;
  const mobile = matchMedia("(max-width: 800px)");
  const chapterStarts = [0, 2.75, 7.60];
  const chapterStops = [0, 4.42, 9.85];
  const frameTime = 1 / 25;
  let scrollFrame = 0;
  let activeScene = -1;
  let targetTime = 0;
  let videoFailed = false;

  function setActiveScene(current) {
    if (current === activeScene) return;
    activeScene = current;
    stage.dataset.scene = String(current);
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
    stage.style.setProperty("--exit-light", Math.min(1, Math.max(0, (progress - .85) / .15)));
    steps.forEach((step, index) => {
      const start = chapterStarts[index];
      const end = chapterStarts[index + 1] ?? duration;
      const percent = Math.min(1, Math.max(0, (targetTime - start) / (end - start)));
      step.style.setProperty("--fill", `${percent * 100}%`);
    });
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
      const src = mobile.matches ? video.dataset.mobile : video.dataset.wide;
      if (video.getAttribute("src") !== src) {
        visit.classList.remove("has-film");
        videoFailed = false;
        video.preload = "auto";
        video.src = src;
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
      link.focus({preventScroll: true});
      if (location.hash !== link.hash) history.pushState(null, "", link.hash);
      goToScene(index, "smooth");
    });
  });

  video.addEventListener("loadedmetadata", syncVideo);
  video.addEventListener("loadeddata", presentFrame);
  video.addEventListener("canplay", presentFrame);
  video.addEventListener("seeked", presentFrame);
  video.addEventListener("error", () => {
    if (!video.error) return;
    videoFailed = true;
    visit.classList.remove("has-film");
    renderStory();
  });
  mobile.addEventListener("change", updateLayout);
  storyFits.addEventListener("change", updateLayout);
  reduceMotion.addEventListener("change", updateLayout);
  window.addEventListener("scroll", queueRender, { passive: true });
  window.addEventListener("resize", queueRender, { passive: true });
  window.addEventListener("hashchange", restoreScene);
  window.addEventListener("load", restoreScene, { once: true });
  updateLayout();
  restoreScene();

}

const visit = document.querySelector(".visit");
if (visit) initVisit(visit);

const mobileMenu = document.querySelector(".mobile-menu");
mobileMenu.addEventListener("click", event => {
  if (event.target.closest("a")) mobileMenu.open = false;
});
document.addEventListener("keydown", event => {
  if (event.key !== "Escape" || !mobileMenu.open) return;
  mobileMenu.open = false;
  mobileMenu.querySelector("summary").focus();
});
