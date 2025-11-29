// Home Page with Trending Topics
// Landing page with featured posts and trending topics

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts } from '../services/firestoreService';
import { getCommentCount } from '../services/commentsService';
import { getTrendingTopics, getHotPosts } from '../services/trendingService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';

const Home = () => {
    const { currentUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all posts from Firestore
            const allPosts = await getPosts();

            // Add comment counts to posts
            const postsWithComments = await Promise.all(
                allPosts.map(async (post) => ({
                    ...post,
                    commentCount: await getCommentCount(post.id)
                }))
            );

            // Get hot posts using Reddit algorithm
            const hotPosts = getHotPosts(postsWithComments, postsWithComments.length);
            setPosts(hotPosts);

            // Get trending topics
            const trending = getTrendingTopics(postsWithComments);
            setTrendingTopics(trending.slice(0, 5));

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
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-lg">
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Main Content */}
            <section className="content-section">
                <div className="container">
                    <div className="home-grid">
                        {/* Main Feed */}
                        <div className="main-feed">
                            <div className="section-header">
                                <h2>🔥 Hot Posts</h2>
                                <p className="text-muted">Top posts based on votes, comments, and recency</p>
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}

                            {posts.length === 0 ? (
                                <div className="empty-state">
                                    <h3>No posts yet</h3>
                                    <p>Be the first to share something!</p>
                                    {currentUser && (
                                        <Link to="/create-post" className="btn btn-primary">
                                            Create Post
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="posts-grid">
                                    {posts.map((post) => (
                                        <PostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Trending Topics Sidebar */}
                        <aside className="trending-sidebar">
                            <div className="trending-card">
                                <h3>📈 Trending Topics</h3>
                                <p className="text-muted">Hot categories right now</p>

                                {trendingTopics.length > 0 ? (
                                    <div className="trending-list">
                                        {trendingTopics.map((topic, index) => (
                                            <div key={topic.category} className="trending-item">
                                                <div className="trending-rank">
                                                    {index + 1}
                                                </div>
                                                <div className="trending-info">
                                                    <h4>r/{topic.category}</h4>
                                                    <div className="trending-stats">
                                                        <span>{topic.postCount} posts</span>
                                                        <span>•</span>
                                                        <span>{topic.totalVotes + topic.totalComments} engagement</span>
                                                    </div>
                                                </div>
                                                <div className="trending-arrow">
                                                    {topic.trendingScore > 5 ? '🔥' : '📈'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="empty-trending">No trending topics yet</p>
                                )}
                            </div>

                            {/* Create Post CTA */}
                            {currentUser && (
                                <div className="cta-card">
                                    <h3>Share Your Story</h3>
                                    <p>Have something to say?</p>
                                    <Link to="/create-post" className="btn btn-primary w-full">
                                        Create Post
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
