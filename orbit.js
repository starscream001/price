(() => {
  const gallery = document.querySelector(".orbit-gallery");
  const art = gallery.querySelector(".orbit-art");
  const frame = art.querySelector("iframe");
  const poster = art.querySelector("picture");
  const header = document.querySelector(".masthead");
  const chapters = [...document.querySelectorAll(".orbit-chapter")];
  const links = [...gallery.querySelectorAll(".orbit-markers a")];
  const label = gallery.querySelector(".orbit-current");
  const degrees = gallery.querySelector(".orbit-degrees");
  const prices = document.querySelector("#services");
  const mobile = matchMedia("(max-width:760px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const mix = (a, b, t) => a + (b - a) * t;
  const rad = Math.PI / 180;

  // Offsets are fractions of the author's initial camera distance. The authored
  // front view looks at the soles; their tips are higher than their heels.
  const overview = { yaw: 0, pitch: 0.30, distance: 1.02, side: 0, front: 0, up: 0 };
  const zones = {
    whole: { ...overview, yaw: 55, pitch: 0.43 },
    sole: { ...overview, yaw: 14, pitch: 0.12, distance: 0.80, side: 0.10 },
    heel: { ...overview, yaw: 47, pitch: -0.04, distance: 0.65, side: 0.11, up: -0.12 },
    nails: { ...overview, yaw: 150, pitch: 0.74, distance: 0.78, side: 0.10, up: 0.09 },
    bigtoe: { ...overview, yaw: 136, pitch: 0.78, distance: 0.64, side: 0.085, up: 0.12 },
    outertoes: { ...overview, yaw: 166, pitch: 0.69, distance: 0.66, side: 0.16, up: 0.11 }
  };
  const baseYaw = -41;
  const state = { ...overview, yaw: baseYaw + Number(chapters[0].dataset.angle) };
  const photos = {exam:"opening", services:"procedure", "home-care":"finish",
    about:"opening", booking:"finish", catalog:"finish", directions:"finish", selection:"finish"};
  let marks = [], active = -1, needsMeasure = true, raf = 0, lastTime = 0;
  let selectedZone = null, api = null, basis = null, sdkRequested = false;
  let cameraDirty = true, hasSent = false, lastPhoto = "";

  function schedule() {
    if (!raf) raf = requestAnimationFrame(paint);
  }
  function measure() {
    const inset = header.offsetHeight + (mobile.matches ? gallery.offsetHeight : 0);
    document.documentElement.style.setProperty("--orbit-inset", inset + "px");
    marks = chapters.map(el => scrollY + el.getBoundingClientRect().top - inset);
    needsMeasure = false;
    cameraDirty = true;
  }
  function layoutChanged() { needsMeasure = true; schedule(); }
  function setChapter(index) {
    if (active === index) return;
    active = index;
    links.forEach((link,i) => {
      if (i === index) link.setAttribute("aria-current","step");
      else link.removeAttribute("aria-current");
    });
    label.textContent = links[index].getAttribute("aria-label");
    const photo = photos[chapters[index].id];
    if (!art.hasAttribute("data-ready") && photo && photo !== lastPhoto) {
      poster.querySelector("source").srcset = "images/visit/mobile-" + photo + ".jpg";
      poster.querySelector("img").src = "images/visit/wide-" + photo + ".jpg";
      lastPhoto = photo;
    }
  }
  function cameraTarget(angle) {
    const phase = angle * rad;
    const target = { ...overview, yaw: baseYaw + angle, pitch: 0.31 + 0.23 * Math.sin(phase),
      distance: 1.03 - 0.12 * Math.sin(phase / 2) ** 2 };
    if (!prices || !selectedZone) return target;
    const index = chapters.indexOf(prices);
    const viewport = Math.max(180, innerHeight - header.offsetHeight - (mobile.matches ? gallery.offsetHeight : 0));
    const start = marks[index], end = marks[index + 1];
    const weight = clamp((scrollY - start + viewport * 0.5) / (viewport * 0.32), 0, 1)
                 * clamp((end - scrollY) / (viewport * 0.48), 0, 1);
    const pose = zones[selectedZone];
    for (const key of Object.keys(target)) target[key] = mix(target[key], pose[key], weight);
    return target;
  }
  function submitCamera() {
    if (!basis || !api || reduced.matches) return;
    const { center, front, right, length } = basis;
    const aim = center.map((v,i) => v + length * (state.side * right[i] + state.front * front[i] + (i === 2 ? state.up : 0)));
    const yaw = state.yaw * rad, cosPitch = Math.cos(state.pitch);
    const distance = length * state.distance * Math.max(1, 0.98 / (frame.clientWidth / Math.max(1,frame.clientHeight)));
    const eye = aim.map((v,i) => v + distance * (i === 2 ? Math.sin(state.pitch)
      : cosPitch * (Math.cos(yaw) * front[i] + Math.sin(yaw) * right[i])));
    const first = !hasSent;
    hasSent = true;
    api.setCameraLookAt(eye, aim, 0, first ? err => {
      if (!err && !reduced.matches) art.setAttribute("data-ready","");
      else if (err) hasSent = false;
    } : undefined);
  }
  function paint(now) {
    raf = 0;
    if (needsMeasure) measure();
    let i = 0;
    while (i + 1 < marks.length && scrollY >= marks[i + 1]) i++;
    const j = Math.min(i + 1, marks.length - 1);
    const t = clamp((scrollY - marks[i]) / Math.max(1, marks[j] - marks[i]), 0, 1);
    const angle = mix(+chapters[i].dataset.angle, +chapters[j].dataset.angle, t);
    const visible = i !== j && marks[j]-scrollY < (innerHeight-header.offsetHeight-(mobile.matches?gallery.offsetHeight:0)) * 0.23 ? j : i;
    setChapter(visible);
    const target = cameraTarget(angle);
    const dt = clamp(now - lastTime, 1, 90);
    lastTime = now;
    const step = !hasSent || reduced.matches ? 1 : 1 - Math.exp(-dt / 105);
    let moving = false;
    for (const key of Object.keys(state)) {
      const error = target[key] - state[key];
      const threshold = key === "yaw" ? 0.05 : 0.0004;
      if (Math.abs(error) > threshold) {
        state[key] += error * step;
        moving = true;
      } else state[key] = target[key];
    }
    degrees.textContent = Math.round(angle) + "°";
    if (cameraDirty || moving) submitCamera();
    cameraDirty = false;
    if (moving && step < 1) schedule();
  }

  function connect() {
    const client = new window.Sketchfab(frame);
    client.init("050df1b193cb491baf1b0d186e184b2f", {
      autostart:1, preload:0, transparent:1, ui_controls:0, ui_infos:0, ui_hint:0,
      ui_stop:0, ui_annotations:0, scrollwheel:0, autospin:0, dnt:1,
      success(viewer) {
        api = viewer;
        viewer.addEventListener("viewerready", () => {
          viewer.setUserInteraction(false);
          viewer.setBackground({ transparent:true });
          viewer.getCameraLookAt((err, camera) => {
            if (err || !camera) return;
            const delta = camera.position.map((v,i) => v - camera.target[i]);
            const h = Math.hypot(delta[0],delta[1]), length = Math.hypot(...delta);
            if (!h || !length) return;
            const front = [delta[0]/h,delta[1]/h,0];
            basis = {center:camera.target, length, front, right:[-front[1],front[0],0]};
            cameraDirty = true; schedule();
          });
        });
        viewer.start();
      },
      error() { art.removeAttribute("data-ready"); }
    });
  }
  function loadViewer() {
    if (reduced.matches || sdkRequested) return;
    sdkRequested = true;
    const sdk = document.createElement("script");
    sdk.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
    sdk.onload = connect;
    sdk.onerror = () => { sdkRequested = false; };
    document.head.append(sdk);
  }
  function changeZone(event) {
    const summary = event.target.closest("summary");
    if (!summary) return;
    const item = summary.parentElement;
    if (!item.dataset.zone) return;
    // Native details activation runs after click, including Enter/Space activation.
    requestAnimationFrame(() => {
      if (item.open) {
        selectedZone = item.dataset.zone;
        for (const sibling of item.parentElement.children) {
          if (sibling !== item && sibling.matches("details[open]")) sibling.open = false;
        }
      } else {
        selectedZone = item.parentElement.closest("details[open][data-zone]")?.dataset.zone || null;
      }
      layoutChanged();
    });
  }
  prices?.addEventListener("click", changeZone);
  const observer = new ResizeObserver(layoutChanged);
  [gallery, header, ...chapters].forEach(el => observer.observe(el));
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",layoutChanged,{passive:true});
  window.addEventListener("pageshow",layoutChanged);
  window.addEventListener("online",loadViewer);
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      art.removeAttribute("data-ready");
      hasSent = false; active = -1;
    } else { loadViewer(); cameraDirty = true; }
    schedule();
  });
  measure(); schedule(); loadViewer();
})();
