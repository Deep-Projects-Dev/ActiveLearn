import { Link } from "react-router";
import Socials from "./socials.jsx";
import './css/footer.css'

export default function Footer() {
  return (
    <>
      <section className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <h2>ActiveLearn</h2>
            <span>By Deep Projects</span>
            <p>
              Software for people who create, learn, and explore.
            </p>
            <div id="socials">
              <Socials />
            </div>
          </div>

          <div className="footer-links">
            <div>
              <h3>Explore</h3>
              <Link to="/about">About</Link>
              <Link to="/projects">Projects</Link>
              <a href="/philosophy">Philosophy</a>
            </div>

            <div>
              <h3>Development</h3>
              <a href="https://github.com/Deep-Projects-Dev/">GitHub</a>
              <Link to="/license">DPSAL - License</Link>
              <a href="/source">Source Available</a>
            </div>

            <div>
              <h3>Connect</h3>
              <Link to="/contact">Contact</Link>
              <a href="/updates">Updates</a>
              <a href="/updates">Updates</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 Deep Projects</span>
          <span>Built to create, not to manipulate.</span>
        </div>
      </section>
    </>
  )
}