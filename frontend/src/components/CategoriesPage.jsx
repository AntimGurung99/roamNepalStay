// import React from "react";
// import "../styles/CategoriesPage.css";
// import lakesides from "../assets/Lakesides.jpg";
// import Homestay from "../assets/Homestay.jpg";
// import Trekking from "../assets/Trekking.jpg";
// import WesternNepal from "../assets/WesternNepal.jpg";
// import Cities from "../assets/Cities.jpg";
// import EasternNepal from "../assets/EasternNepal.jpg";
// const categories = [
//   { id: 1, name: "Lakesides", image: lakesides },
//   { id: 2, name: "HomeStay", image: Homestay },
//   { id: 3, name: "Western Nepal", image: WesternNepal },
//   { id: 4, name: "Cities", image: Cities },
//   { id: 5, name: "Eastern Nepal", image: EasternNepal },
//   { id: 6, name: "Trekking Side", image: Trekking },
// ];

// export default function CategoriesPage() {
//   return (
//     <div className="categories-page">
//       <h2 className="categories-title">Explore Top Categories</h2>
//       <p className="categories-subtitle">Discover beautiful stays across Nepal</p>

//       <div className="category-grid">
//         {categories.map((category, index) => {
       
//           const isBottomCentered = index >= categories.length - 2;

//           return (
//             <div
//               key={category.id}
//               className={`category-card ${isBottomCentered ? "category-card--center" : ""}`}
//               style={{ backgroundImage: `url(${category.image})` }}
//               aria-label={category.name}
//             >
//               <div className="category-overlay" />
//               <div className="category-name">{category.name}</div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CategoriesPage.css";
import { listingsAPI } from "../api/axios";

import lakesides from "../assets/Lakesides.jpg";
import Homestay from "../assets/Homestay.jpg";
import Trekking from "../assets/Trekking.jpg";
import WesternNepal from "../assets/WesternNepal.jpg";
import Cities from "../assets/Cities.jpg";
import EasternNepal from "../assets/EasternNepal.jpg";

const categoryImages = {
  lakesides,
  homestay: Homestay,
  "western-nepal": WesternNepal,
  cities: Cities,
  "eastern-nepal": EasternNepal,
  "trekking-side": Trekking,
};

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await listingsAPI.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const orderedCategories = useMemo(() => {
    const order = [
      "lakesides",
      "homestay",
      "western-nepal",
      "cities",
      "eastern-nepal",
      "trekking-side",
    ];

    return [...categories].sort(
      (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)
    );
  }, [categories]);

  const handleCategoryClick = (slug) => {
    navigate(`/categories/${slug}`);
  };

  return (
    <div className="categories-page">
      <h2 className="categories-title">Explore Top Categories</h2>
      <p className="categories-subtitle">Discover beautiful stays across Nepal</p>

      {loading ? (
        <div className="categories-loading">Loading categories...</div>
      ) : (
        <div className="category-grid">
          {orderedCategories.map((category, index) => {
            const isBottomCentered = index >= orderedCategories.length - 2;

            return (
              <div
                key={category.slug}
                className={`category-card ${
                  isBottomCentered ? "category-card--center" : ""
                }`}
                style={{
                  backgroundImage: `url(${categoryImages[category.slug]})`,
                }}
                aria-label={category.title}
                onClick={() => handleCategoryClick(category.slug)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCategoryClick(category.slug);
                  }
                }}
              >
                <div className="category-overlay" />
                <div className="category-content">
                  <div className="category-name">{category.title}</div>
                  {/* <div className="category-subtext">{category.subtitle}</div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
