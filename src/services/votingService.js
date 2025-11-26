// Voting Service
// Handles upvote/downvote functionality for posts

import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../firebase.config';

const POSTS_COLLECTION = 'posts';

// Upvote a post
export const upvotePost = async (postId, userId) => {
    try {
        const postRef = doc(db, POSTS_COLLECTION, postId);

        await updateDoc(postRef, {
            upvotes: arrayUnion(userId),
            downvotes: arrayRemove(userId),
            voteCount: increment(1)
        });

        return { success: true };
    } catch (error) {
        console.error('Error upvoting post:', error);
        throw new Error('Failed to upvote post');
    }
};

// Downvote a post
export const downvotePost = async (postId, userId) => {
    try {
        const postRef = doc(db, POSTS_COLLECTION, postId);

        await updateDoc(postRef, {
            downvotes: arrayUnion(userId),
            upvotes: arrayRemove(userId),
            voteCount: increment(-1)
        });

        return { success: true };
    } catch (error) {
        console.error('Error downvoting post:', error);
        throw new Error('Failed to downvote post');
    }
};

// Remove vote from a post
export const removeVote = async (postId, userId, voteType) => {
    try {
        const postRef = doc(db, POSTS_COLLECTION, postId);

        const updates = {
            [voteType]: arrayRemove(userId),
            voteCount: increment(voteType === 'upvotes' ? -1 : 1)
        };

        await updateDoc(postRef, updates);

        return { success: true };
    } catch (error) {
        console.error('Error removing vote:', error);
        throw new Error('Failed to remove vote');
    }
};
