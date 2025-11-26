// Header Navigation Component
// Global navigation with user menu and authentication state

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Header.css';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <header className="header">
            <div className="container">
                <div className="header-content">
                    <Link to="/" className="logo">
                        <span className="logo-icon">✍️</span>
                        <span className="logo-text text-gradient">BlogSpace</span>
                    </Link>

                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="theme-toggle"
                            aria-label="Toggle theme"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </button>

                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/settings" className="nav-link">Settings</Link>
                                <div className="user-menu">
                                    <span className="user-name">{currentUser.displayName || currentUser.email}</span>
                                    <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
