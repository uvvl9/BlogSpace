// Dashboard Page
// Protected page showing user's blog posts with CRUD operations

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserPosts, deletePost } from '../services/firestoreService';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserPosts();
    }, [currentUser]);

    const fetchUserPosts = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const userPosts = await getUserPosts(currentUser.uid);
            setPosts(userPosts);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (postId) => {
        navigate(`/edit-post/${postId}`);
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            await deletePost(postId);
            setPosts(posts.filter(post => post.id !== postId));
        } catch (err) {
            console.error('Error deleting post:', err);
            setError(err.message);
        }
    };

    const handleCreateNew = () => {
        navigate('/create-post');
    };

    if (loading) {
        return <LoadingSpinner text="Loading your posts..." />;
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header fade-in">
                    <div>
                        <h1>My Profile</h1>
                        <p className="text-muted">
                            Welcome back, {currentUser?.displayName || currentUser?.email}!
                        </p>
                    </div>
                    <button onClick={handleCreateNew} className="btn btn-primary">
                        ✍️ Create New Post
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                {posts.length === 0 ? (
                    <div className="empty-state fade-in">
                        <div className="empty-icon">📝</div>
                        <h2>No posts yet</h2>
                        <p>Start sharing your thoughts with the world!</p>
                        <button onClick={handleCreateNew} className="btn btn-primary">
                            Write Your First Post
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="stats-grid fade-in">
                            <div className="stat-card">
                                <div className="stat-value">{posts.length}</div>
                                <div className="stat-label">Total Posts</div>
                            </div>
                        </div>

                        <div className="posts-section">
                            <h2>Your Posts</h2>
                            <div className="grid grid-2">
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        showActions={true}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
