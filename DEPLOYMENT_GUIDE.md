# Deployment Guide - Phase 1 Features

## 🔧 Firebase Security Rules Setup

The errors you're seeing are due to missing Firebase Security Rules. Follow these steps to fix them:

### 1. Deploy Firestore Security Rules

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):
   ```bash
   firebase init
   ```
   - Select Firestore and Storage
   - Use existing project: `nodeqms`

4. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 2. Deploy Storage Security Rules

1. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

### 3. Alternative: Manual Setup in Firebase Console

If you prefer to set up rules manually:

#### Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `nodeqms`
3. Go to Firestore Database → Rules
4. Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. Click "Publish"

#### Storage Rules:
1. Go to Storage → Rules
2. Replace the rules with:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Click "Publish"

## 🚀 Re-enable Audit Trail Features

After deploying the security rules, you can re-enable the audit trail features:

### 1. Re-enable Audit Trail Logging

Uncomment the audit trail logging in these files:
- `src/BatchSheet.js`
- `src/VerificationDetail.js`
- `src/components/PhotoAttachment.js`
- `src/ManagerDashboard.js`

### 2. Test the Features

1. **Photo Attachments**: Try uploading photos in the BatchSheet form
2. **Audit Trail**: Check the Manager Dashboard for activity statistics
3. **Form Operations**: Submit, approve, reject, and delete forms to test audit logging

## 🔒 Production Security Rules

For production, you should implement more restrictive rules:

### Firestore Rules Example:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /completedForms/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.submittedBy == request.auth.token.email);
    }
    
    // Audit trail - managers can read all, users can read their own
    match /auditTrail/{document} {
      allow read: if request.auth != null && 
        (resource.data.userEmail == request.auth.token.email || 
         request.auth.token.role == 'manager');
      allow write: if request.auth != null;
    }
    
    // Saved forms - users can only access their own
    match /savedForms/{document} {
      allow read, write: if request.auth != null && 
        resource.data.savedBy == request.auth.token.email;
    }
  }
}
```

### Storage Rules Example:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only access photos for forms they submitted
    match /form-photos/{formId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing or insufficient permissions"**
   - Deploy the security rules as shown above
   - Make sure you're logged in to the app

2. **CORS errors for photo uploads**
   - Deploy the storage rules
   - Check that the storage bucket is properly configured

3. **"getDocs is not a function"**
   - This should be resolved with the security rules
   - If it persists, check that `getDocs` is properly exported from `firebase.js`

### Testing Checklist:

- [ ] Firebase Security Rules deployed
- [ ] Storage Rules deployed
- [ ] User authentication working
- [ ] Photo uploads working
- [ ] Form submission working
- [ ] Audit trail logging working
- [ ] Manager dashboard showing statistics

## 📞 Support

If you continue to have issues:
1. Check the Firebase Console for error logs
2. Verify your Firebase project configuration
3. Ensure all dependencies are installed: `npm install`
4. Clear browser cache and try again 