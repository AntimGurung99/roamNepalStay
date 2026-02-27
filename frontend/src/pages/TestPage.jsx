import React, { useState, useEffect } from 'react';

const TestPage = () => {
    const [backendStatus, setBackendStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        testBackendConnection();
    }, []);

    const testBackendConnection = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://127.0.0.1:8000/api/test/');
            
            if (response.ok) {
                const data = await response.json();
                setBackendStatus(data);
                setError(null);
            } else {
                setError('Backend connection failed');
            }
        } catch (err) {
            setError('Cannot connect to backend: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const testRegistration = async () => {
        try {
            const testUser = {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                password: 'testpassword123',
                confirm_password: 'testpassword123'
            };

            const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testUser)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Registration test successful!');
                console.log('Registration response:', data);
            } else {
                alert('Registration test failed: ' + JSON.stringify(data));
            }
        } catch (err) {
            alert('Registration test error: ' + err.message);
        }
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
            <h1>🧪 Backend & Frontend Test Page</h1>
            
            {/* Backend Status */}
            <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                border: '1px solid #dee2e6'
            }}>
                <h2>Backend Connection Status</h2>
                
                {loading && <p>Testing backend connection...</p>}
                
                {error && (
                    <div style={{ color: 'red', background: '#ffebee', padding: '1rem', borderRadius: '4px' }}>
                        <strong>❌ Error:</strong> {error}
                        <br />
                        <small>Make sure Django server is running on http://127.0.0.1:8000</small>
                    </div>
                )}
                
                {backendStatus && (
                    <div style={{ color: 'green', background: '#e8f5e8', padding: '1rem', borderRadius: '4px' }}>
                        <strong>✅ Backend Status:</strong> {backendStatus.message}
                        <br />
                        <strong>Server:</strong> {backendStatus.data.server}
                        <br />
                        <strong>Version:</strong> {backendStatus.data.version}
                    </div>
                )}
                
                <button 
                    onClick={testBackendConnection}
                    style={{
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginTop: '1rem'
                    }}
                >
                    🔄 Test Backend Connection
                </button>
            </div>

            {/* API Endpoints */}
            <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                border: '1px solid #dee2e6'
            }}>
                <h2>Available API Endpoints</h2>
                {backendStatus && (
                    <ul>
                        {backendStatus.data.endpoints.map((endpoint, index) => (
                            <li key={index} style={{ marginBottom: '0.5rem' }}>
                                <code style={{ background: '#e9ecef', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>
                                    {endpoint}
                                </code>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Test Actions */}
            <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '2rem',
                border: '1px solid #dee2e6'
            }}>
                <h2>API Tests</h2>
                <button 
                    onClick={testRegistration}
                    style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '1rem'
                    }}
                >
                    🧪 Test User Registration
                </button>
                
                <button 
                    onClick={() => window.open('/admin/login', '_blank')}
                    style={{
                        background: '#6f42c1',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '1rem'
                    }}
                >
                    🔐 Admin Login
                </button>
            </div>

            {/* Frontend Status */}
            <div style={{ 
                background: '#e8f5e8', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid #c3e6cb'
            }}>
                <h2>Frontend Status</h2>
                <p><strong>✅ Frontend Status:</strong> React app is running successfully!</p>
                <p><strong>Framework:</strong> React with Vite</p>
                <p><strong>Port:</strong> http://localhost:5173</p>
            </div>
        </div>
    );
};

export default TestPage;
