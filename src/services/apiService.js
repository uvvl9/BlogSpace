// External API Service
// Uses GNews API with CORS proxy for GitHub Pages compatibility
// Implements caching to reduce API calls

import axios from 'axios';

// GNews API with CORS proxy
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || 'e1bad32da5ddb4b6a13f4cb44298d657';
const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const QUOTABLE_API_BASE_URL = 'https://api.quotable.io';

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const NEWS_CACHE_KEY = 'trending_news_cache';

// Helper function to get cached data
const getCachedNews = () => {
    try {
        const cached = localStorage.getItem(NEWS_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        if (now - timestamp < CACHE_DURATION) {
            console.log('📰 Using cached news data');
            return data;
        }

        localStorage.removeItem(NEWS_CACHE_KEY);
        return null;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
};

// Helper function to cache news data
const cacheNews = (data) => {
    try {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cacheData));
        console.log('✅ News cached successfully');
    } catch (error) {
        console.error('Error caching news:', error);
    }
};

// Fetch trending news articles from GNews
export const fetchTrendingNews = async (limit = 5) => {
    // Check cache first
    const cachedNews = getCachedNews();
    if (cachedNews) {
        return cachedNews;
    }

    try {
        console.log('🔄 Fetching fresh news from GNews API...');

        // Build the API URL
        const apiUrl = `${GNEWS_API_BASE_URL}/top-headlines?category=business&lang=en&country=us&max=${limit}&apikey=${GNEWS_API_KEY}`;
        const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;

        const response = await axios.get(proxiedUrl);
        const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

        if (!data.articles || data.articles.length === 0) {
            throw new Error('No news articles returned from GNews');
        }

        // Cache the results
        cacheNews(data.articles);
        console.log(`✅ Successfully fetched ${data.articles.length} news articles`);

        return data.articles;
    } catch (error) {
        console.error('❌ Error fetching news:', error);
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
