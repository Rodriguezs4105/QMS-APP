// Utility to safely submit form data to Firestore
import { serverTimestamp } from '../firebase';

/**
 * Safely prepares form data for Firestore by omitting undefined/null fields and ensuring required fields.
 * @param {object} data - The form data object
 * @param {object} options - { status, submittedBy, submittedAt, savedBy, savedAt, isCompletedForm }
 * @returns {object} - Cleaned data ready for Firestore
 */
export function prepareFormDataForFirestore(data, options = {}) {
    const cleaned = {};
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value !== 'undefined' && value !== null) {
            cleaned[key] = value;
        }
    });
    // Add/override required fields
    if (options.status) cleaned.status = options.status;
    if (options.submittedBy) cleaned.submittedBy = options.submittedBy;
    if (options.savedBy) cleaned.savedBy = options.savedBy;
    if (options.isCompletedForm) cleaned.submittedAt = serverTimestamp();
    if (options.isSavedForm) cleaned.savedAt = serverTimestamp();
    return cleaned;
} 