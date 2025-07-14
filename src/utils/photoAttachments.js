import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from '../firebase';

/**
 * Upload a photo to Firebase Storage
 * @param {File} file - The photo file to upload
 * @param {string} formId - The form ID this photo belongs to
 * @param {string} fieldName - The field name this photo is attached to
 * @param {string} description - Optional description of the photo
 * @returns {Promise<string>} - The download URL of the uploaded photo
 */
export const uploadPhoto = async (file, formId, fieldName, description = '') => {
    try {
        // Validate file
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Invalid file type. Please select an image.');
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Please select an image smaller than 5MB.');
        }

        // Create unique filename
        const timestamp = Date.now();
        const fileName = `${formId}_${fieldName}_${timestamp}_${file.name}`;
        
        // Create storage reference
        const storageRef = ref(storage, `form-photos/${formId}/${fileName}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Return photo metadata
        return {
            url: downloadURL,
            fileName: fileName,
            originalName: file.name,
            size: file.size,
            type: file.type,
            description: description,
            uploadedAt: new Date().toISOString(),
            storagePath: snapshot.ref.fullPath
        };
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

/**
 * Delete a photo from Firebase Storage
 * @param {string} storagePath - The storage path of the photo to delete
 * @returns {Promise<void>}
 */
export const deletePhoto = async (storagePath) => {
    try {
        const photoRef = ref(storage, storagePath);
        await deleteObject(photoRef);
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
};

/**
 * Take a photo using the device camera
 * @returns {Promise<File>} - The captured photo as a File object
 */
export const takePhoto = () => {
    return new Promise((resolve, reject) => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Use back camera on mobile
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                resolve(file);
            } else {
                reject(new Error('No file selected'));
            }
        };
        
        input.onerror = () => {
            reject(new Error('Error accessing camera'));
        };
        
        // Trigger file selection
        input.click();
    });
};

/**
 * Select a photo from the device gallery
 * @returns {Promise<File>} - The selected photo as a File object
 */
export const selectPhoto = () => {
    return new Promise((resolve, reject) => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                resolve(file);
            } else {
                reject(new Error('No file selected'));
            }
        };
        
        input.onerror = () => {
            reject(new Error('Error selecting file'));
        };
        
        // Trigger file selection
        input.click();
    });
};

/**
 * Compress an image to reduce file size
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default: 1200)
 * @param {number} quality - JPEG quality (0-1, default: 0.8)
 * @returns {Promise<File>} - The compressed image as a File object
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            canvas.toBlob((blob) => {
                if (blob) {
                    // Create new file with compressed data
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                } else {
                    reject(new Error('Failed to compress image'));
                }
            }, 'image/jpeg', quality);
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
        
        // Load image from file
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

/**
 * Generate a thumbnail for an image
 * @param {string} imageUrl - The URL of the image
 * @param {number} width - Thumbnail width (default: 150)
 * @param {number} height - Thumbnail height (default: 150)
 * @returns {Promise<string>} - The thumbnail as a data URL
 */
export const generateThumbnail = (imageUrl, width = 150, height = 150) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw thumbnail
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to data URL
            const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
            resolve(thumbnailUrl);
        };
        
        img.onerror = () => {
            reject(new Error('Failed to load image for thumbnail'));
        };
        
        img.src = imageUrl;
    });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @returns {object} - Validation result with isValid boolean and error message
 */
export const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
        return { isValid: false, error: 'No file selected' };
    }
    
    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.' };
    }
    
    if (file.size > maxSize) {
        return { isValid: false, error: 'File size too large. Please select an image smaller than 5MB.' };
    }
    
    return { isValid: true, error: null };
}; 