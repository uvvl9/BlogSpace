// External API Service
// Integrates with GNews API and Quotable API

import axios from 'axios';

const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || 'e1bad32da5ddb4b6a13f4cb44298d657';
const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';
const QUOTABLE_API_BASE_URL = 'https://api.quotable.io';

// Fetch trending news articles
export const fetchTrendingNews = async (limit = 5) => {
    try {
        const response = await axios.get(`${GNEWS_API_BASE_URL}/top-headlines`, {
            params: {
                category: 'general',
                lang: 'en',
                country: 'us',
                max: limit,
                apikey: GNEWS_API_KEY
            }
        });
        return response.data.articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw new Error('Failed to load news. Please try again later.');
    }
};

// Fetch random inspirational quote
export const fetchRandomQuote = async () => {
    try {
        const response = await axios.get(`${QUOTABLE_API_BASE_URL}/random`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quote:', error);
        throw new Error('Failed to load quote. Please try again later.');
    }
};
