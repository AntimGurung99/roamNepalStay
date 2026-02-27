import React, { useState, useEffect } from 'react';
import '../styles/CreateListingModal.css';

const CATEGORIES = [
  { label: "Apartment", icon: "bi-building" },
  { label: "House", icon: "bi-house" },
  { label: "Homestay", icon: "bi-people" },
  { label: "Hostel", icon: "bi-grid-3x3-gap" },
  { label: "Luxury Stay", icon: "bi-gem" },
  { label: "Budget Stay", icon: "bi-wallet2" },
  { label: "Mountain", icon: "bi-mountain" },
  { label: "Lake View", icon: "bi-water" },
  { label: "City Area", icon: "bi-buildings" },
  { label: 'Iconic cities', icon: "bi-bank" },
  { label: 'Countryside', icon: "bi-tree" },
  { label: 'Castles', icon: "bi-castle" },
  { label: 'Camping', icon: "bi-tent" },
  { label: 'Jungle Site', icon: "bi-cloud-haze" },
  { label: 'Traditional House', icon: "bi-house-heart" },
  { label: "Trekking Route", icon: "bi-signpost-split" },
  { label: "Famous Areas", icon: "bi-stars" },
];

const REGIONS = [
  { label: "Far West" },
  { label: "Mid West" },
  { label: "West" },
  { label: "Central" },
  { label: "East" },
];

const PROVINCES = [
  { label: "Province 1" },
  { label: "Province 2" },
  { label: "Province 3" },
  { label: "Province 4" },
  { label: "Province 5" },
  { label: "Province 6" },
  { label: "Province 7" },
];

const PROPERTY_TYPES = [
  { 
    id: 'house', 
    label: 'An entire place', 
    description: 'Guests have the whole place to themselves',
    icon: 'bi bi-house-door'
  },
  { 
    id: 'room', 
    label: 'Room(s)', 
    description: 'Guests have their own room in a house, plus access to shared places',
    icon: 'bi bi-door-open'
  },
  { 
    id: 'shared_room', 
    label: 'A Shared Room', 
    description: 'Guests sleep in a room or common area that maybe shared with you or others',
    icon: 'bi bi-people-fill'
  },
];

const AMENITIES_LIST = [
  { id: 'bath_tub', label: 'Bath tub', icon: 'bi-droplet-half' },
  { id: 'personal_care', label: 'Personal care products', icon: 'bi-bandaid' },
  { id: 'outdoor_shower', label: 'Outdoor shower', icon: 'bi-cloud-rain-heavy' },
  { id: 'washer', label: 'Washer', icon: 'bi-bucket' },
  { id: 'dryer', label: 'Dryer', icon: 'bi-wind' },
  { id: 'hangers', label: 'Hangers', icon: 'bi-app-indicator' },
  { id: 'iron', label: 'Iron', icon: 'bi-lightning-charge' },
  { id: 'tv', label: 'TV', icon: 'bi-tv' },
  { id: 'dedicated_workspace', label: 'Dedicated workspace', icon: 'bi-laptop' },
  { id: 'air_conditioning', label: 'Air Conditioning', icon: 'bi-snow' },
  { id: 'heating', label: 'Heating', icon: 'bi-thermometer-half' },
  { id: 'security_cameras', label: 'Security cameras', icon: 'bi-camera-video' },
  { id: 'fire_extinguisher', label: 'Fire extinguisher', icon: 'bi-fire' },
  { id: 'first_aid', label: 'First Aid', icon: 'bi-plus-square' },
  { id: 'wifi', label: 'Wifi', icon: 'bi-wifi' },
  { id: 'cooking_set', label: 'Cooking set', icon: 'bi-egg-fried' },
  { id: 'refrigerator', label: 'Refrigerator', icon: 'bi-box' },
  { id: 'microwave', label: 'Microwave', icon: 'bi-box-seam' },
  { id: 'stove', label: 'Stove', icon: 'bi-fire' },
  { id: 'barbecue_grill', label: 'Barbecue grill', icon: 'bi-grid-3x3' },
  { id: 'outdoor_dining_area', label: 'Outdoor dining area', icon: 'bi-tree' },
  { id: 'private_patio_or_balcony', label: 'Private patio or Balcony', icon: 'bi-layout-sidebar' },
  { id: 'camp_fire', label: 'Camp fire', icon: 'bi-fire' },
  { id: 'garden', label: 'Garden', icon: 'bi-flower1' },
  { id: 'free_parking', label: 'Free parking', icon: 'bi-p-circle' },
  { id: 'self_check_in', label: 'Self check-in', icon: 'bi-key' },
  { id: 'pet_allowed', label: 'Pet allowed', icon: 'bi-dog' },
];

const CreateListingModal = ({ isOpen, onClose, initialData = null }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: 'Apartment',
    property_type: 'house',
    street_address: '',
    city: '',
    province: '',
    region: '',
    country: 'Nepal',
    guests: 1,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    title: '',
    description: '',
    highlight: '',
    highlight_details: '',
    price_per_night: 0,
    images: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        street_address: initialData.address || '',
        images: [],
      });
      setExistingImages(initialData.images || []);
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleAmenity = (amenityId) => {
    setFormData(prev => {
      const amenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities };
    });
  };

  const updateCounter = (field, delta) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, (typeof prev[field] === 'number' ? prev[field] : 0) + delta)
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    const token = localStorage.getItem('access');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/listings/${initialData.id}/delete_image/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_id: imageId })
      });

      if (response.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        alert("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
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
      formDataToSend.append("district", formData.province || 'Unknown');
      formDataToSend.append("country", formData.country || 'Nepal');
      formDataToSend.append("address", formData.street_address);
      formDataToSend.append("bedrooms", formData.bedrooms);
      formDataToSend.append("bathrooms", formData.bathrooms);
      formDataToSend.append("max_guests", formData.guests);
      formDataToSend.append("price_per_night", formData.price_per_night);

      AMENITIES_LIST.forEach(amenity => {
        formDataToSend.append(amenity.id, formData.amenities.includes(amenity.id));
      });

      formData.images.forEach(imageFile => {
        formDataToSend.append('images', imageFile);
      });

      const url = initialData 
        ? `http://127.0.0.1:8000/api/listings/${initialData.id}/` 
        : 'http://127.0.0.1:8000/api/listings/';
      
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 2000);
      } else {
        const err = await response.json();
        alert(`Error: ${JSON.stringify(err)}`);
      }
    } catch (error) {
        console.error(error);
      alert('Network error. Please try again.');
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
              <h2 className="step-title">Which of these categories best describes your place?</h2>
            </div>
            
            <div className="categories-grid">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.label} 
                  className={`category-item ${formData.category === cat.label ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, category: cat.label})}
                >
                  <i className={`category-icon bi ${cat.icon}`}></i>
                  <span className="category-label">{cat.label}</span>
                </div>
              ))}
            </div>

            <div className="section-label">What type of place will guests have?</div>
            <div className="type-options">
              {PROPERTY_TYPES.map(type => (
                <div 
                  key={type.id} 
                  className={`type-option ${formData.property_type === type.id ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, property_type: type.id})}
                >
                  <div className="type-info">
                    <h4>{type.label}</h4>
                    <p>{type.description}</p>
                  </div>
                  <i className={`type-icon bi ${type.icon}`}></i>
                </div>
              ))}
            </div>

            <div className="section-label">Where's your place located?</div>
            <div className="location-inputs">
              <div className="input-field full-span">
                <label>Street Address</label>
                <input 
                  type="text" 
                  name="street_address" 
                  placeholder="Street address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-field">
                <label>City</label>
                <input 
                  type="text" 
                  name="city" 
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-field">
                <label>Province</label>
                <select 
                  name="province" 
                  value={formData.province}
                  onChange={handleInputChange}
                  className="province-select"
                >
                  <option value="">Select Province</option>
                  {PROVINCES.map(province => (
                    <option key={province.label} value={province.label}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>Region</label>
                <select 
                  name="region" 
                  value={formData.region}
                  onChange={handleInputChange}
                  className="region-select"
                >
                  <option value="">Select Region</option>
                  {REGIONS.map(region => (
                    <option key={region.label} value={region.label}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>Country</label>
                <input 
                  type="text" 
                  name="country" 
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="section-label">Share some basics about your place</div>
            <div className="basics-container">
              {[
                { label: 'Guests', field: 'guests' },
                { label: 'Bedrooms', field: 'bedrooms' },
                { label: 'Bathrooms', field: 'bathrooms' },
              ].map(item => (
                <div key={item.field} className="counter-item">
                  <span className="counter-label">{item.label}</span>
                  <div className="counter-controls">
                    <button 
                      className="counter-btn"
                      onClick={() => updateCounter(item.field, -1)}
                      disabled={formData[item.field] <= 0}
                    >-</button>
                    <span className="counter-value">{formData[item.field]}</span>
                    <button 
                      className="counter-btn"
                      onClick={() => updateCounter(item.field, 1)}
                    >+</button>
                  </div>
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
              {AMENITIES_LIST.map(amenity => (
                <div 
                  key={amenity.id} 
                  className={`amenity-item ${formData.amenities.includes(amenity.id) ? 'active' : ''}`}
                  onClick={() => handleToggleAmenity(amenity.id)}
                >
                  <i className={`amenity-icon bi ${amenity.icon}`}></i>
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
              <h2 className="step-title">Guests love to see what your place looks like</h2>
            </div>

            <div className="photo-upload-container">
              <label className="photo-upload-box">
                <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                <div className="photo-upload-content">
                  <span style={{ fontSize: '48px' }}>📸</span>
                  <p>Upload from your device</p>
                </div>
              </label>
              <div className="photo-preview-grid">
                {/* Existing Images */}
                {existingImages.map((img) => (
                  <div key={img.id} className="photo-preview-item">
                    <img src={img.image?.startsWith('http') ? img.image : `http://127.0.0.1:8000${img.image}`} alt="existing" />
                    <button 
                      className="photo-remove-btn" 
                      onClick={() => handleRemoveExistingImage(img.id)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* New Images */}
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
              <h2 className="step-title">What make your place attractive and exciting?</h2>
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
                />
              </div>
              <div className="input-field full-span">
                <label>Description</label>
                <textarea 
                  name="description" 
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="custom-textarea"
                />
              </div>
              <div className="input-field full-span">
                <label>Highlight</label>
                <input 
                  type="text" 
                  name="highlight" 
                  placeholder="Highlight (e.g. Near the lake)"
                  value={formData.highlight}
                  onChange={handleInputChange}
                />
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
                        className="counter-btn big"
                        onClick={() => updateCounter('price_per_night', -100)}
                        disabled={formData.price_per_night <= 0}
                    >—</button>
                    <input 
                        type="number" 
                        name="price_per_night" 
                        value={formData.price_per_night}
                        onChange={(e) => setFormData({...formData, price_per_night: Math.max(0, parseInt(e.target.value) || 0)})}
                        className="price-input-field"
                    />
                    <button 
                        className="counter-btn big"
                        onClick={() => updateCounter('price_per_night', 100)}
                    >+</button>
                </div>
              </div>
              <p style={{ color: '#717171', marginTop: '10px' }}>This is the price per night guests will see.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="listing-page-overlay" onClick={onClose}>
      <div className="listing-modal-content full-screen" onClick={e => e.stopPropagation()}>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
        
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="listing-modal-body">
          {success ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
              <h2 style={{ fontSize: '32px', fontWeight: '700' }}>
                {initialData ? 'Listing Updated!' : 'Listing Submitted!'}
              </h2>
              <p style={{ color: '#717171', fontSize: '18px' }}>
                {initialData 
                  ? 'Your changes have been sent for review.' 
                  : 'Your place has been sent for admin review.'}
              </p>
            </div>
          ) : renderStep()}
        </div>

        {!success && (
          <div className="listing-modal-footer">
            {step > 1 ? (
              <button className="back-btn" onClick={prevStep}>Back</button>
            ) : (
              <div></div>
            )}
            
            {step < 5 ? (
              <button className="next-btn" onClick={nextStep}>Next</button>
            ) : (
              <button 
                className="submit-listing-btn" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading 
                  ? 'Processing...' 
                  : initialData ? 'UPDATE LISTING' : 'CREATE YOUR LISTING'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListingModal;
