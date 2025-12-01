// Blog Post Page - Full Post View with Comments
// Displays complete post content with comments section

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPost, getUserProfile } from '../services/firestoreService';
import { getComments, addComment, toggleCommentLike, addReply, deleteComment } from '../services/commentsService';
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

    const [userProfiles, setUserProfiles] = useState({});

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

            // Fetch user profiles for comments
            const userIds = [...new Set(commentsData.map(c => c.userId))];
            const profiles = {};
            await Promise.all(userIds.map(async (uid) => {
                if (uid) {
                    const profile = await getUserProfile(uid);
                    if (profile) profiles[uid] = profile;
                }
            }));
            setUserProfiles(profiles);

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

    const handleLikeComment = async (commentId) => {
        if (!currentUser) {
            alert('Please login to like comments');
            return;
        }

        // Optimistic update
        setComments(prevComments => {
            const updateLikes = (list) => {
                return list.map(comment => {
                    if (comment.id === commentId) {
                        const likes = comment.likes || [];
                        const isLiked = likes.includes(currentUser.uid);
                        const newLikes = isLiked
                            ? likes.filter(id => id !== currentUser.uid)
                            : [...likes, currentUser.uid];
                        return { ...comment, likes: newLikes };
                    }
                    if (comment.children) {
                        return { ...comment, children: updateLikes(comment.children) };
                    }
                    return comment;
                });
            };
            return updateLikes(prevComments);
        });

        try {
            await toggleCommentLike(commentId, currentUser.uid);
            // No need to reload, we already updated optimistically
        } catch (err) {
            console.error('Error liking comment:', err);
            // Revert on error
            await loadPostAndComments();
        }
    };

    const handleReply = async (parentId, text) => {
        if (!currentUser) return;
        try {
            await addReply(postId, parentId, {
                text,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous'
            });
            await loadPostAndComments();
        } catch (err) {
            console.error('Error replying:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await deleteComment(commentId);
            await loadPostAndComments();
        } catch (err) {
            console.error('Error deleting comment:', err);
            alert('Failed to delete comment');
        }
    };

    // Helper to organize comments into a tree
    const organizeComments = (comments) => {
        const commentMap = {};
        const roots = [];

        // First pass: create map and initialize children
        comments.forEach(comment => {
            commentMap[comment.id] = { ...comment, children: [] };
        });

        // Second pass: link children to parents
        comments.forEach(comment => {
            if (comment.parentId && commentMap[comment.parentId]) {
                commentMap[comment.parentId].children.push(commentMap[comment.id]);
            } else {
                roots.push(commentMap[comment.id]);
            }
        });

        return roots;
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
                                src={post.authorPhoto || (currentUser?.uid === post.authorId ? currentUser.photoURL : `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(post.authorName)}`)}
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
                                organizeComments(comments).map((comment) => (
                                    <CommentItem
                                        key={comment.id}
                                        comment={comment}
                                        currentUser={currentUser}
                                        userProfiles={userProfiles}
                                        onReply={handleReply}
                                        onLike={handleLikeComment}
                                        onDelete={handleDeleteComment}
                                        formatDate={formatDate}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommentItem = ({ comment, currentUser, userProfiles, onReply, onLike, onDelete, formatDate }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [showAllReplies, setShowAllReplies] = useState(false);

    // Get author info from profiles map, or fall back to comment data
    const authorProfile = userProfiles?.[comment.userId];
    const authorName = authorProfile?.displayName || comment.userName;
    const authorPhoto = authorProfile?.photoURL;

    const avatarUrl = comment.userId === currentUser?.uid
        ? currentUser.photoURL
        : (authorPhoto || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(authorName)}`);

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        await onReply(comment.id, replyText);
        setIsReplying(false);
        setReplyText('');
        setShowAllReplies(true);
    };

    const isLiked = comment.likes?.includes(currentUser?.uid);
    const likeCount = comment.likes?.length || 0;
    const isOwner = currentUser?.uid === comment.userId;

    const hasChildren = comment.children && comment.children.length > 0;
    const displayedChildren = showAllReplies
        ? comment.children
        : comment.children?.slice(0, 2);
    const remainingChildrenCount = (comment.children?.length || 0) - 2;

    return (
        <div className="comment-item-container">
            <div className="comment-item">
                <img
                    src={avatarUrl || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=default'}
                    alt={authorName}
                    className="comment-avatar"
                />
                <div className="comment-content">
                    <div className="comment-header">
                        <span className="comment-author">
                            {comment.userId === currentUser?.uid ? (currentUser.displayName || 'Anonymous') : authorName}
                        </span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                        {isOwner && (
                            <button
                                className="delete-btn"
                                onClick={() => onDelete(comment.id)}
                                title="Delete comment"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                    <p className="comment-text">{comment.text}</p>

                    <div className="comment-actions">
                        <button
                            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
                            onClick={() => onLike(comment.id)}
                        >
                            {isLiked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg>
                            )}
                            <span>{likeCount > 0 ? likeCount : ''}</span>
                        </button>
                        <button
                            className="action-btn reply-btn"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            Reply
                        </button>
                    </div>

                    {isReplying && (
                        <form onSubmit={handleReplySubmit} className="reply-form">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="reply-input"
                                rows="2"
                            />
                            <div className="reply-actions">
                                <button type="button" onClick={() => setIsReplying(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm">Reply</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {hasChildren && (
                <div className="nested-replies">
                    {displayedChildren.map(child => (
                        <CommentItem
                            key={child.id}
                            comment={child}
                            currentUser={currentUser}
                            userProfiles={userProfiles}
                            onReply={onReply}
                            onLike={onLike}
                            onDelete={onDelete}
                            formatDate={formatDate}
                        />
                    ))}

                    {remainingChildrenCount > 0 && !showAllReplies && (
                        <button
                            className="view-more-replies-btn"
                            onClick={() => setShowAllReplies(true)}
                        >
                            <div className="reply-line"></div>
                            View {remainingChildrenCount} more {remainingChildrenCount === 1 ? 'reply' : 'replies'}
                        </button>
                    )}

                    {showAllReplies && (
                        <button
                            className="view-more-replies-btn"
                            onClick={() => setShowAllReplies(false)}
                        >
                            <div className="reply-line"></div>
                            Hide replies
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogPost;
