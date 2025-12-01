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
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="BlogSpace" style={{ height: '40px', width: 'auto' }} />
                        <span className="logo-text text-gradient">BlogSpace</span>
                    </Link>

                    <nav className="nav">
                        <Link to="/" className="nav-link">Home</Link>

                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Profile</Link>
                                <Link to="/settings" className="nav-link">Settings</Link>
                                <div className="user-menu">
                                    <img
                                        src={currentUser.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(currentUser.displayName || currentUser.email)}`}
                                        alt={currentUser.displayName || currentUser.email}
                                        className="user-avatar-header"
                                        style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }}
                                    />
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

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-secondary btn-sm"
                            aria-label="Toggle theme"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
