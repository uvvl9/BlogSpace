// Main App Component
// React Router setup with all routes and layout

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import BlogPost from './pages/BlogPost';
import Settings from './pages/Settings';
import Contact from './pages/Contact';
import './App.css';

function App() {
    return (
        <Router>
            <ThemeProvider>
                <AuthProvider>
                    <div className="app">
                        <Header />
                        <main className="main-content">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/post/:postId" element={<BlogPost />} />
                                <Route path="/contact" element={<Contact />} />

                                {/* Protected Routes */}
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/create-post"
                                    element={
                                        <ProtectedRoute>
                                            <CreatePost />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/edit-post/:postId"
                                    element={
                                        <ProtectedRoute>
                                            <EditPost />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/settings"
                                    element={
                                        <ProtectedRoute>
                                            <Settings />
                                        </ProtectedRoute>
                                    }
                                />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
            </ThemeProvider>
        </Router>
    );
}

export default App;
