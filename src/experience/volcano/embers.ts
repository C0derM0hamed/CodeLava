// Point sprites keep the hottest ejecta at one draw call, with no render target or bloom pass.
const vertex = `
attribute float seed;
uniform float progress, aspect, origin, ratio, verticalScale;
varying float light, life;
float hash(float x){return fract(sin(x*19.31+3.0)*17415.387);}
void main(){
  float t=fract(hash(seed+1.0) + progress*(1.8+hash(seed+3.0)*.6));
  // Coherent volleys launch from the lip in sync with the first code fragments.
  if(mod(seed,3.0)<1.0){
    float launch=.205+.018*floor(hash(seed+8.0)*6.0);
    t=clamp((progress-launch)*4.5,0.0,1.0);
  }
  float growth=smoothstep(.09,.35,progress)*(1.0-smoothstep(.45,.565,progress));
  float x=(hash(seed)-.5)*t*t*1.6+(sin(t*4.0+seed)*.021*t);
  float y=(.28+.36*hash(seed+5.0))*t-.30*t*t;
  light=hash(seed+4.0);
  life=growth*smoothstep(.0,.08,t)*(1.0-smoothstep(.60,1.0,t));
  gl_Position=vec4(2.0*x/aspect,1.0-2.0*(origin-y)*verticalScale,0.,1.);
  gl_PointSize=ratio*(1.2+2.6*light);
}`;
const fragment = `
precision mediump float;
varying float light,life;
void main(){
 float d=length(gl_PointCoord-.5)*2.;
 gl_FragColor=vec4(1.0,.33+.46*light,.09+.26*light,life*(1.-smoothstep(.13,1.,d)));
}`;
export function makeEmbers(canvas: HTMLCanvasElement) {
  const upperStage = 0.48;
  canvas.style.height = `${upperStage * 100}%`;
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return;
  const program = gl.createProgram();
  if (!program) return;
  function attach(type: number, source: string) {
    if (!gl || !program) return;
    const shader = gl.createShader(type);
    if (!shader) return;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  attach(gl.VERTEX_SHADER, vertex);
  attach(gl.FRAGMENT_SHADER, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return;
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    Float32Array.from({ length: 320 }, (_, i) => i),
    gl.STATIC_DRAW,
  );
  const seed = gl.getAttribLocation(program, "seed");
  gl.enableVertexAttribArray(seed);
  gl.vertexAttribPointer(seed, 1, gl.FLOAT, false, 0, 0);
  const loc = (s: string) => gl.getUniformLocation(program, s);
  const aspect = loc("aspect"),
    origin = loc("origin"),
    ratio = loc("ratio"),
    progress = loc("progress"),
    verticalScale = loc("verticalScale");
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
  let count = 320;
  return {
    resize(w: number, h: number, low: boolean) {
      // Sparks are soft. Bound the transparent drawing buffer independently of
      // the much sharper type layer to save fill and compositing bandwidth.
      const pixelBudget = low ? 90_000 : 180_000;
      const dpr = Math.min(
        devicePixelRatio,
        1.5,
        Math.sqrt(pixelBudget / (w * h * upperStage)),
      );
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * upperStage * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(aspect, w / h);
      gl.uniform1f(verticalScale, 1 / upperStage);
      gl.uniform1f(origin, 0.5 - (Math.max(h, (w * 9) / 16) * 0.11) / h);
      gl.uniform1f(ratio, dpr);
      count = low ? 96 : 320;
    },
    paint(p: number) {
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (p <= 0.09 || p >= 0.565) return;
      gl.uniform1f(progress, p);
      gl.drawArrays(gl.POINTS, 0, count);
    },
    dispose() {
      gl.disableVertexAttribArray(seed);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.useProgram(null);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}
