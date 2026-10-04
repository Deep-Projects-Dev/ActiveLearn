import { Link } from "react-router";
import "./school-home.css";

export default function School() {
  return (
    <main className="school-home">
      <header className="school-header">
        <div className="school-brand">
          <div className="school-mark">∑</div>

          <div>
            <span>INTERACTIVE CLASSROOM</span>
            <h1>Learning Lab</h1>
          </div>
        </div>

        <div className="school-meta">
          <span>PM SHRI</span>
          <strong>Classroom Edition</strong>
        </div>
      </header>

      <section className="school-hero">
        <div>
          <span className="hero-kicker">EXPLORE · VISUALISE · UNDERSTAND</span>

          <h2>
            Turn the board<br />
            into a laboratory.
          </h2>

          <p>
            Interactive lessons designed for teaching,
            demonstration and discussion.
          </p>
        </div>

        <div className="hero-orbit">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-dot dot-one" />
          <div className="orbit-dot dot-two" />
          <div className="hero-symbol">λ</div>
        </div>
      </section>

      <section className="lesson-section">
        <div className="section-heading">
          <div>
            <span>AVAILABLE LESSONS</span>
            <h3>Choose a lesson</h3>
          </div>

          <small>Tap a card to begin</small>
        </div>

        <div className="lesson-grid">

          <Link to="vector-algebra" className="lesson-card vector-card">
            <div className="lesson-icon">→</div>

            <div className="lesson-content">
              <span>MATHEMATICS · CLASS XII</span>

              <h4>Vector Algebra</h4>

              <p>
                Manipulate vectors and see addition,
                components and the resultant visually.
              </p>
            </div>

            <div className="lesson-arrow">↗</div>
          </Link>

          <Link to="wave-optics" className="lesson-card optics-card">
            <div className="lesson-icon">≈</div>

            <div className="lesson-content">
              <span>PHYSICS · CLASS XII</span>

              <h4>Wave Optics</h4>

              <p>
                Explore Young's double-slit experiment
                and see interference respond to variables.
              </p>
            </div>

            <div className="lesson-arrow">↗</div>
          </Link>

          <div className="lesson-card coming-card">
            <div className="lesson-icon">+</div>

            <div className="lesson-content">
              <span>MORE LESSONS</span>

              <h4>Coming soon</h4>

              <p>
                More interactive topics can be added
                as the classroom library grows.
              </p>
            </div>
          </div>

        </div>
      </section>

      <footer className="school-footer">
        <span>INTERACTIVE LEARNING LAB</span>
        <span>Built for the classroom</span>
      </footer>
    </main>
  );
}