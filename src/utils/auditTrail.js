import { db, auth, addDoc, collection, serverTimestamp, query, where, orderBy, getDocs } from '../firebase';

// Audit trail action types
export const AUDIT_ACTIONS = {
    FORM_CREATED: 'FORM_CREATED',
    FORM_SAVED: 'FORM_SAVED',
    FORM_SUBMITTED: 'FORM_SUBMITTED',
    FORM_APPROVED: 'FORM_APPROVED',
    FORM_REJECTED: 'FORM_REJECTED',
    FORM_DELETED: 'FORM_DELETED',
    FORM_EDITED: 'FORM_EDITED',
    PHOTO_ATTACHED: 'PHOTO_ATTACHED',
    SIGNATURE_ADDED: 'SIGNATURE_ADDED',
    CORRECTIVE_ACTION_ADDED: 'CORRECTIVE_ACTION_ADDED',
    QUALITY_CHECK_PERFORMED: 'QUALITY_CHECK_PERFORMED'
};

/**
 * Log an audit trail entry
 * @param {string} action - The action performed (from AUDIT_ACTIONS)
 * @param {string} formId - The ID of the form being acted upon
 * @param {string} formType - The type of form (e.g., 'batchSheet', 'yogurtFinalTimeCut')
 * @param {string} formTitle - The human-readable title of the form
 * @param {object} details - Additional details about the action
 * @param {string} userId - The user performing the action (optional, will use current user if not provided)
 */
export const logAuditTrail = async (action, formId, formType, formTitle, details = {}, userId = null) => {
    try {
        const currentUser = auth.currentUser;
        const user = userId || currentUser?.email || 'Unknown User';
        
        const auditEntry = {
            action,
            formId,
            formType,
            formTitle,
            userId: user,
            userEmail: currentUser?.email || 'Unknown',
            timestamp: serverTimestamp(),
            details,
            ipAddress: 'N/A', // Could be enhanced with actual IP tracking
            userAgent: navigator.userAgent,
            sessionId: sessionStorage.getItem('sessionId') || 'N/A'
        };

        await addDoc(collection(db, 'auditTrail'), auditEntry);
        
        // Also log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Audit Trail Entry:', auditEntry);
        }
    } catch (error) {
        console.error('Error logging audit trail:', error);
        // Don't throw error to avoid breaking main functionality
    }
};

/**
 * Get audit trail entries for a specific form
 * @param {string} formId - The form ID to get audit trail for
 * @param {number} limit - Maximum number of entries to return (default: 50)
 */
export const getFormAuditTrail = async (formId, limit = 50) => {
    try {
        const q = query(
            collection(db, 'auditTrail'),
            where('formId', '==', formId),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).slice(0, limit);
    } catch (error) {
        console.error('Error getting form audit trail:', error);
        return [];
    }
};

/**
 * Get audit trail entries for a specific user
 * @param {string} userEmail - The user email to get audit trail for
 * @param {number} limit - Maximum number of entries to return (default: 50)
 */
export const getUserAuditTrail = async (userEmail, limit = 50) => {
    try {
        const q = query(
            collection(db, 'auditTrail'),
            where('userEmail', '==', userEmail),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).slice(0, limit);
    } catch (error) {
        console.error('Error getting user audit trail:', error);
        return [];
    }
};

/**
 * Get audit trail entries for a specific time period
 * @param {Date} startDate - Start date for the period
 * @param {Date} endDate - End date for the period
 * @param {number} limit - Maximum number of entries to return (default: 100)
 */
export const getAuditTrailByDateRange = async (startDate, endDate, limit = 100) => {
    try {
        const q = query(
            collection(db, 'auditTrail'),
            where('timestamp', '>=', startDate),
            where('timestamp', '<=', endDate),
            orderBy('timestamp', 'desc')
        );
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })).slice(0, limit);
    } catch (error) {
        console.error('Error getting audit trail by date range:', error);
        return [];
    }
};

/**
 * Generate a session ID for tracking user sessions
 */
export const generateSessionId = () => {
    const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('sessionId', sessionId);
    return sessionId;
};

// Initialize session ID when the module is loaded
if (typeof window !== 'undefined') {
    if (!sessionStorage.getItem('sessionId')) {
        generateSessionId();
    }
} 