// Post Card Component - Reddit Style with Dynamic Avatars
// Displays blog posts with user avatar, votes, and comments

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { upvotePost, downvotePost, removeVote } from '../services/votingService';
import { getCommentCount } from '../services/commentsService';
import './PostCard.css';

const PostCard = ({ post, showActions = false, onEdit, onDelete }) => {
    const { currentUser } = useAuth();
    const [voteCount, setVoteCount] = useState(post.voteCount || 0);
    const [userVote, setUserVote] = useState(() => {
        if (!currentUser) return null;
        if (post.upvotes?.includes(currentUser.uid)) return 'upvote';
        if (post.downvotes?.includes(currentUser.uid)) return 'downvote';
        return null;
    });
    const [commentCount, setCommentCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCommentCount();
    }, [post.id]);

    const loadCommentCount = async () => {
        try {
            const count = await getCommentCount(post.id);
            setCommentCount(count);
        } catch (error) {
            console.error('Error loading comment count:', error);
        }
    };

    const handleUpvote = async () => {
        if (!currentUser) {
            alert('Please login to vote');
            return;
        }
        setLoading(true);
        try {
            if (userVote === 'upvote') {
                await removeVote(post.id, currentUser.uid, 'upvotes');
                setVoteCount(prev => prev - 1);
                setUserVote(null);
            } else {
                await upvotePost(post.id, currentUser.uid);
                setVoteCount(prev => prev + (userVote === 'downvote' ? 2 : 1));
                setUserVote('upvote');
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownvote = async () => {
        if (!currentUser) {
            alert('Please login to vote');
            return;
        }
        setLoading(true);
        try {
            if (userVote === 'downvote') {
                await removeVote(post.id, currentUser.uid, 'downvotes');
                setVoteCount(prev => prev + 1);
                setUserVote(null);
            } else {
                await downvotePost(post.id, currentUser.uid);
                setVoteCount(prev => prev - (userVote === 'upvote' ? 2 : 1));
                setUserVote('downvote');
            }
        } catch (error) {
            console.error('Error voting:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Just now';
        const postDate = date instanceof Date ? date : new Date(date);
        const diff = Date.now() - postDate.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return `${Math.floor(diff / (1000 * 60))} min. ago`;
        if (hours < 24) return `${hours} hr. ago`;
        return `${Math.floor(hours / 24)} day(s) ago`;
    };

    // Generate avatar dynamically - use post author photo if available, or current user photo if it's their post
    const getAvatarUrl = () => {
        if (post.authorPhoto) return post.authorPhoto;
        if (post.authorId === currentUser?.uid) {
            return currentUser.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(post.authorName)}`;
        }
        return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(post.authorName)}`;
    };

    return (
        <div className="post-card-reddit">
            {/* Author Info */}
            <div className="post-header-reddit">
                <div className="author-info">
                    <img
                        src={getAvatarUrl()}
                        alt={post.authorName}
                        className="author-avatar"
                    />
                    <div className="author-details">
                        <span className="subreddit-name">r/{post.category || 'blog'}</span>
                        <span className="post-meta-text">
                            Posted by {post.authorName || 'Anonymous'} • {formatDate(post.createdAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Post Content */}
            <Link to={`/post/${post.id}`} className="post-content-link">
                <h3 className="post-title-reddit">{post.title}</h3>
                <p className="post-excerpt-reddit">
                    {post.content ? post.content.substring(0, 200) + '...' : ''}
                </p>
            </Link>

            {/* Action Bar */}
            <div className="post-actions-bar">
                <div className="vote-section">
                    <button
                        className={`vote-btn-reddit ${userVote === 'upvote' ? 'active-up' : ''}`}
                        onClick={handleUpvote}
                        disabled={loading}
                    >
                        ↑
                    </button>
                    <span className={`vote-count-reddit ${voteCount > 0 ? 'positive' : voteCount < 0 ? 'negative' : ''}`}>
                        {voteCount > 0 ? `+${voteCount}` : voteCount}
                    </span>
                    <button
                        className={`vote-btn-reddit ${userVote === 'downvote' ? 'active-down' : ''}`}
                        onClick={handleDownvote}
                        disabled={loading}
                    >
                        ↓
                    </button>
                </div>

                <Link to={`/post/${post.id}`} className="action-btn-reddit">
                    💬 {commentCount} Comments
                </Link>

                {showActions && (
                    <>
                        <button onClick={() => onEdit(post.id)} className="action-btn-reddit">
                            ✏️ Edit
                        </button>
                        <button onClick={() => onDelete(post.id)} className="action-btn-reddit delete">
                            🗑️ Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PostCard;
