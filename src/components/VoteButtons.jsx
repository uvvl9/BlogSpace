// Vote Buttons Component
// Reddit-style upvote/downvote arrows

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { upvotePost, downvotePost, removeVote } from '../services/votingService';
import './VoteButtons.css';

const VoteButtons = ({ post }) => {
    const { currentUser } = useAuth();
    const [voteCount, setVoteCount] = useState(post.voteCount || 0);
    const [userVote, setUserVote] = useState(() => {
        if (!currentUser) return null;
        if (post.upvotes?.includes(currentUser.uid)) return 'upvote';
        if (post.downvotes?.includes(currentUser.uid)) return 'downvote';
        return null;
    });
    const [loading, setLoading] = useState(false);

    const handleUpvote = async () => {
        if (!currentUser) {
            alert('Please login to vote');
            return;
        }

        setLoading(true);
        try {
            if (userVote === 'upvote') {
                // Remove upvote
                await removeVote(post.id, currentUser.uid, 'upvotes');
                setVoteCount(prev => prev - 1);
                setUserVote(null);
            } else {
                // Add upvote (and remove downvote if exists)
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
                // Remove downvote
                await removeVote(post.id, currentUser.uid, 'downvotes');
                setVoteCount(prev => prev + 1);
                setUserVote(null);
            } else {
                // Add downvote (and remove upvote if exists)
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

    return (
        <div className="vote-buttons">
            <button
                className={`vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}`}
                onClick={handleUpvote}
                disabled={loading}
                aria-label="Upvote"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4L4 12h5v8h6v-8h5l-8-8z" fill="currentColor" />
                </svg>
            </button>

            <span className="vote-count">{voteCount}</span>

            <button
                className={`vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}`}
                onClick={handleDownvote}
                disabled={loading}
                aria-label="Downvote"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20l8-8h-5V4H9v8H4l8 8z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
};

export default VoteButtons;
