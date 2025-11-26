// External API Service
// Integrates with JSONPlaceholder for sample data and trending content

import axios from 'axios';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

// Fetch sample posts from JSONPlaceholder
export const fetchExternalPosts = async (limit = 10) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/posts`, {
            params: { _limit: limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching external posts:', error);
        throw new Error('Failed to load trending content. Please try again later.');
    }
};

// Fetch comments for a post
export const fetchPostComments = async (postId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`);
        return response.data;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw new Error('Failed to load comments. Please try again later.');
    }
};

// Fetch users data
export const fetchExternalUsers = async (limit = 5) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users`, {
            params: { _limit: limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to load user data. Please try again later.');
    }
};

// Fetch single post
export const fetchExternalPost = async (postId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error('Failed to load post. Please try again later.');
    }
};
