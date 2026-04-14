import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";

const TravelBlogPage = () => {
  const blogPosts = [
    {
      title: "Top 10 Places to Visit in Pokhara",
      description:
        "Discover the best lakeside spots, mountain views, and peaceful places to stay in Pokhara.",
    },
    {
      title: "A Beginner’s Guide to Traveling in Nepal",
      description:
        "Helpful tips for first-time visitors, including transport, booking stays, and local travel advice.",
    },
    {
      title: "Best Family-Friendly Stays in Kathmandu",
      description:
        "Find comfortable and safe places perfect for family trips in the capital city.",
    },
  ];

  return (
    <>
      <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>Travel Blog</h1>
        <p className="footer-page-subtitle">
          Explore travel ideas, destination guides, and useful tips for your
          next trip in Nepal.
        </p>

        <div className="footer-card-grid">
          {blogPosts.map((post, index) => (
            <div className="footer-card" key={index}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <button className="footer-btn">Read More</button>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default TravelBlogPage;