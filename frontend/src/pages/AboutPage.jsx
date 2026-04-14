import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/AboutPage.css";
import aboutHeroImage from "../assets/Nepal.jpg";
import storyImage from "../assets/Lakesides.jpg";
import missionImage from "../assets/Cities.jpg";

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <Navbar />

      <section className="about-hero">
        <div className="about-hero-overlay"></div>
        <img
          src={aboutHeroImage}
          alt="Beautiful Nepal destination"
          className="about-hero-image"
        />

        <div className="about-hero-content">
          <span className="about-badge">About Roam Nepal Stay</span>
          <h1>Find beautiful stays and real travel experiences across Nepal</h1>
          <p>
            Roam Nepal Stay helps travelers discover cozy places, trusted hosts,
            and memorable journeys while supporting local tourism and authentic
            Nepali hospitality.
          </p>

          <div className="about-hero-actions">
            <button
              className="about-primary-btn"
              onClick={() => navigate("/home")}
              type="button"
            >
              Explore Stays
            </button>

            <button
              className="about-secondary-btn"
              onClick={() => navigate("/register")}
              type="button"
            >
              Join Us
            </button>
          </div>
        </div>
      </section>

      <main className="about-main">
        <section className="about-story section-card">
          <div className="about-story-text">
            <span className="section-tag">Our Story</span>
            <h2>Travel Nepal with comfort, trust, and local connection</h2>
            <p>
              Roam Nepal Stay was created to make travel in Nepal simpler and
              more meaningful. We want guests to find stays that feel welcoming,
              safe, and memorable, whether they are visiting lakeside cities,
              mountain towns, cultural centers, or peaceful countryside homes.
            </p>
            <p>
              At the same time, we want to support local hosts by giving them a
              place to share their spaces, stories, and hospitality with people
              from around Nepal and beyond.
            </p>
          </div>

          <div className="about-story-image-wrap">
            <img
              src={storyImage}
              alt="Lakeside stay in Nepal"
              className="about-story-image"
            />
          </div>
        </section>

        <section className="about-features">
          <div className="about-section-head">
            <span className="section-tag">Why Choose Us</span>
            <h2>Made for guests and hosts across Nepal</h2>
            <p>
              Everything is designed to keep booking easy, stays trustworthy,
              and the experience warm and local.
            </p>
          </div>

          <div className="about-feature-grid">
            <div className="about-feature-card">
              {/* <div className="about-feature-icon">🏡</div> */}
              <h3>Trusted Stays</h3>
              <p>
                Discover homestays, hotels, resorts, and unique properties with
                clear details and easy booking.
              </p>
            </div>

            <div className="about-feature-card">
              {/* <div className="about-feature-icon">📍</div> */}
              <h3>Local Experiences</h3>
              <p>
                Explore destinations with a deeper connection to local culture,
                people, and the beauty of Nepal.
              </p>
            </div>

            <div className="about-feature-card">
              {/* <div className="about-feature-icon">💗</div> */}
              <h3>Simple Booking</h3>
              <p>
                Search, compare, and book stays in a smooth and user-friendly
                way from one platform.
              </p>
            </div>

            <div className="about-feature-card">
              {/* <div className="about-feature-icon">🤝</div> */}
              <h3>Support for Hosts</h3>
              <p>
                We help property owners and local hosts connect with travelers
                and grow with confidence.
              </p>
            </div>
          </div>
        </section>

        <section className="about-mission section-card">
          <div className="about-mission-image-wrap">
            <img
              src={missionImage}
              alt="Cities and destinations in Nepal"
              className="about-mission-image"
            />
          </div>

          <div className="about-mission-text">
            <span className="section-tag">Our Mission</span>
            <h2>To make discovering Nepal easier, warmer, and more authentic</h2>
            <p>
              We believe travel should feel exciting but also comfortable. Our
              mission is to connect guests with stays they can trust and give
              hosts a strong platform to share what makes their place special.
            </p>

            <div className="about-values">
              <div className="about-value-item">
                <strong>Trust</strong>
                <span>Clear details and dependable stays</span>
              </div>
              <div className="about-value-item">
                <strong>Comfort</strong>
                <span>A smoother and friendlier booking journey</span>
              </div>
              <div className="about-value-item">
                <strong>Local Connection</strong>
                <span>Support for local tourism and real experiences</span>
              </div>
              <div className="about-value-item">
                <strong>Simplicity</strong>
                <span>Clean design and easy-to-use features</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-stats">
          <div className="about-stat-card">
            <h3>Guests First</h3>
            <p>
              A clean platform built to help travelers quickly find the stay
              that fits them best.
            </p>
          </div>

          <div className="about-stat-card">
            <h3>Host Friendly</h3>
            <p>
              A welcoming space for hosts to list their property and grow their
              visibility.
            </p>
          </div>

          <div className="about-stat-card">
            <h3>Nepal Focused</h3>
            <p>
              Built around Nepal’s destinations, culture, hospitality, and
              travel lifestyle.
            </p>
          </div>
        </section>

        <section className="about-cta">
          <div className="about-cta-box">
            <span className="section-tag">Start Your Journey</span>
            <h2>Ready to explore Nepal with Roam Nepal Stay?</h2>
            <p>
              Browse listings, discover places, and enjoy stays that feel more
              personal and more connected to Nepal.
            </p>

            <div className="about-cta-actions">
              <button
                className="about-primary-btn"
                onClick={() => navigate("/home")}
                type="button"
              >
                Browse Listings
              </button>

              <button
                className="about-secondary-btn"
                onClick={() => navigate("/explore-map")}
                type="button"
              >
                Explore Map
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;