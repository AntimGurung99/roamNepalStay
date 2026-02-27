import React, { useState, useEffect } from 'react';
import '../styles/HostApplicationModal.css';

const HostApplicationModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        citizenship_number: '',
        citizenship_image: null,
        phone_number: '',
        business_name: '',
        business_registration: '',
        tax_number: '',
        bank_name: '',
        account_number: '',
        account_holder_name: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, citizenship_image: file }));
        if (errors.citizenship_image) {
            setErrors(prev => ({ ...prev, citizenship_image: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.citizenship_number.trim()) newErrors.citizenship_number = 'Citizenship number is required';
        if (!formData.citizenship_image) newErrors.citizenship_image = 'Citizenship copy is required';
        if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
        if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required';
        if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required';
        if (!formData.account_holder_name.trim()) newErrors.account_holder_name = 'Account holder name is required';

        if (formData.citizenship_number && !/^\d{5,20}[/-]?\d*$/.test(formData.citizenship_number)) { 
            // Simplified regex for Nepali citizenship which can have / or -
            // newErrors.citizenship_number = 'कृपया मान्य नागरिकता नम्बर राख्नुहोस्';
        }

        if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Please enter a valid 10-digit phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('access');
            
            if (!token) {
                alert('You are not logged in. Please login first.');
                return;
            }

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });

            const response = await fetch('http://127.0.0.1:8000/api/host-applications/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: data
            });

            if (response.ok) {
                // SUCCESS LOGIC:
                // 1. Inform the user of success via modal state
                setSuccess(true);
                
                // 2. Update local storage user data immediately so other components (like Navbar)
                // can reflect the 'pending' status without waiting for a re-login.
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    try {
                        const userObj = JSON.parse(storedUser);
                        userObj.host_application_status = 'pending';
                        localStorage.setItem('user', JSON.stringify(userObj));
                    } catch (e) {
                        console.error('Error updating local user state:', e);
                    }
                }

                // 3. After 3 seconds, close the modal and reload the page
                // Reloading ensures all app state is fresh and the Navbar button changes to "Pending Review"
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    window.location.reload();
                }, 3000);
            } else {
                const errData = await response.json().catch(() => ({}));
                console.error('Submission error:', errData);
                alert(`Error submitting application: ${errData.detail || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Could not connect to server. Please check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>X</button>
                
                {success ? (
                    <div className="success-message">
                        <div className="success-icon">S</div>
                        <h2>Congratulations!</h2>
                        <p>Your application has been received successfully. We will contact you soon.</p>
                    </div>
                ) : (
                    <>
                        <div className="modal-header">
                            <h2>Become a Host</h2>
                            <p>Share your space and start earning</p>
                        </div>

                        <form onSubmit={handleSubmit} className="host-form">
                            <div className="form-grid">
                                <div className="section-title">Personal Details</div>
                                
                                <div className="form-group">
                                    <label>Citizenship Number</label>
                                    <input 
                                        type="text" 
                                        name="citizenship_number" 
                                        placeholder="Enter citizenship number"
                                        value={formData.citizenship_number}
                                        onChange={handleInputChange}
                                        className={errors.citizenship_number ? 'error' : ''}
                                    />
                                    {errors.citizenship_number && <span className="error-text">Required</span>}
                                </div>

                                <div className="form-group text-center">
                                    <label>Citizenship Photo</label>
                                    <div className="file-input-wrapper">
                                        <input 
                                            type="file" 
                                            id="citizenship_image"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                        <label htmlFor="citizenship_image" className="file-label">
                                            {formData.citizenship_image ? formData.citizenship_image.name : 'Upload Photo'}
                                        </label>
                                    </div>
                                    {errors.citizenship_image && <span className="error-text">Required</span>}
                                </div>

                                <div className="form-group full-width">
                                    <label>Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="phone_number" 
                                        placeholder="Enter phone number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        className={errors.phone_number ? 'error' : ''}
                                        maxLength="10"
                                    />
                                    {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
                                </div>

                                <div className="section-title">Bank Details</div>

                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <select 
                                        name="bank_name" 
                                        value={formData.bank_name} 
                                        onChange={handleInputChange}
                                        className={errors.bank_name ? 'error' : ''}
                                    >
                                        <option value="">Select Bank</option>
                                        <option value="Nabil Bank">Nabil Bank</option>
                                        <option value="Global IME Bank">Global IME Bank</option>
                                        <option value="Nepal Investment Bank">Nepal Investment Mega Bank</option>
                                        <option value="NIC Asia Bank">NIC Asia Bank</option>
                                        <option value="Rastriya Banijya Bank">Rastriya Banijya Bank</option>
                                        <option value="Nepal Bank">Nepal Bank Limited</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    {errors.bank_name && <span className="error-text">Required</span>}
                                </div>

                                <div className="form-group">
                                    <label>Account Number </label>
                                    <input 
                                        type="text" 
                                        name="account_number" 
                                        placeholder="Bank account number"
                                        value={formData.account_number}
                                        onChange={handleInputChange}
                                        className={errors.account_number ? 'error' : ''}
                                    />
                                    {errors.account_number && <span className="error-text">Required</span>}
                                </div>

                                <div className="form-group full-width">
                                    <label>Account Holder Name </label>
                                    <input 
                                        type="text" 
                                        name="account_holder_name" 
                                        placeholder="Name as in bank account"
                                        value={formData.account_holder_name}
                                        onChange={handleInputChange}
                                        className={errors.account_holder_name ? 'error' : ''}
                                    />
                                    {errors.account_holder_name && <span className="error-text">Required</span>}
                                </div>

                                <div className="section-title">Business Details (Optional)</div>
                                
                                <div className="form-group">
                                    <label>Business Name <span style={{color: '#9ca3af', fontWeight: '400'}}>(Optional)</span></label>
                                    <input 
                                        type="text" 
                                        name="business_name" 
                                        placeholder="Your business name"
                                        value={formData.business_name}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>PAN/VAT No. <span style={{color: '#9ca3af', fontWeight: '400'}}>(Optional)</span></label>
                                    <input 
                                        type="text" 
                                        name="tax_number" 
                                        placeholder="PAN or VAT Number"
                                        value={formData.tax_number}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Reg. Number <span style={{color: '#9ca3af', fontWeight: '400'}}>(Optional)</span></label>
                                    <input 
                                        type="text" 
                                        name="business_registration" 
                                        placeholder="Registration Number"
                                        value={formData.business_registration}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-footer">
                                <p className="terms">By submitting, you agree to our <a href="#">Terms & Conditions</a>.</p>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Processing...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default HostApplicationModal;
