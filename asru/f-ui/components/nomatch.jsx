import React from 'react';

const NoMatch = () => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            backgroundColor: '#f8f9fa',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '90%'
            }}>
                <div style={{ fontSize: '72px', marginBottom: '20px' }}>🔍</div>
                <h1 style={{ 
                    color: '#333', 
                    marginBottom: '16px',
                    fontSize: '2rem',
                    fontWeight: '600'
                }}>
                    Page Not Found
                </h1>
                <p style={{ 
                    color: '#666', 
                    marginBottom: '30px',
                    fontSize: '1.1rem',
                    lineHeight: '1.5'
                }}>
                    Sorry, the page you are looking for doesn't exist or has been moved.
                </p>
                <button 
                    onClick={() => window.location.href = '/'}
                    style={{
                        backgroundColor: '#196ECF',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#1557a8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#196ECF'}
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
};

export default NoMatch;
