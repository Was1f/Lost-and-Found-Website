// HomePage.jsx
import React from 'react';
import './landingPage.css';

function LandingPage() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">Lost & Found</div>
        <ul className="nav-links">
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="auth-buttons">
          <button onClick={() => window.location.href='/login'}>Sign In</button>
        </div>
      </nav>

      <section className="hero">
        <h1>Find what you've lost, or help others find what they've lost.</h1>
        <p>Connect with your community to report or recover lost items easily. Join now!</p>
        <button className="cta-button" onClick={() => window.location.href='/signup'}>Get Started</button>
      </section>

      <section id="how-it-works" className="info-section">
        <h2>How It Works</h2>
        <p>Post about a lost or found item. Our smart feed will help connect you with others who can help.</p>
      </section>

      <section id="reviews" className="info-section">
        <h2>User Reviews</h2>
        <p>"I found my lost cat thanks to this platform!" - Sarah</p>
        <p>"This app is a blessing for forgetful people like me." - Jake</p>
      </section>

      <section id="contact" className="info-section">
        <h2>Contact Us</h2>
        <p>Email: support@lostfoundapp.com</p>
        <p>Phone: +123-456-7890</p>
      </section>

      <footer>
        <p>&copy; 2025 Lost & Found. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
