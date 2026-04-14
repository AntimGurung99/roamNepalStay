import React from "react";
import "../styles/FooterPages.css";
import Navbar from "../components/Navbar";
const FAQsPage = () => {
  const faqs = [
    {
      question: "How do I book a stay?",
      answer:
        "Search for a property, select your dates and guests, then continue to checkout to complete your booking.",
    },
    {
      question: "Can I cancel my booking?",
      answer:
        "Yes, cancellation depends on the property policy and the timing of your request.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can contact us through our support email or phone number listed on the Contact and Customer Support pages.",
    },
    {
      question: "Are payments secure?",
      answer:
        "Yes, we aim to provide secure payment handling for all bookings made through our platform.",
    },
    {
      question: "Can I list my property on Roam Nepal Stay?",
      answer:
        "Yes, property owners can contact us through the Partners page to get started.",
    },
  ];

  return (
    <>
      <Navbar/>
    <div className="footer-page">
      <div className="footer-page-container">
        <h1>FAQs</h1>
        <p className="footer-page-subtitle">
          Here are some common questions our users ask.
        </p>

        <div className="footer-faq-list">
          {faqs.map((faq, index) => (
            <div className="footer-card" key={index}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default FAQsPage;