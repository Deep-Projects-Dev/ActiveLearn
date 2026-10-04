import React, { useMemo, useState } from "react";
import "./WaveOptics.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const wavelengthColour = (nm) => {
  if (nm < 490) return "#5BA7FF";
  if (nm < 560) return "#63D7A0";
  if (nm < 590) return "#FFE05A";
  if (nm < 620) return "#FFB347";
  return "#FF6666";
};

export default function WaveOptics() {
  const [wavelength, setWavelength] = useState(600);
  const [screenDistance, setScreenDistance] = useState(1.5);
  const [slitDistance, setSlitDistance] = useState(0.30);
  const [section, setSection] = useState("experiment");
  const [showFormula, setShowFormula] = useState(false);

  const fringeWidth = useMemo(() => {
    // β = λD/d
    return (
      ((wavelength * 1e-9 * screenDistance) /
        (slitDistance * 1e-3)) *
      1000
    );
  }, [wavelength, screenDistance, slitDistance]);

  const colour = wavelengthColour(wavelength);

  const fringeSpacing = clamp(
    12 + fringeWidth * 35,
    12,
    55
  );

  const reset = () => {
    setWavelength(600);
    setScreenDistance(1.5);
    setSlitDistance(0.30);
    setShowFormula(false);
  };

  return (
    <div className="wave-page">
      <header className="wave-header">
        <div>
          <div className="wave-kicker">CLASS XII · PHYSICS</div>
          <h1>Wave Optics</h1>
          <p>Young's Double-Slit Experiment</p>
        </div>

        <button className="reset-button" onClick={reset}>
          ↻ Reset
        </button>
      </header>

      <nav className="wave-nav">
        <button
          className={section === "experiment" ? "active" : ""}
          onClick={() => setSection("experiment")}
        >
          Experiment
        </button>

        <button
          className={section === "concept" ? "active" : ""}
          onClick={() => setSection("concept")}
        >
          Concept
        </button>

        <button
          className={section === "predict" ? "active" : ""}
          onClick={() => setSection("predict")}
        >
          Predict
        </button>
      </nav>

      {section === "experiment" && (
        <main className="experiment-layout">

          <section className="experiment-panel">

            <div className="panel-heading">
              <div>
                <span>INTERACTIVE EXPERIMENT</span>
                <h2>Change the variables. Watch the fringes.</h2>
              </div>

              <div
                className="laser-indicator"
                style={{ "--laser": colour }}
              >
                <i />
                {wavelength} nm
              </div>
            </div>

            <div className="experiment-stage">

              <div className="source-column">
                <div
                  className="laser"
                  style={{ "--laser": colour }}
                />

                <strong>Light source</strong>
                <small>Monochromatic</small>
              </div>

              <div className="wave-zone">

                <div className="incoming-waves">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <span
                      key={index}
                      style={{
                        animationDelay: `${index * -0.35}s`,
                        borderColor: colour
                      }}
                    />
                  ))}
                </div>

                <div className="double-slit">
                  <div className="slit-gap" />
                  <div className="slit-gap" />
                </div>

                <div className="outgoing-waves">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      style={{
                        animationDelay: `${index * -0.5}s`,
                        borderColor: colour
                      }}
                    />
                  ))}
                </div>

              </div>

              <div className="screen-area">
                <div className="screen-label">SCREEN</div>

                <div
                  className="fringe-screen"
                  style={{
                    "--fringe-space": `${fringeSpacing}px`,
                    "--fringe-colour": colour
                  }}
                >
                  {Array.from({ length: 11 }).map((_, index) => (
                    <i
                      key={index}
                      className={index === 5 ? "central-fringe" : ""}
                    />
                  ))}
                </div>

                <small>Bright → dark → bright → dark</small>
              </div>

            </div>

            <div className="controls">

              <Slider
                label="Wavelength λ"
                value={`${wavelength} nm`}
                min={450}
                max={700}
                step={10}
                current={wavelength}
                onChange={setWavelength}
              />

              <Slider
                label="Screen distance D"
                value={`${screenDistance.toFixed(1)} m`}
                min={0.5}
                max={3}
                step={0.1}
                current={screenDistance}
                onChange={setScreenDistance}
              />

              <Slider
                label="Slit separation d"
                value={`${slitDistance.toFixed(2)} mm`}
                min={0.10}
                max={0.60}
                step={0.01}
                current={slitDistance}
                onChange={setSlitDistance}
              />

            </div>
          </section>

          <aside className="experiment-sidebar">

            <div className="result-card">
              <span>FRINGE WIDTH β</span>

              <strong>
                {fringeWidth.toFixed(2)}
                <small> mm</small>
              </strong>

              <p>
                Distance between two consecutive bright
                fringes.
              </p>
            </div>

            <div className="rule-card">
              <span>OBSERVE</span>

              <h3>What happens?</h3>

              <ul>
                <li>Increase λ → wider fringes</li>
                <li>Increase D → wider fringes</li>
                <li>Increase d → narrower fringes</li>
              </ul>
            </div>

            <button
              className="formula-card"
              onClick={() => setShowFormula(!showFormula)}
            >
              <span>THE RELATIONSHIP</span>

              <strong>β ∝ λD / d</strong>

              {showFormula && (
                <em>β = λD/d</em>
              )}
            </button>

          </aside>
        </main>
      )}

      {section === "concept" && (
        <main className="concept-page">

          <span>THE IDEA</span>

          <h2>
            Why do bright and dark fringes appear?
          </h2>

          <div className="concept-grid">

            <article>
              <b>01</b>
              <h3>Two coherent waves</h3>
              <p>
                Light emerging from the two narrow slits
                behaves as two coherent wave sources.
              </p>
            </article>

            <article>
              <b>02</b>
              <h3>Path difference</h3>
              <p>
                At different points on the screen, the two
                waves travel slightly different distances.
              </p>
            </article>

            <article>
              <b>03</b>
              <h3>Interference</h3>
              <p>
                Waves reinforce when they arrive in phase
                and cancel when they arrive out of phase.
              </p>
            </article>

          </div>

          <div className="equation-row">

            <div>
              <span>Bright fringe</span>
              <strong>Δ = nλ</strong>
            </div>

            <div>
              <span>Dark fringe</span>
              <strong>Δ = (n + ½)λ</strong>
            </div>

            <div>
              <span>Fringe width</span>
              <strong>β = λD/d</strong>
            </div>

          </div>

        </main>
      )}

      {section === "predict" && (
        <main className="predict-page">

          <span>PREDICT → OBSERVE → EXPLAIN</span>

          <h2>
            What happens if the wavelength increases?
          </h2>

          <div className="prediction-options">

            <button
              onClick={() => setSection("experiment")}
            >
              Decreases
            </button>

            <button
              className="correct"
              onClick={() => setSection("experiment")}
            >
              Increases
            </button>

            <button
              onClick={() => setSection("experiment")}
            >
              Stays the same
            </button>

          </div>

          <div className="prediction-hint">
            Use <strong>β = λD/d</strong> to check your
            reasoning.
          </div>

        </main>
      )}

      <footer className="wave-footer">
        <span>WAVE OPTICS</span>
        <span>INTERACTIVE CLASSROOM MODULE</span>
      </footer>

    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange
}) {
  return (
    <label className="wave-slider">

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
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
      />

    </label>
  );
}