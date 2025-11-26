// Settings Page with Profile Photo Upload
// User account settings and profile management

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updatePassword, updateProfile, deleteUser } from 'firebase/auth';
import { uploadProfilePhoto } from '../services/storageService';
import './Settings.css';

const Settings = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(currentUser?.photoURL || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            let photoURL = currentUser.photoURL;

            // Upload photo if selected
            if (photoFile) {
                const result = await uploadProfilePhoto(currentUser.uid, photoFile);
                photoURL = result.photoURL;
            }

            // Update profile
            await updateProfile(currentUser, {
                displayName,
                photoURL
            });

            setSuccess('Profile updated successfully!');
            setPhotoFile(null);
        } catch (err) {
            setError('Failed to update profile: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        try {
            await updatePassword(currentUser, newPassword);
            setSuccess('Password changed successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('Failed to change password. You may need to re-login: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account? This action cannot be undone!'
        );

        if (!confirmed) return;

        setLoading(true);
        try {
            await deleteUser(currentUser);
            await logout();
            navigate('/');
        } catch (err) {
            setError('Failed to delete account. You may need to re-login: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <div className="container">
                <div className="settings-header">
                    <h1>Account Settings</h1>
                    <p className="text-muted">Manage your profile and account preferences</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="settings-grid">
                    {/* Profile Information */}
                    <div className="settings-card">
                        <h2>Profile Information</h2>
                        <form onSubmit={handleUpdateProfile}>
                            {/* Profile Photo */}
                            <div className="form-group">
                                <label className="form-label">Profile Photo</label>
                                <div className="photo-upload-section">
                                    <img
                                        src={photoPreview || 'https://via.placeholder.com/100'}
                                        alt="Profile"
                                        className="photo-preview"
                                    />
                                    <div className="photo-upload-controls">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="form-input"
                                            id="photo-upload"
                                        />
                                        <label htmlFor="photo-upload" className="btn btn-secondary">
                                            Choose Photo
                                        </label>
                                        {photoFile && (
                                            <span className="text-muted">Photo selected: {photoFile.name}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Display Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={currentUser?.email}
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                                <small className="text-muted">Email cannot be changed</small>
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="settings-card">
                        <h2>Security</h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="settings-card danger-zone">
                        <h2>Danger Zone</h2>
                        <p className="text-muted">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="btn btn-danger"
                            disabled={loading}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
