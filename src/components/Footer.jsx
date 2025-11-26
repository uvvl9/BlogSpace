// Footer Component

import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <p>&copy; {new Date().getFullYear()} BlogSpace. Built with React & Firebase.</p>
                    <p className="text-muted">CPIT 405 - Web Development Project</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
