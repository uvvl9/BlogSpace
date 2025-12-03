// External API Service
// Integrates with News API and Quotable API

import axios from 'axios';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const QUOTABLE_API_BASE_URL = 'https://api.quotable.io';

// Fetch trending news articles
export const fetchTrendingNews = async (limit = 5) => {
    try {
        const response = await axios.get(`${NEWS_API_BASE_URL}/top-headlines`, {
            params: {
                country: 'us',
                pageSize: limit,
                apiKey: NEWS_API_KEY
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
