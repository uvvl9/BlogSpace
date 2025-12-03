// Home Page with Trending Topics
// Landing page with featured posts and trending topics

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts } from '../services/firestoreService';
import { getCommentCount } from '../services/commentsService';
import { getTrendingTopics, getHotPosts } from '../services/trendingService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Home.css';
import './Home-active.css';

const Home = () => {
    const { currentUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [allPosts, setAllPosts] = useState([]); // Store all posts
    const [posts, setPosts] = useState([]); // Filtered posts to display
    const [allCategories, setAllCategories] = useState([]); // All unique categories
    const [selectedCategory, setSelectedCategory] = useState(null); // Current filter
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        // Filter posts when category or search changes
        setSearching(true);

        let filteredPosts = allPosts;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(post => {
                const titleMatch = post.title?.toLowerCase().includes(query);
                const contentMatch = post.content?.toLowerCase().includes(query);
                const authorMatch = post.authorName?.toLowerCase().includes(query);
                return titleMatch || contentMatch || authorMatch;
            });
        }

        // Apply category filter
        if (selectedCategory !== null) {
            filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
        }

        // Sort by hot algorithm
        const hotPosts = getHotPosts(filteredPosts, filteredPosts.length);
        setPosts(hotPosts);
        setSearching(false);
    }, [selectedCategory, allPosts, searchQuery]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all posts from Firestore
            const fetchedPosts = await getPosts();

            // Add comment counts to posts
            const postsWithComments = await Promise.all(
                fetchedPosts.map(async (post) => ({
                    ...post,
                    commentCount: await getCommentCount(post.id)
                }))
            );

            setAllPosts(postsWithComments);

            // Calculate engagement for each category and sort by it (like Twitter)
            const categoriesMap = {};
            postsWithComments.forEach(post => {
                if (post.category) {
                    if (!categoriesMap[post.category]) {
                        categoriesMap[post.category] = {
                            category: post.category,
                            engagement: 0
                        };
                    }
                    // Add votes and comments to engagement score
                    categoriesMap[post.category].engagement += (post.voteCount || 0) + (post.commentCount || 0);
                }
            });

            // Convert to array and sort by engagement (highest first)
            const sortedCategories = Object.values(categoriesMap)
                .sort((a, b) => b.engagement - a.engagement)
                .map(item => item.category);

            setAllCategories(sortedCategories);

            // Get hot posts using Reddit algorithm
            const hotPosts = getHotPosts(postsWithComments, postsWithComments.length);
            setPosts(hotPosts);

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
                                {searchQuery ? (
                                    <>
                                        <h2>🔍 Search Results</h2>
                                        <p className="text-muted">
                                            Showing results for "{searchQuery}"
                                            <button
                                                onClick={() => setSearchParams({})}
                                                className="btn btn-secondary btn-sm"
                                                style={{ marginLeft: '1rem' }}
                                            >
                                                Clear Search
                                            </button>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h2>🔥 Hot Posts</h2>
                                        <p className="text-muted">Top posts based on votes, comments, and recency</p>
                                    </>
                                )}
                            </div>

                            {error && <div className="alert alert-error">{error}</div>}

                            {searching ? (
                                <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                                    <p>Searching posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="empty-state">
                                    {searchQuery ? (
                                        <>
                                            <h3>No results found</h3>
                                            <p>No posts match your search for "{searchQuery}"</p>
                                            <button
                                                onClick={() => setSearchParams({})}
                                                className="btn btn-primary"
                                            >
                                                Clear Search
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <h3>No posts yet</h3>
                                            <p>Be the first to share something!</p>
                                            {currentUser && (
                                                <Link to="/create-post" className="btn btn-primary">
                                                    Create Post
                                                </Link>
                                            )}
                                        </>
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

                                {allCategories.length > 0 ? (
                                    <div className="trending-list">
                                        {/* All option */}
                                        <div
                                            className={`trending-item ${selectedCategory === null ? 'active' : ''}`}
                                            onClick={() => setSelectedCategory(null)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="trending-rank">
                                                🌐
                                            </div>
                                            <div className="trending-info">
                                                <h4>r/All</h4>
                                                <div className="trending-stats">
                                                    <span>{allPosts.length} posts</span>
                                                </div>
                                            </div>
                                            <div className="trending-arrow">
                                                📈
                                            </div>
                                        </div>

                                        {/* Category options */}
                                        {allCategories.map((category, index) => {
                                            const categoryPosts = allPosts.filter(p => p.category === category);
                                            const postCount = categoryPosts.length;
                                            const engagement = categoryPosts.reduce((sum, p) =>
                                                sum + (p.voteCount || 0) + (p.commentCount || 0), 0
                                            );

                                            return (
                                                <div
                                                    key={category}
                                                    className={`trending-item ${selectedCategory === category ? 'active' : ''}`}
                                                    onClick={() => setSelectedCategory(category)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="trending-rank">
                                                        {index + 1}
                                                    </div>
                                                    <div className="trending-info">
                                                        <h4>r/{category}</h4>
                                                        <div className="trending-stats">
                                                            <span>{postCount} posts</span>
                                                            <span>•</span>
                                                            <span>{engagement} engagement</span>
                                                        </div>
                                                    </div>
                                                    <div className="trending-arrow">
                                                        {index === 0 ? '🔥' : '📈'}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
