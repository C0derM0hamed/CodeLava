// The decoded footage atlas and GL context stay off the main thread. Render only on a seek or resize.
type Start = { type: "start"; canvas: OffscreenCanvas; small: boolean };
type Seek = { type: "seek"; frame: number; width: number; height: number };
type Input = Start | Seek;
let render: ((state: Seek) => void) | undefined;

async function setup({ canvas, small }: Start) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
  if (!gl) throw new Error("No worker WebGL context");
  canvas.addEventListener("webglcontextlost", () => self.postMessage("fallback"));
  const program = gl.createProgram()!;
  const shaders = [
    [gl.VERTEX_SHADER, `attribute vec2 position; varying vec2 uv;
      void main(){uv=position*vec2(.5,-.5)+.5;gl_Position=vec4(position,0.,1.);}`],
    [gl.FRAGMENT_SHADER, `precision highp float;
      varying vec2 uv; uniform sampler2D film; uniform vec2 grid; uniform vec2 tile; uniform float frame;
      vec4 sampleFrame(float n){
        vec2 cell=vec2(mod(n,grid.x),floor(n/grid.x));
        return texture2D(film,(cell+(uv*(tile-1.)+.5)/tile)/grid);
      }
      void main(){gl_FragColor=mix(sampleFrame(floor(frame)),sampleFrame(ceil(frame)),fract(frame));}`],
  ] as const;
  for (const [type, source] of shaders) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Film shader failed");
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const response = await fetch(`/media/hero/fountain-atlas${small ? "-small" : ""}.webp`);
  if (!response.ok) throw new Error("Footage unavailable");
  const atlas = await createImageBitmap(await response.blob(), { premultiplyAlpha: "premultiply" });
  const columns = small ? 6 : 8, rows = small ? 5 : 7;
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.uniform2f(gl.getUniformLocation(program, "tile"), atlas.width/columns, atlas.height/rows);
  gl.uniform2f(gl.getUniformLocation(program, "grid"), columns, rows);
  atlas.close();
  if (gl.getError() !== gl.NO_ERROR) throw new Error("Footage texture unavailable");
  const frameLocation = gl.getUniformLocation(program, "frame");
  render = ({ frame, width, height }) => {
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
    gl.uniform1f(frameLocation, frame * (columns*rows-1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  self.postMessage("ready");
}

self.onmessage = (event: MessageEvent<Input>) => {
  if (event.data.type === "start") void setup(event.data).catch(() => self.postMessage("fallback"));
  else render?.(event.data);
};
export {};
