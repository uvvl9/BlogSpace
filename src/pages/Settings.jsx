// Settings Page with Avatar Selection
// User account settings and profile management

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updatePassword, updateProfile, deleteUser } from 'firebase/auth';
import { generateAvatarUrl, generateAvatarOptions } from '../services/avatarService';
import './Settings.css';

const Settings = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [avatarOptions, setAvatarOptions] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.photoURL || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEditAvatar = () => {
        // Generate 6 avatar options
        const options = generateAvatarOptions(currentUser.email || currentUser.uid, 6);
        setAvatarOptions(options);
        setShowAvatarPicker(true);
    };

    const handleGenerateRandomAvatar = async () => {
        setLoading(true);
        try {
            const randomAvatar = generateAvatarUrl(Date.now().toString());
            await updateProfile(currentUser, { photoURL: randomAvatar });
            setSelectedAvatar(randomAvatar);
            setSuccess('Avatar updated successfully!');
        } catch (err) {
            setError('Failed to update avatar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAvatar = async (avatarUrl) => {
        setSelectedAvatar(avatarUrl);
        setLoading(true);
        try {
            await updateProfile(currentUser, { photoURL: avatarUrl });
            setSuccess('Avatar updated successfully!');
            setShowAvatarPicker(false);
        } catch (err) {
            setError('Failed to update avatar: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await updateProfile(currentUser, { displayName });
            setSuccess('Profile updated successfully!');
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
                            {/* Avatar Section */}
                            <div className="form-group">
                                <label className="form-label">Avatar</label>
                                <div className="avatar-section">
                                    <img
                                        src={selectedAvatar || currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                        alt="Avatar"
                                        className="avatar-preview-large"
                                    />
                                    <div className="avatar-buttons">
                                        <button
                                            type="button"
                                            onClick={handleEditAvatar}
                                            className="btn btn-secondary"
                                            disabled={loading}
                                        >
                                            Edit Avatar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleGenerateRandomAvatar}
                                            className="btn btn-secondary"
                                            disabled={loading}
                                        >
                                            Generate Random Avatar
                                        </button>
                                    </div>
                                </div>

                                {/* Avatar Picker Modal */}
                                {showAvatarPicker && (
                                    <div className="avatar-picker">
                                        <h3>Choose Your Avatar</h3>
                                        <div className="avatar-grid">
                                            {avatarOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="avatar-option"
                                                    onClick={() => handleSelectAvatar(option.url)}
                                                >
                                                    <img src={option.url} alt={`Avatar ${option.id}`} />
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAvatarPicker(false)}
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
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
