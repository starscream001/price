// The mesh is adapted from the CC0 MakeHuman hm08 base (makehuman/data/3dobjs/base.obj,
// source blob d26635e9326e3cca30778fd7b9c00062b03cce09). Both feet share a fixed pose.
// Interleaved vertex records contain quantized positions, smooth normals, baked light and material.
const vertexSource = `
  attribute vec3 position;
  attribute vec3 normal;
  attribute vec3 surface;
  uniform vec3 eye, forward, right, up;
  uniform vec2 projection;
  varying vec3 p, n, material;
  void main() {
    p = position / 4096.0;
    n = normal;
    material = surface;
    vec3 delta = p - eye;
    float depth = dot(delta, forward);
    gl_Position = vec4(dot(delta, right) * projection.x, dot(delta, up) * projection.y,
                       depth * 1.02 - 0.4, depth);
  }`;
const fragmentSource = `
  precision highp float;
  uniform vec3 eye;
  varying vec3 p, n, material;
  float hash(vec3 a) {
    a = fract(a * 0.3183099 + vec3(0.12,0.44,0.78));
    a *= 17.0;
    return fract(a.x * a.y * a.z * (a.x + a.y + a.z));
  }
  float noise3(vec3 a) {
    vec3 i = floor(a), t = fract(a); t = t*t*(3.0-2.0*t);
    return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),t.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),t.x),t.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),t.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1)),t.x),t.y),t.z);
  }
  void main() {
    vec3 normal = normalize(n), key = normalize(vec3(-3.2,5.5,4.0)), view = normalize(eye-p);
    float ao=material.x/255.0, sun=material.y/255.0;
    float diffuse=max(0.0,dot(normal,key));
    float shine=pow(max(0.0,dot(normal,normalize(key+view))),38.0);
    float rim=pow(1.0-max(0.0,dot(view,normal)),3.0);
    vec3 ambient=vec3(0.53,0.445,0.35), direct=vec3(0.49,0.50,0.48);
    if(material.z>0.5) {
      ambient=vec3(0.14,0.23,0.182); direct=vec3(0.34,0.38,0.285);
      float stone=noise3(p*5.0)+0.28*noise3(p*24.0);
      float vein=smoothstep(0.965,1.0,sin(dot(p,vec3(2.5,6.0,1.4))+stone*4.4));
      ambient += vec3(0.035,0.032,0.018)*vein + (stone-0.65)*0.035;
    }
    if(material.z>1.5) { ambient=vec3(0.43,0.32,0.18); direct=vec3(0.48,0.41,0.27); }
    vec3 color=ambient*(0.50+0.50*ao)*(0.86+0.14*normal.y)
       +direct*diffuse*(0.13+0.87*sun)*(0.70+0.30*ao)
       +vec3(1.0,0.89,0.71)*shine*0.18*sun+vec3(0.60,0.72,0.66)*rim*0.10*(0.7+0.3*normal.y);
    gl_FragColor=vec4(color,1.0);
  }`;

function createRenderer(gl, bytes) {
  const shader = (kind, source) => {
    const item = gl.createShader(kind);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(item));
    return item;
  };
  const program = gl.createProgram();
  for (const [kind, source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]) {
    const item = shader(kind,source);
    gl.attachShader(program,item);
    gl.deleteShader(item);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const header = new DataView(bytes);
  const vertexCount = header.getUint32(0,true);
  const indexCount = header.getUint32(4,true) * 3;
  const indicesOffset = 8 + vertexCount * 12;
  if (indicesOffset + indexCount * 2 !== bytes.byteLength) throw Error("Invalid orbit mesh");
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(bytes,8,vertexCount*12),gl.STATIC_DRAW);
  for (const [name, type, normalized, offset] of [["position",gl.SHORT,false,0],["normal",gl.BYTE,true,6],["surface",gl.UNSIGNED_BYTE,false,9]]) {
    const attr = gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(attr);
    gl.vertexAttribPointer(attr,3,type,normalized,12,offset);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(bytes, indicesOffset),gl.STATIC_DRAW);
  const uniforms = Object.fromEntries(["eye","forward","right","up","projection"].map(name=>[name,gl.getUniformLocation(program,name)]));
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0,0,0,0);
  return (degree) => {
    const canvas = gl.canvas;
    const pixelRatio = Math.min(devicePixelRatio || 1,1.65,1500/Math.max(1,canvas.clientWidth,canvas.clientHeight));
    const width = Math.max(1, Math.round(canvas.clientWidth*pixelRatio));
    const height = Math.max(1, Math.round(canvas.clientHeight*pixelRatio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width=width; canvas.height=height; }
    const t=degree*Math.PI/180, a=.64+t, elevation=.205+.075*Math.sin(t), r=7.4-.40*Math.sin(t/2)**2;
    const sx=Math.sin(a), cz=Math.cos(a), sy=Math.sin(elevation), cy=Math.cos(elevation);
    const focal=1.44*Math.min(height,width*1.04);
    gl.viewport(0,0,width,height);
    gl.uniform3f(uniforms.eye,r*sx*cy,1.19+.09*Math.sin(t)+r*sy,.24+r*cz*cy);
    gl.uniform3f(uniforms.forward,-sx*cy,-sy,-cz*cy);
    gl.uniform3f(uniforms.right,cz,0,-sx);
    gl.uniform3f(uniforms.up,-sx*sy,cy,-cz*sy);
    gl.uniform2f(uniforms.projection,2*focal/width,2*focal/height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
  };
}

const chapters = [...document.querySelectorAll(".orbit-chapter")];
const links = [...document.querySelectorAll(".orbit-markers a")];
const art = document.querySelector(".orbit-art");
const canvas = art.querySelector("canvas");
const gallery = document.querySelector(".orbit-gallery");
const atlas = document.querySelector(".orbit-angles");
const label = document.querySelector(".orbit-current");
const counter = document.querySelector(".orbit-degrees");
const header = document.querySelector(".masthead");
const small = matchMedia("(max-width:760px)");
const reduced = matchMedia("(prefers-reduced-motion:reduce)");
let offsets = [], current = Number(chapters[0].dataset.angle), active = -1, raf = 0, needsMeasure = true;
let draw = null, mesh = null, gl = null, atlasReady = false, atlasRequest = null, assetRequest = null;
let previousTime = 0;

function schedule() {
  if (!raf) raf = requestAnimationFrame(paint);
}
function measure() {
  const cover = header.offsetHeight + (small.matches ? gallery.offsetHeight : 0);
  document.documentElement.style.setProperty("--orbit-inset", cover+"px");
  offsets = chapters.map(section => window.scrollY + section.getBoundingClientRect().top - cover);
  const artSide=Math.min(art.clientWidth,art.clientHeight);
  art.style.setProperty("--atlas-side",artSide+"px");
  needsMeasure=false;
}
function paint(now) {
  raf = 0;
  if (needsMeasure) measure();
  const position=window.scrollY;
  let i=0;
  while (i+1<offsets.length && position>=offsets[i+1]) i++;
  const next=Math.min(i+1,offsets.length-1);
  const fraction=Math.max(0,Math.min(1,(position-offsets[i])/Math.max(1,offsets[next]-offsets[i])));
  const angle=Number(chapters[i].dataset.angle);
  const target=angle+(Number(chapters[next].dataset.angle)-angle)*fraction;
  const visible=i!==next && offsets[next]-position < Math.max(36,(innerHeight-header.offsetHeight-(small.matches?gallery.offsetHeight:0))*.32) ? next:i;
  if (visible!==active) {
    active=visible;
    links.forEach((link,j)=>j===active?link.setAttribute("aria-current","step"):link.removeAttribute("aria-current"));
    label.textContent=links[active].getAttribute("aria-label");
  }
  const dt=previousTime ? Math.min(80,now-previousTime) : 80;
  previousTime=now;
  if (reduced.matches || Math.abs(target-current)>175 || Math.abs(target-current)<.035) current=target;
  else current+=(target-current)*(1-Math.exp(-dt/48));
  counter.textContent=Math.round(current)+"°";
  if (reduced.matches) {
    art.dataset.render="poster";
  } else if (draw) {
    draw(current);
    art.dataset.render="model";
  } else if (atlasReady) {
    const tile=Math.round(current/8)%45;
    atlas.style.backgroundPosition=(tile%9/8*100)+"% "+(Math.floor(tile/9)/4*100)+"%";
    art.dataset.render="angles";
  }
  if (!reduced.matches && current!==target) schedule();
}
function layoutChanged() { needsMeasure=true; schedule(); }
function loadAtlas() {
  if (atlasRequest || reduced.matches) return;
  atlasRequest=new Image();
  atlasRequest.onload=()=>{
    atlas.style.backgroundImage='url("'+atlasRequest.src+'")';
    atlasReady=true;
    schedule();
  };
  atlasRequest.src="images/orbit/angles.jpg";
}
async function initGraphics() {
  if (reduced.matches) { schedule(); return; }
  try {
    gl ||= canvas.getContext("webgl",{alpha:true,antialias:true,depth:true,powerPreference:"low-power"});
    if (!gl) { loadAtlas(); return; }
    assetRequest ||= fetch("images/orbit/sculpture.bin").then(response=>{
      if (!response.ok) throw Error("Orbit model unavailable");
      return response.arrayBuffer();
    });
    mesh = await assetRequest;
    if (!gl.isContextLost() && !draw) draw=createRenderer(gl,mesh);
    schedule();
  } catch { loadAtlas(); }
}
canvas.addEventListener("webglcontextlost",event=>{
  event.preventDefault(); draw=null; art.dataset.render="poster"; loadAtlas(); schedule();
});
canvas.addEventListener("webglcontextrestored",initGraphics);
reduced.addEventListener("change",()=>{ initGraphics(); schedule(); });
window.addEventListener("scroll",schedule,{passive:true});
window.addEventListener("resize",layoutChanged,{passive:true});
window.addEventListener("pageshow",layoutChanged);
const observer=new ResizeObserver(layoutChanged);
[header,gallery,...chapters].forEach(el=>observer.observe(el));

// A horizontal drag scrubs the same document scroll position as the wheel or vertical swipe.
let drag=null;
art.addEventListener("pointerdown",event=>{
  if (event.button===0 && event.isPrimary && !reduced.matches) drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:window.scrollY,engaged:false};
});
art.addEventListener("pointermove",event=>{
  if (!drag || event.pointerId!==drag.id) return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if (!drag.engaged) {
    if (Math.abs(dx)<8) return;
    if (Math.abs(dx)<Math.abs(dy)) { drag=null; return; }
    drag.engaged=true; art.setPointerCapture(event.pointerId);
  }
  window.scrollTo({top:drag.start-dx*(offsets.at(-1)-offsets[0])/(art.clientWidth*2.5),behavior:"instant"});
});
for (const name of ["pointerup","pointercancel","lostpointercapture","pointerleave"]) art.addEventListener(name,()=>{
  if (name!=="pointerleave" || !drag?.engaged) drag=null;
});
measure();
schedule();
initGraphics();
