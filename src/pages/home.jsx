import { Link } from "react-router";
import Navbar from "../components/navbar.jsx";
import Footer from "../components/footer.jsx";

import '../App.css';

export default function Home() {
  return (
    <>
      <Navbar />

      <div className="matrix" />
    
      <section id="hero">
        <h1>ActiveLearn</h1>
        <p id="founder">By Deep Projects</p>
        <h4>Wonder. Explore. Create.</h4>
        <Link to="/learn">Learn</Link>
        <Link to="/school">School</Link>
      </section>

      <section id="identity">
        <h2>A community for learners, teachers, and curious minds.</h2>
        <div className="drivers">
          <h4>...driven by</h4>
          <div className="words">
            <h4 className="word">Curiosity</h4>
            <h4 className="word">Understanding</h4>
            <h4 className="word">Sharing</h4>
          </div>
        </div>

        {/* <div className="cards">
          {cards.map(([title, front, back]) => (
            <div className="flip-card" key={title}>
              <div className="flip-inner">
                <div className="flip front">
                  <p className="title">{title}</p>
                  <p>{front}</p>
                </div>

                <div className="flip back">
                  <p>{back}</p>
                </div>
              </div>
            </div>
          ))}
        </div> */}
      </section>

      <Footer />
    </>
  )
}