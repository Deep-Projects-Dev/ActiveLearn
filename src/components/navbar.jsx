import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./css/navbar.css";

export default function Navbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("#hero");

    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.intersectionRatio < 0.8);
      },
      {
        threshold: [0, 0.8, 1],
      }
    );

    observer.observe(hero);

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="navbar" data-visible={visible}>
      <Link className="navbar-logo" to="/">
        Deep Projects
      </Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/license">License</Link>
      </div>

      <a
        className="navbar-github"
        href="https://github.com/Deep-Projects-Dev"
        target="_blank"
        rel="noreferrer"
      >
        GitHub ↗
      </a>
    </nav>
  );
}