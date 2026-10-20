import { useEffect, useMemo, useRef, useState } from "react";
import "./WaveOptics.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const rad = (deg) => (deg * Math.PI) / 180;
const deg = (value) => (value * 180) / Math.PI;

const MODES = [
  { id: "ydse", label: "YDSE", title: "Young's double-slit" },
  { id: "huygens", label: "WAVEFRONTS", title: "Huygens' principle" },
  { id: "diffraction", label: "DIFFRACTION", title: "Single-slit diffraction" },
];

const DEFAULTS = {
  ydse: { wavelength: 600, slitDistance: 0.30, screenDistance: 1.50 },
  huygens: { incidence: 35, refractiveIndex: 1.50 },
  diffraction: { wavelength: 550, slitWidth: 0.20, screenDistance: 1.50 },
};

function wavelengthColour(nm) {
  if (nm < 490) return "#74a7ff";
  if (nm < 560) return "#62d7a3";
  if (nm < 590) return "#f4dc64";
  if (nm < 620) return "#f4a65c";
  return "#ef6d73";
}

export default function WaveOptics() {
  const canvasRef = useRef(null);
  const stateRef = useRef({ mode: "ydse", values: DEFAULTS.ydse, paused: false });
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });
  const pointerRef = useRef(new Map());
  const gestureRef = useRef(null);
  const dragRef = useRef(null);

  const [mode, setMode] = useState("ydse");
  const [values, setValues] = useState(DEFAULTS);
  const [paused, setPaused] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const current = values[mode];
  stateRef.current = { mode, values: current, paused };

  const derived = useMemo(() => derive(mode, current), [mode, current]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return undefined;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let destroyed = false;
    let last = performance.now();
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      requestRender();
    };

    const render = (now) => {
      raf = 0;
      if (destroyed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!stateRef.current.paused) time += dt;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawBoard(ctx, width, height, stateRef.current.mode, stateRef.current.values, time, cameraRef.current);
      requestRender();
    };

    const requestRender = () => {
      if (!raf && !destroyed) raf = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    return () => {
      destroyed = true;
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const update = (patch) => {
    setValues((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], ...patch },
    }));
  };

  const reset = () => {
    setValues((prev) => ({ ...prev, [mode]: { ...DEFAULTS[mode] } }));
    setShowFormula(false);
    setPaused(false);
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
  };

  const selectMode = (next) => {
    pointerRef.current.clear();
    gestureRef.current = null;
    dragRef.current = null;
    setMode(next);
    setShowFormula(false);
    cameraRef.current = { x: 0, y: 0, zoom: 1 };
  };

  const pointFromEvent = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const screenToWorld = (point) => ({
    x: (point.x - cameraRef.current.x) / cameraRef.current.zoom,
    y: (point.y - cameraRef.current.y) / cameraRef.current.zoom,
  });

  const zoomAt = (factor, point) => {
    const before = screenToWorld(point);
    const camera = cameraRef.current;
    const nextZoom = clamp(camera.zoom * factor, 0.7, 2.4);
    camera.zoom = nextZoom;
    camera.x = point.x - before.x * nextZoom;
    camera.y = point.y - before.y * nextZoom;
  };

  const handlePointerDown = (event) => {
    const point = pointFromEvent(event);
    const canvas = canvasRef.current;

    if (event.pointerType === "touch") {
      event.preventDefault();
      pointerRef.current.set(event.pointerId, point);
      canvas.setPointerCapture?.(event.pointerId);
      if (pointerRef.current.size === 1) {
        gestureRef.current = { single: point };
      } else if (pointerRef.current.size === 2) {
        const points = [...pointerRef.current.values()];
        gestureRef.current = {
          center: midpoint(points[0], points[1]),
          distance: distance(points[0], points[1]),
        };
      }
      return;
    }

    if (event.pointerType === "mouse" && event.button === 2) {
      event.preventDefault();
      dragRef.current = { kind: "pan", pointerId: event.pointerId, point };
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }

    if (event.pointerType === "pen" || (event.pointerType === "mouse" && event.button === 0)) {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const world = screenToWorld(point);
      const hit = hitTest(mode, current, world, rect.width, rect.height);
      if (!hit) return;
      dragRef.current = { kind: hit, pointerId: event.pointerId };
      canvas.setPointerCapture?.(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    const point = pointFromEvent(event);
    const canvas = canvasRef.current;

    if (event.pointerType === "touch") {
      if (!pointerRef.current.has(event.pointerId)) return;
      event.preventDefault();
      pointerRef.current.set(event.pointerId, point);
      const points = [...pointerRef.current.values()];
      const gesture = gestureRef.current;
      if (points.length === 1 && gesture?.single) {
        cameraRef.current.x += point.x - gesture.single.x;
        cameraRef.current.y += point.y - gesture.single.y;
        gestureRef.current = { single: point };
      } else if (points.length === 2 && gesture?.center) {
        const center = midpoint(points[0], points[1]);
        const span = distance(points[0], points[1]);
        cameraRef.current.x += center.x - gesture.center.x;
        cameraRef.current.y += center.y - gesture.center.y;
        const factor = gesture.distance > 0 ? span / gesture.distance : 1;
        zoomAt(factor, center);
        gestureRef.current = { center, distance: span };
      }
      return;
    }

    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;

    if (drag.kind === "pan") {
      cameraRef.current.x += point.x - drag.point.x;
      cameraRef.current.y += point.y - drag.point.y;
      drag.point = point;
      return;
    }

    const world = screenToWorld(point);
    const rect = canvas.getBoundingClientRect();
    applyManipulation(mode, drag.kind, world, rect.width, rect.height, current, update);
  };

  const handlePointerUp = (event) => {
    if (event.pointerType === "touch") {
      pointerRef.current.delete(event.pointerId);
      if (pointerRef.current.size === 0) gestureRef.current = null;
      else {
        const [remaining] = [...pointerRef.current.values()];
        gestureRef.current = { single: remaining };
      }
      canvasRef.current?.releasePointerCapture?.(event.pointerId);
      return;
    }
    dragRef.current = null;
    canvasRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    zoomAt(Math.exp(-event.deltaY * 0.0012), pointFromEvent(event));
  };

  return (
    <main className="wave-lab">
      <canvas
        ref={canvasRef}
        className="wave-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onContextMenu={(event) => event.preventDefault()}
        aria-label="Interactive Wave Optics teaching board"
      />

      <header className="wave-header">
        <div className="wave-heading">
          <span>ACTIVELEARN · CLASS XII PHYSICS</span>
          <h1>Wave Optics</h1>
        </div>

        <nav className="wave-modes" aria-label="Wave optics topics">
          {MODES.map((item) => (
            <button
              key={item.id}
              className={mode === item.id ? "active" : ""}
              onClick={() => selectMode(item.id)}
            >
              <strong>{item.label}</strong>
              <small>{item.title}</small>
            </button>
          ))}
        </nav>

        <div className="wave-header-actions">
          <button onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play" : "Pause"}>
            {paused ? "▶" : "Ⅱ"}
          </button>
          <button onClick={() => setShowFormula((value) => !value)} className={showFormula ? "active" : ""} aria-label="Show formula">
            ƒ
          </button>
          <button onClick={reset} aria-label="Reset experiment">↻</button>
        </div>
      </header>

      <aside className="wave-control-rail">
        <div className="rail-title">
          <span>EXPERIMENT</span>
          <strong>{MODES.find((item) => item.id === mode)?.title}</strong>
        </div>
        <Controls mode={mode} value={current} derived={derived} update={update} />
      </aside>

      <aside className="wave-observation">
        <span className="observation-kicker">OBSERVE</span>
        <strong>{derived.observation}</strong>
        <p>{derived.explanation}</p>
      </aside>

      <div className="wave-measurements">
        {derived.metrics.map((metric) => (
          <div key={metric.label} className="wave-measurement">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>

      {showFormula && (
        <aside className="wave-formula">
          <span>{derived.formulaLabel}</span>
          <strong>{derived.formula}</strong>
          <p>{derived.formulaNote}</p>
        </aside>
      )}

      <footer className="wave-footer">
        <span>Pen / mouse left · manipulate</span>
        <span>Finger / mouse right · pan · pinch / wheel · zoom</span>
      </footer>
    </main>
  );
}

function Controls({ mode, value, derived, update }) {
  if (mode === "ydse") {
    return (
      <div className="controls">
        <Variable
          label="Wavelength λ"
          value={`${value.wavelength} nm`}
          min={450}
          max={700}
          step={10}
          current={value.wavelength}
          onChange={(next) => update({ wavelength: next })}
        />
        <Variable
          label="Slit separation d"
          value={`${value.slitDistance.toFixed(2)} mm`}
          min={0.10}
          max={0.60}
          step={0.01}
          current={value.slitDistance}
          onChange={(next) => update({ slitDistance: next })}
        />
        <Variable
          label="Screen distance D"
          value={`${value.screenDistance.toFixed(2)} m`}
          min={0.50}
          max={3.00}
          step={0.05}
          current={value.screenDistance}
          onChange={(next) => update({ screenDistance: next })}
        />
        <TeacherCue text={derived.cue} />
      </div>
    );
  }

  if (mode === "huygens") {
    return (
      <div className="controls">
        <Variable
          label="Angle of incidence i"
          value={`${value.incidence.toFixed(1)}°`}
          min={5}
          max={70}
          step={1}
          current={value.incidence}
          onChange={(next) => update({ incidence: next })}
        />
        <Variable
          label="Medium 2 refractive index n₂"
          value={value.refractiveIndex.toFixed(2)}
          min={1.00}
          max={2.00}
          step={0.01}
          current={value.refractiveIndex}
          onChange={(next) => update({ refractiveIndex: next })}
        />
        <TeacherCue text={derived.cue} />
      </div>
    );
  }

  return (
    <div className="controls">
      <Variable
        label="Wavelength λ"
        value={`${value.wavelength} nm`}
        min={450}
        max={700}
        step={10}
        current={value.wavelength}
        onChange={(next) => update({ wavelength: next })}
      />
      <Variable
        label="Slit width a"
        value={`${value.slitWidth.toFixed(2)} mm`}
        min={0.05}
        max={0.50}
        step={0.01}
        current={value.slitWidth}
        onChange={(next) => update({ slitWidth: next })}
      />
      <Variable
        label="Screen distance D"
        value={`${value.screenDistance.toFixed(2)} m`}
        min={0.50}
        max={3.00}
        step={0.05}
        current={value.screenDistance}
        onChange={(next) => update({ screenDistance: next })}
      />
      <TeacherCue text={derived.cue} />
    </div>
  );
}

function Variable({ label, value, min, max, step, current, onChange }) {
  return (
    <label className="wave-variable">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function TeacherCue({ text }) {
  return (
    <div className="teacher-cue">
      <span>TEACHING CUE</span>
      <p>{text}</p>
    </div>
  );
}

function drawBoard(ctx, width, height, mode, value, time, camera) {
  ctx.fillStyle = "#07090c";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  drawQuietGrid(ctx, width, height);
  if (mode === "ydse") drawYDSE(ctx, width, height, value, time);
  else if (mode === "huygens") drawHuygens(ctx, width, height, value, time);
  else drawDiffraction(ctx, width, height, value, time);

  ctx.restore();
}

function drawYDSE(ctx, width, height, value, time) {
  const colour = wavelengthColour(value.wavelength);
  const apparatusY = height * 0.56;
  const sourceX = width * 0.14;
  const barrierX = width * 0.42;
  const screenX = width * 0.78;
  const screenTop = height * 0.22;
  const screenBottom = height * 0.90;
  const scale = clamp(Math.min(width, height) / 720, 0.78, 1.55);
  const slitSeparationPx = lerp(46, 138, (value.slitDistance - 0.10) / 0.50) * scale;
  const topSlit = apparatusY - slitSeparationPx / 2;
  const bottomSlit = apparatusY + slitSeparationPx / 2;

  drawSectionTitle(ctx, width * 0.05, height * 0.16, "YOUNG'S DOUBLE-SLIT", "Interference pattern from two coherent sources");

  drawLaser(ctx, sourceX, apparatusY, barrierX - 30, colour, time);
  drawDoubleSlit(ctx, barrierX, screenTop + 25, screenBottom - 20, topSlit, bottomSlit);
  drawCircularSources(ctx, barrierX, topSlit, colour, time);
  drawCircularSources(ctx, barrierX, bottomSlit, colour, time + 0.45);
  drawConicalBeams(ctx, barrierX + 9, topSlit, screenX - 8, apparatusY - height * 0.30, colour);
  drawConicalBeams(ctx, barrierX + 9, bottomSlit, screenX - 8, apparatusY + height * 0.30, colour);
  drawInterferenceScreen(ctx, screenX, apparatusY, screenTop, screenBottom, value, colour);

  drawMeasureHandle(ctx, barrierX + 26, (topSlit + bottomSlit) / 2, colour, "d");
  drawMeasureHandle(ctx, screenX + 36, apparatusY, "#ffffff", "D");
  drawWavelengthBadge(ctx, sourceX, apparatusY - 58, value.wavelength, colour);

  drawText(ctx, barrierX, screenBottom + 24, "two coherent slits", "center", colour, 12, true);
  drawText(ctx, screenX + 42, screenTop - 16, "SCREEN", "start", "rgba(255,255,255,.55)", 11, true);
}

function drawHuygens(ctx, width, height, value, time) {
  const boundaryY = height * 0.56;
  const normalX = width * 0.62;
  const theta = rad(value.incidence);
  const refracted = Math.asin(clamp(Math.sin(theta) / value.refractiveIndex, -0.999, 0.999));
  const colour = "#8edcff";

  drawSectionTitle(ctx, width * 0.05, height * 0.16, "HUYGENS' PRINCIPLE", "Wavefronts explain reflection and refraction");

  ctx.fillStyle = "rgba(90,140,255,.045)";
  ctx.fillRect(0, 0, width, boundaryY);
  ctx.fillStyle = "rgba(70,210,190,.04)";
  ctx.fillRect(0, boundaryY, width, height - boundaryY);

  drawText(ctx, width * 0.06, height * 0.27, "MEDIUM 1", "start", "rgba(255,255,255,.42)", 11, true);
  drawText(ctx, width * 0.06, height * 0.31, "n₁ = 1.00", "start", "rgba(255,255,255,.65)", 14, true);
  drawText(ctx, width * 0.06, boundaryY + 36, "MEDIUM 2", "start", "rgba(255,255,255,.42)", 11, true);
  drawText(ctx, width * 0.06, boundaryY + 60, `n₂ = ${value.refractiveIndex.toFixed(2)}`, "start", colour, 14, true);

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, boundaryY);
  ctx.lineTo(width, boundaryY);
  ctx.stroke();
  ctx.setLineDash([5, 9]);
  ctx.strokeStyle = "rgba(255,255,255,.20)";
  ctx.beginPath();
  ctx.moveTo(normalX, boundaryY - height * 0.33);
  ctx.lineTo(normalX, boundaryY + height * 0.32);
  ctx.stroke();
  ctx.restore();

  drawText(ctx, normalX + 10, boundaryY - height * 0.29, "NORMAL", "start", "rgba(255,255,255,.35)", 10, true);

  const incidentDirection = { x: Math.sin(theta), y: Math.cos(theta) };
  const incidentFront = { x: Math.cos(theta), y: -Math.sin(theta) };
  const reflectedDirection = { x: Math.sin(theta), y: -Math.cos(theta) };
  const reflectedFront = { x: Math.cos(theta), y: Math.sin(theta) };
  const refractedFront = { x: Math.cos(refracted), y: -Math.sin(refracted) };

  drawWavefronts(ctx, normalX - incidentDirection.x * 190, boundaryY - incidentDirection.y * 190, incidentFront, 8, 45, 230, colour, time, 0.46);
  drawWavefronts(ctx, normalX + reflectedDirection.x * 185, boundaryY + reflectedDirection.y * 185, reflectedFront, 7, 45, 220, colour, -time, 0.36);
  drawWavefronts(ctx, normalX + refractedFront.x * 140, boundaryY + 120, refractedFront, 8, 37, 250, colour, time * 0.85, 0.40);

  drawRay(ctx, normalX - incidentDirection.x * 190, boundaryY - incidentDirection.y * 190, normalX, boundaryY, "#ffffff", 0.72);
  drawRay(ctx, normalX, boundaryY, normalX + reflectedDirection.x * 180, boundaryY + reflectedDirection.y * 180, colour, 0.65);
  drawRay(ctx, normalX, boundaryY, normalX + Math.sin(refracted) * 210, boundaryY + Math.cos(refracted) * 210, colour, 0.72);

  drawAngleArc(ctx, normalX, boundaryY, 55, -Math.PI / 2, -Math.PI / 2 + theta, "rgba(255,255,255,.65)");
  drawAngleArc(ctx, normalX, boundaryY, 55, Math.PI / 2, Math.PI / 2 - theta, colour);
  drawText(ctx, normalX - Math.sin(theta) * 185, boundaryY - Math.cos(theta) * 185 - 18, `i = ${value.incidence.toFixed(1)}°`, "center", "#fff", 12, true);
  drawText(ctx, normalX + Math.sin(refracted) * 145 + 12, boundaryY + Math.cos(refracted) * 145 + 4, `r = ${deg(refracted).toFixed(1)}°`, "start", colour, 12, true);

  drawMeasureHandle(ctx, normalX - Math.sin(theta) * 185, boundaryY - Math.cos(theta) * 185, "#ffffff", "i");
  drawText(ctx, width * 0.73, height * 0.88, "n₁ sin i = n₂ sin r", "center", "rgba(255,255,255,.60)", 14, true);
}

function drawDiffraction(ctx, width, height, value, time) {
  const colour = wavelengthColour(value.wavelength);
  const slitX = width * 0.42;
  const screenX = width * 0.78;
  const centreY = height * 0.56;
  const top = height * 0.23;
  const bottom = height * 0.89;
  const opening = lerp(22, 120, (value.slitWidth - 0.05) / 0.45);

  drawSectionTitle(ctx, width * 0.05, height * 0.16, "SINGLE-SLIT DIFFRACTION", "Narrow the opening and watch the central maximum spread");
  drawLaser(ctx, width * 0.14, centreY, slitX - 34, colour, time);
  drawSingleSlit(ctx, slitX, top, bottom, centreY - opening / 2, centreY + opening / 2);
  drawDiffractionArcs(ctx, slitX + 5, centreY, screenX - slitX, colour, time);
  drawDiffractionScreen(ctx, screenX, centreY, top, bottom, value, colour);
  drawMeasureHandle(ctx, slitX + 30, centreY - opening / 2, colour, "a");
  drawMeasureHandle(ctx, screenX + 35, centreY, "#ffffff", "D");
  drawWavelengthBadge(ctx, width * 0.14, centreY - 58, value.wavelength, colour);
}

function drawInterferenceScreen(ctx, x, centreY, top, bottom, value, colour) {
  const beta = (value.wavelength * 1e-9 * value.screenDistance) / (value.slitDistance * 1e-3);
  const patternScale = clamp(beta * 1000 * 0.9, 5, 42);

  ctx.save();
  const gradient = ctx.createLinearGradient(x - 5, 0, x + 12, 0);
  gradient.addColorStop(0, "rgba(255,255,255,.10)");
  gradient.addColorStop(.5, "rgba(255,255,255,.88)");
  gradient.addColorStop(1, "rgba(255,255,255,.08)");
  ctx.fillStyle = gradient;
  ctx.fillRect(x - 5, top, 9, bottom - top);

  for (let y = top; y <= bottom; y += 1) {
    const phase = ((y - centreY) / patternScale) * Math.PI;
    const intensity = 0.06 + 0.94 * Math.pow(0.5 + 0.5 * Math.cos(phase), 1.4);
    ctx.fillStyle = rgba(colour, intensity);
    ctx.fillRect(x + 8, y, 28, 1);
  }

  ctx.fillStyle = rgba(colour, 0.08);
  ctx.fillRect(x + 8, centreY - patternScale * .8, 28, patternScale * 1.6);
  ctx.restore();

  drawText(ctx, x + 46, centreY + 5, "bright / dark fringes", "start", "rgba(255,255,255,.52)", 11, false);
}

function drawDiffractionScreen(ctx, x, centreY, top, bottom, value, colour) {
  const widthPx = clamp((2 * value.wavelength * 1e-9 * value.screenDistance / (value.slitWidth * 1e-3)) * 100000, 55, (bottom - top) * 0.62);
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.10)";
  ctx.fillRect(x - 4, top, 8, bottom - top);
  ctx.shadowColor = colour;
  ctx.shadowBlur = 22;
  ctx.fillStyle = rgba(colour, 0.85);
  ctx.fillRect(x + 7, centreY - widthPx / 2, 26, widthPx);
  ctx.shadowBlur = 0;
  ctx.fillStyle = rgba(colour, 0.20);
  ctx.fillRect(x + 7, centreY - widthPx * 1.35, 26, widthPx * 0.32);
  ctx.fillRect(x + 7, centreY + widthPx * 1.03, 26, widthPx * 0.32);
  ctx.restore();
  drawText(ctx, x + 45, centreY + 5, "central maximum", "start", "rgba(255,255,255,.52)", 11, false);
}

function drawQuietGrid(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.025)";
  ctx.lineWidth = 1;
  const spacing = clamp(width / 22, 46, 74);
  for (let x = 0; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSectionTitle(ctx, x, y, title, subtitle) {
  drawText(ctx, x, y, title, "start", "#f4f6f8", 15, true);
  drawText(ctx, x, y + 20, subtitle, "start", "rgba(255,255,255,.40)", 11, false);
}

function drawLaser(ctx, sourceX, y, endX, colour, time) {
  drawRay(ctx, sourceX + 12, y, endX, y, colour, .82);
  ctx.save();
  ctx.fillStyle = colour;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(sourceX, y, 7 + Math.sin(time * 4) * 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  drawText(ctx, sourceX, y + 28, "laser", "center", "rgba(255,255,255,.48)", 11, true);
}

function drawDoubleSlit(ctx, x, top, bottom, slitTop, slitBottom) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.54)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, slitTop - 8);
  ctx.moveTo(x, slitTop + 8);
  ctx.lineTo(x, slitBottom - 8);
  ctx.moveTo(x, slitBottom + 8);
  ctx.lineTo(x, bottom);
  ctx.stroke();
  ctx.restore();
  drawText(ctx, x - 8, top - 12, "double slit", "end", "rgba(255,255,255,.42)", 10, true);
}

function drawSingleSlit(ctx, x, top, bottom, openTop, openBottom) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.07)";
  ctx.fillRect(x - 5, top, 10, openTop - top);
  ctx.fillRect(x - 5, openBottom, 10, bottom - openBottom);
  ctx.strokeStyle = "rgba(255,255,255,.54)";
  ctx.strokeRect(x - 5, top, 10, bottom - top);
  ctx.restore();
  drawText(ctx, x - 8, top - 12, "single slit", "end", "rgba(255,255,255,.42)", 10, true);
}

function drawCircularSources(ctx, x, y, colour, time) {
  ctx.save();
  ctx.strokeStyle = rgba(colour, .27);
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 7; i += 1) {
    const radius = 16 + i * 25 + (time * 22) % 25;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawConicalBeams(ctx, x1, y1, x2, y2, colour) {
  ctx.save();
  ctx.strokeStyle = rgba(colour, .16);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawWavefronts(ctx, x, y, direction, count, spacing, length, colour, time, alpha) {
  ctx.save();
  ctx.strokeStyle = rgba(colour, alpha);
  ctx.lineWidth = 1.7;
  const travel = (time * 48) % spacing;
  for (let i = -2; i < count + 3; i += 1) {
    const offset = i * spacing + travel;
    const ox = x - direction.y * offset;
    const oy = y + direction.x * offset;
    ctx.beginPath();
    ctx.moveTo(ox - direction.x * length / 2, oy - direction.y * length / 2);
    ctx.lineTo(ox + direction.x * length / 2, oy + direction.y * length / 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDiffractionArcs(ctx, x, y, maxLength, colour, time) {
  ctx.save();
  ctx.strokeStyle = rgba(colour, .34);
  ctx.lineWidth = 1.5;
  const maxRadius = Math.min(maxLength * .62, 330);
  for (let i = 0; i < 9; i += 1) {
    const radius = 20 + i * 26 + ((time * 26) % 26);
    if (radius > maxRadius) continue;
    ctx.beginPath();
    ctx.arc(x, y, radius, -Math.PI * .48, Math.PI * .48);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRay(ctx, x1, y1, x2, y2, colour, alpha) {
  ctx.save();
  ctx.strokeStyle = rgba(colour, alpha);
  ctx.lineWidth = 2;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawAngleArc(ctx, x, y, radius, start, end, colour) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.stroke();
  ctx.restore();
}

function drawMeasureHandle(ctx, x, y, colour, label) {
  ctx.save();
  ctx.fillStyle = "rgba(7,9,12,.94)";
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 9;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = colour;
  ctx.font = "800 11px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y);
  ctx.restore();
}

function drawWavelengthBadge(ctx, x, y, wavelength, colour) {
  ctx.save();
  ctx.fillStyle = rgba(colour, .10);
  ctx.strokeStyle = rgba(colour, .35);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - 48, y - 16, 96, 29, 10);
  ctx.fill();
  ctx.stroke();
  drawText(ctx, x, y + 2, `λ ${wavelength} nm`, "center", colour, 11, true);
  ctx.restore();
}

function drawText(ctx, x, y, text, align, colour, size, strong) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.font = `${strong ? 800 : 500} ${size}px Inter, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function hitTest(mode, value, point, width, height) {
  const radius = 34;
  if (mode === "ydse") {
    const barrierX = width * .42;
    const screenX = width * .78;
    const centreY = height * .56;
    const separation = lerp(46, 138, (value.slitDistance - .10) / .50) * clamp(Math.min(width, height) / 720, .78, 1.55);
    if (Math.hypot(point.x - (barrierX + 26), point.y - centreY) < radius + separation / 2) return "slitDistance";
    if (Math.hypot(point.x - (screenX + 36), point.y - centreY) < radius) return "screenDistance";
    return null;
  }
  if (mode === "huygens") {
    const boundaryY = height * .56;
    const normalX = width * .62;
    const theta = rad(value.incidence);
    const handleX = normalX - Math.sin(theta) * 185;
    const handleY = boundaryY - Math.cos(theta) * 185;
    if (Math.hypot(point.x - handleX, point.y - handleY) < radius) return "incidence";
    return null;
  }
  const slitX = width * .42;
  const screenX = width * .78;
  const centreY = height * .56;
  const opening = lerp(22, 120, (value.slitWidth - .05) / .45);
  if (Math.hypot(point.x - (slitX + 30), point.y - (centreY - opening / 2)) < radius) return "slitWidth";
  if (Math.hypot(point.x - (screenX + 35), point.y - centreY) < radius) return "screenDistance";
  return null;
}

function applyManipulation(mode, kind, point, width, height, value, update) {
  if (mode === "ydse") {
    if (kind === "slitDistance") {
      const centreY = height * .56;
      const separation = clamp(Math.abs(point.y - centreY) * 2, 36, 156);
      update({ slitDistance: Number(lerp(.10, .60, (separation - 36) / 120).toFixed(2)) });
    } else if (kind === "screenDistance") {
      const t = clamp((point.x - width * .68) / (width * .18), 0, 1);
      update({ screenDistance: Number(lerp(.50, 3.00, t).toFixed(2)) });
    }
    return;
  }
  if (mode === "huygens" && kind === "incidence") {
    const normalX = width * .62;
    const boundaryY = height * .56;
    const next = clamp(deg(Math.atan2(normalX - point.x, boundaryY - point.y)), 5, 70);
    update({ incidence: Number(next.toFixed(1)) });
    return;
  }
  if (kind === "slitWidth") {
    const centreY = height * .56;
    const opening = clamp(Math.abs(point.y - centreY) * 2, 20, 126);
    update({ slitWidth: Number(lerp(.05, .50, (opening - 20) / 106).toFixed(2)) });
  } else if (kind === "screenDistance") {
    const t = clamp((point.x - width * .68) / (width * .18), 0, 1);
    update({ screenDistance: Number(lerp(.50, 3.00, t).toFixed(2)) });
  }
}

function derive(mode, value) {
  if (mode === "ydse") {
    const beta = (value.wavelength * 1e-9 * value.screenDistance) / (value.slitDistance * 1e-3);
    let observation = "The pattern is balanced. Change one variable and watch β respond.";
    if (value.wavelength > 640) observation = "Longer wavelength → fringes move farther apart.";
    else if (value.wavelength < 510) observation = "Shorter wavelength → fringes move closer together.";
    else if (value.slitDistance < .18) observation = "Smaller slit separation → wider fringes.";
    else if (value.slitDistance > .50) observation = "Larger slit separation → narrower fringes.";
    else if (value.screenDistance > 2.35) observation = "A farther screen magnifies the fringe spacing.";

    return {
      observation,
      explanation: "The experiment makes the proportionality visible: β increases with λ and D, and decreases with d.",
      formulaLabel: "FRINGE WIDTH",
      formula: "β = λD / d",
      formulaNote: "The board is showing the measured consequence of the variables you control.",
      cue: "Try changing only one quantity at a time, then ask the class which relationship they can see.",
      metrics: [
        { label: "FRINGE WIDTH β", value: `${(beta * 1000).toFixed(2)} mm` },
        { label: "λ", value: `${value.wavelength} nm` },
        { label: "d", value: `${value.slitDistance.toFixed(2)} mm` },
        { label: "D", value: `${value.screenDistance.toFixed(2)} m` },
      ],
    };
  }

  if (mode === "huygens") {
    const refracted = deg(Math.asin(clamp(Math.sin(rad(value.incidence)) / value.refractiveIndex, -.999, .999)));
    const observation = value.refractiveIndex > 1.65
      ? "A denser second medium bends the refracted wavefront more strongly towards the normal."
      : "Rotate the incident wavefront and compare the reflected and refracted directions.";
    return {
      observation,
      explanation: "Huygens' construction connects wavefront geometry with the laws of reflection and refraction.",
      formulaLabel: "REFRACTION",
      formula: "n₁ sin i = n₂ sin r",
      formulaNote: `Here i = ${value.incidence.toFixed(1)}° and r = ${refracted.toFixed(1)}° for n₁ = 1.00.`,
      cue: "Change the angle first. Then change n₂ and ask the class what stays true and what changes.",
      metrics: [
        { label: "INCIDENCE i", value: `${value.incidence.toFixed(1)}°` },
        { label: "REFRACTION r", value: `${refracted.toFixed(1)}°` },
        { label: "n₂", value: value.refractiveIndex.toFixed(2) },
      ],
    };
  }

  const centralWidth = (2 * value.wavelength * 1e-9 * value.screenDistance) / (value.slitWidth * 1e-3);
  return {
    observation: value.slitWidth < .12
      ? "A narrow slit produces a broad central maximum."
      : "Widen the slit and the central maximum contracts.",
    explanation: "Diffraction becomes more pronounced when the slit width is comparable to the wavelength.",
    formulaLabel: "CENTRAL MAXIMUM",
    formula: "width ≈ 2λD / a",
    formulaNote: "The board presents this as a qualitative diffraction relationship, consistent with the syllabus treatment.",
    cue: "Narrow the slit slowly. Pause when the central maximum becomes obviously broader and explain why.",
    metrics: [
      { label: "CENTRAL WIDTH", value: `${(centralWidth * 1000).toFixed(2)} mm` },
      { label: "λ", value: `${value.wavelength} nm` },
      { label: "a", value: `${value.slitWidth.toFixed(2)} mm` },
      { label: "D", value: `${value.screenDistance.toFixed(2)} m` },
    ],
  };
}

function rgba(hex, alpha) {
  if (!hex.startsWith("#")) return hex;
  const value = hex.slice(1);
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const number = Number.parseInt(full, 16);
  return `rgba(${(number >> 16) & 255},${(number >> 8) & 255},${number & 255},${alpha})`;
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
