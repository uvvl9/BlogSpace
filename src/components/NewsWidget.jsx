// News Widget Component
// Displays trending news from News API

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTrendingNews } from '../services/apiService';
import './NewsWidget.css';

const NewsWidget = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadNews();
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            setError('');
            const articles = await fetchTrendingNews(5);
            setNews(articles);
        } catch (err) {
            console.error('Error loading news:', err);
            setError('Failed to load news');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const handlePostNews = (article) => {
        if (!currentUser) {
            alert('Please login to create a post');
            navigate('/login');
            return;
        }

        const postContent = `${article.description || article.title}\n\nSource: ${article.source.name}\nRead more: ${article.url}`;
        navigate('/create-post', {
            state: {
                prefilledContent: postContent,
                prefilledTitle: article.title
            }
        });
    };

    return (
        <div className="news-widget">
            <div className="widget-header">
                <h3>📰 Trending News</h3>
            </div>

            {loading ? (
                <div className="widget-loading">
                    <div className="spinner"></div>
                    <p>Loading news...</p>
                </div>
            ) : error ? (
                <div className="widget-error">
                    <p>{error}</p>
                    <button onClick={loadNews} className="btn btn-sm btn-secondary">
                        Try Again
                    </button>
                </div>
            ) : news.length > 0 ? (
                <div className="news-list">
                    {news.map((article, index) => (
                        <div key={index} className="news-item">
                            <div className="news-content">
                                <h4 className="news-title">{article.title}</h4>
                                <div className="news-meta">
                                    <span className="news-source">{article.source.name}</span>
                                    <span className="news-time">{formatDate(article.publishedAt)}</span>
                                </div>
                                <div className="news-actions">
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-sm btn-secondary"
                                    >
                                        📖 Read
                                    </a>
                                    {currentUser && (
                                        <button
                                            onClick={() => handlePostNews(article)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            ✍️ Post This
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-news">No news available</p>
            )}
        </div>
    );
};

export default NewsWidget;
