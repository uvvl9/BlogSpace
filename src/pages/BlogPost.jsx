// Blog Post Page - Full Post View with Comments
// Displays complete post content with comments section

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPost } from '../services/firestoreService';
import { getComments, addComment } from '../services/commentsService';
import { upvotePost, downvotePost, removeVote } from '../services/votingService';
import LoadingSpinner from '../components/LoadingSpinner';
import './BlogPost.css';

const BlogPost = () => {
    const { postId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [voteCount, setVoteCount] = useState(0);
    const [userVote, setUserVote] = useState(null);

    useEffect(() => {
        loadPostAndComments();
    }, [postId]);

    useEffect(() => {
        if (post && currentUser) {
            setVoteCount(post.voteCount || 0);
            if (post.upvotes?.includes(currentUser.uid)) setUserVote('upvote');
            else if (post.downvotes?.includes(currentUser.uid)) setUserVote('downvote');
        }
    }, [post, currentUser]);

    const loadPostAndComments = async () => {
        try {
            const [postData, commentsData] = await Promise.all([
                getPost(postId),
                getComments(postId)
            ]);
            setPost(postData);
            setComments(commentsData);
        } catch (err) {
            setError('Failed to load post');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (type) => {
        if (!currentUser) {
            alert('Please login to vote');
            return;
        }

        try {
            if (type === 'upvote') {
                if (userVote === 'upvote') {
                    await removeVote(postId, currentUser.uid, 'upvotes');
                    setVoteCount(prev => prev - 1);
                    setUserVote(null);
                } else {
                    await upvotePost(postId, currentUser.uid);
                    setVoteCount(prev => prev + (userVote === 'downvote' ? 2 : 1));
                    setUserVote('upvote');
                }
            } else {
                if (userVote === 'downvote') {
                    await removeVote(postId, currentUser.uid, 'downvotes');
                    setVoteCount(prev => prev + 1);
                    setUserVote(null);
                } else {
                    await downvotePost(postId, currentUser.uid);
                    setVoteCount(prev => prev - (userVote === 'upvote' ? 2 : 1));
                    setUserVote('downvote');
                }
            }
        } catch (err) {
            console.error('Error voting:', err);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            alert('Please login to comment');
            return;
        }
        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            await addComment(postId, {
                text: commentText,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous'
            });
            setCommentText('');
            await loadPostAndComments();
        } catch (err) {
            console.error('Error adding comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Just now';
        const diff = Date.now() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return `${Math.floor(diff / (1000 * 60))} min. ago`;
        if (hours < 24) return `${hours} hr. ago`;
        return `${Math.floor(hours / 24)} day(s) ago`;
    };

    if (loading) return <LoadingSpinner text="Loading post..." />;
    if (error) return <div className="error-message">{error}</div>;
    if (!post) return <div className="error-message">Post not found</div>;

    return (
        <div className="blog-post-page">
            <div className="container">
                <div className="blog-post-container">
                    {/* Post Header */}
                    <div className="post-header-full">
                        <div className="author-section">
                            <img
                                src={post.authorPhoto || 'https://via.placeholder.com/50'}
                                alt={post.authorName}
                                className="author-avatar-large"
                            />
                            <div className="author-info-full">
                                <span className="subreddit-tag">r/{post.category || 'blog'}</span>
                                <span className="author-meta">
                                    Posted by {post.authorName} • {formatDate(post.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Post Content */}
                    <article className="post-content-full">
                        <h1 className="post-title-full">{post.title}</h1>
                        <div className="post-body">
                            {post.content.split('\n').map((paragraph, idx) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    </article>

                    {/* Vote & Actions Bar */}
                    <div className="post-actions-full">
                        <div className="vote-controls">
                            <button
                                className={`vote-btn-large ${userVote === 'upvote' ? 'active-up' : ''}`}
                                onClick={() => handleVote('upvote')}
                            >
                                ↑
                            </button>
                            <span className={`vote-count-large ${voteCount > 0 ? 'positive' : voteCount < 0 ? 'negative' : ''}`}>
                                {voteCount}
                            </span>
                            <button
                                className={`vote-btn-large ${userVote === 'downvote' ? 'active-down' : ''}`}
                                onClick={() => handleVote('downvote')}
                            >
                                ↓
                            </button>
                        </div>
                        <span className="comment-count-display">
                            💬 {comments.length} Comments
                        </span>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h2>Comments</h2>

                        {/* Add Comment Form */}
                        {currentUser && (
                            <form onSubmit={handleAddComment} className="comment-form">
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="What are your thoughts?"
                                    className="comment-input"
                                    rows="4"
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || !commentText.trim()}
                                >
                                    {submitting ? 'Posting...' : 'Comment'}
                                </button>
                            </form>
                        )}

                        {!currentUser && (
                            <div className="login-prompt">
                                <Link to="/login">Log in</Link> to leave a comment
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="comments-list">
                            {comments.length === 0 ? (
                                <p className="no-comments">No comments yet. Be the first to comment!</p>
                            ) : (
                                comments.map((comment) => {
                                    // Use current user's photo if it's their comment, otherwise generate from userName
                                    const avatarUrl = comment.userId === currentUser?.uid
                                        ? currentUser.photoURL
                                        : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(comment.userName)}`;

                                    return (
                                        <div key={comment.id} className="comment-item">
                                            <img
                                                src={avatarUrl || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=default'}
                                                alt={comment.userName}
                                                className="comment-avatar"
                                            />
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.userName}</span>
                                                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPost;
