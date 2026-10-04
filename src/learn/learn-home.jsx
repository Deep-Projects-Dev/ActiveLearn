import { Link } from "react-router";
import "./learn-home.css";

export default function LearnHome() {
  return (
    <main className="learn-page">
      <div className="matrix" />

      <header className="learn-header">
        <p className="eyebrow">ActiveLearn / Learn</p>

        <h1>What will you learn today?</h1>

        <p className="learn-subtitle">
          Explore concepts, build understanding, and learn at your own pace.
        </p>

        <Link to="/learn/search" className="search-link">
          <span>Search topics, subjects, and concepts...</span>
          <span aria-hidden="true">⌕</span>
        </Link>
      </header>

      <section className="continue-section">
        <div>
          <p className="eyebrow">CONTINUE LEARNING</p>

          <h2>Start your learning journey</h2>

          <p>
            Pick up where you left off, or begin something completely new.
          </p>
        </div>

        <Link to="/learn" className="action-link">
          Explore learning <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="subjects-section">
        <div className="section-heading">
          <p className="eyebrow">SUBJECTS</p>
          <h2>Explore by subject</h2>
        </div>

        <div className="subject-grid">
          <Link to="/learn/physics" className="subject-card">
            <span className="subject-number">01</span>
            <h3>Physics</h3>
            <p>Understand the laws that shape our universe.</p>
            <span className="arrow" aria-hidden="true">→</span>
          </Link>

          <Link to="/learn/mathematics" className="subject-card">
            <span className="subject-number">02</span>
            <h3>Mathematics</h3>
            <p>
              Build intuition, reasoning, and mathematical thinking.
            </p>
            <span className="arrow" aria-hidden="true">→</span>
          </Link>

          <Link to="/learn/chemistry" className="subject-card">
            <span className="subject-number">03</span>
            <h3>Chemistry</h3>
            <p>Explore matter, reactions, and the world at its core.</p>
            <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="ways-section">
        <div className="section-heading">
          <p className="eyebrow">EXPLORE</p>
          <h2>More ways to learn</h2>
        </div>

        <div className="ways-grid">
          <Link to="/explore">Simulations</Link>
          <Link to="/study">Study material</Link>
          <Link to="/practice">Practice</Link>
          <Link to="/research">Research</Link>
        </div>
      </section>
    </main>
  );
}
