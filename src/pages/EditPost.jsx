// Edit Post Page
// Protected page for editing existing blog posts

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPost, updatePost } from '../services/firestoreService';
import LoadingSpinner from '../components/LoadingSpinner';
import './PostForm.css';

const EditPost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'General'
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { currentUser } = useAuth();
    const { postId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const post = await getPost(postId);

            // Verify user owns this post
            if (post.authorId !== currentUser.uid) {
                setError('You do not have permission to edit this post');
                return;
            }

            setFormData({
                title: post.title,
                content: post.content,
                category: post.category || 'General'
            });
        } catch (err) {
            console.error('Error fetching post:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
            setSubmitting(true);
            setError('');

            await updatePost(postId, {
                title: formData.title.trim(),
                content: formData.content.trim(),
                category: formData.category
            });

            navigate('/dashboard');
        } catch (err) {
            console.error('Error updating post:', err);
            setError(err.message || 'Failed to update post');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading post..." />;
    }

    if (error && !formData.title) {
        return (
            <div className="container" style={{ padding: '3rem 0' }}>
                <div className="alert alert-error">{error}</div>
                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="post-form-page">
            <div className="container">
                <div className="post-form-container fade-in">
                    <div className="form-header">
                        <h1>Edit Post</h1>
                        <p className="text-muted">Update your blog post</p>
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
                                disabled={submitting}
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
                                disabled={submitting}
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
                                disabled={submitting}
                                rows="15"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn btn-secondary"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Updating...' : 'Update Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPost;
