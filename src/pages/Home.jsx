// Home Page
// Landing page with featured posts and external API integration

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts } from '../services/firestoreService';
import { fetchExternalPosts } from '../services/apiService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

const Home = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch user-created posts from Firestore
            const userPosts = await getPosts();
            setPosts(userPosts.slice(0, 6)); // Show latest 6 posts

            // Fetch trending posts from external API
            const apiPosts = await fetchExternalPosts(6);
            setTrendingPosts(apiPosts);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading posts..." />;
    }

    return (
        <div className="home-page">
            {/* Hero Section - Only show for non-logged-in users */}
            {!currentUser && (
                <section className="hero">
                    <div className="container">
                        <div className="hero-content fade-in">
                            <h1 className="hero-title">
                                Share Your Stories with <span className="text-gradient">BlogSpace</span>
                            </h1>
                            <p className="hero-subtitle">
                                A modern blogging platform where your ideas come to life.
                                Start writing, connect with readers, and build your audience.
                            </p>
                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-large">
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-large">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Latest Community Posts */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Latest from Our Community</h2>
                        <p className="text-muted">Discover fresh content from our writers</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">{error}</div>
                    )}

                    {posts.length === 0 ? (
                        <div className="empty-state">
                            <p>No blog posts yet. Be the first to write!</p>
                            <Link to="/create-post" className="btn btn-primary">
                                Create Your First Post
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-3">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trending Topics from External API */}
            <section className="section section-alt">
                <div className="container">
                    <div className="section-header">
                        <h2>Trending Topics</h2>
                        <p className="text-muted">Popular content from around the web</p>
                    </div>

                    {trendingPosts.length > 0 && (
                        <div className="grid grid-3">
                            {trendingPosts.map((post) => (
                                <div key={post.id} className="trending-card fade-in">
                                    <h3 className="trending-title">{post.title}</h3>
                                    <p className="trending-excerpt">{post.body.substring(0, 120)}...</p>
                                    <span className="trending-tag">Trending</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose BlogSpace?</h2>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card fade-in">
                            <div className="feature-icon">🚀</div>
                            <h3>Easy to Use</h3>
                            <p>Intuitive interface designed for writers of all skill levels</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">🔐</div>
                            <h3>Secure</h3>
                            <p>Your data is protected with Firebase authentication</p>
                        </div>

                        <div className="feature-card fade-in">
                            <div className="feature-icon">⚡</div>
                            <h3>Fast & Reliable</h3>
                            <p>Built with modern technologies for optimal performance</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
