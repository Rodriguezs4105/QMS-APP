import React, { useState, useEffect } from 'react';
import { getFormAuditTrail, getUserAuditTrail, getAuditTrailByDateRange } from '../utils/auditTrail';

// Icons
const ClockIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ActionIcon = ({ action }) => {
    const iconMap = {
        'FORM_CREATED': '📝',
        'FORM_SAVED': '💾',
        'FORM_SUBMITTED': '📤',
        'FORM_APPROVED': '✅',
        'FORM_REJECTED': '❌',
        'FORM_DELETED': '🗑️',
        'FORM_EDITED': '✏️',
        'PHOTO_ATTACHED': '📷',
        'SIGNATURE_ADDED': '✍️',
        'CORRECTIVE_ACTION_ADDED': '🔧',
        'QUALITY_CHECK_PERFORMED': '🔍'
    };
    
    return <span className="text-lg">{iconMap[action] || '📋'}</span>;
};

const AuditTrailViewer = ({ formId, userEmail, startDate, endDate, title = "Audit Trail" }) => {
    const [auditEntries, setAuditEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadAuditTrail = async () => {
            try {
                setLoading(true);
                setError('');
                
                let entries = [];
                
                if (formId) {
                    entries = await getFormAuditTrail(formId);
                } else if (userEmail) {
                    entries = await getUserAuditTrail(userEmail);
                } else if (startDate && endDate) {
                    entries = await getAuditTrailByDateRange(startDate, endDate);
                } else {
                    setError('No filter criteria provided');
                    return;
                }
                
                setAuditEntries(entries);
            } catch (error) {
                console.error('Error loading audit trail:', error);
                setError('Failed to load audit trail');
            } finally {
                setLoading(false);
            }
        };

        loadAuditTrail();
    }, [formId, userEmail, startDate, endDate]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString();
    };

    const getActionColor = (action) => {
        const colorMap = {
            'FORM_CREATED': 'bg-blue-100 text-blue-800',
            'FORM_SAVED': 'bg-yellow-100 text-yellow-800',
            'FORM_SUBMITTED': 'bg-green-100 text-green-800',
            'FORM_APPROVED': 'bg-emerald-100 text-emerald-800',
            'FORM_REJECTED': 'bg-red-100 text-red-800',
            'FORM_DELETED': 'bg-gray-100 text-gray-800',
            'FORM_EDITED': 'bg-purple-100 text-purple-800',
            'PHOTO_ATTACHED': 'bg-indigo-100 text-indigo-800',
            'SIGNATURE_ADDED': 'bg-pink-100 text-pink-800',
            'CORRECTIVE_ACTION_ADDED': 'bg-orange-100 text-orange-800',
            'QUALITY_CHECK_PERFORMED': 'bg-cyan-100 text-cyan-800'
        };
        
        return colorMap[action] || 'bg-gray-100 text-gray-800';
    };

    const getActionDescription = (action) => {
        const descriptionMap = {
            'FORM_CREATED': 'Form Created',
            'FORM_SAVED': 'Form Saved for Later',
            'FORM_SUBMITTED': 'Form Submitted for Review',
            'FORM_APPROVED': 'Form Approved',
            'FORM_REJECTED': 'Form Rejected',
            'FORM_DELETED': 'Form Deleted',
            'FORM_EDITED': 'Form Edited',
            'PHOTO_ATTACHED': 'Photo Attached',
            'SIGNATURE_ADDED': 'Signature Added',
            'CORRECTIVE_ACTION_ADDED': 'Corrective Action Added',
            'QUALITY_CHECK_PERFORMED': 'Quality Check Performed'
        };
        
        return descriptionMap[action] || action;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading audit trail...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">
                    {auditEntries.length} audit entries found
                </p>
            </div>

            {/* Audit Entries */}
            <div className="divide-y divide-gray-200">
                {auditEntries.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <p className="text-gray-500">No audit trail entries found</p>
                    </div>
                ) : (
                    auditEntries.map((entry, index) => (
                        <div key={entry.id || index} className="px-6 py-4 hover:bg-gray-50">
                            <div className="flex items-start space-x-3">
                                {/* Action Icon */}
                                <div className="flex-shrink-0 mt-1">
                                    <ActionIcon action={entry.action} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                                            {getActionDescription(entry.action)}
                                        </span>
                                        <span className="text-sm text-gray-500">by</span>
                                        <div className="flex items-center space-x-1 text-sm text-gray-700">
                                            <UserIcon />
                                            <span className="font-medium">{entry.userEmail}</span>
                                        </div>
                                    </div>

                                    {/* Form Details */}
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">{entry.formTitle}</span>
                                        {entry.details?.recipeName && (
                                            <span className="ml-2">• {entry.details.recipeName}</span>
                                        )}
                                        {entry.details?.batchNumber && (
                                            <span className="ml-2">• Batch #{entry.details.batchNumber}</span>
                                        )}
                                    </div>

                                    {/* Additional Details */}
                                    {entry.details && Object.keys(entry.details).length > 0 && (
                                        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2 mb-2">
                                            {Object.entries(entry.details).map(([key, value]) => (
                                                <div key={key} className="flex justify-between">
                                                    <span className="font-medium">{key}:</span>
                                                    <span className="ml-2">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Timestamp */}
                                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                                        <ClockIcon />
                                        <span>{formatTimestamp(entry.timestamp)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AuditTrailViewer; 