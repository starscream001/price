(() => {
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;
  const fragment = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D before;
    uniform sampler2D treatment;
    uniform sampler2D care;
    uniform vec2 cover;
    uniform vec4 take;
    uniform float clock;
    uniform float portrait;

    float region(vec2 p, vec2 center, vec2 size) {
      vec2 d = (p - center) / size;
      return exp(-dot(d, d) * 2.0);
    }

    vec3 sampleTake(float shot, vec2 p) {
      float breath = sin(clock * 1.15);
      if (shot < 0.5) {
        vec3 still = texture2D(before, p).rgb;
        float golden = region(p, vec2(0.17, 0.25), vec2(0.46, 0.48));
        float stone = region(p, vec2(0.35, 0.72), vec2(0.63, 0.12));
        float ripple = pow(0.5 + 0.5 * cos(55.0 * p.y + 18.0 * p.x - 2.5 * clock + 1.8 * sin(p.x * 17.0)), 4.0);
        return still + vec3(1.0, 0.78, 0.4) * ripple * (golden + stone * 0.7) * 0.17;
      }
      if (shot < 1.5) {
        float tool = region(p, vec2(0.75, 0.79), vec2(0.43, 0.29));
        float grip = region(p, vec2(0.23, 0.41), vec2(0.34, 0.12));
        p += vec2(0.036, 0.018) * breath * tool;
        p += vec2(0.019, -0.014) * sin(clock * 0.83 + 1.3) * grip;
        vec3 still = texture2D(treatment, p).rgb;
        float glint = pow(0.5 + 0.5 * cos(24.0 * p.y - 9.0 * p.x - clock * 2.9), 10.0);
        float steel = region(p, vec2(0.77, 0.76), vec2(0.27, 0.22));
        return still + vec3(0.56, 0.78, 0.75) * steel * glint * 0.13;
      }
      float fingers = region(p, vec2(0.29, 0.45), vec2(0.34, 0.145));
      float cradle = region(p, vec2(0.57, 0.66), vec2(0.38, 0.14));
      p += vec2(0.032, -0.023) * breath * fingers;
      p += vec2(-0.012, 0.014) * breath * cradle;
      vec3 still = texture2D(care, p).rgb;
      float cream = region(p, vec2(0.445, 0.503), vec2(0.19, 0.034));
      float gleam = smoothstep(0.68, 0.91, still.r) * cream * (0.5 + 0.5 * sin(clock * 1.4));
      return still + vec3(0.08, 0.053, 0.022) * gleam;
    }

    float gloveShape(vec2 p, vec2 start, vec2 end, float radius) {
      vec2 edge = end - start;
      float along = clamp(dot(p - start, edge) / dot(edge, edge), 0.0, 1.0);
      float dist = length(p - start - edge * along);
      return 1.0 - smoothstep(radius * 0.68, radius, dist);
    }

    void main() {
      float blend = smoothstep(0.34, 0.67, take.z);
      float camera = 1.05 + sin(take.w * 3.14159) * 0.078 + 0.009 * sin(clock * 0.64);
      vec2 pivot = vec2(0.55, 0.59);
      vec2 p = (uv - pivot) * cover / camera + pivot;
      p.y += portrait * -0.018;
      vec3 previous = sampleTake(take.x, p);
      vec3 result = previous;
      if (blend > 0.0) result = mix(previous, sampleTake(take.y, p), blend);

      // The same motion across the lens hides both changes of shot.
      float pass = smoothstep(0.07, 0.94, take.z);
      float envelope = smoothstep(0.13, 0.37, take.z) * (1.0 - smoothstep(0.64, 0.91, take.z));
      if (envelope > 0.0) {
        vec2 sweep = vec2(uv.x - (pass - 0.5) * 3.7, uv.y - 0.5);
        vec3 hand;
        float mask;
        if (take.y < 1.5) {
          vec2 q = vec2(0.10, 0.464) + vec2(sweep.x * 0.20, sweep.y * 0.19);
          mask = gloveShape(q, vec2(0.01, 0.494), vec2(0.53, 0.335), 0.19);
          hand = texture2D(treatment, q).rgb * vec3(0.39, 0.67, 0.58);
        } else {
          vec2 q = vec2(0.091, 0.365) + vec2(sweep.x * 0.21, sweep.y * 0.19);
          mask = gloveShape(q, vec2(0.015, 0.342), vec2(0.31, 0.452), 0.18);
          hand = texture2D(care, q).rgb * vec3(0.74, 0.54, 0.43);
        }
        float nearLens = envelope * mask * 0.95;
        result = mix(result, hand, nearLens);
      }
      gl_FragColor = vec4(result, 1.0);
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  function loadProgram(gl) {
    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    return program;
  }

  function prepare(canvas, images) {
    const gl = canvas.getContext("webgl", {
      alpha: false, antialias: false, depth: false, stencil: false, powerPreference: "low-power"
    });
    if (!gl) return null;

    const program = loadProgram(gl);
    const geometry = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, geometry);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    images.forEach((img, index) => {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(gl.getUniformLocation(program, ["before", "treatment", "care"][index]), index);
    });

    const uniform = Object.fromEntries(["cover", "take", "clock", "portrait"]
      .map(name => [name, gl.getUniformLocation(program, name)]));
    const ratio = images[0].naturalWidth / images[0].naturalHeight;
    const mobile = matchMedia("(max-width: 800px)");
    let state = [0, 0, 0, 0];
    let request = 0;
    let previousFrame = -100;
    let active = false;
    let dirty = true;
    let lastInput = 0;
    let elapsed = 0;

    function size() {
      const { clientWidth: w, clientHeight: h } = canvas;
      if (!w || !h) return false;
      const density = Math.min(devicePixelRatio || 1, 1.45, 1120 / w, 960 / h);
      canvas.width = Math.max(1, Math.round(w * density));
      canvas.height = Math.max(1, Math.round(h * density));
      gl.viewport(0, 0, canvas.width, canvas.height);
      const viewportRatio = w / h;
      gl.uniform2f(uniform.cover, Math.min(1, viewportRatio / ratio), Math.min(1, ratio / viewportRatio));
      gl.uniform1f(uniform.portrait, Number(mobile.matches));
      dirty = false;
      return true;
    }

    function stop() {
      cancelAnimationFrame(request);
      request = 0;
    }

    function paint(now) {
      request = 0;
      if (!active || document.hidden || gl.isContextLost()) return;
      if (now - previousFrame >= 31 && (!dirty || size())) {
        gl.uniform4fv(uniform.take, state);
        elapsed += Math.min(45, now - previousFrame) / 1000;
        gl.uniform1f(uniform.clock, elapsed);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        previousFrame = now;
      }
      if (now - lastInput < 4600) request = requestAnimationFrame(paint);
    }

    function wake() {
      if (active && !request && !document.hidden) request = requestAnimationFrame(paint);
    }

    const observer = new ResizeObserver(() => { dirty = true; wake(); });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : wake());
    return {
      update(values, visible) {
        if (!active || values.some((value, index) => value !== state[index])) lastInput = performance.now();
        state = values;
        active = visible;
        if (active) wake();
        else stop();
      }
    };
  }

  window.openVisitFilm = async (canvas, images) => {
    try {
      await Promise.all(images.map(img => img.decode()));
      return prepare(canvas, images);
    } catch {
      return null;
    }
  };
})();
