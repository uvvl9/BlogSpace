// Quote Widget Component
// Displays random inspirational quotes from Quotable API

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchRandomQuote } from '../services/apiService';
import './QuoteWidget.css';

const QuoteWidget = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fallback quotes if API fails
    const fallbackQuotes = [
        { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { content: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
        { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
    ];

    useEffect(() => {
        loadQuote();
    }, []);

    const loadQuote = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await fetchRandomQuote();
            setQuote(data);
        } catch (err) {
            console.error('Error loading quote from API, using fallback:', err);
            // Use fallback quote if API fails
            const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            setQuote(randomQuote);
        } finally {
            setLoading(false);
        }
    };

    const handlePostQuote = () => {
        if (!currentUser) {
            alert('Please login to create a post');
            navigate('/login');
            return;
        }

        const postContent = `"${quote.content}"\n\n— ${quote.author}`;
        navigate('/create-post', {
            state: {
                prefilledContent: postContent,
                prefilledTitle: 'Inspirational Quote'
            }
        });
    };

    return (
        <div className="quote-widget">
            <div className="widget-header">
                <h3>💡 Daily Inspiration</h3>
            </div>

            {loading ? (
                <div className="widget-loading">
                    <div className="spinner"></div>
                    <p>Loading quote...</p>
                </div>
            ) : error ? (
                <div className="widget-error">
                    <p>{error}</p>
                    <button onClick={loadQuote} className="btn btn-sm btn-secondary">
                        Try Again
                    </button>
                </div>
            ) : quote ? (
                <div className="quote-content">
                    <p className="quote-text">"{quote.content}"</p>
                    <p className="quote-author">— {quote.author}</p>
                    <div className="quote-actions">
                        <button onClick={loadQuote} className="btn btn-sm btn-secondary">
                            🔄 New Quote
                        </button>
                        {currentUser && (
                            <button onClick={handlePostQuote} className="btn btn-sm btn-primary">
                                ✍️ Post This
                            </button>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default QuoteWidget;
