import React, { useState, useRef } from 'react';
import { uploadPhoto, takePhoto, selectPhoto, compressImage, validateImage, deletePhoto } from '../utils/photoAttachments';
import { logAuditTrail, AUDIT_ACTIONS } from '../utils/auditTrail';

// Icons
const CameraIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const GalleryIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const TrashIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const PhotoAttachment = ({ 
    formId, 
    fieldName, 
    label = "Photo Attachment", 
    description = "", 
    required = false,
    onPhotoUploaded,
    onPhotoDeleted,
    existingPhotos = [],
    maxPhotos = 5,
    showPreview = true
}) => {
    const [photos, setPhotos] = useState(existingPhotos);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (file) => {
        try {
            setUploading(true);
            setError('');

            // Validate file
            const validation = validateImage(file);
            if (!validation.isValid) {
                setError(validation.error);
                return;
            }

            // Compress image
            const compressedFile = await compressImage(file);

            // Upload to Firebase Storage
            const photoData = await uploadPhoto(compressedFile, formId, fieldName, description);

            // Add to photos array
            const newPhotos = [...photos, photoData];
            setPhotos(newPhotos);

            // Log audit trail
            await logAuditTrail(
                AUDIT_ACTIONS.PHOTO_ATTACHED,
                formId,
                'photoAttachment',
                `${label} - Photo Added`,
                {
                    fieldName,
                    photoFileName: photoData.fileName,
                    photoSize: photoData.size,
                    description
                }
            );

            // Call parent callback
            if (onPhotoUploaded) {
                onPhotoUploaded(photoData, newPhotos);
            }

        } catch (error) {
            console.error('Error uploading photo:', error);
            setError(error.message || 'Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const file = await takePhoto();
            await handlePhotoUpload(file);
        } catch (error) {
            setError(error.message || 'Failed to take photo');
        }
    };

    const handleSelectPhoto = async () => {
        try {
            const file = await selectPhoto();
            await handlePhotoUpload(file);
        } catch (error) {
            setError(error.message || 'Failed to select photo');
        }
    };

    const handleDeletePhoto = async (photoIndex) => {
        try {
            const photo = photos[photoIndex];
            
            // Delete from Firebase Storage
            if (photo.storagePath) {
                await deletePhoto(photo.storagePath);
            }

            // Remove from photos array
            const newPhotos = photos.filter((_, index) => index !== photoIndex);
            setPhotos(newPhotos);

            // Log audit trail
            await logAuditTrail(
                AUDIT_ACTIONS.PHOTO_ATTACHED,
                formId,
                'photoAttachment',
                `${label} - Photo Deleted`,
                {
                    fieldName,
                    photoFileName: photo.fileName,
                    description
                }
            );

            // Call parent callback
            if (onPhotoDeleted) {
                onPhotoDeleted(photo, newPhotos);
            }

        } catch (error) {
            console.error('Error deleting photo:', error);
            setError('Failed to delete photo');
        }
    };

    const handleFileInputChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            await handlePhotoUpload(file);
        }
        // Reset input
        event.target.value = '';
    };

    return (
        <div className="space-y-4">
            {/* Label */}
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <span className="text-xs text-gray-500">
                    {photos.length}/{maxPhotos} photos
                </span>
            </div>

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-600">{description}</p>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Upload Buttons */}
            {photos.length < maxPhotos && (
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={handleTakePhoto}
                        disabled={uploading}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <CameraIcon />
                        <span>Take Photo</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSelectPhoto}
                        disabled={uploading}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <GalleryIcon />
                        <span>Select Photo</span>
                    </button>

                    {/* Hidden file input for drag & drop or manual selection */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>
            )}

            {/* Uploading Indicator */}
            {uploading && (
                <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Uploading photo...</span>
                </div>
            )}

            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={photo.url}
                                    alt={photo.description || `Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                
                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => window.open(photo.url, '_blank')}
                                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                            title="View full size"
                                        >
                                            <EyeIcon />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePhoto(index)}
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            title="Delete photo"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Photo info */}
                            <div className="mt-2 text-xs text-gray-500">
                                <p className="truncate">{photo.originalName}</p>
                                <p>{(photo.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No photos message */}
            {photos.length === 0 && !uploading && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No photos attached</p>
                    <p className="text-xs text-gray-400">Take or select photos to attach</p>
                </div>
            )}
        </div>
    );
};

export default PhotoAttachment; 