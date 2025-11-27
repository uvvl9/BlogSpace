// Comments Service
// Handles all comment operations for posts

import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

const COMMENTS_COLLECTION = 'comments';

// Add a comment to a post
export const addComment = async (postId, commentData) => {
    try {
        const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
            postId,
            ...commentData,
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error adding comment:', error);
        throw new Error('Failed to add comment');
    }
};

// Get comments for a specific post
export const getComments = async (postId) => {
    try {
        const commentsQuery = query(
            collection(db, COMMENTS_COLLECTION),
            where('postId', '==', postId)
        );
        const querySnapshot = await getDocs(commentsQuery);

        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            });
        });

        // Sort in JavaScript instead of Firestore to avoid compound index
        comments.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt - a.createdAt;
        });

        return comments;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to load comments');
    }
};

// Get comment count for a post
export const getCommentCount = async (postId) => {
    try {
        const commentsQuery = query(
            collection(db, COMMENTS_COLLECTION),
            where('postId', '==', postId)
        );
        const querySnapshot = await getDocs(commentsQuery);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting comment count:', error);
        return 0;
    }
};
