// import React, { useEffect, useMemo, useState } from "react";
// import "../styles/CreateListingModal.css";
// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   useMap,
//   useMapEvents,
// } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
// import iconUrl from "leaflet/dist/images/marker-icon.png";
// import shadowUrl from "leaflet/dist/images/marker-shadow.png";
// import { ImCamera } from "react-icons/im";

// import {
//   MdBathtub,
//   MdOutlineShower,
//   MdOutlineLocalLaundryService,
//   MdDryCleaning,
//   MdIron,
//   MdTv,
//   MdOutlineKitchen,
//   MdMicrowave,
//   MdOutlineBalcony,
//   MdOutlinePets,
//   MdMedicalServices,
//   MdApartment,
// } from "react-icons/md";

// import {
//   FaPumpSoap,
//   FaWifi,
//   FaSnowflake,
//   FaFireExtinguisher,
//   FaParking,
//   FaKey,
//   FaHome,
//   FaUsers,
//   FaGem,
//   FaWallet,
//   FaMountain,
//   FaWater,
//   FaCity,
//   FaTree,
//   FaStar,
// } from "react-icons/fa";

// import {
//   GiClothes,
//   GiBarbecue,
//   GiCampfire,
//   GiFlowerPot,
//   GiCampingTent,
//   GiVillage,
//   GiJungle,
// } from "react-icons/gi";

// import { TbFridge, TbAirConditioning } from "react-icons/tb";
// import { BsCameraVideo, BsGrid3X3Gap } from "react-icons/bs";
// import { LuTrees, LuCookingPot, LuMountain } from "react-icons/lu";
// import { PiOfficeChairFill } from "react-icons/pi";

// // TODAY ADDED: fix Leaflet default marker icon paths
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl,
//   iconUrl,
//   shadowUrl,
// });

// const DEFAULT_CENTER = [27.7172, 85.324]; // Kathmandu

// // TODAY ADDED: category list with React icons
// const CATEGORIES = [
//   { id: "apartment", label: "Apartment", icon: <MdApartment /> },
//   { id: "house", label: "House", icon: <FaHome /> },
//   { id: "homestay", label: "Homestay", icon: <FaUsers /> },
//   { id: "hostel", label: "Hostel", icon: <BsGrid3X3Gap /> },
//   { id: "luxury", label: "Luxury Stay", icon: <FaGem /> },
//   { id: "budget", label: "Budget Stay", icon: <FaWallet /> },
//   { id: "mountain", label: "Mountain", icon: <FaMountain /> },
//   { id: "lake_view", label: "Lake View", icon: <FaWater /> },
//   { id: "city", label: "City Area", icon: <FaCity /> },
//   { id: "countryside", label: "Countryside", icon: <FaTree /> },
//   { id: "jungle", label: "Jungle Site", icon: <GiJungle /> },
//   { id: "camping", label: "Camping", icon: <GiCampingTent /> },
//   { id: "traditional", label: "Traditional House", icon: <GiVillage /> },
//   { id: "trekking", label: "Trekking Route", icon: <LuMountain /> },
//   { id: "famous", label: "Famous Areas", icon: <FaStar /> },
// ];

// const REGIONS = [
//   { label: "Far West" },
//   { label: "Mid West" },
//   { label: "West" },
//   { label: "Central" },
//   { label: "East" },
// ];

// const PROVINCES = [
//   { label: "Koshi" },
//   { label: "Madhesh" },
//   { label: "Bagmati" },
//   { label: "Gandaki" },
//   { label: "Lumbini" },
//   { label: "Karnali" },
//   { label: "Sudurpashchim" },
// ];

// const PROPERTY_TYPES = [
//   {
//     id: "house",
//     label: "An entire place",
//     description: "Guests have the whole place to themselves",
//     icon: "bi-house-door",
//   },
//   {
//     id: "room",
//     label: "Room(s)",
//     description:
//       "Guests have their own room in a house, plus access to shared places",
//     icon: "bi-door-open",
//   },
//   {
//     id: "shared_room",
//     label: "A Shared Room",
//     description:
//       "Guests sleep in a room or common area that may be shared with you or others",
//     icon: "bi-people-fill",
//   },
// ];

// // TODAY ADDED: amenity list with ids matching backend model fields
// const AMENITIES_LIST = [
//   { id: "bath_tub", label: "Bath tub", icon: <MdBathtub /> },
//   { id: "personal_care", label: "Personal care products", icon: <FaPumpSoap /> },
//   { id: "outdoor_shower", label: "Outdoor shower", icon: <MdOutlineShower /> },
//   { id: "washer", label: "Washer", icon: <MdOutlineLocalLaundryService /> },
//   { id: "dryer", label: "Dryer", icon: <MdDryCleaning /> },
//   { id: "hangers", label: "Hangers", icon: <GiClothes /> },
//   { id: "iron", label: "Iron", icon: <MdIron /> },
//   { id: "tv", label: "TV", icon: <MdTv /> },
//   {
//     id: "dedicated_workspace",
//     label: "Dedicated workspace",
//     icon: <PiOfficeChairFill />,
//   },
//   {
//     id: "air_conditioning",
//     label: "Air Conditioning",
//     icon: <TbAirConditioning />,
//   },
//   { id: "heating", label: "Heating", icon: <FaSnowflake /> },
//   { id: "security_cameras", label: "Security cameras", icon: <BsCameraVideo /> },
//   {
//     id: "fire_extinguisher",
//     label: "Fire extinguisher",
//     icon: <FaFireExtinguisher />,
//   },
//   { id: "first_aid", label: "First Aid", icon: <MdMedicalServices /> },
//   { id: "wifi", label: "Wifi", icon: <FaWifi /> },
//   { id: "cooking_set", label: "Cooking set", icon: <LuCookingPot /> },
//   { id: "refrigerator", label: "Refrigerator", icon: <TbFridge /> },
//   { id: "microwave", label: "Microwave", icon: <MdMicrowave /> },
//   { id: "stove", label: "Stove", icon: <MdOutlineKitchen /> },
//   { id: "barbecue_grill", label: "Barbecue grill", icon: <GiBarbecue /> },
//   { id: "outdoor_dining_area", label: "Outdoor dining area", icon: <LuTrees /> },
//   {
//     id: "private_patio_or_balcony",
//     label: "Private patio or Balcony",
//     icon: <MdOutlineBalcony />,
//   },
//   { id: "camp_fire", label: "Camp fire", icon: <GiCampfire /> },
//   { id: "garden", label: "Garden", icon: <GiFlowerPot /> },
//   { id: "free_parking", label: "Free parking", icon: <FaParking /> },
//   { id: "self_check_in", label: "Self check-in", icon: <FaKey /> },
//   { id: "pet_allowed", label: "Pet allowed", icon: <MdOutlinePets /> },
// ];

// function MapRecenter({ latitude, longitude }) {
//   const map = useMap();

//   useEffect(() => {
//     if (
//       latitude !== "" &&
//       longitude !== "" &&
//       !Number.isNaN(Number(latitude)) &&
//       !Number.isNaN(Number(longitude))
//     ) {
//       map.setView([Number(latitude), Number(longitude)], 15);
//     }
//   }, [latitude, longitude, map]);

//   return null;
// }

// function MapInvalidator() {
//   const map = useMap();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       map.invalidateSize();
//     }, 250);

//     return () => clearTimeout(timer);
//   }, [map]);

//   return null;
// }

// function LocationMapPicker({ latitude, longitude, onChange }) {
//   function MapClickHandler() {
//     useMapEvents({
//       click(e) {
//         onChange(e.latlng.lat.toFixed(8), e.latlng.lng.toFixed(8));
//       },
//     });
//     return null;
//   }

//   const markerPosition =
//     latitude !== "" &&
//     longitude !== "" &&
//     !Number.isNaN(Number(latitude)) &&
//     !Number.isNaN(Number(longitude))
//       ? [Number(latitude), Number(longitude)]
//       : null;

//   const initialCenter = markerPosition || DEFAULT_CENTER;

//   return (
//     <div className="host-map-wrapper">
//       <MapContainer
//         center={initialCenter}
//         zoom={markerPosition ? 15 : 7}
//         scrollWheelZoom
//         className="host-location-map"
//       >
//         <TileLayer
//           attribution="&copy; OpenStreetMap contributors"
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         <MapInvalidator />
//         <MapClickHandler />
//         <MapRecenter latitude={latitude} longitude={longitude} />

//         {markerPosition && (
//           <Marker
//             position={markerPosition}
//             draggable={true}
//             eventHandlers={{
//               dragend: (e) => {
//                 const { lat, lng } = e.target.getLatLng();
//                 onChange(lat.toFixed(8), lng.toFixed(8));
//               },
//             }}
//           />
//         )}
//       </MapContainer>

//       <div className="map-help-row">
//         <span>
//           <i className="bi bi-geo-alt-fill"></i> Click on the map or drag the pin
//           to set the exact property location.
//         </span>
//         <button
//           type="button"
//           className="map-reset-btn"
//           onClick={() => onChange("", "")}
//         >
//           Clear Pin
//         </button>
//       </div>
//     </div>
//   );
// }

// const CreateListingModal = ({ isOpen, onClose, initialData = null }) => {
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState({
//     // TODAY ADDED: state aligned with backend serializer/model
//     category: "Apartment",
//     property_type: "house",
//     street_address: "",
//     city: "",
//     province: "",
//     district: "",
//     region: "",
//     country: "Nepal",
//     latitude: "",
//     longitude: "",
//     guests: 1,
//     bedrooms: 1,
//     beds: 1,
//     bathrooms: 1,
//     amenities: [],
//     title: "",
//     description: "",
//     highlight: "",
//     highlight_details: "",
//     price_per_night: 0,
//     cleaning_fee: 0,
//     images: [],
//   });

//   const [existingImages, setExistingImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     if (initialData) {
//       setFormData((prev) => ({
//         ...prev,
//         ...initialData,
//         street_address: initialData.address || "",
//         district: initialData.district || "",
//         latitude:
//           initialData.latitude !== null && initialData.latitude !== undefined
//             ? String(initialData.latitude)
//             : "",
//         longitude:
//           initialData.longitude !== null && initialData.longitude !== undefined
//             ? String(initialData.longitude)
//             : "",
//         amenities: initialData.amenities || [],
//         images: [],
//         beds: initialData.beds ?? 1,
//         cleaning_fee: initialData.cleaning_fee ?? 0,
//         highlight_details: initialData.highlight_details || "",
//       }));
//       setExistingImages(initialData.images || []);
//     }
//   }, [initialData]);

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   const selectedAmenities = useMemo(
//     () => new Set(formData.amenities),
//     [formData.amenities]
//   );

//   if (!isOpen) return null;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCoordinateChange = (lat, lng) => {
//     setFormData((prev) => ({
//       ...prev,
//       latitude: lat,
//       longitude: lng,
//     }));
//   };

//   const handleToggleAmenity = (amenityId) => {
//     setFormData((prev) => {
//       const amenities = prev.amenities.includes(amenityId)
//         ? prev.amenities.filter((id) => id !== amenityId)
//         : [...prev.amenities, amenityId];

//       return { ...prev, amenities };
//     });
//   };

//   const updateCounter = (field, delta) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: Math.max(
//         0,
//         (typeof prev[field] === "number" ? prev[field] : 0) + delta
//       ),
//     }));
//   };

//   const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
//   const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
//   };

//   const removePhoto = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index),
//     }));
//   };

//   const handleRemoveExistingImage = async (imageId) => {
//     if (!window.confirm("Are you sure you want to delete this image?")) return;

//     const token = localStorage.getItem("access");
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/api/listings/${initialData.id}/delete_image/`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ image_id: imageId }),
//         }
//       );

//       if (response.ok) {
//         setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
//       } else {
//         alert("Failed to delete image");
//       }
//     } catch (error) {
//       console.error("Error deleting image:", error);
//       alert("Failed to delete image.");
//     }
//   };

//   const handleSubmit = async () => {
//     setLoading(true);

//     // TODAY ADDED: simple frontend validation
//     if (!formData.title.trim()) {
//       alert("Title is required.");
//       setLoading(false);
//       return;
//     }

//     if (!formData.street_address.trim()) {
//       alert("Street address is required.");
//       setLoading(false);
//       return;
//     }

//     if (!formData.city.trim()) {
//       alert("City is required.");
//       setLoading(false);
//       return;
//     }

//     if (!formData.property_type) {
//       alert("Property type is required.");
//       setLoading(false);
//       return;
//     }

//     if (!formData.category) {
//       alert("Category is required.");
//       setLoading(false);
//       return;
//     }

//     if (Number(formData.price_per_night) <= 0) {
//       alert("Price per night must be greater than 0.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const token = localStorage.getItem("access");
//       const formDataToSend = new FormData();

//       formDataToSend.append("title", formData.title);
//       formDataToSend.append("description", formData.description);
//       formDataToSend.append("highlight", formData.highlight);
//       formDataToSend.append("highlight_details", formData.highlight_details);
//       formDataToSend.append("property_type", formData.property_type);
//       formDataToSend.append("category", formData.category);
//       formDataToSend.append("city", formData.city);
//       formDataToSend.append("province", formData.province);
//       formDataToSend.append("region", formData.region);
//       formDataToSend.append("district", formData.district || "Unknown");
//       formDataToSend.append("country", formData.country || "Nepal");
//       formDataToSend.append("address", formData.street_address);
//       formDataToSend.append("bedrooms", formData.bedrooms);
//       formDataToSend.append("beds", formData.beds);
//       formDataToSend.append("bathrooms", formData.bathrooms);
//       formDataToSend.append("max_guests", formData.guests);
//       formDataToSend.append("price_per_night", formData.price_per_night);
//       formDataToSend.append("cleaning_fee", formData.cleaning_fee || 0);

//       if (formData.latitude !== "") {
//         formDataToSend.append("latitude", formData.latitude);
//       }

//       if (formData.longitude !== "") {
//         formDataToSend.append("longitude", formData.longitude);
//       }

//       AMENITIES_LIST.forEach((amenity) => {
//         formDataToSend.append(
//           amenity.id,
//           selectedAmenities.has(amenity.id) ? "true" : "false"
//         );
//       });

//       formData.images.forEach((imageFile) => {
//         formDataToSend.append("images", imageFile);
//       });

//       const url = initialData
//         ? `http://127.0.0.1:8000/api/listings/${initialData.id}/`
//         : "http://127.0.0.1:8000/api/listings/";

//       const method = initialData ? "PATCH" : "POST";

//       const response = await fetch(url, {
//         method,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formDataToSend,
//       });

//       if (response.ok) {
//         setSuccess(true);
//         setTimeout(() => {
//           onClose();
//           window.location.reload();
//         }, 1500);
//       } else {
//         const err = await response.json();
//         alert(`Error: ${JSON.stringify(err)}`);
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div className="step-container">
//             <div>
//               <p className="step-subtitle">Step 1: Tell us about your place</p>
//               <h2 className="step-title">
//                 Which of these categories best describes your place?
//               </h2>
//             </div>

//             <div className="categories-grid">
//               {CATEGORIES.map((cat) => (
//                 <div
//                   key={cat.id}
//                   className={`category-item ${
//                     formData.category === cat.label ? "active" : ""
//                   }`}
//                   onClick={() =>
//                     setFormData((prev) => ({ ...prev, category: cat.label }))
//                   }
//                 >
//                   <span className="category-icon">{cat.icon}</span>
//                   <span className="category-label">{cat.label}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="section-label">What type of place will guests have?</div>
//             <div className="type-options">
//               {PROPERTY_TYPES.map((type) => (
//                 <div
//                   key={type.id}
//                   className={`type-option ${
//                     formData.property_type === type.id ? "active" : ""
//                   }`}
//                   onClick={() =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       property_type: type.id,
//                     }))
//                   }
//                 >
//                   <div className="type-info">
//                     <h4>{type.label}</h4>
//                     <p>{type.description}</p>
//                   </div>
//                   <i className={`type-icon bi ${type.icon}`}></i>
//                 </div>
//               ))}
//             </div>

//             <div className="section-label location-heading">
//               <i className="bi bi-geo-alt-fill"></i>
//               <span>Where’s your place located?</span>
//             </div>

//             <p className="location-note">
//               <i className="bi bi-map"></i>
//               Hosts can type the address and also place an exact pin on the map.
//               This makes the property much easier to show correctly in Explore Map.
//             </p>

//             <div className="location-inputs">
//               <div className="input-field full-span">
//                 <label>Street Address</label>
//                 <input
//                   type="text"
//                   name="street_address"
//                   placeholder="Street address"
//                   value={formData.street_address}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="input-field">
//                 <label>City</label>
//                 <input
//                   type="text"
//                   name="city"
//                   placeholder="City"
//                   value={formData.city}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="input-field">
//                 <label>District</label>
//                 <input
//                   type="text"
//                   name="district"
//                   placeholder="District"
//                   value={formData.district}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="input-field">
//                 <label>Province</label>
//                 <select
//                   name="province"
//                   value={formData.province}
//                   onChange={handleInputChange}
//                   className="province-select"
//                 >
//                   <option value="">Select Province</option>
//                   {PROVINCES.map((province) => (
//                     <option key={province.label} value={province.label}>
//                       {province.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="input-field">
//                 <label>Region (Optional)</label>
//                 <select
//                   name="region"
//                   value={formData.region}
//                   onChange={handleInputChange}
//                   className="region-select"
//                 >
//                   <option value="">Select Region</option>
//                   {REGIONS.map((region) => (
//                     <option key={region.label} value={region.label}>
//                       {region.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="input-field full-span">
//                 <label>Country</label>
//                 <input
//                   type="text"
//                   name="country"
//                   placeholder="Country"
//                   value={formData.country}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="input-field">
//                 <label>Latitude</label>
//                 <input
//                   type="number"
//                   step="any"
//                   name="latitude"
//                   placeholder="e.g. 27.71720000"
//                   value={formData.latitude}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="input-field">
//                 <label>Longitude</label>
//                 <input
//                   type="number"
//                   step="any"
//                   name="longitude"
//                   placeholder="e.g. 85.32400000"
//                   value={formData.longitude}
//                   onChange={handleInputChange}
//                 />
//               </div>
//             </div>

//             <LocationMapPicker
//               latitude={formData.latitude}
//               longitude={formData.longitude}
//               onChange={handleCoordinateChange}
//             />

//             <div className="section-label">Share some basics about your place</div>
//             <div className="basics-container">
//               {[
//                 { label: "Guests", field: "guests" },
//                 { label: "Bedrooms", field: "bedrooms" },
//                 { label: "Beds", field: "beds" },
//                 { label: "Bathrooms", field: "bathrooms" },
//               ].map((item) => (
//                 <div key={item.field} className="counter-item">
//                   <span className="counter-label">{item.label}</span>
//                   <div className="counter-controls">
//                     <button
//                       type="button"
//                       className="counter-btn"
//                       onClick={() => updateCounter(item.field, -1)}
//                       disabled={formData[item.field] <= 0}
//                     >
//                       -
//                     </button>
//                     <span className="counter-value">{formData[item.field]}</span>
//                     <button
//                       type="button"
//                       className="counter-btn"
//                       onClick={() => updateCounter(item.field, 1)}
//                     >
//                       +
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="step-container">
//             <div>
//               <p className="step-subtitle">Step 2: Make your place stand out</p>
//               <h2 className="step-title">Tell guests what your place has to offer</h2>
//             </div>

//             <div className="amenities-grid">
//               {AMENITIES_LIST.map((amenity) => (
//                 <div
//                   key={amenity.id}
//                   className={`amenity-item ${
//                     formData.amenities.includes(amenity.id) ? "active" : ""
//                   }`}
//                   onClick={() => handleToggleAmenity(amenity.id)}
//                 >
//                   <span className="amenity-icon">{amenity.icon}</span>
//                   <span className="amenity-label">{amenity.label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="step-container">
//             <div>
//               <p className="step-subtitle">Step 3: Add some photos of your place</p>
//               <h2 className="step-title">
//                 Guests love to see what your place looks like
//               </h2>
//             </div>

//             <div className="photo-upload-container">
//               <label className="photo-upload-box">
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileChange}
//                   style={{ display: "none" }}
//                 />
//                 <div className="photo-upload-content">
//                   <span style={{ fontSize: "48px" }}>
//                     <ImCamera />
//                   </span>
//                   <p>Upload from your device</p>
//                 </div>
//               </label>

//               <div className="photo-preview-grid">
//                 {existingImages.map((img) => (
//                   <div key={img.id} className="photo-preview-item">
//                     <img
//                       src={
//                         img.image?.startsWith("http")
//                           ? img.image
//                           : `http://127.0.0.1:8000${img.image}`
//                       }
//                       alt="existing"
//                     />
//                     <button
//                       className="photo-remove-btn"
//                       onClick={() => handleRemoveExistingImage(img.id)}
//                       type="button"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}

//                 {formData.images.map((file, idx) => (
//                   <div key={idx} className="photo-preview-item">
//                     <img src={URL.createObjectURL(file)} alt="preview" />
//                     <button
//                       className="photo-remove-btn"
//                       onClick={() => removePhoto(idx)}
//                       type="button"
//                     >
//                       ✕
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="step-container">
//             <div>
//               <p className="step-subtitle">Step 4: Details & Highlights</p>
//               <h2 className="step-title">
//                 What makes your place attractive and exciting?
//               </h2>
//             </div>

//             <div className="form-grid">
//               <div className="input-field full-span">
//                 <label>Title</label>
//                 <input
//                   type="text"
//                   name="title"
//                   placeholder="Title"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                   maxLength={100}
//                 />
//               </div>

//               <div className="input-field full-span">
//                 <label>Description</label>
//                 <textarea
//                   name="description"
//                   placeholder="Description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={4}
//                   className="custom-textarea"
//                 />
//               </div>

//               <div className="input-field full-span">
//                 <label>Highlight</label>
//                 <input
//                   type="text"
//                   name="highlight"
//                   placeholder="Highlight (e.g. Near the lake)"
//                   value={formData.highlight}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div className="input-field full-span">
//                 <label>Highlight Details</label>
//                 <textarea
//                   name="highlight_details"
//                   placeholder="Tell guests more about the highlight"
//                   value={formData.highlight_details}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className="custom-textarea"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       case 5:
//         return (
//           <div className="step-container">
//             <div>
//               <p className="step-subtitle">Final Step: Pricing</p>
//               <h2 className="step-title">Now, set your PRICE</h2>
//             </div>

//             <div className="price-container">
//               <div className="price-input-wrapper">
//                 <span className="currency-symbol">NPR</span>
//                 <div className="price-controls">
//                   <button
//                     type="button"
//                     className="counter-btn big"
//                     onClick={() => updateCounter("price_per_night", -100)}
//                     disabled={formData.price_per_night <= 0}
//                   >
//                     —
//                   </button>

//                   <input
//                     type="number"
//                     name="price_per_night"
//                     value={formData.price_per_night}
//                     onChange={(e) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         price_per_night: Math.max(
//                           0,
//                           parseInt(e.target.value, 10) || 0
//                         ),
//                       }))
//                     }
//                     className="price-input-field"
//                   />

//                   <button
//                     type="button"
//                     className="counter-btn big"
//                     onClick={() => updateCounter("price_per_night", 100)}
//                   >
//                     +
//                   </button>
//                 </div>
//               </div>

//               <div
//                 className="input-field"
//                 style={{ maxWidth: "280px", marginTop: "20px" }}
//               >
//                 <label>Cleaning Fee (Optional)</label>
//                 <input
//                   type="number"
//                   name="cleaning_fee"
//                   min="0"
//                   value={formData.cleaning_fee}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       cleaning_fee: Math.max(
//                         0,
//                         parseInt(e.target.value, 10) || 0
//                       ),
//                     }))
//                   }
//                 />
//               </div>

//               <p style={{ color: "#717171", marginTop: "10px" }}>
//                 This is the price per night guests will see.
//               </p>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="listing-page-overlay" onClick={onClose}>
//       <div
//         className="listing-modal-content full-screen"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="progress-bar-container">
//           <div
//             className="progress-bar-fill"
//             style={{ width: `${(step / 5) * 100}%` }}
//           ></div>
//         </div>

//         <button className="modal-close-btn" onClick={onClose} type="button">
//           ✕
//         </button>

//         <div className="listing-modal-body">
//           {success ? (
//             <div style={{ textAlign: "center", padding: "100px 0" }}>
//               <h2 style={{ fontSize: "32px", fontWeight: "700" }}>
//                 {initialData ? "Listing Updated!" : "Listing Submitted!"}
//               </h2>
//               <p style={{ color: "#717171", fontSize: "18px" }}>
//                 {initialData
//                   ? "Your changes have been sent for review."
//                   : "Your place has been sent for admin review."}
//               </p>
//             </div>
//           ) : (
//             renderStep()
//           )}
//         </div>

//         {!success && (
//           <div className="listing-modal-footer">
//             {step > 1 ? (
//               <button className="back-btn" onClick={prevStep} type="button">
//                 Back
//               </button>
//             ) : (
//               <div></div>
//             )}

//             {step < 5 ? (
//               <button className="next-btn" onClick={nextStep} type="button">
//                 Next
//               </button>
//             ) : (
//               <button
//                 className="submit-listing-btn"
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 type="button"
//               >
//                 {loading
//                   ? "Processing..."
//                   : initialData
//                   ? "UPDATE LISTING"
//                   : "CREATE YOUR LISTING"}
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CreateListingModal;


import React, { useEffect, useMemo, useState } from "react";
import "../styles/CreateListingModal.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { ImCamera } from "react-icons/im";

import {
  MdBathtub,
  MdOutlineShower,
  MdOutlineLocalLaundryService,
  MdDryCleaning,
  MdIron,
  MdTv,
  MdOutlineKitchen,
  MdMicrowave,
  MdOutlineBalcony,
  MdOutlinePets,
  MdMedicalServices,
  MdApartment,
} from "react-icons/md";

import {
  FaPumpSoap,
  FaWifi,
  FaSnowflake,
  FaFireExtinguisher,
  FaParking,
  FaKey,
  FaHome,
  FaUsers,
  FaGem,
  FaWallet,
  FaMountain,
  FaWater,
  FaCity,
  FaTree,
  FaStar,
} from "react-icons/fa";

import {
  GiClothes,
  GiBarbecue,
  GiCampfire,
  GiFlowerPot,
  GiCampingTent,
  GiVillage,
  GiJungle,
} from "react-icons/gi";

import { TbFridge, TbAirConditioning } from "react-icons/tb";
import { BsCameraVideo, BsGrid3X3Gap } from "react-icons/bs";
import { LuTrees, LuCookingPot, LuMountain } from "react-icons/lu";
import { PiOfficeChairFill } from "react-icons/pi";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const DEFAULT_CENTER = [27.7172, 85.324];

const CATEGORIES = [
  { id: "apartment", label: "Apartment", icon: <MdApartment /> },
  { id: "house", label: "House", icon: <FaHome /> },
  { id: "homestay", label: "Homestay", icon: <FaUsers /> },
  { id: "hostel", label: "Hostel", icon: <BsGrid3X3Gap /> },
  { id: "luxury", label: "Luxury Stay", icon: <FaGem /> },
  { id: "budget", label: "Budget Stay", icon: <FaWallet /> },
  { id: "mountain", label: "Mountain", icon: <FaMountain /> },
  { id: "lake_view", label: "Lake View", icon: <FaWater /> },
  { id: "city", label: "City Area", icon: <FaCity /> },
  { id: "countryside", label: "Countryside", icon: <FaTree /> },
  { id: "jungle", label: "Jungle Site", icon: <GiJungle /> },
  { id: "camping", label: "Camping", icon: <GiCampingTent /> },
  { id: "traditional", label: "Traditional House", icon: <GiVillage /> },
  { id: "trekking", label: "Trekking Route", icon: <LuMountain /> },
  { id: "famous", label: "Famous Areas", icon: <FaStar /> },
];

const REGIONS = [
  { label: "Far West" },
  { label: "Mid West" },
  { label: "West" },
  { label: "Central" },
  { label: "East" },
];

const PROVINCES = [
  { label: "Koshi" },
  { label: "Madhesh" },
  { label: "Bagmati" },
  { label: "Gandaki" },
  { label: "Lumbini" },
  { label: "Karnali" },
  { label: "Sudurpashchim" },
];

const PROPERTY_TYPES = [
  {
    id: "house",
    label: "An entire place",
    description: "Guests have the whole place to themselves",
    icon: "bi-house-door",
  },
  {
    id: "room",
    label: "Room(s)",
    description:
      "Guests have their own room in a house, plus access to shared places",
    icon: "bi-door-open",
  },
  {
    id: "shared_room",
    label: "A Shared Room",
    description:
      "Guests sleep in a room or common area that may be shared with you or others",
    icon: "bi-people-fill",
  },
];

const AMENITIES_LIST = [
  { id: "bath_tub", label: "Bath tub", icon: <MdBathtub /> },
  { id: "personal_care", label: "Personal care products", icon: <FaPumpSoap /> },
  { id: "outdoor_shower", label: "Outdoor shower", icon: <MdOutlineShower /> },
  { id: "washer", label: "Washer", icon: <MdOutlineLocalLaundryService /> },
  { id: "dryer", label: "Dryer", icon: <MdDryCleaning /> },
  { id: "hangers", label: "Hangers", icon: <GiClothes /> },
  { id: "iron", label: "Iron", icon: <MdIron /> },
  { id: "tv", label: "TV", icon: <MdTv /> },
  {
    id: "dedicated_workspace",
    label: "Dedicated workspace",
    icon: <PiOfficeChairFill />,
  },
  {
    id: "air_conditioning",
    label: "Air Conditioning",
    icon: <TbAirConditioning />,
  },
  { id: "heating", label: "Heating", icon: <FaSnowflake /> },
  { id: "security_cameras", label: "Security cameras", icon: <BsCameraVideo /> },
  {
    id: "fire_extinguisher",
    label: "Fire extinguisher",
    icon: <FaFireExtinguisher />,
  },
  { id: "first_aid", label: "First Aid", icon: <MdMedicalServices /> },
  { id: "wifi", label: "Wifi", icon: <FaWifi /> },
  { id: "cooking_set", label: "Cooking set", icon: <LuCookingPot /> },
  { id: "refrigerator", label: "Refrigerator", icon: <TbFridge /> },
  { id: "microwave", label: "Microwave", icon: <MdMicrowave /> },
  { id: "stove", label: "Stove", icon: <MdOutlineKitchen /> },
  { id: "barbecue_grill", label: "Barbecue grill", icon: <GiBarbecue /> },
  { id: "outdoor_dining_area", label: "Outdoor dining area", icon: <LuTrees /> },
  {
    id: "private_patio_or_balcony",
    label: "Private patio or Balcony",
    icon: <MdOutlineBalcony />,
  },
  { id: "camp_fire", label: "Camp fire", icon: <GiCampfire /> },
  { id: "garden", label: "Garden", icon: <GiFlowerPot /> },
  { id: "free_parking", label: "Free parking", icon: <FaParking /> },
  { id: "self_check_in", label: "Self check-in", icon: <FaKey /> },
  { id: "pet_allowed", label: "Pet allowed", icon: <MdOutlinePets /> },
];

function MapRecenter({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude !== "" &&
      longitude !== "" &&
      !Number.isNaN(Number(latitude)) &&
      !Number.isNaN(Number(longitude))
    ) {
      map.setView([Number(latitude), Number(longitude)], 15);
    }
  }, [latitude, longitude, map]);

  return null;
}

function MapInvalidator() {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

function LocationMapPicker({ latitude, longitude, onChange }) {
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat.toFixed(8), e.latlng.lng.toFixed(8));
      },
    });
    return null;
  }

  const markerPosition =
    latitude !== "" &&
    longitude !== "" &&
    !Number.isNaN(Number(latitude)) &&
    !Number.isNaN(Number(longitude))
      ? [Number(latitude), Number(longitude)]
      : null;

  const initialCenter = markerPosition || DEFAULT_CENTER;

  return (
    <div className="host-map-wrapper">
      <MapContainer
        center={initialCenter}
        zoom={markerPosition ? 15 : 7}
        scrollWheelZoom
        className="host-location-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInvalidator />
        <MapClickHandler />
        <MapRecenter latitude={latitude} longitude={longitude} />

        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onChange(lat.toFixed(8), lng.toFixed(8));
              },
            }}
          />
        )}
      </MapContainer>

      <div className="map-help-row">
        <span>
          <i className="bi bi-geo-alt-fill"></i> Click on the map or drag the pin
          to set the exact property location.
        </span>
        <button
          type="button"
          className="map-reset-btn"
          onClick={() => onChange("", "")}
        >
          Clear Pin
        </button>
      </div>
    </div>
  );
}

const CreateListingModal = ({ isOpen, onClose, initialData = null }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    category: "Apartment",
    property_type: "house",
    street_address: "",
    city: "",
    province: "",
    district: "",
    region: "",
    country: "Nepal",
    latitude: "",
    longitude: "",
    guests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: [],
    title: "",
    description: "",
    highlight: "",
    highlight_details: "",
    price_per_night: 0,
    cleaning_fee: 0,
    images: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    if (initialData) {
      const amenityValues = AMENITIES_LIST.filter(
        (amenity) => initialData?.[amenity.id] === true
      ).map((amenity) => amenity.id);

      setFormData((prev) => ({
        ...prev,
        ...initialData,
        street_address: initialData.address || "",
        district: initialData.district || "",
        province: initialData.province || "",
        region: initialData.region || "",
        country: initialData.country || "Nepal",
        latitude:
          initialData.latitude !== null && initialData.latitude !== undefined
            ? String(initialData.latitude)
            : "",
        longitude:
          initialData.longitude !== null && initialData.longitude !== undefined
            ? String(initialData.longitude)
            : "",
        amenities: initialData.amenities?.length
          ? initialData.amenities
          : amenityValues,
        images: [],
        guests: initialData.max_guests ?? initialData.guests ?? 1,
        bedrooms: initialData.bedrooms ?? 1,
        beds: initialData.beds ?? 1,
        bathrooms: initialData.bathrooms ?? 1,
        title: initialData.title || "",
        description: initialData.description || "",
        highlight: initialData.highlight || "",
        highlight_details: initialData.highlight_details || "",
        price_per_night: initialData.price_per_night ?? 0,
        cleaning_fee: initialData.cleaning_fee ?? 0,
      }));

      setExistingImages(initialData.images || []);
    } else {
      setFormData({
        category: "Apartment",
        property_type: "house",
        street_address: "",
        city: "",
        province: "",
        district: "",
        region: "",
        country: "Nepal",
        latitude: "",
        longitude: "",
        guests: 1,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
        amenities: [],
        title: "",
        description: "",
        highlight: "",
        highlight_details: "",
        price_per_night: 0,
        cleaning_fee: 0,
        images: [],
      });
      setExistingImages([]);
    }

    setFieldErrors({});
    setTouchedFields({});
    setStep(1);
    setSuccess(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const selectedAmenities = useMemo(
    () => new Set(formData.amenities),
    [formData.amenities]
  );

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCoordinateChange = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    setTouchedFields((prev) => ({
      ...prev,
      latitude: true,
      longitude: true,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
    }));
  };

  const handleToggleAmenity = (amenityId) => {
    setFormData((prev) => {
      const amenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId];

      return { ...prev, amenities };
    });
  };

  const updateCounter = (field, delta) => {
    setFormData((prev) => {
      const nextValue = Math.max(
        0,
        (typeof prev[field] === "number" ? prev[field] : 0) + delta
      );

      return {
        ...prev,
        [field]: nextValue,
      };
    });

    setTouchedFields((prev) => ({
      ...prev,
      [field]: true,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateStep = (currentStep = step) => {
    const errors = {};

    if (currentStep === 1) {
      if (!formData.street_address.trim()) {
        errors.street_address = "Street address is required.";
      }

      if (!formData.city.trim()) {
        errors.city = "City is required.";
      }

      if (!formData.district.trim()) {
        errors.district = "District is required.";
      }

      if (!formData.province.trim()) {
        errors.province = "Province is required.";
      }

      if (!formData.country.trim()) {
        errors.country = "Country is required.";
      }

      if (Number(formData.guests) <= 0) {
        errors.guests = "Guests must be at least 1.";
      }

      if (Number(formData.bedrooms) <= 0) {
        errors.bedrooms = "Bedrooms must be at least 1.";
      }

      if (Number(formData.beds) <= 0) {
        errors.beds = "Beds must be at least 1.";
      }

      if (Number(formData.bathrooms) <= 0) {
        errors.bathrooms = "Bathrooms must be at least 1.";
      }
    }

    if (currentStep === 4) {
      if (!formData.title.trim()) {
        errors.title = "Title is required.";
      }

      if (!formData.description.trim()) {
        errors.description = "Description is required.";
      }

      if (!formData.highlight.trim()) {
        errors.highlight = "Highlight is required.";
      }

      if (!formData.highlight_details.trim()) {
        errors.highlight_details = "Highlight details are required.";
      }
    }

    if (currentStep === 5) {
      if (Number(formData.price_per_night) <= 0) {
        errors.price_per_night = "Price per night must be greater than 0.";
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const touched = {};
      Object.keys(errors).forEach((key) => {
        touched[key] = true;
      });

      setTouchedFields((prev) => ({
        ...prev,
        ...touched,
      }));

      return false;
    }

    return true;
  };

  const nextStep = () => {
    const isValid = validateStep(step);
    if (!isValid) return;

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    const token = localStorage.getItem("access");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/listings/${initialData.id}/delete_image/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image_id: imageId }),
        }
      );

      if (response.ok) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        alert("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image.");
    }
  };

  const getError = (field) => {
    return touchedFields[field] && fieldErrors[field] ? fieldErrors[field] : "";
  };

  const getInputClass = (field, extraClass = "") => {
    return `${extraClass} ${getError(field) ? "input-error" : ""}`.trim();
  };

  const handleSubmit = async () => {
    const isValidStep4 = validateStep(4);
    const isValidStep5 = validateStep(5);

    if (!isValidStep4 || !isValidStep5) {
      if (!isValidStep4) {
        setStep(4);
      } else {
        setStep(5);
      }
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access");
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("highlight", formData.highlight);
      formDataToSend.append("highlight_details", formData.highlight_details);
      formDataToSend.append("property_type", formData.property_type);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("province", formData.province);
      formDataToSend.append("region", formData.region);
      formDataToSend.append("district", formData.district || "Unknown");
      formDataToSend.append("country", formData.country || "Nepal");
      formDataToSend.append("address", formData.street_address);
      formDataToSend.append("bedrooms", formData.bedrooms);
      formDataToSend.append("beds", formData.beds);
      formDataToSend.append("bathrooms", formData.bathrooms);
      formDataToSend.append("max_guests", formData.guests);
      formDataToSend.append("price_per_night", formData.price_per_night);
      formDataToSend.append("cleaning_fee", formData.cleaning_fee || 0);

      if (formData.latitude !== "") {
        formDataToSend.append("latitude", formData.latitude);
      }

      if (formData.longitude !== "") {
        formDataToSend.append("longitude", formData.longitude);
      }

      AMENITIES_LIST.forEach((amenity) => {
        formDataToSend.append(
          amenity.id,
          selectedAmenities.has(amenity.id) ? "true" : "false"
        );
      });

      formData.images.forEach((imageFile) => {
        formDataToSend.append("images", imageFile);
      });

      const url = initialData
        ? `http://127.0.0.1:8000/api/listings/${initialData.id}/`
        : "http://127.0.0.1:8000/api/listings/";

      const method = initialData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setSuccess(true);

        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        const err = await response.json();
        alert(`Error: ${JSON.stringify(err)}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="step-container">
            <div>
              <p className="step-subtitle">Step 1: Tell us about your place</p>
              <h2 className="step-title">
                Which of these categories best describes your place?
              </h2>
            </div>

            <div className="categories-grid">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-item ${
                    formData.category === cat.label ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, category: cat.label }))
                  }
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-label">{cat.label}</span>
                </div>
              ))}
            </div>

            <div className="section-label">What type of place will guests have?</div>

            <div className="type-options">
              {PROPERTY_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`type-option ${
                    formData.property_type === type.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      property_type: type.id,
                    }))
                  }
                >
                  <div className="type-info">
                    <h4>{type.label}</h4>
                    <p>{type.description}</p>
                  </div>
                  <i className={`type-icon bi ${type.icon}`}></i>
                </div>
              ))}
            </div>

            <div className="section-label location-heading">
              <i className="bi bi-geo-alt-fill"></i>
              <span>Where’s your place located?</span>
            </div>

            <p className="location-note">
              <i className="bi bi-map"></i>
              Hosts can type the address and also place an exact pin on the map.
              This makes the property much easier to show correctly in Explore Map.
            </p>

            <div className="location-inputs">
              <div className="input-field full-span">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street_address"
                  placeholder="Street address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                  className={getInputClass("street_address")}
                />
                {getError("street_address") && (
                  <small className="field-error">{getError("street_address")}</small>
                )}
              </div>

              <div className="input-field">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={getInputClass("city")}
                />
                {getError("city") && (
                  <small className="field-error">{getError("city")}</small>
                )}
              </div>

              <div className="input-field">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  placeholder="District"
                  value={formData.district}
                  onChange={handleInputChange}
                  className={getInputClass("district")}
                />
                {getError("district") && (
                  <small className="field-error">{getError("district")}</small>
                )}
              </div>

              <div className="input-field">
                <label>Province</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className={getInputClass("province", "province-select")}
                >
                  <option value="">Select Province</option>
                  {PROVINCES.map((province) => (
                    <option key={province.label} value={province.label}>
                      {province.label}
                    </option>
                  ))}
                </select>
                {getError("province") && (
                  <small className="field-error">{getError("province")}</small>
                )}
              </div>

              <div className="input-field">
                <label>Region (Optional)</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="region-select"
                >
                  <option value="">Select Region</option>
                  {REGIONS.map((region) => (
                    <option key={region.label} value={region.label}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-field full-span">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={getInputClass("country")}
                />
                {getError("country") && (
                  <small className="field-error">{getError("country")}</small>
                )}
              </div>

              <div className="input-field">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  placeholder="e.g. 27.71720000"
                  value={formData.latitude}
                  onChange={handleInputChange}
                />
              </div>

              <div className="input-field">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  placeholder="e.g. 85.32400000"
                  value={formData.longitude}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <LocationMapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleCoordinateChange}
            />

            <div className="section-label">Share some basics about your place</div>

            <div className="basics-container">
              {[
                { label: "Guests", field: "guests" },
                { label: "Bedrooms", field: "bedrooms" },
                { label: "Beds", field: "beds" },
                { label: "Bathrooms", field: "bathrooms" },
              ].map((item) => (
                <div key={item.field} className="counter-item">
                  <span className="counter-label">{item.label}</span>
                  <div className="counter-controls">
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateCounter(item.field, -1)}
                      disabled={formData[item.field] <= 0}
                    >
                      -
                    </button>
                    <span className="counter-value">{formData[item.field]}</span>
                    <button
                      type="button"
                      className="counter-btn"
                      onClick={() => updateCounter(item.field, 1)}
                    >
                      +
                    </button>
                  </div>

                  {getError(item.field) && (
                    <small className="field-error">{getError(item.field)}</small>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-container">
            <div>
              <p className="step-subtitle">Step 2: Make your place stand out</p>
              <h2 className="step-title">Tell guests what your place has to offer</h2>
            </div>

            <div className="amenities-grid">
              {AMENITIES_LIST.map((amenity) => (
                <div
                  key={amenity.id}
                  className={`amenity-item ${
                    formData.amenities.includes(amenity.id) ? "active" : ""
                  }`}
                  onClick={() => handleToggleAmenity(amenity.id)}
                >
                  <span className="amenity-icon">{amenity.icon}</span>
                  <span className="amenity-label">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-container">
            <div>
              <p className="step-subtitle">Step 3: Add some photos of your place</p>
              <h2 className="step-title">
                Guests love to see what your place looks like
              </h2>
            </div>

            <div className="photo-upload-container">
              <label className="photo-upload-box">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="photo-upload-content">
                  <span style={{ fontSize: "48px" }}>
                    <ImCamera />
                  </span>
                  <p>Upload from your device</p>
                </div>
              </label>

              <div className="photo-preview-grid">
                {existingImages.map((img) => (
                  <div key={img.id} className="photo-preview-item">
                    <img
                      src={
                        img.image?.startsWith("http")
                          ? img.image
                          : `http://127.0.0.1:8000${img.image}`
                      }
                      alt="existing"
                    />
                    <button
                      className="photo-remove-btn"
                      onClick={() => handleRemoveExistingImage(img.id)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {formData.images.map((file, idx) => (
                  <div key={idx} className="photo-preview-item">
                    <img src={URL.createObjectURL(file)} alt="preview" />
                    <button
                      className="photo-remove-btn"
                      onClick={() => removePhoto(idx)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-container">
            <div>
              <p className="step-subtitle">Step 4: Details & Highlights</p>
              <h2 className="step-title">
                What makes your place attractive and exciting?
              </h2>
            </div>

            <div className="form-grid">
              <div className="input-field full-span">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  maxLength={100}
                  className={getInputClass("title")}
                />
                {getError("title") && (
                  <small className="field-error">{getError("title")}</small>
                )}
              </div>

              <div className="input-field full-span">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`custom-textarea ${getInputClass("description")}`}
                />
                {getError("description") && (
                  <small className="field-error">{getError("description")}</small>
                )}
              </div>

              <div className="input-field full-span">
                <label>Highlight</label>
                <input
                  type="text"
                  name="highlight"
                  placeholder="Highlight (e.g. Near the lake)"
                  value={formData.highlight}
                  onChange={handleInputChange}
                  className={getInputClass("highlight")}
                />
                {getError("highlight") && (
                  <small className="field-error">{getError("highlight")}</small>
                )}
              </div>

              <div className="input-field full-span">
                <label>Highlight Details</label>
                <textarea
                  name="highlight_details"
                  placeholder="Tell guests more about the highlight"
                  value={formData.highlight_details}
                  onChange={handleInputChange}
                  rows={3}
                  className={`custom-textarea ${getInputClass("highlight_details")}`}
                />
                {getError("highlight_details") && (
                  <small className="field-error">
                    {getError("highlight_details")}
                  </small>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step-container">
            <div>
              <p className="step-subtitle">Final Step: Pricing</p>
              <h2 className="step-title">Now, set your PRICE</h2>
            </div>

            <div className="price-container">
              <div className="price-input-wrapper">
                <span className="currency-symbol">NPR</span>

                <div className="price-controls">
                  <button
                    type="button"
                    className="counter-btn big"
                    onClick={() => updateCounter("price_per_night", -100)}
                    disabled={formData.price_per_night <= 0}
                  >
                    —
                  </button>

                  <input
                    type="number"
                    name="price_per_night"
                    value={formData.price_per_night}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        price_per_night: Math.max(
                          0,
                          parseInt(e.target.value, 10) || 0
                        ),
                      }));

                      setTouchedFields((prev) => ({
                        ...prev,
                        price_per_night: true,
                      }));

                      setFieldErrors((prev) => ({
                        ...prev,
                        price_per_night: "",
                      }));
                    }}
                    className={`price-input-field ${
                      getError("price_per_night") ? "input-error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    className="counter-btn big"
                    onClick={() => updateCounter("price_per_night", 100)}
                  >
                    +
                  </button>
                </div>
              </div>

              {getError("price_per_night") && (
                <small className="field-error">{getError("price_per_night")}</small>
              )}

              <div
                className="input-field"
                style={{ maxWidth: "280px", marginTop: "20px" }}
              >
                <label>Cleaning Fee (Optional)</label>
                <input
                  type="number"
                  name="cleaning_fee"
                  min="0"
                  value={formData.cleaning_fee}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cleaning_fee: Math.max(
                        0,
                        parseInt(e.target.value, 10) || 0
                      ),
                    }))
                  }
                />
              </div>

              <p style={{ color: "#717171", marginTop: "10px" }}>
                This is the price per night guests will see.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="listing-page-overlay" onClick={onClose}>
      <div
        className="listing-modal-content full-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        <button className="modal-close-btn" onClick={onClose} type="button">
          ✕
        </button>

        <div className="listing-modal-body">
          {success ? (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <h2 style={{ fontSize: "32px", fontWeight: "700" }}>
                {initialData ? "Listing Updated!" : "Listing Submitted!"}
              </h2>
              <p style={{ color: "#717171", fontSize: "18px" }}>
                {initialData
                  ? "Your changes have been sent for review."
                  : "Your place has been sent for admin review."}
              </p>
            </div>
          ) : (
            renderStep()
          )}
        </div>

        {!success && (
          <div className="listing-modal-footer">
            {step > 1 ? (
              <button className="back-btn" onClick={prevStep} type="button">
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button className="next-btn" onClick={nextStep} type="button">
                Next
              </button>
            ) : (
              <button
                className="submit-listing-btn"
                onClick={handleSubmit}
                disabled={loading}
                type="button"
              >
                {loading
                  ? "Processing..."
                  : initialData
                  ? "UPDATE LISTING"
                  : "CREATE YOUR LISTING"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListingModal;