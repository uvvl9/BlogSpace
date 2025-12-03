// External API Service
// Integrates with multiple News APIs (with fallback) and Quotable API
// Implements caching to reduce API calls

import axios from 'axios';

// API Keys and Base URLs
const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || 'e1bad32da5ddb4b6a13f4cb44298d657';
const NEWSDATA_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY || 'pub_61048e0e6a8b5e7c8a5f3f9f7e8f9f9f'; // Replace with your key
const CURRENTS_API_KEY = import.meta.env.VITE_CURRENTS_API_KEY || 'your-currents-api-key'; // Replace with your key

const GNEWS_API_BASE_URL = 'https://gnews.io/api/v4';
const NEWSDATA_API_BASE_URL = 'https://newsdata.io/api/1';
const CURRENTS_API_BASE_URL = 'https://api.currentsapi.services/v1';
const QUOTABLE_API_BASE_URL = 'https://api.quotable.io';

// Cache configuration
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const NEWS_CACHE_KEY = 'trending_news_cache';

// Helper function to get cached data
const getCachedNews = () => {
    try {
        const cached = localStorage.getItem(NEWS_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
            console.log('Using cached news data');
            return data;
        }

        // Cache expired, remove it
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
    } catch (error) {
        console.error('Error caching news:', error);
    }
};

// CORS Proxy for APIs that don't support CORS on free tier
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Fetch from GNews API
const fetchFromGNews = async (limit) => {
    // Use CORS proxy for GitHub Pages deployment
    const apiUrl = `${GNEWS_API_BASE_URL}/top-headlines?category=general&lang=en&country=us&max=${limit}&apikey=${GNEWS_API_KEY}`;
    const proxiedUrl = `${CORS_PROXY}${encodeURIComponent(apiUrl)}`;

    const response = await axios.get(proxiedUrl);
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    if (!data.articles || data.articles.length === 0) {
        throw new Error('No news articles returned from GNews');
    }

    return data.articles;
};

// Fetch from NewsData.io API
const fetchFromNewsData = async (limit) => {
    const response = await axios.get(`${NEWSDATA_API_BASE_URL}/news`, {
        params: {
            apikey: NEWSDATA_API_KEY,
            country: 'us',
            language: 'en',
            category: 'top',
            size: limit
        }
    });

    // Normalize the response to match GNews format
    if (!response.data.results || response.data.results.length === 0) {
        throw new Error('No news articles returned from NewsData.io');
    }

    return response.data.results.map(article => ({
        title: article.title || 'No title available',
        description: article.description || article.content || 'No description available',
        url: article.link || '#',
        source: { name: article.source_id || 'Unknown Source' },
        publishedAt: article.pubDate || new Date().toISOString(),
        image: article.image_url || null
    }));
};

// Fetch from Currents API
const fetchFromCurrents = async (limit) => {
    const response = await axios.get(`${CURRENTS_API_BASE_URL}/latest-news`, {
        params: {
            apiKey: CURRENTS_API_KEY,
            language: 'en',
            country: 'us',
            limit: limit
        }
    });
    // Normalize the response to match GNews format
    return response.data.news.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: { name: article.author || 'Unknown' },
        publishedAt: article.published,
        image: article.image
    }));
};

// Fetch trending news articles with caching and fallback
export const fetchTrendingNews = async (limit = 5) => {
    // Check cache first
    const cachedNews = getCachedNews();
    if (cachedNews) {
        return cachedNews;
    }

    // Try APIs in order: GNews -> NewsData -> Currents
    const apis = [
        { name: 'GNews', fetch: fetchFromGNews },
        { name: 'NewsData', fetch: fetchFromNewsData },
        { name: 'Currents', fetch: fetchFromCurrents }
    ];

    for (const api of apis) {
        try {
            console.log(`Trying ${api.name} API...`);
            const articles = await api.fetch(limit);

            // Cache the successful result
            cacheNews(articles);
            console.log(`Successfully fetched news from ${api.name}`);

            return articles;
        } catch (error) {
            console.warn(`${api.name} API failed:`, error.message);
            // Continue to next API
        }
    }

    // All APIs failed
    throw new Error('Failed to load news from all sources. Please try again later.');
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
