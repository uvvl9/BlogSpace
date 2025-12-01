// Footer Component

import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} BlogSpace. Built with React & Firebase.</p>
                    <div className="footer-links">
                        <Link to="/contact" className="footer-link">Contact Us</Link>
                        <span className="text-muted"> | </span>
                        <span className="text-muted">CPIT 405 - Web Development Project</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
