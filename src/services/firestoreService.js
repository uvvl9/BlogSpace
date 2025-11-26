// Firestore Database Service
// Handles all CRUD operations for blog posts

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

const POSTS_COLLECTION = 'posts';

// Create a new blog post
export const createPost = async (postData) => {
    try {
        const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
            ...postData,
            upvotes: [],
            downvotes: [],
            voteCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { id: docRef.id, success: true };
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post. Please try again.');
    }
};

// Get all blog posts
export const getPosts = async () => {
    try {
        const postsQuery = query(
            collection(db, POSTS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(postsQuery);

        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            });
        });

        return posts;
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error('Failed to load posts. Please try again.');
    }
};

// Get posts by specific user
export const getUserPosts = async (userId) => {
    try {
        const postsQuery = query(
            collection(db, POSTS_COLLECTION),
            where('authorId', '==', userId)
        );
        const querySnapshot = await getDocs(postsQuery);

        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            });
        });

        posts.sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt - a.createdAt;
        });

        return posts;
    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw new Error('Failed to load your posts. Please try again.');
    }
};

// Get a single post by ID
export const getPost = async (postId) => {
    try {
        const docRef = doc(db, POSTS_COLLECTION, postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate(),
                updatedAt: docSnap.data().updatedAt?.toDate()
            };
        } else {
            throw new Error('Post not found');
        }
    } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error('Failed to load post. Please try again.');
    }
};

// Update an existing post
export const updatePost = async (postId, updates) => {
    try {
        const docRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating post:', error);
        throw new Error('Failed to update post. Please try again.');
    }
};

// Delete a post
export const deletePost = async (postId) => {
    try {
        const docRef = doc(db, POSTS_COLLECTION, postId);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Failed to delete post. Please try again.');
    }
};
