// Settings Page with Color-Filtered Avatar Picker
// User account settings and profile management

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updatePassword, updateProfile, deleteUser } from 'firebase/auth';
import { updateUserPostsAvatar, updateUserPostsName, syncUserProfile } from '../services/firestoreService';
import { updateUserCommentsName } from '../services/commentsService';
import {
    generateAvatarUrl,
    generateColorFilteredAvatars,
    getAvatarColors
} from '../services/avatarService';
import './Settings.css';

const Settings = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [avatarOptions, setAvatarOptions] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.photoURL || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEditAvatar = () => {
        // Generate avatars with no filter initially (variety pack)
        const options = generateColorFilteredAvatars(currentUser.email || currentUser.uid, null);
        setAvatarOptions(options);
        setSelectedColor(null);
        setShowAvatarPicker(true);
    };

    const handleColorFilter = (colorValue) => {
        // Generate 12 avatars for selected color
        const options = generateColorFilteredAvatars(currentUser.email || currentUser.uid, colorValue);
        setAvatarOptions(options);
        setSelectedColor(colorValue);
    };

    const handleGenerateRandomAvatar = async () => {
        setLoading(true);
        try {
            const randomAvatar = generateAvatarUrl(Date.now().toString());
            await updateProfile(currentUser, { photoURL: randomAvatar });
            // Update all user's posts with new avatar
            await updateUserPostsAvatar(currentUser.uid, randomAvatar);
            // Sync to Firestore
            await syncUserProfile({ ...currentUser, photoURL: randomAvatar });

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
            // Update all user's posts with new avatar
            await updateUserPostsAvatar(currentUser.uid, avatarUrl);
            // Sync to Firestore
            await syncUserProfile({ ...currentUser, photoURL: avatarUrl });

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
            // Sync to Firestore
            await syncUserProfile({ ...currentUser, displayName });

            // Update all user's posts with new name
            await updateUserPostsName(currentUser.uid, displayName);

            // Update all user's comments with new name (non-blocking)
            try {
                await updateUserCommentsName(currentUser.uid, displayName);
            } catch (commentErr) {
                console.error('Failed to update comments:', commentErr);
                // We don't block the success message here, as the main profile is updated
            }

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
            setNewPassword('');
            setConfirmPassword('');
            setSuccess('Password changed successfully!');
        } catch (err) {
            if (err.code === 'auth/requires-recent-login') {
                setError('For security, please log out and log back in before changing your password');
            } else {
                setError('Failed to change password: ' + err.message);
            }
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
                                        src={selectedAvatar || currentUser?.photoURL || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=default'}
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
                                        <p className="picker-subtitle">Filter by color</p>

                                        {/* Color Filter Buttons */}
                                        <div className="color-filters">
                                            <button
                                                className={`color-filter-btn ${selectedColor === null ? 'active' : ''}`}
                                                onClick={() => handleColorFilter(null)}
                                                type="button"
                                            >
                                                All Colors
                                            </button>
                                            {getAvatarColors().map((color) => (
                                                <button
                                                    key={color.value}
                                                    type="button"
                                                    className={`color-filter-btn ${selectedColor === color.value ? 'active' : ''}`}
                                                    onClick={() => handleColorFilter(color.value)}
                                                    style={{ borderColor: `#${color.value}` }}
                                                >
                                                    {color.emoji} {color.name}
                                                </button>
                                            ))}
                                        </div>

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
