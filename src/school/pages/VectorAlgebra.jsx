import { useEffect, useMemo, useRef, useState } from "react";
import "./VectorAlgebra.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const MODES = [
  ["basics", "Basics", "Vectors, scalars & position vectors"],
  ["types", "Types", "Zero, unit, equal & collinear"],
  ["addition", "Addition", "Triangle & parallelogram laws"],
  ["scalar", "Scalar", "Multiplication & components"],
  ["section", "Section", "Position & section formula"],
  ["dot", "Dot product", "Projection & angle"],
  ["cross", "Cross product", "Perpendicular vector & area"],
];

const MODE_INDEX = Object.fromEntries(MODES.map(([id], index) => [id, index]));

export default function VectorAlgebra() {
  const [mode, setMode] = useState("addition");
  const [showGuide, setShowGuide] = useState(true);
  const [showFormula, setShowFormula] = useState(false);
  const [viewResetToken, setViewResetToken] = useState(0);
  const [values, setValues] = useState({
    ax: 3,
    ay: 2,
    bx: 2,
    by: 1,
    lambda: 1.5,
    ratio: 2,
    px: -4,
    py: 1.5,
    qx: 4,
    qy: 4,
  });

  const modeTitle = MODES.find(([id]) => id === mode)?.[1] ?? "Vector Algebra";
  const modeSubtitle = MODES.find(([id]) => id === mode)?.[2] ?? "";

  const update = (key, next) => setValues((prev) => ({ ...prev, [key]: next }));

  const nextMode = () => {
    const index = MODE_INDEX[mode];
    setMode(MODES[(index + 1) % MODES.length][0]);
    setShowFormula(false);
  };

  const previousMode = () => {
    const index = MODE_INDEX[mode];
    setMode(MODES[(index - 1 + MODES.length) % MODES.length][0]);
    setShowFormula(false);
  };

  const resetLesson = () => {
    setValues({
      ax: 3,
      ay: 2,
      bx: 2,
      by: 1,
      lambda: 1.5,
      ratio: 2,
      px: -4,
      py: 1.5,
      qx: 4,
      qy: 4,
    });
    setMode("addition");
    setShowFormula(false);
    setViewResetToken((token) => token + 1);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setShowGuide(false);
      if (event.key === "ArrowRight") nextMode();
      if (event.key === "ArrowLeft") previousMode();
      if (event.key.toLowerCase() === "g") setShowGuide((visible) => !visible);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <main className="va-app">
      <VectorStage
        mode={mode}
        values={values}
        update={update}
        resetToken={viewResetToken}
      />

      <header className="va-topbar">
        <div className="va-brand">
          <span className="va-eyebrow">ACTIVELEARN / SCHOOL</span>
          <div className="va-brand-row">
            <h1>Vector Algebra</h1>
            <span className="va-live-dot">LIVE</span>
          </div>
          <p>{modeSubtitle}</p>
        </div>

        <div className="va-top-actions">
          <button className="va-ghost-button" onClick={() => setShowGuide((visible) => !visible)}>
            {showGuide ? "Hide guide" : "Show guide"}
          </button>
          <button className="va-ghost-button" onClick={() => setShowFormula((visible) => !visible)}>
            {showFormula ? "Hide formula" : "Formula"}
          </button>
          <button className="va-icon-button" onClick={resetLesson} aria-label="Reset lesson" title="Reset lesson">
            ↻
          </button>
        </div>
      </header>

      <nav className="va-mode-rail" aria-label="Vector Algebra topics">
        <div className="va-mode-list">
          {MODES.map(([id, label, description], index) => (
            <button
              key={id}
              className={mode === id ? "va-mode active" : "va-mode"}
              onClick={() => {
                setMode(id);
                setShowFormula(false);
              }}
              title={description}
            >
              <span className="va-mode-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="va-mode-label">{label}</span>
            </button>
          ))}
        </div>
        <div className="va-mode-controls">
          <button className="va-small-button" onClick={previousMode} aria-label="Previous topic">↑</button>
          <button className="va-small-button" onClick={nextMode} aria-label="Next topic">↓</button>
        </div>
      </nav>

      {showGuide && <LessonGuide mode={mode} />}

      {showFormula && <FormulaPanel mode={mode} values={values} />}

      <div className="va-footer">
        <span>CLASS XII · MATHEMATICS</span>
        <span>Pen: manipulate · Finger: pan / zoom · Mouse: left = pen · right = pan</span>
      </div>
    </main>
  );
}

function LessonGuide({ mode }) {
  const guides = {
    basics: {
      kicker: "START HERE",
      title: "A vector has magnitude and direction.",
      body: "Drag the endpoint. Observe the position vector, magnitude, and direction angle update together.",
      hint: "Try moving the point into another quadrant.",
    },
    types: {
      kicker: "CLASSIFY",
      title: "Turn geometry into vector types.",
      body: "Move the vector endpoints and compare zero, unit, equal, negative, and collinear cases.",
      hint: "Make B twice as long as A, then make it point backwards.",
    },
    addition: {
      kicker: "BUILD THE RESULTANT",
      title: "Move the arrows. The resultant follows.",
      body: "Drag either endpoint. The triangle construction and parallelogram construction remain linked to the same A + B.",
      hint: "Make B point perpendicular to A and watch the geometry change.",
    },
    scalar: {
      kicker: "SCALE",
      title: "Positive, zero, negative: one scalar changes everything.",
      body: "Drag the scalar control. The vector scales continuously through zero and reverses direction when λ becomes negative.",
      hint: "Set λ = −2 and compare the new direction.",
    },
    section: {
      kicker: "DIVIDE A SEGMENT",
      title: "The point R moves when the ratio changes.",
      body: "Drag P or Q, then change m:n. The internal section point follows the vector section formula.",
      hint: "Try 1:1 first. Then move to 1:3.",
    },
    dot: {
      kicker: "SCALAR PRODUCT",
      title: "How much does A point along B?",
      body: "Drag either vector. The angle, projection, and dot product update live.",
      hint: "Find the zero case without touching the formula panel.",
    },
    cross: {
      kicker: "VECTOR PRODUCT",
      title: "The new vector is perpendicular to both.",
      body: "Change the two vectors in the projected 3D view. The cross product direction follows the right-hand rule and its magnitude gives area.",
      hint: "Make A and B parallel: the cross product collapses to zero.",
    },
  };

  const guide = guides[mode];

  return (
    <aside className="va-guide">
      <span className="va-panel-kicker">{guide.kicker}</span>
      <h2>{guide.title}</h2>
      <p>{guide.body}</p>
      <div className="va-guide-hint">↳ {guide.hint}</div>
    </aside>
  );
}

function FormulaPanel({ mode, values }) {
  const formulas = {
    basics: [
      ["Position vector", "A = x i + y j"],
      ["Magnitude", "|A| = √(x² + y²)"],
      ["Direction", "tan θ = y / x"],
    ],
    types: [
      ["Unit vector", "Â = A / |A|"],
      ["Negative vector", "−A has equal magnitude and opposite direction"],
      ["Collinear vectors", "A = λB"],
    ],
    addition: [
      ["Vector addition", "A + B = (a₁ + b₁)i + (a₂ + b₂)j"],
      ["Magnitude", "|A + B| = √((a₁+b₁)² + (a₂+b₂)²)"],
    ],
    scalar: [
      ["Scalar multiplication", "λA = (λa₁)i + (λa₂)j"],
      ["Components", "A = Aₓ i + Aᵧ j"],
      ["Magnitude", "|A| = √(Aₓ² + Aᵧ²)"],
    ],
    section: [
      ["Internal section", "R = (mQ + nP) / (m + n)"],
      ["Midpoint", "M = (P + Q) / 2"],
      ["Current ratio", `m:n = ${values.ratio.toFixed(1)}:1`],
    ],
    dot: [
      ["Scalar product", "A · B = |A||B| cos θ"],
      ["Component form", "A · B = a₁b₁ + a₂b₂ + a₃b₃"],
      ["Projection", "proj_B A = (A · B) / |B|"],
    ],
    cross: [
      ["Vector product", "A × B = |A||B| sin θ n̂"],
      ["Parallelogram area", "|A × B|"],
      ["Triangle area", "½|A × B|"],
    ],
  };

  return (
    <aside className="va-formula-panel">
      <div className="va-formula-heading">
        <span>NCERT TOOLBOX</span>
        <strong>{MODES.find(([id]) => id === mode)?.[1]}</strong>
      </div>
      <div className="va-formula-list">
        {formulas[mode].map(([label, formula]) => (
          <div key={label} className="va-formula-row">
            <span>{label}</span>
            <strong>{formula}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}

function VectorStage({ mode, values, update, resetToken }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    camera: { x: 0, y: 0, zoom: 1 },
    pointers: new Map(),
    drag: null,
    lastTouchCenter: null,
    lastPinchDistance: null,
  });

  const scene = useMemo(() => buildScene(mode, values), [mode, values]);

  useEffect(() => {
    stateRef.current.camera = { x: 0, y: 0, zoom: 1 };
    stateRef.current.drag = null;
    stateRef.current.lastTouchCenter = null;
    stateRef.current.lastPinchDistance = null;
  }, [resetToken, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let raf = 0;
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawScene(ctx, rect.width, rect.height, stateRef.current.camera, scene);
    };

    const loop = () => {
      render();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [scene]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const getPoint = (event) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const screenToWorld = (point) => {
      const { camera } = stateRef.current;
      return {
        x: (point.x / camera.zoom) + camera.x,
        y: (point.y / camera.zoom) + camera.y,
      };
    };

    const updateCameraFromGesture = () => {
      const pointers = [...stateRef.current.pointers.values()];
      const camera = stateRef.current.camera;
      if (pointers.length === 1) {
        const point = pointers[0];
        if (stateRef.current.lastTouchCenter) {
          camera.x -= (point.x - stateRef.current.lastTouchCenter.x) / camera.zoom;
          camera.y -= (point.y - stateRef.current.lastTouchCenter.y) / camera.zoom;
        }
        stateRef.current.lastTouchCenter = { ...point };
        stateRef.current.lastPinchDistance = null;
        return;
      }
      if (pointers.length < 2) return;

      const [a, b] = pointers;
      const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (stateRef.current.lastTouchCenter) {
        camera.x -= (center.x - stateRef.current.lastTouchCenter.x) / camera.zoom;
        camera.y -= (center.y - stateRef.current.lastTouchCenter.y) / camera.zoom;
      }
      if (stateRef.current.lastPinchDistance && distance > 0) {
        zoomAt(stateRef.current.camera, distance / stateRef.current.lastPinchDistance, center);
      }
      stateRef.current.lastTouchCenter = center;
      stateRef.current.lastPinchDistance = distance;
    };

    const zoomAt = (camera, factor, point) => {
      const before = { x: point.x / camera.zoom + camera.x, y: point.y / camera.zoom + camera.y };
      camera.zoom = clamp(camera.zoom * factor, 0.45, 3.5);
      const after = { x: point.x / camera.zoom + camera.x, y: point.y / camera.zoom + camera.y };
      camera.x += before.x - after.x;
      camera.y += before.y - after.y;
    };

    const onPointerDown = (event) => {
      const point = getPoint(event);
      if (event.pointerType === "touch") {
        event.preventDefault();
        stateRef.current.pointers.set(event.pointerId, point);
        updateCameraFromGesture();
        return;
      }
      if (event.pointerType === "mouse" && event.button === 2) {
        event.preventDefault();
        stateRef.current.drag = { kind: "pan", pointerId: event.pointerId, point };
        canvas.setPointerCapture?.(event.pointerId);
        return;
      }
      if (event.pointerType === "pen" || (event.pointerType === "mouse" && event.button === 0)) {
        event.preventDefault();
        const world = screenToWorld(point);
        const hit = hitTest(scene, world);
        if (!hit) return;
        stateRef.current.drag = { kind: "object", pointerId: event.pointerId, hit, point };
        canvas.setPointerCapture?.(event.pointerId);
      }
    };

    const onPointerMove = (event) => {
      const point = getPoint(event);
      if (event.pointerType === "touch") {
        if (!stateRef.current.pointers.has(event.pointerId)) return;
        event.preventDefault();
        stateRef.current.pointers.set(event.pointerId, point);
        updateCameraFromGesture();
        return;
      }

      const drag = stateRef.current.drag;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();

      if (drag.kind === "pan") {
        const camera = stateRef.current.camera;
        camera.x -= (point.x - drag.point.x) / camera.zoom;
        camera.y -= (point.y - drag.point.y) / camera.zoom;
        drag.point = point;
        return;
      }

      if (drag.kind === "object") {
        const world = screenToWorld(point);
        handleObjectDrag(mode, drag.hit, world, update, values);
      }
    };

    const onPointerUp = (event) => {
      if (event.pointerType === "touch") {
        stateRef.current.pointers.delete(event.pointerId);
        if (stateRef.current.pointers.size === 0) {
          stateRef.current.lastTouchCenter = null;
          stateRef.current.lastPinchDistance = null;
        }
        return;
      }
      if (stateRef.current.drag?.pointerId === event.pointerId) {
        canvas.releasePointerCapture?.(event.pointerId);
        stateRef.current.drag = null;
      }
    };

    const onWheel = (event) => {
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      zoomAt(stateRef.current.camera, Math.exp(-event.deltaY * 0.0015), point);
    };

    const onContextMenu = (event) => event.preventDefault();

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onContextMenu);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
    };
  }, [mode, scene, update, values]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="va-canvas"
        aria-label="Interactive Vector Algebra board"
      />
      <StageControls mode={mode} values={values} update={update} />
    </>
  );
}

function StageControls({ mode, values, update }) {
  if (mode === "scalar") {
    return (
      <div className="va-stage-control">
        <div>
          <span>SCALAR λ</span>
          <strong>{values.lambda.toFixed(2)}</strong>
        </div>
        <input
          type="range"
          min="-3"
          max="3"
          step="0.01"
          value={values.lambda}
          onChange={(event) => update("lambda", Number(event.target.value))}
          aria-label="Scalar lambda"
        />
      </div>
    );
  }

  if (mode === "section") {
    return (
      <div className="va-stage-control">
        <div>
          <span>INTERNAL RATIO m:n</span>
          <strong>{values.ratio.toFixed(1)}:1</strong>
        </div>
        <input
          type="range"
          min="0.5"
          max="6"
          step="0.1"
          value={values.ratio}
          onChange={(event) => update("ratio", Number(event.target.value))}
          aria-label="Section formula ratio"
        />
      </div>
    );
  }

  return null;
}

function buildScene(mode, values) {
  if (mode === "addition") {
    return {
      type: "addition",
      vectors: [
        { id: "A", x: values.ax, y: values.ay, colour: "#61d7ff" },
        { id: "B", x: values.bx, y: values.by, colour: "#ffbf63" },
      ],
    };
  }

  if (mode === "scalar") {
    return {
      type: "scalar",
      vectors: [{ id: "A", x: 3.5, y: 2, colour: "#61d7ff" }],
      lambda: values.lambda,
    };
  }

  if (mode === "section") {
    return {
      type: "section",
      p: { x: values.px, y: values.py },
      q: { x: values.qx, y: values.qy },
      ratio: values.ratio,
    };
  }

  if (mode === "dot") {
    return {
      type: "dot",
      vectors: [
        { id: "A", x: 4, y: 2, colour: "#61d7ff" },
        { id: "B", x: 2, y: 4, colour: "#ffbf63" },
      ],
    };
  }

  if (mode === "cross") {
    return {
      type: "cross",
      vectors: [
        { id: "A", x: values.ax, y: values.ay, z: 0, colour: "#61d7ff" },
        { id: "B", x: values.bx, y: values.by, z: 0, colour: "#ffbf63" },
      ],
    };
  }

  if (mode === "types") {
    return {
      type: "types",
      vectors: [
        { id: "A", x: values.ax, y: values.ay, colour: "#61d7ff" },
        { id: "B", x: values.bx, y: values.by, colour: "#ffbf63" },
      ],
    };
  }

  return {
    type: "basics",
    point: { x: values.ax, y: values.ay },
  };
}

function hitTest(scene, world) {
  const threshold = 0.42;
  if (scene.type === "basics") {
    return distance(world.x, world.y, scene.point.x, scene.point.y) < threshold ? { kind: "basics-point" } : null;
  }

  if (["addition", "dot", "types"].includes(scene.type)) {
    for (const vector of scene.vectors) {
      if (distance(world.x, world.y, vector.x, vector.y) < threshold) return { kind: "vector-head", id: vector.id };
    }
  }

  if (scene.type === "scalar") {
    const scaled = { x: scene.vectors[0].x * scene.lambda, y: scene.vectors[0].y * scene.lambda };
    if (distance(world.x, world.y, scaled.x, scaled.y) < threshold) return { kind: "scalar-head" };
    if (distance(world.x, world.y, scene.vectors[0].x, scene.vectors[0].y) < threshold) return { kind: "scalar-base" };
  }

  if (scene.type === "section") {
    if (distance(world.x, world.y, scene.p.x, scene.p.y) < threshold) return { kind: "P" };
    if (distance(world.x, world.y, scene.q.x, scene.q.y) < threshold) return { kind: "Q" };
  }

  if (scene.type === "cross") {
    for (const vector of scene.vectors) {
      const projected = project3D(vector.x, vector.y, vector.z);
      if (distance(world.x, world.y, projected.x, projected.y) < threshold) return { kind: "cross-head", id: vector.id };
    }
  }

  return null;
}

function handleObjectDrag(mode, hit, world, update) {
  if (!hit) return;

  if (mode === "basics" && hit.kind === "basics-point") {
    update("ax", clamp(Number(world.x.toFixed(2)), -8, 8));
    update("ay", clamp(Number(world.y.toFixed(2)), -6, 6));
    return;
  }

  if (["addition", "dot", "types"].includes(mode) && hit.kind === "vector-head") {
    if (hit.id === "A") {
      update("ax", clamp(Number(world.x.toFixed(2)), -8, 8));
      update("ay", clamp(Number(world.y.toFixed(2)), -6, 6));
    } else {
      update("bx", clamp(Number(world.x.toFixed(2)), -8, 8));
      update("by", clamp(Number(world.y.toFixed(2)), -6, 6));
    }
    return;
  }

  if (mode === "section") {
    if (hit.kind === "P") {
      update("px", clamp(Number(world.x.toFixed(2)), -8, 8));
      update("py", clamp(Number(world.y.toFixed(2)), -6, 6));
    }
    if (hit.kind === "Q") {
      update("qx", clamp(Number(world.x.toFixed(2)), -8, 8));
      update("qy", clamp(Number(world.y.toFixed(2)), -6, 6));
    }
    return;
  }

  if (mode === "scalar" && (hit.kind === "scalar-head" || hit.kind === "scalar-base")) {
    const base = { x: 3.5, y: 2 };
    const projection = (world.x * base.x + world.y * base.y) / (base.x * base.x + base.y * base.y);
    update("lambda", clamp(Number(projection.toFixed(2)), -3, 3));
    return;
  }

  if (mode === "cross" && hit.kind === "cross-head") {
    const z = hit.id === "A" ? 0 : 0;
    if (hit.id === "A") {
      update("ax", clamp(Number(world.x.toFixed(2)), -6, 6));
      update("ay", clamp(Number(world.y.toFixed(2)), -6, 6));
    } else {
      update("bx", clamp(Number(world.x.toFixed(2)), -6, 6));
      update("by", clamp(Number(world.y.toFixed(2)), -6, 6));
    }
    void z;
  }
}

function drawScene(ctx, width, height, camera, scene) {
  const background = "#06080b";
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const origin = { x: width / 2, y: height / 2 + 32 };
  const worldScale = Math.min(width, height) / 17 * camera.zoom;
  const toScreen = (x, y) => ({
    x: origin.x + (x - camera.x) * worldScale,
    y: origin.y - (y - camera.y) * worldScale,
  });

  drawGrid(ctx, width, height, origin, worldScale, camera);
  drawAxes(ctx, width, height, origin);

  switch (scene.type) {
    case "basics":
      drawBasics(ctx, toScreen, scene);
      break;
    case "types":
      drawTypes(ctx, toScreen, scene);
      break;
    case "addition":
      drawAddition(ctx, toScreen, scene);
      break;
    case "scalar":
      drawScalar(ctx, toScreen, scene);
      break;
    case "section":
      drawSection(ctx, toScreen, scene);
      break;
    case "dot":
      drawDot(ctx, toScreen, scene);
      break;
    case "cross":
      drawCross(ctx, toScreen, scene, origin, worldScale);
      break;
    default:
      break;
  }

  ctx.save();
  ctx.fillStyle = "rgba(222, 233, 242, 0.46)";
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("WORLD SPACE", 24, height - 24);
  ctx.restore();
}

function drawGrid(ctx, width, height, origin, scale, camera) {
  const step = clamp(scale, 24, 88);
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;

  for (let x = ((origin.x - camera.x * scale) % step + step) % step; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = ((origin.y + camera.y * scale) % step + step) % step; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAxes(ctx, width, height, origin) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, origin.y);
  ctx.lineTo(width, origin.y);
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, height);
  ctx.stroke();
  ctx.fillStyle = "rgba(222,233,242,0.65)";
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.fillText("x", width - 22, origin.y - 8);
  ctx.fillText("y", origin.x + 10, 22);
  ctx.restore();
}

function drawBasics(ctx, toScreen, scene) {
  const point = toScreen(scene.point.x, scene.point.y);
  const origin = toScreen(0, 0);
  drawArrow(ctx, origin, point, "#61d7ff", 4);
  drawPoint(ctx, point, "#61d7ff", 7);
  drawDashed(ctx, toScreen(scene.point.x, 0), point, "rgba(97,215,255,0.35)");
  drawDashed(ctx, toScreen(0, scene.point.y), point, "rgba(97,215,255,0.35)");
  text(ctx, `A (${scene.point.x.toFixed(1)}, ${scene.point.y.toFixed(1)})`, point.x + 14, point.y - 14, "#dceff7", 14, true);
  const magnitude = Math.hypot(scene.point.x, scene.point.y);
  const angle = Math.atan2(scene.point.y, scene.point.x) * 180 / Math.PI;
  drawInfo(ctx, [
    ["POSITION VECTOR", `A = ${scene.point.x.toFixed(1)}i + ${scene.point.y.toFixed(1)}j`],
    ["MAGNITUDE", magnitude.toFixed(2)],
    ["DIRECTION", `${angle.toFixed(1)}°`],
  ]);
}

function drawTypes(ctx, toScreen, scene) {
  const origin = toScreen(0, 0);
  const [a, b] = scene.vectors;
  const A = toScreen(a.x, a.y);
  const B = toScreen(b.x, b.y);
  drawArrow(ctx, origin, A, a.colour, 4);
  drawArrow(ctx, origin, B, b.colour, 4);
  drawPoint(ctx, A, a.colour, 6);
  drawPoint(ctx, B, b.colour, 6);
  text(ctx, `A · ${Math.hypot(a.x, a.y).toFixed(2)}`, A.x + 10, A.y - 10, a.colour, 14, true);
  text(ctx, `B · ${Math.hypot(b.x, b.y).toFixed(2)}`, B.x + 10, B.y + 20, b.colour, 14, true);
  const cross = a.x * b.y - a.y * b.x;
  const ratio = a.x !== 0 ? b.x / a.x : null;
  const angle = angleBetween(a, b);
  drawInfo(ctx, [
    ["LENGTHS", `${Math.hypot(a.x, a.y).toFixed(2)} · ${Math.hypot(b.x, b.y).toFixed(2)}`],
    ["ANGLE", `${angle.toFixed(1)}°`],
    ["COLLINEAR?", Math.abs(cross) < 0.1 ? "YES" : "NO"],
    ["SAME DIRECTION?", ratio != null && ratio > 0 && Math.abs(cross) < 0.1 ? "YES" : "NO"],
  ]);
}

function drawAddition(ctx, toScreen, scene) {
  const origin = toScreen(0, 0);
  const [a, b] = scene.vectors;
  const A = toScreen(a.x, a.y);
  const B = toScreen(b.x, b.y);
  const R = toScreen(a.x + b.x, a.y + b.y);
  const tailB = A;
  const opposite = toScreen(b.x, b.y);

  drawDashed(ctx, B, R, "rgba(255,191,99,0.55)");
  drawDashed(ctx, A, R, "rgba(97,215,255,0.55)");
  drawArrow(ctx, origin, A, a.colour, 4.5);
  drawArrow(ctx, A, R, b.colour, 4.5);
  drawArrow(ctx, origin, R, "#82ff9a", 6);
  drawPoint(ctx, A, a.colour, 7);
  drawPoint(ctx, B, b.colour, 7);
  drawPoint(ctx, R, "#82ff9a", 8);

  text(ctx, "A", A.x + 12, A.y - 12, a.colour, 16, true);
  text(ctx, "B", R.x + 12, R.y + 18, b.colour, 16, true);
  text(ctx, "R = A + B", (origin.x + R.x) / 2 + 12, (origin.y + R.y) / 2 - 8, "#82ff9a", 15, true);
  text(ctx, "parallelogram construction", B.x + 16, B.y - 14, "rgba(222,233,242,0.55)", 12, false);

  const rx = a.x + b.x;
  const ry = a.y + b.y;
  drawInfo(ctx, [
    ["A", `(${a.x.toFixed(1)}, ${a.y.toFixed(1)})`],
    ["B", `(${b.x.toFixed(1)}, ${b.y.toFixed(1)})`],
    ["RESULTANT", `(${rx.toFixed(1)}, ${ry.toFixed(1)})`],
    ["|R|", Math.hypot(rx, ry).toFixed(2)],
    ["∠R", `${(Math.atan2(ry, rx) * 180 / Math.PI).toFixed(1)}°`],
  ]);
  void tailB;
  void opposite;
}

function drawScalar(ctx, toScreen, scene) {
  const origin = toScreen(0, 0);
  const base = scene.vectors[0];
  const baseEnd = toScreen(base.x, base.y);
  const scaled = toScreen(base.x * scene.lambda, base.y * scene.lambda);
  drawArrow(ctx, origin, baseEnd, "rgba(97,215,255,0.4)", 3);
  drawArrow(ctx, origin, scaled, "#61d7ff", 6);
  drawPoint(ctx, baseEnd, "rgba(97,215,255,0.5)", 5);
  drawPoint(ctx, scaled, "#61d7ff", 8);
  text(ctx, "A", baseEnd.x + 10, baseEnd.y - 10, "rgba(205,235,243,0.8)", 14, true);
  text(ctx, `λA  (λ = ${scene.lambda.toFixed(2)})`, scaled.x + 12, scaled.y - 14, "#61d7ff", 15, true);

  const sign = scene.lambda > 0.001 ? "same direction" : scene.lambda < -0.001 ? "opposite direction" : "zero vector";
  drawScalarRail(ctx, scene.lambda);
  drawInfo(ctx, [
    ["SCALAR λ", scene.lambda.toFixed(2)],
    ["RESULT", sign],
    ["MAGNITUDE", `${(Math.abs(scene.lambda) * Math.hypot(base.x, base.y)).toFixed(2)} units`],
  ]);
}

function drawScalarRail(ctx, lambda) {
  const x = 36;
  const y = ctx.canvas.height / (window.devicePixelRatio || 1) - 82;
  const w = 330;
  const left = x;
  const right = x + w;
  const zero = left + w / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.stroke();
  const knob = zero + (clamp(lambda, -3, 3) / 3) * (w / 2);
  ctx.fillStyle = "#61d7ff";
  ctx.beginPath();
  ctx.arc(knob, y, 7, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, "−3", left, y + 24, "rgba(222,233,242,0.45)", 11, false);
  text(ctx, "0", zero - 4, y + 24, "rgba(222,233,242,0.6)", 11, false);
  text(ctx, "+3", right - 16, y + 24, "rgba(222,233,242,0.45)", 11, false);
  ctx.restore();
}

function drawSection(ctx, toScreen, scene) {
  const P = toScreen(scene.p.x, scene.p.y);
  const Q = toScreen(scene.q.x, scene.q.y);
  const denominator = scene.ratio + 1;
  const r = {
    x: (scene.ratio * scene.q.x + scene.p.x) / denominator,
    y: (scene.ratio * scene.q.y + scene.p.y) / denominator,
  };
  const R = toScreen(r.x, r.y);
  drawDashed(ctx, P, Q, "rgba(255,255,255,0.28)");
  drawPoint(ctx, P, "#61d7ff", 8);
  drawPoint(ctx, Q, "#ffbf63", 8);
  drawPoint(ctx, R, "#82ff9a", 9);
  text(ctx, "P", P.x + 10, P.y - 12, "#61d7ff", 15, true);
  text(ctx, "Q", Q.x + 10, Q.y - 12, "#ffbf63", 15, true);
  text(ctx, "R", R.x + 10, R.y - 12, "#82ff9a", 15, true);
  drawRatioBar(ctx, scene.ratio);
  drawInfo(ctx, [
    ["RATIO m:n", `${scene.ratio.toFixed(1)}:1`],
    ["R", `(${r.x.toFixed(2)}, ${r.y.toFixed(2)})`],
    ["MIDPOINT", scene.ratio === 1 ? "YES" : "NO"],
  ]);
}

function drawRatioBar(ctx, ratio) {
  const x = 36;
  const y = ctx.canvas.height / (window.devicePixelRatio || 1) - 82;
  const w = 300;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  const knob = x + clamp((ratio - 0.5) / 5.5, 0, 1) * w;
  ctx.fillStyle = "#82ff9a";
  ctx.beginPath();
  ctx.arc(knob, y, 7, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, "0.5:1", x, y + 24, "rgba(222,233,242,0.45)", 11, false);
  text(ctx, "3:1", x + w * 0.45, y + 24, "rgba(222,233,242,0.6)", 11, false);
  text(ctx, "6:1", x + w - 22, y + 24, "rgba(222,233,242,0.45)", 11, false);
  ctx.restore();
}

function drawDot(ctx, toScreen, scene) {
  const origin = toScreen(0, 0);
  const [a, b] = scene.vectors;
  const A = toScreen(a.x, a.y);
  const B = toScreen(b.x, b.y);
  const dot = a.x * b.x + a.y * b.y;
  const angle = angleBetween(a, b);
  const bLength = Math.hypot(b.x, b.y);
  const projectionLength = bLength ? dot / bLength : 0;
  const proj = bLength ? { x: b.x / bLength * projectionLength, y: b.y / bLength * projectionLength } : { x: 0, y: 0 };
  const projPoint = toScreen(proj.x, proj.y);

  drawArrow(ctx, origin, A, a.colour, 4.5);
  drawArrow(ctx, origin, B, b.colour, 4.5);
  drawDashed(ctx, A, projPoint, "rgba(130,255,154,0.6)");
  drawArrow(ctx, origin, projPoint, "#82ff9a", 4);
  drawPoint(ctx, A, a.colour, 7);
  drawPoint(ctx, B, b.colour, 7);
  drawPoint(ctx, projPoint, "#82ff9a", 6);
  drawAngleArc(ctx, origin, a, b, Math.min(0.72 * Math.min(ctx.canvas.width, ctx.canvas.height), 82));
  text(ctx, `A · B = ${dot.toFixed(2)}`, 34, 150, "#82ff9a", 18, true);
  text(ctx, `θ = ${angle.toFixed(1)}°`, 34, 178, "rgba(222,233,242,0.72)", 13, false);
  text(ctx, "projection of A on B", projPoint.x + 12, projPoint.y - 10, "#82ff9a", 13, true);

  const sign = dot > 0.05 ? "positive" : dot < -0.05 ? "negative" : "zero";
  drawInfo(ctx, [
    ["DOT PRODUCT", dot.toFixed(2)],
    ["ANGLE", `${angle.toFixed(1)}°`],
    ["SIGN", sign],
    ["PROJECTION", `${projectionLength.toFixed(2)} units`],
  ]);
}

function drawCross(ctx, toScreen, scene, origin, worldScale) {
  const [a2, b2] = scene.vectors;
  const a = { x: a2.x, y: a2.y, z: a2.z };
  const b = { x: b2.x, y: b2.y, z: b2.z };
  const A = project3D(a.x, a.y, a.z);
  const B = project3D(b.x, b.y, b.z);
  const R = project3D(
    a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x,
  );

  const originScreen = toScreen(0, 0);
  const aScreen = { x: originScreen.x + A.x * worldScale, y: originScreen.y - A.y * worldScale };
  const bScreen = { x: originScreen.x + B.x * worldScale, y: originScreen.y - B.y * worldScale };
  const rScale = Math.min(1.5, 0.28 + Math.hypot(R.x, R.y) * 0.2);
  const rScreen = { x: originScreen.x + R.x * worldScale * rScale, y: originScreen.y - R.y * worldScale * rScale };

  drawPlaneAxes(ctx, originScreen, worldScale);
  drawArrow(ctx, originScreen, aScreen, a2.colour, 4.5);
  drawArrow(ctx, originScreen, bScreen, b2.colour, 4.5);
  drawArrow(ctx, originScreen, rScreen, "#82ff9a", 6);
  drawPoint(ctx, aScreen, a2.colour, 7);
  drawPoint(ctx, bScreen, b2.colour, 7);
  drawPoint(ctx, rScreen, "#82ff9a", 8);
  text(ctx, "A", aScreen.x + 10, aScreen.y - 10, a2.colour, 15, true);
  text(ctx, "B", bScreen.x + 10, bScreen.y - 10, b2.colour, 15, true);
  text(ctx, "A × B", rScreen.x + 10, rScreen.y - 12, "#82ff9a", 15, true);

  const magnitude = Math.hypot(R.x, R.y, R.z);
  const area = magnitude;
  drawInfo(ctx, [
    ["A × B", `(${R.x.toFixed(2)}, ${R.y.toFixed(2)}, ${R.z.toFixed(2)})`],
    ["|A × B|", magnitude.toFixed(2)],
    ["PARALLELOGRAM AREA", area.toFixed(2)],
    ["TRIANGLE AREA", (area / 2).toFixed(2)],
    ["VIEW", "oblique 3D projection"],
  ]);
}

function drawPlaneAxes(ctx, origin, scale) {
  const xEnd = { x: origin.x + scale * 3.7, y: origin.y + scale * 1.2 };
  const yEnd = { x: origin.x - scale * 2.7, y: origin.y + scale * 1.8 };
  const zEnd = { x: origin.x, y: origin.y - scale * 3.5 };
  drawArrow(ctx, origin, xEnd, "rgba(255,255,255,0.32)", 2);
  drawArrow(ctx, origin, yEnd, "rgba(255,255,255,0.24)", 2);
  drawArrow(ctx, origin, zEnd, "rgba(255,255,255,0.3)", 2);
  text(ctx, "x", xEnd.x + 8, xEnd.y + 4, "rgba(222,233,242,0.6)", 12, false);
  text(ctx, "y", yEnd.x - 16, yEnd.y + 4, "rgba(222,233,242,0.6)", 12, false);
  text(ctx, "z", zEnd.x + 8, zEnd.y - 4, "rgba(222,233,242,0.6)", 12, false);
}

function project3D(x, y, z) {
  return {
    x: x + y * 0.55,
    y: z + (x + y) * 0.28,
  };
}

function drawArrow(ctx, from, to, colour, width) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const size = Math.max(10, width * 2.6);
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - size * Math.cos(angle - Math.PI / 6), to.y - size * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(to.x - size * Math.cos(angle + Math.PI / 6), to.y - size * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPoint(ctx, point, colour, radius) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.shadowColor = colour;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDashed(ctx, from, to, colour) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.3;
  ctx.setLineDash([7, 6]);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function drawAngleArc(ctx, origin, a, b, radius) {
  const start = Math.atan2(a.y, a.x);
  const end = Math.atan2(b.y, b.x);
  let delta = end - start;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, radius, start, start + delta, delta < 0);
  ctx.stroke();
  ctx.restore();
}

function drawInfo(ctx, rows) {
  const width = 280;
  const height = 78 + rows.length * 30;
  const x = ctx.canvas.width / (window.devicePixelRatio || 1) - width - 26;
  const y = 112;
  ctx.save();
  ctx.fillStyle = "rgba(10,14,19,0.84)";
  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, width, height, 18);
  ctx.fill();
  ctx.stroke();
  text(ctx, "LIVE VALUES", x + 18, y + 24, "rgba(222,233,242,0.48)", 10, true);
  rows.forEach(([label, value], index) => {
    const rowY = y + 50 + index * 30;
    text(ctx, label, x + 18, rowY, "rgba(222,233,242,0.5)", 10, false);
    text(ctx, String(value), x + 112, rowY, "#e9f7ff", 12, true);
  });
  ctx.restore();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, colour, size, bold) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.font = `${bold ? 650 : 450} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textBaseline = "middle";
  ctx.fillText(value, x, y);
  ctx.restore();
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function angleBetween(a, b) {
  const dot = a.x * b.x + a.y * b.y;
  const denominator = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y);
  if (!denominator) return 0;
  return Math.acos(clamp(dot / denominator, -1, 1)) * 180 / Math.PI;
}
