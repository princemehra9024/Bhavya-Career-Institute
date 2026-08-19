import React, { useRef, useEffect } from 'react';
import { Renderer, Camera, Mesh, Transform, Program, Geometry, Texture } from 'ogl';

// Vertex shader: passes UV coordinates
const vertex = `
attribute vec3 position;
attribute vec2 uv;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment shader: simple ripple based on mouse position and time
const fragment = `
precision highp float;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uTime;
uniform float uStrength;
uniform float uSwirl;
uniform float uBrushSize;
uniform bool uGrayscale;
varying vec2 vUv;

void main() {
  vec2 dir = vUv - uMouse;
  float dist = length(dir);
  // Ripple effect
  float ripple = sin(dist * uBrushSize - uTime * uSwirl) * uStrength;
  vec2 uv = vUv + normalize(dir) * ripple;
  vec4 color = texture2D(uTexture, uv);
  if (uGrayscale) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color = vec4(gray, gray, gray, color.a);
  }
  gl_FragColor = color;
}
`;

/**
 * RippleDistortion component using OGL.
 * Props:
 *  - src: image URL (string)
 *  - brushSize: number (default 150)
 *  - strength: number (default 0.2)
 *  - swirl: number (default 1)
 *  - rings: number (unused in this simplified version)
 *  - grayscale: boolean (default false)
 */
const RippleDistortion = ({
  src = 'https://images.unsplash.com/photo-1526406915891-9b5c6b5a0d71',
  brushSize = 150,
  strength = 0.2,
  swirl = 1,
  rings = 4,
  grayscale = false,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new Renderer({ canvas, dpr: window.devicePixelRatio });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl);
    camera.position.z = 1;

    const geometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array([
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        -1, 1, 0,
      ]) },
      uv: { size: 2, data: new Float32Array([
        0, 0,
        1, 0,
        1, 1,
        0, 1,
      ]) },
      index: { size: 1, data: new Uint16Array([
        0, 1, 2,
        0, 2, 3,
      ]) },
    });

    const texture = new Texture(gl);
    texture.image = new Image();
    texture.image.src = src;
    texture.image.onload = () => texture.update();

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTexture: { value: texture },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uTime: { value: 0 },
        uStrength: { value: strength },
        uSwirl: { value: swirl },
        uBrushSize: { value: brushSize },
        uGrayscale: { value: grayscale },
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    const scene = new Transform();
    scene.addChild(mesh);

    const mouse = new Float32Array([0.5, 0.5]);
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height; // flip Y for UV space
      mouse[0] = x;
      mouse[1] = y;
      program.uniforms.uMouse.value = mouse;
    };
    canvas.addEventListener('pointermove', onPointerMove);

    let time = 0;
    const resize = () => {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.perspective({ aspect: canvas.clientWidth / canvas.clientHeight });
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.016;
      program.uniforms.uTime.value = time;
      renderer.render({ scene, camera });
      requestAnimationFrame(draw);
    };
    draw();

    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      renderer.destroy();
    };
  }, [src, brushSize, strength, swirl, grayscale]);

  return (
    <canvas
      ref={canvasRef}
      className="ripple-canvas"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

export default RippleDistortion;
