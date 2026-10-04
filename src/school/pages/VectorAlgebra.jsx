import { useState } from "react";
import "./VectorAlgebra.css";

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export default function VectorAgebra() {
  const [section, setSection] = useState("add");
  const [ax, setAx] = useState(4);
  const [ay, setAy] = useState(2);
  const [bx, setBx] = useState(2);
  const [by, setBy] = useState(4);
  const [showFormula, setShowFormula] = useState(false);

  const rx = ax + bx;
  const ry = ay + by;

  const magnitudeA = Math.hypot(ax, ay);
  const magnitudeB = Math.hypot(bx, by);
  const magnitudeR = Math.hypot(rx, ry);

  const angleA = Math.atan2(ay, ax) * 180 / Math.PI;
  const angleB = Math.atan2(by, bx) * 180 / Math.PI;
  const angleR = Math.atan2(ry, rx) * 180 / Math.PI;

  const reset = () => {
    setAx(4);
    setAy(2);
    setBx(2);
    setBy(4);
    setShowFormula(false);
  };

  return (
    <div className="vector-page">

      <header className="vector-header">
        <div>
          <span>CLASS XII · MATHEMATICS</span>
          <h1>Vector Algebra</h1>
          <p>Visualise. Manipulate. Understand.</p>
        </div>

        <button className="vector-reset" onClick={reset}>
          ↻ Reset
        </button>
      </header>

      <nav className="vector-nav">
        <button
          className={section === "add" ? "active" : ""}
          onClick={() => setSection("add")}
        >
          Vector Addition
        </button>

        <button
          className={section === "components" ? "active" : ""}
          onClick={() => setSection("components")}
        >
          Components
        </button>

        <button
          className={section === "dot" ? "active" : ""}
          onClick={() => setSection("dot")}
        >
          Dot Product
        </button>
      </nav>

      {section === "add" && (
        <main className="vector-layout">

          <section className="vector-main">

            <div className="vector-title">
              <div>
                <span>INTERACTIVE VECTOR LAB</span>
                <h2>Change the components. Watch the resultant move.</h2>
              </div>

              <div className="result-chip">
                R = ({rx}, {ry})
              </div>
            </div>

            <VectorCanvas
              ax={ax}
              ay={ay}
              bx={bx}
              by={by}
              rx={rx}
              ry={ry}
            />

            <div className="vector-controls">

              <VectorControl
                name="Vector A"
                x={ax}
                y={ay}
                setX={setAx}
                setY={setAy}
              />

              <VectorControl
                name="Vector B"
                x={bx}
                y={by}
                setX={setBx}
                setY={setBy}
              />

            </div>

          </section>

          <aside className="vector-sidebar">

            <div className="magnitude-card">

              <span>RESULTANT |R|</span>

              <strong>
                {magnitudeR.toFixed(2)}
              </strong>

              <small>units</small>

              <div className="result-equation">
                R = ({rx}, {ry})
              </div>

            </div>

            <div className="stats-card">

              <Stat
                label="Vector A"
                value={`${magnitudeA.toFixed(2)} units`}
                angle={`${angleA.toFixed(1)}°`}
              />

              <Stat
                label="Vector B"
                value={`${magnitudeB.toFixed(2)} units`}
                angle={`${angleB.toFixed(1)}°`}
              />

              <Stat
                label="Resultant"
                value={`${magnitudeR.toFixed(2)} units`}
                angle={`${angleR.toFixed(1)}°`}
              />

            </div>

            <button
              className="vector-formula"
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>VECTOR ADDITION</span>

              <strong>
                A + B = R
              </strong>

              {showFormula && (
                <em>
                  (a₁ + b₁)i + (a₂ + b₂)j
                </em>
              )}
            </button>

          </aside>

        </main>
      )}

      {section === "components" && (
        <main className="vector-concept">

          <span>COMPONENT FORM</span>

          <h2>
            Every vector can be described by its components.
          </h2>

          <div className="component-grid">

            <article>
              <b>i COMPONENT</b>
              <strong>Aₓ</strong>
              <p>
                Horizontal component of the vector.
              </p>
            </article>

            <article>
              <b>j COMPONENT</b>
              <strong>Aᵧ</strong>
              <p>
                Vertical component of the vector.
              </p>
            </article>

            <article>
              <b>MAGNITUDE</b>
              <strong>|A| = √(Aₓ² + Aᵧ²)</strong>
              <p>
                Length of the vector.
              </p>
            </article>

          </div>

          <div className="big-equation">
            <span>A VECTOR</span>
            <strong>
              A = Aₓ i + Aᵧ j
            </strong>
          </div>

        </main>
      )}

      {section === "dot" && (
        <main className="vector-concept">

          <span>SCALAR PRODUCT</span>

          <h2>
            The dot product tells us how much two vectors point in the same direction.
          </h2>

          <div className="dot-demo">

            <div>
              <span>Formula</span>
              <strong>
                A · B = |A||B| cos θ
              </strong>
            </div>

            <div>
              <span>Component form</span>
              <strong>
                A · B = AₓBₓ + AᵧBᵧ
              </strong>
            </div>

          </div>

          <div className="dot-cases">

            <div>
              <b>θ = 0°</b>
              <p>Maximum positive dot product.</p>
            </div>

            <div>
              <b>θ = 90°</b>
              <p>Dot product is zero.</p>
            </div>

            <div>
              <b>θ = 180°</b>
              <p>Maximum negative dot product.</p>
            </div>

          </div>

        </main>
      )}

      <footer className="vector-footer">
        <span>VECTOR ALGEBRA</span>
        <span>INTERACTIVE CLASSROOM MODULE</span>
      </footer>

    </div>
  );
}

function VectorControl({
  name,
  x,
  y,
  setX,
  setY
}) {
  return (
    <div className="vector-control">

      <div className="vector-control-heading">
        <strong>{name}</strong>
        <span>({x}, {y})</span>
      </div>

      <label>
        <span>X component</span>
        <input
          type="range"
          min="-6"
          max="6"
          step="1"
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
        />
      </label>

      <label>
        <span>Y component</span>
        <input
          type="range"
          min="-6"
          max="6"
          step="1"
          value={y}
          onChange={(e) => setY(Number(e.target.value))}
        />
      </label>

    </div>
  );
}

function Stat({ label, value, angle }) {
  return (
    <div className="stat-row">
      <strong>{label}</strong>
      <span>{value}</span>
      <small>{angle}</small>
    </div>
  );
}

function VectorCanvas({
  ax,
  ay,
  bx,
  by,
  rx,
  ry
}) {
  const width = 760;
  const height = 420;

  const origin = {
    x: width / 2,
    y: height / 2
  };

  const scale = 32;

  const point = (x, y) => ({
    x: origin.x + x * scale,
    y: origin.y - y * scale
  });

  const A = point(ax, ay);
  const B = point(bx, by);
  const R = point(rx, ry);

  const tailB = point(ax, ay);

  return (
    <div className="vector-canvas-wrap">

      <svg
        className="vector-canvas"
        viewBox={`0 0 ${width} ${height}`}
      >

        <defs>

          <marker
            id="arrowA"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill="#55cfff"
            />
          </marker>

          <marker
            id="arrowB"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill="#ffbd59"
            />
          </marker>

          <marker
            id="arrowR"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path
              d="M0,0 L0,6 L9,3 z"
              fill="#7dff9a"
            />
          </marker>

        </defs>

        {/* Grid */}

        {Array.from({ length: 25 }).map((_, i) => {
          const x = i * scale;
          return (
            <line
              key={`v-${i}`}
              x1={x}
              y1="0"
              x2={x}
              y2={height}
              className="grid-line"
            />
          );
        })}

        {Array.from({ length: 15 }).map((_, i) => {
          const y = i * scale;
          return (
            <line
              key={`h-${i}`}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              className="grid-line"
            />
          );
        })}

        {/* Axes */}

        <line
          x1="0"
          y1={origin.y}
          x2={width}
          y2={origin.y}
          className="axis-line"
        />

        <line
          x1={origin.x}
          y1="0"
          x2={origin.x}
          y2={height}
          className="axis-line"
        />

        {/* Parallelogram construction */}

        <line
          x1={A.x}
          y1={A.y}
          x2={R.x}
          y2={R.y}
          className="construction-line"
        />

        <line
          x1={B.x}
          y1={B.y}
          x2={R.x}
          y2={R.y}
          className="construction-line"
        />

        {/* Vector A */}

        <line
          x1={origin.x}
          y1={origin.y}
          x2={A.x}
          y2={A.y}
          className="vector-a"
          markerEnd="url(#arrowA)"
        />

        {/* Vector B translated */}

        <line
          x1={A.x}
          y1={A.y}
          x2={R.x}
          y2={R.y}
          className="vector-b"
          markerEnd="url(#arrowB)"
        />

        {/* Resultant */}

        <line
          x1={origin.x}
          y1={origin.y}
          x2={R.x}
          y2={R.y}
          className="vector-r"
          markerEnd="url(#arrowR)"
        />

        {/* Labels */}

        <text
          x={A.x + 12}
          y={A.y - 12}
          className="vector-label a-label"
        >
          A
        </text>

        <text
          x={R.x + 12}
          y={R.y - 12}
          className="vector-label b-label"
        >
          B
        </text>

        <text
          x={(origin.x + R.x) / 2 + 12}
          y={(origin.y + R.y) / 2 - 10}
          className="vector-label r-label"
        >
          R = A + B
        </text>

        <circle
          cx={origin.x}
          cy={origin.y}
          r="5"
          className="origin-point"
        />

      </svg>

      <div className="canvas-legend">

        <span>
          <i className="legend-a" />
          A
        </span>

        <span>
          <i className="legend-b" />
          B
        </span>

        <span>
          <i className="legend-r" />
          Resultant
        </span>

      </div>

    </div>
  );
}