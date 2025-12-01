// Contact Page
// Form for users to contact support or submit reports

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addReport } from '../services/firestoreService';
import './Auth.css'; // Reuse auth styles for consistency

const Contact = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'contact' // default type
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await addReport({
                ...formData,
                userId: currentUser?.uid || 'anonymous',
                userEmail: currentUser?.email || 'anonymous',
                status: 'open'
            });

            setSuccess(true);
            setFormData({ title: '', description: '', type: 'contact' });

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            console.error('Error submitting message:', err);
            setError('Failed to submit message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
                    <h2 className="text-gradient">Message Sent</h2>
                    <p className="text-muted">Thank you for contacting us! We'll get back to you soon.</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Redirecting to home...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <h1 className="text-gradient">Contact Us</h1>
                    <p className="text-muted">Have a question or feedback? Let us know!</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="type" className="form-label">Topic</label>
                        <select
                            id="type"
                            name="type"
                            className="form-input"
                            value={formData.type}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="contact">📧 General Inquiry</option>
                            <option value="bug">🐛 Report a Bug</option>
                            <option value="feature">💡 Feature Request</option>
                            <option value="other">📝 Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="title" className="form-label">Subject</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            className="form-input"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="What is this about?"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">Message</label>
                        <textarea
                            id="description"
                            name="description"
                            className="form-input"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Type your message here..."
                            rows="5"
                            style={{ resize: 'vertical', minHeight: '120px' }}
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
