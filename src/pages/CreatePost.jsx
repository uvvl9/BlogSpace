// Create Post Page
// Protected page for creating new blog posts

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/firestoreService';
import './PostForm.css';

const CreatePost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

        // Validation
        if (!formData.title.trim() || !formData.content.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await createPost({
                title: formData.title.trim(),
                content: formData.content.trim(),
                category: formData.category,
                authorId: currentUser.uid,
                authorName: currentUser.displayName || currentUser.email
            });

            navigate('/dashboard');
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="post-form-page">
            <div className="container">
                <div className="post-form-container fade-in">
                    <div className="form-header">
                        <h1>Create New Post</h1>
                        <p className="text-muted">Share your thoughts with the community</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="post-form">
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">
                                Title <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter an engaging title..."
                                disabled={loading}
                                maxLength="100"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select
                                id="category"
                                name="category"
                                className="form-input"
                                value={formData.category}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="General">General</option>
                                <option value="Technology">Technology</option>
                                <option value="Lifestyle">Lifestyle</option>
                                <option value="Travel">Travel</option>
                                <option value="Food">Food</option>
                                <option value="Health">Health</option>
                                <option value="Business">Business</option>
                                <option value="Education">Education</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="content" className="form-label">
                                Content <span className="required">*</span>
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                className="form-textarea"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Write your story..."
                                disabled={loading}
                                rows="15"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Publishing...' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
