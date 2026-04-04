// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMapEvents,
// } from "react-leaflet";
// import MarkerClusterGroup from "react-leaflet-cluster";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import "../styles/ExploreMapPage.css";
// import { listingsAPI } from "../api/axios";

// // Fix default leaflet marker icons
// import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
// import iconUrl from "leaflet/dist/images/marker-icon.png";
// import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl,
//   iconUrl,
//   shadowUrl,
// });

// function debounce(fn, delay = 500) {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// }

// function createPriceIcon(price) {
//   return L.divIcon({
//     className: "custom-price-marker",
//     html: `<div class="price-tag">Rs. ${price}</div>`,
//     iconSize: [88, 32],
//     iconAnchor: [44, 16],
//   });
// }

// function MapBoundsListener({ onBoundsChange }) {
//   const debouncedHandler = useMemo(
//     () =>
//       debounce((bounds) => {
//         onBoundsChange(bounds);
//       }, 500),
//     [onBoundsChange]
//   );

//   useMapEvents({
//     moveend(e) {
//       const map = e.target;
//       const bounds = map.getBounds();

//       debouncedHandler({
//         north: bounds.getNorth(),
//         south: bounds.getSouth(),
//         east: bounds.getEast(),
//         west: bounds.getWest(),
//         zoom: map.getZoom(),
//       });
//     },
//     zoomend(e) {
//       const map = e.target;
//       const bounds = map.getBounds();

//       debouncedHandler({
//         north: bounds.getNorth(),
//         south: bounds.getSouth(),
//         east: bounds.getEast(),
//         west: bounds.getWest(),
//         zoom: map.getZoom(),
//       });
//     },
//   });

//   return null;
// }

// const ExploreMapPage = () => {
//   const [listings, setListings] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [mapBounds, setMapBounds] = useState(null);

//   const [filters, setFilters] = useState({
//     search: "",
//     city: "",
//     min_price: "",

//     max_price: "",
//   });

//   const mapRef = useRef(null);

//   const fetchListings = async () => {
//     try {
//       setLoading(true);

//       const params = {};

//       if (filters.search) params.search = filters.search;
//       if (filters.city) params.city = filters.city;
//       if (filters.min_price) params.min_price = filters.min_price;
//       if (filters.max_price) params.max_price = filters.max_price;

//       if (mapBounds) {
//         params.north = mapBounds.north;
//         params.south = mapBounds.south;
//         params.east = mapBounds.east;
//         params.west = mapBounds.west;
//       }

//       const response = await listingsAPI.getMapListings(params);
//       setListings(response.data || []);
//     } catch (error) {
//       console.error("Error fetching map listings:", error);
//       setListings([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchListings();
//   }, [mapBounds]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const applyFilters = () => {
//     fetchListings();
//   };

//   const flyToListing = (listing) => {
//     if (!mapRef.current || !listing.latitude || !listing.longitude) return;
//     mapRef.current.flyTo(
//       [parseFloat(listing.latitude), parseFloat(listing.longitude)],
//       15,
//       { duration: 1.2 }
//     );
//   };

//   return (
//     <div className="explore-page">
//       <div className="explore-sidebar">
//         <div className="filters-box">
//           <h2>Explore stays</h2>

//           <input
//             type="text"
//             name="search"
//             placeholder="Search title, address, place..."
//             value={filters.search}
//             onChange={handleFilterChange}
//           />

//           <input
//             type="text"
//             name="city"
//             placeholder="City"
//             value={filters.city}
//             onChange={handleFilterChange}
//           />

//           <input
//             type="number"
//             name="min_price"
//             placeholder="Min price"
//             value={filters.min_price}
//             onChange={handleFilterChange}
//           />

//           <input
//             type="number"
//             name="max_price"
//             placeholder="Max price"
//             value={filters.max_price}
//             onChange={handleFilterChange}
//           />

//           <button onClick={applyFilters}>Apply Filters</button>
//         </div>

//         <div className="results-header">
//           {loading ? "Loading..." : `${listings.length} stays found`}
//         </div>

//         <div className="listing-results">
//           {listings.map((listing) => (
//             <div
//               key={listing.id}
//               className="listing-card-map"
//               onClick={() => flyToListing(listing)}
//             >
//               <img
//                 src={listing.primary_image || "https://via.placeholder.com/300x200"}
//                 alt={listing.title}
//               />
//               <div className="listing-card-map-info">
//                 <h3>{listing.title}</h3>
//                 <p>
//                   {listing.city}, {listing.district}
//                 </p>
//                 <p>{listing.address}</p>
//                 <strong>Rs. {listing.price_per_night} / night</strong>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="explore-map">
//         <MapContainer
//           center={[27.7172, 85.324]}
//           zoom={12}
//           className="leaflet-map"
//           ref={mapRef}
//         >
//           <TileLayer
//             attribution='&copy; OpenStreetMap contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />

//           <MapBoundsListener onBoundsChange={setMapBounds} />

//           <MarkerClusterGroup chunkedLoading>
//             {listings.map((listing) => (
//               <Marker
//                 key={listing.id}
//                 position={[
//                   parseFloat(listing.latitude),
//                   parseFloat(listing.longitude),
//                 ]}
//                 icon={createPriceIcon(listing.price_per_night)}
//               >
//                 <Popup>
//                   <div className="popup-card">
//                     <img
//                       src={
//                         listing.primary_image ||
//                         "https://via.placeholder.com/200x120"
//                       }
//                       alt={listing.title}
//                     />
//                     <h4>{listing.title}</h4>
//                     <p>{listing.address}</p>
//                     <strong>Rs. {listing.price_per_night} / night</strong>
//                   </div>
//                 </Popup>
//               </Marker>
//             ))}
//           </MarkerClusterGroup>
//         </MapContainer>
//       </div>
//     </div>
//   );
// };

// export default ExploreMapPage;


import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/ExploreMapPage.css";
import { listingsAPI } from "../api/axios";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

function debounce(fn, delay = 500) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function createPriceIcon(price) {
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div class="price-tag">Rs. ${price}</div>`,
    iconSize: [88, 32],
    iconAnchor: [44, 16],
  });
}

function MapBoundsListener({ onBoundsChange }) {
  const debouncedHandler = useMemo(
    () =>
      debounce((bounds) => {
        onBoundsChange(bounds);
      }, 500),
    [onBoundsChange]
  );

  useMapEvents({
    moveend(e) {
      const map = e.target;
      const bounds = map.getBounds();

      debouncedHandler({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: map.getZoom(),
      });
    },
    zoomend(e) {
      const map = e.target;
      const bounds = map.getBounds();

      debouncedHandler({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
        zoom: map.getZoom(),
      });
    },
  });

  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    // Small delay to ensure the container has reached its final size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const ExploreMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);

  const [filters, setFilters] = useState({
      search: "",
      min_price: "",
      max_price: "",
  });

  const fetchListings = useCallback(async (fitNewBounds = false, overrideFilters = null) => {
    setLoading(true);
    try {
      const activeFilters = overrideFilters || filters;
      const params = {};

      if (activeFilters.search?.trim()) params.search = activeFilters.search.trim();
      if (activeFilters.min_price) params.min_price = activeFilters.min_price;
      if (activeFilters.max_price) params.max_price = activeFilters.max_price;

      if (mapBounds && !fitNewBounds) {
        params.north = mapBounds.north;
        params.south = mapBounds.south;
        params.east = mapBounds.east;
        params.west = mapBounds.west;
      }

      const response = await listingsAPI.getMapListings(params);
      const data = Array.isArray(response.data) ? response.data : [];
      setListings(data);

      if (fitNewBounds && data.length > 0 && mapRef.current) {
        const points = data
          .filter((l) => l.latitude && l.longitude)
          .map((l) => [Number(l.latitude), Number(l.longitude)]);

        if (points.length > 0) {
          mapRef.current.fitBounds(points, { padding: [50, 50] });
        }
      }
    } catch (error) {
      console.error("Error fetching map listings:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters, mapBounds]);

  useEffect(() => {
    fetchListings(false);
  }, [mapBounds, fetchListings]);

  const isFilterActive = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.min_price !== "" ||
      filters.max_price !== ""
    );
  }, [filters]);

  const validListings = useMemo(() => {
    if (!isFilterActive) return [];

    return listings.filter((listing) => {
      const lat = Number(listing.latitude);
      const lng = Number(listing.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [listings, isFilterActive]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    fetchListings(true);
  };

  const clearFilters = () => {
    const freshFilters = {
      search: "",
      min_price: "",
      max_price: "",
    };
    setFilters(freshFilters);
    // Trigger immediate fetch with cleared filters
    fetchListings(false, freshFilters);
  };

  const flyToListing = (listing) => {
    if (!mapRef.current || !listing.latitude || !listing.longitude) return;

    mapRef.current.flyTo(
      [Number(listing.latitude), Number(listing.longitude)],
      15,
      { duration: 1.2 }
    );
  };

  return (
    <div className="explore-page">
      <div className="explore-sidebar">
        <div className="filters-box">
          <button
            className="back-home-btn"
            onClick={() => navigate("/")}
            type="button"
          >
            <i className="bi bi-arrow-left"></i> Back to Home
          </button>

          <h2>
            <i className="bi bi-geo-alt-fill" style={{ marginRight: "8px" }}></i>
            Explore stays
          </h2>

          <input
              type="text"
              name="search"
              placeholder="Search by title, city, district, province, or region"
              value={filters.search}
              onChange={handleFilterChange}
          />

          <input
            type="number"
            name="min_price"
            placeholder="Min amount"
            value={filters.min_price}
            onChange={handleFilterChange}
          />

          <input
            type="number"
            name="max_price"
            placeholder="Max amount"
            value={filters.max_price}
            onChange={handleFilterChange}
          />

          <div className="filter-btn-row">
            <button onClick={applyFilters} type="button">
              Apply Filters
            </button>

            <button
              onClick={clearFilters}
              type="button"
              className="clear-filter-btn"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="results-header">
          {loading ? (
            "Loading..."
          ) : !isFilterActive ? (
            "Search to find properties"
          ) : (
            `${validListings.length} stays found`
          )}
        </div>

        <div className="listing-results">
          {validListings.length === 0 && !loading && (
            <div className="no-search-prompt">
              {!isFilterActive ? (
                <p>Use the search bar above or apply a price filter to explore available stays.</p>
              ) : (
                <p>No matches found for your current search criteria.</p>
              )}
            </div>
          )}
          {validListings.map((listing) => (
            <div
              key={listing.id}
              className="listing-card-map"
              onClick={() => flyToListing(listing)}
            >
              <img
                src={
                  listing.primary_image || "https://via.placeholder.com/300x200"
                }
                alt={listing.title}
              />

              <div className="listing-card-map-info">
                <h3>{listing.title}</h3>
                <p>
                  {listing.city}, {listing.district}
                </p>
                <p>{listing.address}</p>
                <strong>Rs. {listing.price_per_night} / night</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="explore-map">
        <MapContainer
          center={[27.7172, 85.324]}
          zoom={12}
          className="leaflet-map"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapInvalidator />
          <MapBoundsListener onBoundsChange={setMapBounds} />

          <MarkerClusterGroup chunkedLoading>
            {validListings.map((listing) => (
              <Marker
                key={listing.id}
                position={[Number(listing.latitude), Number(listing.longitude)]}
                icon={createPriceIcon(listing.price_per_night)}
              >
                <Popup>
                  <div className="popup-card">
                    <img
                      src={
                        listing.primary_image ||
                        "https://via.placeholder.com/200x120"
                      }
                      alt={listing.title}
                    />
                    <h4>{listing.title}</h4>
                    <p>{listing.address}</p>
                    <strong>Rs. {listing.price_per_night} / night</strong>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default ExploreMapPage;