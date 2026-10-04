import { useEffect, useRef, useState } from "react";
import "./VectorAlgebra.css";

const MODES = [
  ["basics", "Basics", "Magnitude, direction & position vectors"],
  ["types", "Types", "Zero, unit, equal, negative & collinear"],
  ["addition", "Addition", "Triangle and parallelogram laws"],
  ["scalar", "Scalar", "Scalar multiplication & components"],
  ["section", "Section", "Position vectors & section formula"],
  ["dot", "Dot", "Angle, projection & scalar product"],
  ["cross", "Cross", "Perpendicular vector & area"],
];

const INITIAL = {
  basics: { x: 3, y: 2, z: 1 },
  types: { ax: 3, ay: 2, bx: 6, by: 4 },
  addition: { ax: 3, ay: 1, bx: 1, by: 2 },
  scalar: { ax: 3, ay: 1, lambda: 1.5 },
  section: { px: -4, py: 1, qx: 4, qy: 3, t: 0.5 },
  dot: { ax: 4, ay: 1, bx: 2, by: 3 },
  cross: { ax: 3, ay: 1, az: 2, bx: 1, by: 3, bz: 1 },
};

const CHALLENGES = {
  basics: [
    {
      text: "Put A in quadrant II.",
      done: (v) => v.x < 0 && v.y > 0,
    },
    {
      text: "Make |A| = 3 units.",
      done: (v) => Math.abs(Math.hypot(v.x, v.y, v.z) - 3) < 0.08,
    },
    {
      text: "Make A lie on the z-axis.",
      done: (v) => Math.abs(v.x) < 0.08 && Math.abs(v.y) < 0.08,
    },
  ],
  types: [
    {
      text: "Make A and B equal.",
      done: (v) => Math.hypot(v.ax - v.bx, v.ay - v.by) < 0.12,
    },
    {
      text: "Make B the negative of A.",
      done: (v) => Math.hypot(v.ax + v.bx, v.ay + v.by) < 0.12,
    },
    {
      text: "Make B a unit vector.",
      done: (v) => Math.abs(Math.hypot(v.bx, v.by) - 1) < 0.05,
    },
  ],
  addition: [
    {
      text: "Make the resultant horizontal.",
      done: (v) => Math.abs(v.ay + v.by) < 0.08,
    },
    {
      text: "Make A and B perpendicular.",
      done: (v) => Math.abs(v.ax * v.bx + v.ay * v.by) < 0.12,
    },
    {
      text: "Make R = (1, 0).",
      done: (v) => Math.hypot(v.ax + v.bx - 1, v.ay + v.by) < 0.12,
    },
  ],
  scalar: [
    {
      text: "Make λ = 0.",
      done: (v) => Math.abs(v.lambda) < 0.08,
    },
    {
      text: "Reverse A without changing its length.",
      done: (v) => Math.abs(v.lambda + 1) < 0.08,
    },
    {
      text: "Make |λ| = 2.",
      done: (v) => Math.abs(Math.abs(v.lambda) - 2) < 0.08,
    },
  ],
  section: [
    {
      text: "Put R at the midpoint of PQ.",
      done: (v) => Math.abs(v.t - 0.5) < 0.04,
    },
    {
      text: "Make PR : RQ = 1 : 3.",
      done: (v) => Math.abs(v.t - 0.25) < 0.04,
    },
    {
      text: "Move P and Q, then keep R at the midpoint.",
      done: (v) => Math.abs(v.t - 0.5) < 0.04 && Math.hypot(v.qx - v.px, v.qy - v.py) > 2,
    },
  ],
  dot: [
    {
      text: "Make A · B = 0.",
      done: (v) => Math.abs(v.dot) < 0.12,
    },
    {
      text: "Make A · B negative.",
      done: (v) => v.dot < -1,
    },
    {
      text: "Make B point in exactly the same direction as A.",
      done: (v) => v.cross2 < 0.08 && v.dot > 1,
    },
  ],
  cross: [
    {
      text: "Make A × B = 0 by making A and B parallel.",
      done: (v) => v.crossMagnitude < 0.12,
    },
    {
      text: "Make A perpendicular to B.",
      done: (v) => Math.abs(v.dot) < 0.12,
    },
    {
      text: "Make the parallelogram area larger than 8.",
      done: (v) => v.crossMagnitude > 8,
    },
  ],
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const fmt = (value, digits = 2) => {
  if (Math.abs(value) < 0.005) return "0";
  return Number(value.toFixed(digits)).toString();
};
const deg = (radians) => (radians * 180) / Math.PI;

function magnitude2(x, y) {
  return Math.hypot(x, y);
}

function cross2(ax, ay, bx, by) {
  return ax * by - ay * bx;
}

function dot2(ax, ay, bx, by) {
  return ax * bx + ay * by;
}

function magnitude3(x, y, z) {
  return Math.hypot(x, y, z);
}

function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function angle2(ax, ay, bx, by) {
  const ma = magnitude2(ax, ay);
  const mb = magnitude2(bx, by);
  if (!ma || !mb) return 0;
  return Math.acos(clamp(dot2(ax, ay, bx, by) / (ma * mb), -1, 1));
}

function cloneInitial() {
  return Object.fromEntries(Object.entries(INITIAL).map(([key, value]) => [key, { ...value }]));
}

export default function VectorAlgebra() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [mode, setMode] = useState("addition");
  const [ui, setUi] = useState(() => ({
    mode: "addition",
    challengeIndex: 0,
    challengeComplete: false,
    readout: [],
    note: "Drag the vector endpoints with a pen or mouse-left.",
    formula: "A + B = R",
  }));
  const [formulaOpen, setFormulaOpen] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const engine = new VectorLessonEngine(canvasRef.current, setUi);
    engineRef.current = engine;
    engine.setMode(mode);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setMode(mode);
    setFormulaOpen(false);
  }, [mode]);

  const reset = () => engineRef.current?.resetMode();
  const nextChallenge = () => engineRef.current?.nextChallenge();
  const resetView = () => engineRef.current?.resetView();

  const meta = MODES.find(([id]) => id === mode) ?? MODES[0];

  return (
    <main className="va-app">
      <canvas ref={canvasRef} className="va-canvas" aria-label="Interactive vector algebra board" />

      <header className="va-header">
        <div>
          <span className="va-kicker">ACTIVELEARN / SCHOOL / MATHEMATICS</span>
          <h1>Vector Algebra</h1>
          <p>{meta[2]}</p>
        </div>
        <div className="va-header-actions">
          <button onClick={() => setFormulaOpen((open) => !open)} className={formulaOpen ? "va-button active" : "va-button"}>
            Formula
          </button>
          <button onClick={resetView} className="va-button">Reset view</button>
          <button onClick={reset} className="va-button accent">Reset experiment</button>
        </div>
      </header>

      <aside className="va-topic-rail" aria-label="Vector Algebra topics">
        {MODES.map(([id, label], index) => (
          <button
            key={id}
            className={mode === id ? "va-topic active" : "va-topic"}
            onClick={() => setMode(id)}
            title={label}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </aside>

      <section className="va-task-panel">
        <div className="va-task-top">
          <span className="va-kicker">EXPERIMENT</span>
          <button className="va-task-next" onClick={nextChallenge}>New task ↗</button>
        </div>
        <strong>{CHALLENGES[mode]?.[ui.challengeIndex]?.text ?? "Experiment with the vectors."}</strong>
        <p>
          {ui.challengeComplete ? "✓ Nice. Try another one." : ui.note}
        </p>
      </section>

      <section className="va-readout" aria-live="polite">
        {ui.readout.map((item) => (
          <div key={item.label} className="va-readout-row">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      {formulaOpen && (
        <FormulaCard mode={mode} />
      )}

      <footer className="va-footer">
        <span>CLASS XII · NCERT VECTOR ALGEBRA</span>
        <span>Pen / mouse-left = manipulate · Finger / mouse-right = pan · Wheel / pinch = zoom</span>
      </footer>
    </main>
  );
}

function FormulaCard({ mode }) {
  const formulas = {
    basics: [
      ["Position vector", "A = xi + yj + zk"],
      ["Magnitude", "|A| = √(x² + y² + z²)"],
      ["Direction cosines", "cos α = x/|A|,  cos β = y/|A|,  cos γ = z/|A|"],
    ],
    types: [
      ["Unit vector", "Â = A / |A|"],
      ["Negative vector", "−A has equal magnitude and opposite direction"],
      ["Collinear", "A = λB"],
    ],
    addition: [
      ["Addition", "A + B = (a₁+b₁)i + (a₂+b₂)j"],
      ["Resultant", "R = A + B"],
      ["Parallelogram", "Diagonal from common tail gives R"],
    ],
    scalar: [
      ["Scalar multiplication", "λA = (λa₁)i + (λa₂)j"],
      ["Components", "A = Aₓi + Aᵧj + A_zk"],
      ["Magnitude", "|λA| = |λ||A|"],
    ],
    section: [
      ["Internal section", "R = (mQ + nP)/(m+n)"],
      ["Midpoint", "M = (P + Q)/2"],
      ["Ratio", "PR:RQ = m:n"],
    ],
    dot: [
      ["Scalar product", "A·B = |A||B|cos θ"],
      ["Component form", "A·B = a₁b₁ + a₂b₂ + a₃b₃"],
      ["Projection", "scalar projection of B on A = (A·B)/|A|"],
    ],
    cross: [
      ["Vector product", "A×B = |A||B|sin θ n̂"],
      ["Parallelogram area", "|A×B|"],
      ["Triangle area", "½|A×B|"],
    ],
  };

  return (
    <aside className="va-formula-card">
      <span className="va-kicker">REFERENCE</span>
      {formulas[mode].map(([label, formula]) => (
        <div className="va-formula-row" key={label}>
          <span>{label}</span>
          <strong>{formula}</strong>
        </div>
      ))}
    </aside>
  );
}

class VectorLessonEngine {
  constructor(canvas, onUIChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    this.onUIChange = onUIChange;
    this.mode = "addition";
    this.data = cloneInitial();
    this.challengeIndex = 0;
    this.camera = { x: 0, y: 0, zoom: 1 };
    this.cssWidth = 1;
    this.cssHeight = 1;
    this.dpr = window.devicePixelRatio || 1;
    this.baseScale = 60;
    this.pointers = new Map();
    this.drag = null;
    this.pan = null;
    this.pinch = null;
    this.framePending = false;
    this.uiFramePending = false;
    this.destroyed = false;

    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onPointerCancel = this.onPointerCancel.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onContextMenu = (event) => event.preventDefault();

    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    canvas.addEventListener("wheel", this.onWheel, { passive: false });
    canvas.addEventListener("contextmenu", this.onContextMenu);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.emitUI();
  }

  destroy() {
    this.destroyed = true;
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
    this.resizeObserver.disconnect();
    this.pointers.clear();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.cssWidth = Math.max(1, rect.width);
    this.cssHeight = Math.max(1, rect.height);
    this.dpr = window.devicePixelRatio || 1;
    this.baseScale = clamp(Math.min(this.cssWidth, this.cssHeight) * 0.075, 44, 78);
    this.canvas.width = Math.round(this.cssWidth * this.dpr);
    this.canvas.height = Math.round(this.cssHeight * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.render();
  }

  setMode(mode) {
    this.mode = MODES.some(([id]) => id === mode) ? mode : "addition";
    this.challengeIndex = 0;
    this.drag = null;
    this.pan = null;
    this.pinch = null;
    this.resetView();
    this.emitUI();
  }

  resetMode() {
    this.data[this.mode] = { ...INITIAL[this.mode] };
    this.challengeIndex = 0;
    this.drag = null;
    this.emitUI();
    this.render();
  }

  nextChallenge() {
    const list = CHALLENGES[this.mode] ?? [];
    this.challengeIndex = list.length ? (this.challengeIndex + 1) % list.length : 0;
    this.emitUI();
  }

  resetView() {
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1;
    this.render();
  }

  screenScale() {
    return this.baseScale * this.camera.zoom;
  }

  screenToWorld(screenX, screenY) {
    const scale = this.screenScale();
    return {
      x: this.camera.x + (screenX - this.cssWidth / 2) / scale,
      y: this.camera.y - (screenY - this.cssHeight / 2) / scale,
    };
  }

  worldToScreen(x, y) {
    const scale = this.screenScale();
    return {
      x: this.cssWidth / 2 + (x - this.camera.x) * scale,
      y: this.cssHeight / 2 - (y - this.camera.y) * scale,
    };
  }

  zoomAt(factor, screenX, screenY) {
    const before = this.screenToWorld(screenX, screenY);
    this.camera.zoom = clamp(this.camera.zoom * factor, 0.45, 3.2);
    const after = this.screenToWorld(screenX, screenY);
    this.camera.x += before.x - after.x;
    this.camera.y += before.y - after.y;
    this.render();
  }

  startPan(point, id) {
    this.pan = { id, x: point.x, y: point.y };
  }

  updatePan(point) {
    if (!this.pan) return;
    const scale = this.screenScale();
    this.camera.x -= (point.x - this.pan.x) / scale;
    this.camera.y += (point.y - this.pan.y) / scale;
    this.pan = { ...this.pan, x: point.x, y: point.y };
    this.render();
  }

  endPan(pointerId) {
    if (this.pan?.id === pointerId) this.pan = null;
  }

  onPointerDown(event) {
    const point = this.pointFromEvent(event);

    if (event.pointerType === "touch") {
      event.preventDefault();
      this.pointers.set(event.pointerId, point);
      if (this.pointers.size === 1) {
        this.startPan(point, event.pointerId);
      } else if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        this.pan = null;
        this.pinch = {
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        };
      }
      return;
    }

    if (event.pointerType === "mouse" && event.button === 2) {
      event.preventDefault();
      this.startPan(point, event.pointerId);
      this.canvas.setPointerCapture?.(event.pointerId);
      return;
    }

    if ((event.pointerType === "pen" || event.pointerType === "mouse") && event.button === 0) {
      const hit = this.hitTest(point.x, point.y);
      if (hit) {
        event.preventDefault();
        this.drag = { ...hit, pointerId: event.pointerId };
        this.canvas.setPointerCapture?.(event.pointerId);
        this.render();
      }
    }
  }

  onPointerMove(event) {
    const point = this.pointFromEvent(event);

    if (event.pointerType === "touch") {
      if (!this.pointers.has(event.pointerId)) return;
      event.preventDefault();
      this.pointers.set(event.pointerId, point);
      this.updateTouchGesture();
      return;
    }

    if (this.pan?.id === event.pointerId) {
      event.preventDefault();
      this.updatePan(point);
      return;
    }

    if (this.drag?.pointerId === event.pointerId) {
      event.preventDefault();
      const world = this.screenToWorld(point.x, point.y);
      this.applyDrag(world, point);
      this.render();
      this.emitUIThrottled();
    }
  }

  onPointerUp(event) {
    if (event.pointerType === "touch") {
      if (!this.pointers.has(event.pointerId)) return;
      event.preventDefault();
      this.pointers.delete(event.pointerId);
      if (this.pointers.size === 1) {
        const [point] = this.pointers.values();
        this.startPan(point, [...this.pointers.keys()][0]);
        this.pinch = null;
      } else {
        this.pan = null;
        this.pinch = null;
      }
      return;
    }

    if (this.pan?.id === event.pointerId) {
      this.endPan(event.pointerId);
      this.canvas.releasePointerCapture?.(event.pointerId);
    }

    if (this.drag?.pointerId === event.pointerId) {
      this.drag = null;
      this.canvas.releasePointerCapture?.(event.pointerId);
      this.emitUI();
      this.render();
    }
  }

  onPointerCancel(event) {
    if (event.pointerType === "touch") {
      this.pointers.delete(event.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.pointers.size === 0) this.pan = null;
      return;
    }
    if (this.drag?.pointerId === event.pointerId) this.drag = null;
    if (this.pan?.id === event.pointerId) this.pan = null;
  }

  updateTouchGesture() {
    const touchPoints = [...this.pointers.values()];
    if (touchPoints.length === 1) {
      const [point] = touchPoints;
      if (this.pan) this.updatePan(point);
      else this.startPan(point, [...this.pointers.keys()][0]);
      return;
    }
    if (touchPoints.length < 2) return;

    const [a, b] = touchPoints;
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const distance = Math.hypot(a.x - b.x, a.y - b.y);

    if (!this.pinch) {
      this.pinch = { distance, center };
      return;
    }

    const dx = center.x - this.pinch.center.x;
    const dy = center.y - this.pinch.center.y;
    const scale = this.screenScale();
    this.camera.x -= dx / scale;
    this.camera.y += dy / scale;
    if (distance > 0 && this.pinch.distance > 0) {
      this.zoomAt(distance / this.pinch.distance, center.x, center.y);
    } else {
      this.render();
    }
    this.pinch = { distance, center };
  }

  onWheel(event) {
    event.preventDefault();
    const point = this.pointFromEvent(event);
    this.zoomAt(Math.exp(-event.deltaY * 0.0014), point.x, point.y);
  }

  pointFromEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  hitTest(screenX, screenY) {
    const radius = 24;
    const hits = [];

    const push = (id, p, distanceBias = 0) => {
      const d = Math.hypot(screenX - p.x, screenY - p.y);
      if (d <= radius + distanceBias) hits.push({ id, distance: d });
    };

    const point = (x, y) => this.worldToScreen(x, y);

    if (this.mode === "basics") {
      const v = this.data.basics;
      const p = this.project3D(v.x, v.y, v.z);
      push("A-xy", p);
      push("A-z", { x: p.x, y: p.y - this.screenScale() });
    }

    if (this.mode === "types") {
      const v = this.data.types;
      push("A", point(v.ax, v.ay));
      push("B", point(v.bx, v.by));
    }

    if (this.mode === "addition") {
      const v = this.data.addition;
      push("A", point(v.ax, v.ay));
      push("B", point(v.bx, v.by));
    }

    if (this.mode === "scalar") {
      const v = this.data.scalar;
      const aMag = Math.max(0.5, magnitude2(v.ax, v.ay));
      const s = { x: v.ax * v.lambda, y: v.ay * v.lambda };
      push("A", point(v.ax, v.ay));
      push("S", point(s.x, s.y));
      if (Math.abs(v.lambda) < 0.08) push("S", point(0, 0), 6);
      if (!aMag) hits.length = 0;
    }

    if (this.mode === "section") {
      const v = this.data.section;
      const rx = v.px + (v.qx - v.px) * v.t;
      const ry = v.py + (v.qy - v.py) * v.t;
      push("P", point(v.px, v.py));
      push("Q", point(v.qx, v.qy));
      push("R", point(rx, ry));
    }

    if (this.mode === "dot") {
      const v = this.data.dot;
      push("A", point(v.ax, v.ay));
      push("B", point(v.bx, v.by));
    }

    if (this.mode === "cross") {
      const v = this.data.cross;
      const a = this.project3D(v.ax, v.ay, v.az);
      const b = this.project3D(v.bx, v.by, v.bz);
      push("A-xy", a);
      push("A-z", { x: a.x, y: a.y - this.screenScale() });
      push("B-xy", b);
      push("B-z", { x: b.x, y: b.y - this.screenScale() });
    }

    hits.sort((a, b) => a.distance - b.distance);
    return hits[0] ?? null;
  }

  project3D(x, y, z) {
    const s = this.screenScale();
    const kx = 0.74;
    const ky = 0.42;
    return {
      x: this.cssWidth / 2 + (x - y) * s * kx,
      y: this.cssHeight / 2 - z * s + (x + y) * s * ky,
    };
  }

  invertProjectedXY(screenX, screenY, z) {
    const s = this.screenScale();
    const kx = 0.74;
    const ky = 0.42;
    const u = (screenX - this.cssWidth / 2) / (s * kx);
    const v = (screenY - this.cssHeight / 2 + z * s) / (s * ky);
    return { x: (u + v) / 2, y: (v - u) / 2 };
  }

  applyDrag(world, screenPoint) {
    const v = this.data[this.mode];
    if (!this.drag) return;

    if (this.mode === "basics") {
      if (this.drag.id === "A-z") {
        v.z = clamp(v.z - (screenPoint.y - this.project3D(v.x, v.y, v.z).y) / this.screenScale(), -5, 5);
      } else {
        const next = this.invertProjectedXY(screenPoint.x, screenPoint.y, v.z);
        v.x = clamp(next.x, -7, 7);
        v.y = clamp(next.y, -5, 5);
      }
    }

    if (this.mode === "types") {
      if (this.drag.id === "A") {
        v.ax = clamp(world.x, -7, 7);
        v.ay = clamp(world.y, -5, 5);
      } else {
        v.bx = clamp(world.x, -7, 7);
        v.by = clamp(world.y, -5, 5);
      }
    }

    if (this.mode === "addition") {
      if (this.drag.id === "A") {
        v.ax = clamp(world.x, -7, 7);
        v.ay = clamp(world.y, -5, 5);
      } else {
        v.bx = clamp(world.x, -7, 7);
        v.by = clamp(world.y, -5, 5);
      }
    }

    if (this.mode === "scalar") {
      if (this.drag.id === "A") {
        const oldMag = Math.max(0.6, magnitude2(v.ax, v.ay));
        const next = { x: clamp(world.x, -6, 6), y: clamp(world.y, -5, 5) };
        const scale = oldMag ? Math.min(1.6, magnitude2(next.x, next.y) / oldMag) : 1;
        if (scale > 0.12) {
          const unit = magnitude2(next.x, next.y);
          const nx = next.x / unit;
          const ny = next.y / unit;
          v.ax = nx * clamp(magnitude2(next.x, next.y), 0.6, 6);
          v.ay = ny * clamp(magnitude2(next.x, next.y), 0.6, 5);
        }
      } else {
        const a2 = Math.max(0.36, v.ax * v.ax + v.ay * v.ay);
        v.lambda = clamp((world.x * v.ax + world.y * v.ay) / a2, -3, 3);
      }
    }

    if (this.mode === "section") {
      const p = { x: v.px, y: v.py };
      const q = { x: v.qx, y: v.qy };
      const dx = q.x - p.x;
      const dy = q.y - p.y;
      const len2 = dx * dx + dy * dy || 1;
      if (this.drag.id === "P") {
        v.px = clamp(world.x, -7, 7);
        v.py = clamp(world.y, -5, 5);
      } else if (this.drag.id === "Q") {
        v.qx = clamp(world.x, -7, 7);
        v.qy = clamp(world.y, -5, 5);
      } else {
        v.t = clamp(((world.x - p.x) * dx + (world.y - p.y) * dy) / len2, 0, 1);
      }
    }

    if (this.mode === "dot") {
      if (this.drag.id === "A") {
        v.ax = clamp(world.x, -7, 7);
        v.ay = clamp(world.y, -5, 5);
      } else {
        v.bx = clamp(world.x, -7, 7);
        v.by = clamp(world.y, -5, 5);
      }
    }

    if (this.mode === "cross") {
      if (this.drag.id === "A-z") {
        const p = this.project3D(v.ax, v.ay, v.az);
        v.az = clamp(v.az - (screenPoint.y - p.y) / this.screenScale(), -4, 4);
      } else if (this.drag.id === "B-z") {
        const p = this.project3D(v.bx, v.by, v.bz);
        v.bz = clamp(v.bz - (screenPoint.y - p.y) / this.screenScale(), -4, 4);
      } else if (this.drag.id === "A-xy") {
        const next = this.invertProjectedXY(screenPoint.x, screenPoint.y, v.az);
        v.ax = clamp(next.x, -5, 5);
        v.ay = clamp(next.y, -5, 5);
      } else if (this.drag.id === "B-xy") {
        const next = this.invertProjectedXY(screenPoint.x, screenPoint.y, v.bz);
        v.bx = clamp(next.x, -5, 5);
        v.by = clamp(next.y, -5, 5);
      }
    }
  }

  currentSnapshot() {
    const v = this.data[this.mode];
    if (this.mode === "basics") {
      const mag = magnitude3(v.x, v.y, v.z);
      const alpha = mag ? deg(Math.acos(clamp(v.x / mag, -1, 1))) : 0;
      const beta = mag ? deg(Math.acos(clamp(v.y / mag, -1, 1))) : 0;
      const gamma = mag ? deg(Math.acos(clamp(v.z / mag, -1, 1))) : 0;
      return {
        readout: [
          ["A", `(${fmt(v.x)}, ${fmt(v.y)}, ${fmt(v.z)})`],
          ["|A|", `${fmt(mag)} units`],
          ["α β γ", `${fmt(alpha, 1)}°  ${fmt(beta, 1)}°  ${fmt(gamma, 1)}°`],
        ],
        note: "Drag A in the plane. Drag the small z handle to change depth.",
        formula: "A = xi + yj + zk",
        challengeValue: v,
      };
    }

    if (this.mode === "types") {
      const am = magnitude2(v.ax, v.ay);
      const bm = magnitude2(v.bx, v.by);
      const collinear = am * bm > 0.05 && Math.abs(cross2(v.ax, v.ay, v.bx, v.by)) < 0.08;
      let relation = "different directions";
      if (am < 0.08) relation = "A is zero";
      else if (bm < 0.08) relation = "B is zero";
      else if (Math.abs(am - 1) < 0.05) relation = "A is unit";
      else if (Math.abs(bm - 1) < 0.05) relation = "B is unit";
      else if (Math.hypot(v.ax - v.bx, v.ay - v.by) < 0.12) relation = "equal vectors";
      else if (Math.hypot(v.ax + v.bx, v.ay + v.by) < 0.12) relation = "negative vectors";
      else if (collinear) relation = "collinear vectors";
      return {
        readout: [
          ["A", `(${fmt(v.ax)}, ${fmt(v.ay)})`],
          ["B", `(${fmt(v.bx)}, ${fmt(v.by)})`],
          ["Relation", relation],
        ],
        note: "Grab either endpoint. The classification updates from the actual components.",
        formula: "A = λB for collinear vectors",
        challengeValue: v,
      };
    }

    if (this.mode === "addition") {
      const rx = v.ax + v.bx;
      const ry = v.ay + v.by;
      return {
        readout: [
          ["A", `(${fmt(v.ax)}, ${fmt(v.ay)})`],
          ["B", `(${fmt(v.bx)}, ${fmt(v.by)})`],
          ["R = A + B", `(${fmt(rx)}, ${fmt(ry)})`],
        ],
        note: "Drag A or B. The head-to-tail construction, parallelogram and resultant all move together.",
        formula: "R = A + B",
        challengeValue: v,
      };
    }

    if (this.mode === "scalar") {
      const sx = v.lambda * v.ax;
      const sy = v.lambda * v.ay;
      return {
        readout: [
          ["A", `(${fmt(v.ax)}, ${fmt(v.ay)})`],
          ["λ", fmt(v.lambda, 2)],
          ["λA", `(${fmt(sx)}, ${fmt(sy)})`],
        ],
        note: "Drag the blue A endpoint, or drag the green λA endpoint to scale and reverse it.",
        formula: "λA = (λa₁)i + (λa₂)j",
        challengeValue: v,
      };
    }

    if (this.mode === "section") {
      const rx = v.px + (v.qx - v.px) * v.t;
      const ry = v.py + (v.qy - v.py) * v.t;
      const ratio = v.t >= 0.5 ? `${fmt(v.t / (1 - v.t || 1))}:1` : `1:${fmt((1 - v.t) / (v.t || 1))}`;
      return {
        readout: [
          ["P", `(${fmt(v.px)}, ${fmt(v.py)})`],
          ["R", `(${fmt(rx)}, ${fmt(ry)})`],
          ["Q", `(${fmt(v.qx)}, ${fmt(v.qy)})`],
          ["PR : RQ", ratio],
        ],
        note: "Drag P or Q. Drag R along the segment to change the division ratio.",
        formula: "R = (mQ + nP)/(m+n)",
        challengeValue: v,
      };
    }

    if (this.mode === "dot") {
      const dot = dot2(v.ax, v.ay, v.bx, v.by);
      const angle = deg(angle2(v.ax, v.ay, v.bx, v.by));
      const aMag = magnitude2(v.ax, v.ay);
      const projection = aMag ? dot / aMag : 0;
      const cross = Math.abs(cross2(v.ax, v.ay, v.bx, v.by));
      return {
        readout: [
          ["θ", `${fmt(angle, 1)}°`],
          ["A · B", fmt(dot, 2)],
          ["Projection of B on A", `${fmt(projection, 2)} units`],
        ],
        note: "Drag B around A. The projection foot and dot product show exactly how much points along A.",
        formula: "A · B = |A||B| cos θ",
        challengeValue: { ...v, dot, cross2: cross },
      };
    }

    const A = { x: v.ax, y: v.ay, z: v.az };
    const B = { x: v.bx, y: v.by, z: v.bz };
    const C = cross3(A, B);
    const dot = dot3(A, B);
    const crossMagnitude = magnitude3(C.x, C.y, C.z);
    return {
      readout: [
        ["A", `(${fmt(v.ax)}, ${fmt(v.ay)}, ${fmt(v.az)})`],
        ["B", `(${fmt(v.bx)}, ${fmt(v.by)}, ${fmt(v.bz)})`],
        ["A × B", `(${fmt(C.x)}, ${fmt(C.y)}, ${fmt(C.z)})`],
        ["Area", `${fmt(crossMagnitude, 2)} units²`],
      ],
      note: "Drag each endpoint in the plane. Drag its z handle vertically to change depth.",
      formula: "A × B = |A||B|sinθ n̂",
      challengeValue: { ...v, dot, crossMagnitude },
    };
  }

  emitUIThrottled() {
    if (this.uiFramePending) return;
    this.uiFramePending = true;
    requestAnimationFrame(() => {
      this.uiFramePending = false;
      if (!this.destroyed) this.emitUI();
    });
  }

  emitUI() {
    const snapshot = this.currentSnapshot();
    const challenge = CHALLENGES[this.mode]?.[this.challengeIndex];
    this.onUIChange?.({
      mode: this.mode,
      challengeIndex: this.challengeIndex,
      challengeComplete: Boolean(challenge && challenge.done(snapshot.challengeValue)),
      readout: snapshot.readout,
      note: snapshot.note,
      formula: snapshot.formula,
    });
  }

  render() {
    if (this.destroyed) return;
    if (this.framePending) return;
    this.framePending = true;
    requestAnimationFrame(() => {
      this.framePending = false;
      if (this.destroyed) return;
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
      ctx.fillStyle = "#06080b";
      ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);
      this.drawGrid(ctx);
      if (this.mode === "basics") this.renderBasics(ctx);
      if (this.mode === "types") this.renderTypes(ctx);
      if (this.mode === "addition") this.renderAddition(ctx);
      if (this.mode === "scalar") this.renderScalar(ctx);
      if (this.mode === "section") this.renderSection(ctx);
      if (this.mode === "dot") this.renderDot(ctx);
      if (this.mode === "cross") this.renderCross(ctx);
      this.drawOrigin(ctx);
    });
  }

  drawGrid(ctx) {
    const scale = this.screenScale();
    const step = scale < 34 ? 2 : 1;
    const left = this.camera.x - this.cssWidth / 2 / scale;
    const right = this.camera.x + this.cssWidth / 2 / scale;
    const top = this.camera.y + this.cssHeight / 2 / scale;
    const bottom = this.camera.y - this.cssHeight / 2 / scale;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.fillStyle = "rgba(230,245,255,0.28)";
    ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

    const xStart = Math.floor(left / step) * step;
    const yStart = Math.floor(bottom / step) * step;
    for (let x = xStart; x <= right; x += step) {
      const p = this.worldToScreen(x, 0);
      ctx.beginPath();
      ctx.moveTo(Math.round(p.x) + 0.5, 0);
      ctx.lineTo(Math.round(p.x) + 0.5, this.cssHeight);
      ctx.stroke();
    }
    for (let y = yStart; y <= top; y += step) {
      const p = this.worldToScreen(0, y);
      ctx.beginPath();
      ctx.moveTo(0, Math.round(p.y) + 0.5);
      ctx.lineTo(this.cssWidth, Math.round(p.y) + 0.5);
      ctx.stroke();
    }

    const xAxis = this.worldToScreen(0, 0).y;
    const yAxis = this.worldToScreen(0, 0).x;
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.4;
    if (xAxis >= 0 && xAxis <= this.cssHeight) {
      ctx.beginPath();
      ctx.moveTo(0, xAxis);
      ctx.lineTo(this.cssWidth, xAxis);
      ctx.stroke();
    }
    if (yAxis >= 0 && yAxis <= this.cssWidth) {
      ctx.beginPath();
      ctx.moveTo(yAxis, 0);
      ctx.lineTo(yAxis, this.cssHeight);
      ctx.stroke();
    }

    const labelStep = step * (scale < 24 ? 2 : 1);
    for (let x = Math.ceil(left / labelStep) * labelStep; x <= right; x += labelStep) {
      if (x === 0) continue;
      const p = this.worldToScreen(x, 0);
      if (p.x > 20 && p.x < this.cssWidth - 30 && xAxis > 10 && xAxis < this.cssHeight - 10) {
        ctx.fillText(String(x), p.x + 4, xAxis - 6);
      }
    }
    for (let y = Math.ceil(bottom / labelStep) * labelStep; y <= top; y += labelStep) {
      if (y === 0) continue;
      const p = this.worldToScreen(0, y);
      if (p.y > 16 && p.y < this.cssHeight - 20 && yAxis > 24 && yAxis < this.cssWidth - 10) {
        ctx.fillText(String(y), yAxis + 7, p.y - 4);
      }
    }
    ctx.restore();
  }

  drawOrigin(ctx) {
    const p = this.worldToScreen(0, 0);
    if (p.x < -20 || p.x > this.cssWidth + 20 || p.y < -20 || p.y > this.cssHeight + 20) return;
    ctx.save();
    ctx.fillStyle = "#eefbff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(238,251,255,0.5)";
    ctx.font = "11px ui-monospace, monospace";
    ctx.fillText("O", p.x + 8, p.y - 8);
    ctx.restore();
  }

  drawVector2(ctx, ax, ay, bx, by, color, label, options = {}) {
    const a = this.worldToScreen(ax, ay);
    const b = this.worldToScreen(bx, by);
    this.drawArrow(ctx, a.x, a.y, b.x, b.y, color, options.width ?? 3, options.dash);
    if (label) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      this.label(ctx, label, b.x + nx * 12, b.y + ny * 12, color);
    }
    if (options.handle !== false) this.drawHandle(ctx, b, color, options.selected);
    return { a, b };
  }

  drawArrow(ctx, x1, y1, x2, y2, color, width = 3, dash = null) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx / len;
    const uy = dy / len;
    const size = Math.min(18, Math.max(9, width * 3.2));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * size - uy * size * 0.55, y2 - uy * size + ux * size * 0.55);
    ctx.lineTo(x2 - ux * size + uy * size * 0.55, y2 - uy * size - ux * size * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawHandle(ctx, p, color, selected = false) {
    ctx.save();
    ctx.fillStyle = "#06080b";
    ctx.strokeStyle = color;
    ctx.lineWidth = selected ? 3.5 : 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, selected ? 9 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (selected) {
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  label(ctx, text, x, y, color = "#fff", size = 14) {
    ctx.save();
    ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = color;
    ctx.shadowColor = "rgba(0,0,0,0.75)";
    ctx.shadowBlur = 8;
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawPill(ctx, text, x, y, color) {
    ctx.save();
    ctx.font = "700 11px ui-monospace, monospace";
    const width = ctx.measureText(text).width + 18;
    ctx.fillStyle = "rgba(6,8,11,0.88)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y - 16, width, 26, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f2fbff";
    ctx.fillText(text, x + 9, y + 1);
    ctx.restore();
  }

  renderBasics(ctx) {
    const v = this.data.basics;
    const origin = this.project3D(0, 0, 0);
    const end = this.project3D(v.x, v.y, v.z);
    const xy = this.project3D(v.x, v.y, 0);
    const xAxis = this.project3D(2.2, 0, 0);
    const yAxis = this.project3D(0, 2.2, 0);
    const zAxis = this.project3D(0, 0, 2.2);

    ctx.save();
    this.drawArrow(ctx, origin.x, origin.y, xAxis.x, xAxis.y, "rgba(255,255,255,0.35)", 2);
    this.drawArrow(ctx, origin.x, origin.y, yAxis.x, yAxis.y, "rgba(255,255,255,0.35)", 2);
    this.drawArrow(ctx, origin.x, origin.y, zAxis.x, zAxis.y, "rgba(255,255,255,0.35)", 2);
    this.label(ctx, "x", xAxis.x + 7, xAxis.y + 3, "rgba(255,255,255,0.5)", 12);
    this.label(ctx, "y", yAxis.x - 18, yAxis.y + 3, "rgba(255,255,255,0.5)", 12);
    this.label(ctx, "z", zAxis.x + 8, zAxis.y - 2, "rgba(255,255,255,0.5)", 12);

    this.drawVector3(ctx, 0, 0, 0, v.x, v.y, v.z, "#61d7ff", "A", this.drag?.id === "A-xy" || this.drag?.id === "A-z");
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(xy.x, xy.y);
    ctx.stroke();
    ctx.setLineDash([]);

    this.drawHandle(ctx, end, "#61d7ff", this.drag?.id === "A-xy");
    this.drawHandle(ctx, { x: end.x, y: end.y - this.screenScale() }, "#9aa8b3", this.drag?.id === "A-z");
    this.label(ctx, "z", end.x + 11, end.y - this.screenScale() - 8, "#9aa8b3", 11);
    this.drawPill(ctx, `A = (${fmt(v.x)}, ${fmt(v.y)}, ${fmt(v.z)})`, end.x + 20, end.y - 8, "#61d7ff");
    ctx.restore();
  }

  drawVector3(ctx, ax, ay, az, bx, by, bz, color, label, selected = false, dash = null) {
    const a = this.project3D(ax, ay, az);
    const b = this.project3D(bx, by, bz);
    this.drawArrow(ctx, a.x, a.y, b.x, b.y, color, 3.2, dash);
    this.drawHandle(ctx, b, color, selected);
    this.label(ctx, label, b.x + 10, b.y - 10, color);
    return { a, b };
  }

  renderTypes(ctx) {
    const v = this.data.types;
    this.drawVector2(ctx, 0, 0, v.ax, v.ay, "#61d7ff", "A", { selected: this.drag?.id === "A" });
    this.drawVector2(ctx, -4.2, -2.4, -4.2 + v.bx, -2.4 + v.by, "#ffbd59", "B", { selected: this.drag?.id === "B" });
    const aEnd = this.worldToScreen(v.ax, v.ay);
    const bStart = this.worldToScreen(-4.2, -2.4);
    const bEnd = this.worldToScreen(-4.2 + v.bx, -2.4 + v.by);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.setLineDash([6, 7]);
    ctx.beginPath();
    ctx.moveTo(bStart.x, bStart.y);
    ctx.lineTo(bEnd.x, bEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);
    this.drawPill(ctx, `|A| = ${fmt(magnitude2(v.ax, v.ay))}`, aEnd.x + 16, aEnd.y - 6, "#61d7ff");
    this.drawPill(ctx, `|B| = ${fmt(magnitude2(v.bx, v.by))}`, bEnd.x + 16, bEnd.y - 6, "#ffbd59");
    ctx.restore();
  }

  renderAddition(ctx) {
    const v = this.data.addition;
    const rx = v.ax + v.bx;
    const ry = v.ay + v.by;
    this.drawVector2(ctx, 0, 0, v.ax, v.ay, "#61d7ff", "A", { selected: this.drag?.id === "A" });
    this.drawVector2(ctx, 0, 0, v.bx, v.by, "rgba(255,189,89,0.6)", "B", { handle: false, dash: [7, 7] });
    this.drawVector2(ctx, v.ax, v.ay, rx, ry, "#ffbd59", "B", { selected: this.drag?.id === "B" });
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.setLineDash([7, 7]);
    const a = this.worldToScreen(v.ax, v.ay);
    const b = this.worldToScreen(v.bx, v.by);
    const r = this.worldToScreen(rx, ry);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(r.x, r.y);
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
    ctx.setLineDash([]);
    this.drawArrow(ctx, this.worldToScreen(0, 0).x, this.worldToScreen(0, 0).y, r.x, r.y, "#82ff9a", 4);
    this.drawHandle(ctx, this.worldToScreen(v.ax, v.ay), "#61d7ff", this.drag?.id === "A");
    this.drawHandle(ctx, this.worldToScreen(v.bx, v.by), "#ffbd59", this.drag?.id === "B");
    this.drawPill(ctx, `R = (${fmt(rx)}, ${fmt(ry)})`, r.x + 18, r.y - 8, "#82ff9a");
    ctx.restore();
  }

  renderScalar(ctx) {
    const v = this.data.scalar;
    const sx = v.ax * v.lambda;
    const sy = v.ay * v.lambda;
    const origin = this.worldToScreen(0, 0);
    const a = this.worldToScreen(v.ax, v.ay);
    const s = this.worldToScreen(sx, sy);
    this.drawVector2(ctx, 0, 0, v.ax, v.ay, "#61d7ff", "A", { selected: this.drag?.id === "A" });
    this.drawVector2(ctx, 0, 0, sx, sy, "#82ff9a", "λA", { selected: this.drag?.id === "S" });
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.setLineDash([]);
    this.drawPill(ctx, `λ = ${fmt(v.lambda, 2)}`, s.x + 18, s.y - 8, "#82ff9a");
    if (v.lambda < -0.05) {
      this.label(ctx, "opposite direction", origin.x + 16, origin.y + 34, "#ff8e8e", 11);
    } else if (Math.abs(v.lambda) < 0.05) {
      this.label(ctx, "zero vector", origin.x + 16, origin.y + 34, "#c8d6df", 11);
    }
    ctx.restore();
  }

  renderSection(ctx) {
    const v = this.data.section;
    const rx = v.px + (v.qx - v.px) * v.t;
    const ry = v.py + (v.qy - v.py) * v.t;
    const p = this.worldToScreen(v.px, v.py);
    const q = this.worldToScreen(v.qx, v.qy);
    const r = this.worldToScreen(rx, ry);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.32)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = "rgba(255,189,89,0.45)";
    ctx.beginPath();
    ctx.moveTo(this.worldToScreen(0, 0).x, this.worldToScreen(0, 0).y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
    ctx.setLineDash([]);
    this.drawHandle(ctx, p, "#61d7ff", this.drag?.id === "P");
    this.drawHandle(ctx, q, "#ffbd59", this.drag?.id === "Q");
    this.drawHandle(ctx, r, "#82ff9a", this.drag?.id === "R");
    this.label(ctx, "P", p.x + 10, p.y - 10, "#61d7ff");
    this.label(ctx, "Q", q.x + 10, q.y - 10, "#ffbd59");
    this.label(ctx, "R", r.x + 10, r.y - 10, "#82ff9a");
    const ratio = v.t >= 0.5 ? `${fmt(v.t / (1 - v.t || 1))} : 1` : `1 : ${fmt((1 - v.t) / (v.t || 1))}`;
    this.drawPill(ctx, `PR:RQ = ${ratio}`, r.x + 20, r.y + 26, "#82ff9a");
    ctx.restore();
  }

  renderDot(ctx) {
    const v = this.data.dot;
    const origin = this.worldToScreen(0, 0);
    const a = this.worldToScreen(v.ax, v.ay);
    const b = this.worldToScreen(v.bx, v.by);
    const am = magnitude2(v.ax, v.ay);
    const footScale = am ? dot2(v.bx, v.by, v.ax, v.ay) / (am * am) : 0;
    const foot = this.worldToScreen(v.ax * footScale, v.ay * footScale);
    this.drawVector2(ctx, 0, 0, v.ax, v.ay, "#61d7ff", "A", { selected: this.drag?.id === "A" });
    this.drawVector2(ctx, 0, 0, v.bx, v.by, "#ffbd59", "B", { selected: this.drag?.id === "B" });
    ctx.save();
    ctx.strokeStyle = "rgba(130,255,154,0.7)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#82ff9a";
    ctx.beginPath();
    ctx.arc(foot.x, foot.y, 5, 0, Math.PI * 2);
    ctx.fill();

    const theta = angle2(v.ax, v.ay, v.bx, v.by);
    const radius = Math.min(80, am * this.screenScale() * 0.42);
    const start = Math.atan2(-v.ay, v.ax);
    const end = Math.atan2(-v.by, v.bx);
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, radius, start, end, false);
    ctx.stroke();
    this.drawPill(ctx, `θ = ${fmt(deg(theta), 1)}°`, origin.x + radius * 0.65, origin.y - radius * 0.55, "#f2fbff");
    ctx.restore();
  }

  renderCross(ctx) {
    const v = this.data.cross;
    const A = { x: v.ax, y: v.ay, z: v.az };
    const B = { x: v.bx, y: v.by, z: v.bz };
    const C = cross3(A, B);
    const origin = this.project3D(0, 0, 0);
    const a = this.project3D(v.ax, v.ay, v.az);
    const b = this.project3D(v.bx, v.by, v.bz);
    const sum = this.project3D(v.ax + v.bx, v.ay + v.by, v.az + v.bz);
    const cMag = magnitude3(C.x, C.y, C.z);
    const cScale = cMag > 5 ? 5 / cMag : 1;
    const c = this.project3D(C.x * cScale, C.y * cScale, C.z * cScale);

    ctx.save();
    this.drawAxis3D(ctx);
    this.drawArrow(ctx, origin.x, origin.y, a.x, a.y, "#61d7ff", 3.2);
    this.drawArrow(ctx, origin.x, origin.y, b.x, b.y, "#ffbd59", 3.2);
    this.drawArrow(ctx, origin.x, origin.y, c.x, c.y, "#82ff9a", 4, [8, 6]);

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.setLineDash([6, 7]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(sum.x, sum.y);
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(sum.x, sum.y);
    ctx.stroke();
    ctx.setLineDash([]);

    this.drawHandle(ctx, a, "#61d7ff", this.drag?.id === "A-xy");
    this.drawHandle(ctx, { x: a.x, y: a.y - this.screenScale() }, "#9aa8b3", this.drag?.id === "A-z");
    this.drawHandle(ctx, b, "#ffbd59", this.drag?.id === "B-xy");
    this.drawHandle(ctx, { x: b.x, y: b.y - this.screenScale() }, "#9aa8b3", this.drag?.id === "B-z");
    this.label(ctx, "A", a.x + 10, a.y - 10, "#61d7ff");
    this.label(ctx, "B", b.x + 10, b.y - 10, "#ffbd59");
    this.label(ctx, "A × B", c.x + 12, c.y - 12, "#82ff9a");
    this.label(ctx, "z", a.x + 10, a.y - this.screenScale() - 8, "#9aa8b3", 11);
    this.label(ctx, "z", b.x + 10, b.y - this.screenScale() - 8, "#9aa8b3", 11);
    this.drawPill(ctx, `|A × B| = ${fmt(cMag)}`, origin.x + 24, origin.y + 48, "#82ff9a");
    this.drawPill(ctx, "green = perpendicular vector", origin.x + 24, origin.y + 80, "#82ff9a");
    ctx.restore();
  }

  drawAxis3D(ctx) {
    const o = this.project3D(0, 0, 0);
    const x = this.project3D(2.1, 0, 0);
    const y = this.project3D(0, 2.1, 0);
    const z = this.project3D(0, 0, 2.1);
    this.drawArrow(ctx, o.x, o.y, x.x, x.y, "rgba(255,255,255,0.27)", 2);
    this.drawArrow(ctx, o.x, o.y, y.x, y.y, "rgba(255,255,255,0.27)", 2);
    this.drawArrow(ctx, o.x, o.y, z.x, z.y, "rgba(255,255,255,0.27)", 2);
    this.label(ctx, "x", x.x + 7, x.y + 3, "rgba(255,255,255,0.45)", 11);
    this.label(ctx, "y", y.x - 18, y.y + 3, "rgba(255,255,255,0.45)", 11);
    this.label(ctx, "z", z.x + 8, z.y - 4, "rgba(255,255,255,0.45)", 11);
  }
}
