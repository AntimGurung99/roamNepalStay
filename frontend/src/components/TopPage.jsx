import React, { useState, useEffect } from 'react';
import '../styles/TopPage.css'; 
import topImage from '../assets/toppage1.jpg'; 

const quotes = [
  "Explore the Nepal Countryside, one stay at a time.",
  "Journey far, discover the beauty of life and Nature of Nepal.",
  "The best adventure starts with a single step.",
  "Travel far and wide, the Nepal is waiting.",
  "Wherever you go, make it memorable."
];

const TopPage = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length); 
    }, 3000); 
    return () => clearInterval(interval); 
  }, []);

  return (
    <section className="top-hero">
      <div className="top-hero-overlay">
        <h2>{quotes[currentQuoteIndex]}</h2>
      </div>
      <img 
        src={topImage} 
        alt="Hero" 
        className="top-hero-image" 
      />
    </section>
  );
};

export default TopPage;
