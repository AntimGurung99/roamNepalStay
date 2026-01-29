import React from "react";
import "../styles/CategoriesPage.css";
import lakesides from "../assets/Lakesides.jpg";
import Homestay from "../assets/Homestay.jpg";
import Trekking from "../assets/Trekking.jpg";
import WesternNepal from "../assets/WesternNepal.jpg";
import Cities from "../assets/Cities.jpg";
import EasternNepal from "../assets/EasternNepal.jpg";
const categories = [
  { id: 1, name: "Lakesides", image: lakesides },
  { id: 2, name: "HomeStay", image: Homestay },
  { id: 3, name: "Western Nepal", image: WesternNepal },
  { id: 4, name: "Cities", image: Cities },
  { id: 5, name: "Eastern Nepal", image: EasternNepal },
  { id: 6, name: "Trekking Side", image: Trekking },
];

export default function CategoriesPage() {
  return (
    <div className="categories-page">
      <h2 className="categories-title">Explore Top Categories</h2>
      <p className="categories-subtitle">Discover beautiful stays across Nepal</p>

      <div className="category-grid">
        {categories.map((category, index) => {
       
          const isBottomCentered = index >= categories.length - 2;

          return (
            <div
              key={category.id}
              className={`category-card ${isBottomCentered ? "category-card--center" : ""}`}
              style={{ backgroundImage: `url(${category.image})` }}
              aria-label={category.name}
            >
              <div className="category-overlay" />
              <div className="category-name">{category.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
