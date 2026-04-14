// import React, { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { listingsAPI } from "../api/axios";
// import "../styles/ListingsGrid.css";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";

// const titleMap = {
//   lakesides: "Lakesides",
//   homestay: "HomeStay",
//   "western-nepal": "Western Nepal",
//   cities: "Cities",
//   "eastern-nepal": "Eastern Nepal",
//   "trekking-side": "Trekking Side",
// };

// export default function CategoryResultsPage() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Today added: always go top when opening a category page
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [slug]);

//   useEffect(() => {
//     const fetchListings = async () => {
//       try {
//         setLoading(true);
//         const response = await listingsAPI.getListings({ category_slug: slug });
//         setListings(response.data || []);
//       } catch (error) {
//         console.error("Failed to fetch category listings:", error);
//         setListings([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchListings();
//   }, [slug]);

//   return (
//     <>
//       <Navbar />

//       <div
//         className="listings-section"
//         style={{
//           paddingTop: "40px",
//           minHeight: "70vh",
//           background: "#fff",
//         }}
//       >
//         <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px 40px" }}>
//           <button
//             onClick={() => navigate(-1)}
//             style={{
//               marginBottom: "30px",
//               border: "none",
//               background: "#ff4f81",
//               color: "#fff",
//               padding: "10px 16px",
//               borderRadius: "8px",
//               cursor: "pointer",
//             }}
//           >
//             Back
//           </button>

//           <h2 style={{ fontSize: "32px", marginBottom: "8px" }}>
//             {titleMap[slug] || "Category"}
//           </h2>

//           <p style={{ color: "#666", marginBottom: "30px" }}>
//             Explore listings for this category
//           </p>

//           <div className="listings-grid">
//             {loading ? (
//               <div className="no-listings">Loading listings...</div>
//             ) : listings.length > 0 ? (
//               listings.map((listing) => (
//                 <div key={listing.id} className="listing-card">
//                   <div className="listing-image-container">
//                     {listing.primary_image ? (
//                       <img
//                         src={
//                           listing.primary_image.startsWith("http")
//                             ? listing.primary_image
//                             : `http://127.0.0.1:8000${listing.primary_image}`
//                         }
//                         alt={listing.title}
//                       />
//                     ) : (
//                       <div className="no-image">No Photos</div>
//                     )}
//                   </div>

//                   <div className="listing-card-info">
//                     <div className="listing-card-title">{listing.title}</div>

//                     <div className="listing-card-location">
//                       {listing.city}, {listing.region}, {listing.province}
//                     </div>

//                     <div className="listing-card-price">
//                       <strong>Rs. {listing.price_per_night}</strong> per night
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="no-listings">
//                 No listings found in this category yet.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       </>
//   );
// }


import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listingsAPI } from "../api/axios";
import "../styles/ListingsGrid.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const titleMap = {
  lakesides: "Lakesides",
  homestay: "HomeStay",
  "western-nepal": "Western Nepal",
  cities: "Cities",
  "eastern-nepal": "Eastern Nepal",
  "trekking-side": "Trekking Side",
};

export default function CategoryResultsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryTitle, setCategoryTitle] = useState(titleMap[slug] || "Category");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);

        const response = await listingsAPI.getListings({ category_slug: slug });
        const data = response.data;

        if (Array.isArray(data)) {
          setListings(data);
        } else if (data && Array.isArray(data.results)) {
          setListings(data.results);
        } else {
          setListings([]);
        }
      } catch (error) {
        console.error("Failed to fetch category listings:", error);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await listingsAPI.getCategories();
        const categories = response.data || [];
        const matchedCategory = categories.find((item) => item.slug === slug);

        if (matchedCategory?.title) {
          setCategoryTitle(matchedCategory.title);
        } else {
          setCategoryTitle(titleMap[slug] || "Category");
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoryTitle(titleMap[slug] || "Category");
      }
    };

    fetchCategories();
    fetchListings();
  }, [slug]);

  return (
    <>
      <Navbar />

      <div
        className="listings-section"
        style={{
          paddingTop: "40px",
          minHeight: "70vh",
          background: "#fff",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px 40px",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              marginBottom: "30px",
              border: "none",
              background: "#ff4f81",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <h2 style={{ fontSize: "32px", marginBottom: "8px" }}>
            {categoryTitle}
          </h2>

          <p style={{ color: "#666", marginBottom: "30px" }}>
            Explore listings for this category
          </p>

          <div className="listings-grid">
            {loading ? (
              <div className="no-listings">Loading listings...</div>
            ) : listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="listing-card"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="listing-image-container">
                    {listing.primary_image ? (
                      <img
                        src={
                          listing.primary_image.startsWith("http")
                            ? listing.primary_image
                            : `http://127.0.0.1:8000${listing.primary_image}`
                        }
                        alt={listing.title}
                      />
                    ) : (
                      <div className="no-image">No Photos</div>
                    )}
                  </div>

                  <div className="listing-card-info">
                    <div className="listing-card-title">{listing.title}</div>

                    <div className="listing-card-location">
                      {listing.city}
                      {listing.region ? `, ${listing.region}` : ""}
                      {listing.province ? `, ${listing.province}` : ""}
                    </div>

                    <div className="listing-card-price">
                      <strong>Rs. {listing.price_per_night}</strong> per night
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-listings">
                No listings found in this category yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}