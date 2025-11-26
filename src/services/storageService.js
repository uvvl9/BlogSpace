// Firebase Storage Service
// Handles file uploads (profile photos)

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase.config';

// Upload profile photo
export const uploadProfilePhoto = async (userId, file) => {
    try {
        // Create a storage reference
        const storageRef = ref(storage, `profile-photos/${userId}`);

        // Upload file
        await uploadBytes(storageRef, file);

        // Get download URL
        const downloadURL = await getDownloadURL(storageRef);

        return { photoURL: downloadURL, success: true };
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw new Error('Failed to upload photo');
    }
};
