import { auth, db } from './firebase';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, FirebaseStorage } from 'firebase/storage';
import { onAuthStateChanged, Auth, User as FirebaseUser } from 'firebase/auth';

const storage = getStorage();
export function getFirebaseStorage(): FirebaseStorage {
  return storage;
}

export function getFirebaseAuth(): Auth {
  return auth;
}

/**
 * Wait for Firebase Authentication initialization to complete before attempting operations.
 * Resolves with current FirebaseUser or null. Does not treat resolving state as confirmed logged out.
 */
export function waitForFirebaseAuth(timeoutMs = 1500): Promise<FirebaseUser | null> {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(auth?.currentUser || null);
      }
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          unsubscribe();
          resolve(user);
        }
      },
      () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          unsubscribe();
          resolve(null);
        }
      }
    );
  });
}

// ---------------------------------------------------------------------------
// 1. Upload Product Image to Firebase Storage (product-images/)
// ---------------------------------------------------------------------------
export async function uploadProductImageToFirebase(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  const uniqueId = `prod_img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const ext = file.name.split('.').pop() || 'jpg';
  const storagePath = `product-images/${uniqueId}.${ext}`;

  const isRealFirebase =
    storage &&
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('Dummy');

  if (isRealFirebase) {
    const storageRef = ref(storage, storagePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'image/jpeg'
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('Firebase Storage product upload error:', error);
          fallbackReader(file, resolve, reject, storagePath);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadURL, path: storagePath });
          } catch {
            fallbackReader(file, resolve, reject, storagePath);
          }
        }
      );
    });
  } else {
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(40);
      setTimeout(() => {
        if (onProgress) onProgress(100);
        fallbackReader(file, resolve, reject, storagePath);
      }, 350);
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Upload Customer Profile Image to Firebase Storage (customer-profiles/{uid}/)
// ---------------------------------------------------------------------------
export async function uploadCustomerProfileImage(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  // 1. Validate file format
  const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validMimes.includes(file.type)) {
    const error: any = new Error('Unsupported image format. Please select a JPG, JPEG, PNG, or WEBP photo.');
    error.code = 'UNSUPPORTED_IMAGE_TYPE';
    throw error;
  }

  // 2. Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    const error: any = new Error('Photo size exceeds 5MB limit. Please choose a smaller photo under 5MB.');
    error.code = 'SIZE_LIMIT_EXCEEDED';
    throw error;
  }

  // 3. Wait for Firebase Auth state to resolve
  await waitForFirebaseAuth(1000);

  // 4. Construct storage path matching Storage security rules: customer-profiles/{userId}/{fileName}
  const effectiveUid = auth?.currentUser?.uid || userId;
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `profile_${Date.now()}.${ext}`;
  const storagePath = `customer-profiles/${effectiveUid}/${fileName}`;

  const isRealFirebase =
    storage &&
    import.meta.env.VITE_FIREBASE_API_KEY &&
    !import.meta.env.VITE_FIREBASE_API_KEY.includes('Dummy');

  if (isRealFirebase) {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        userId: effectiveUid,
        uploadedAt: new Date().toISOString()
      }
    };

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('Firebase Storage profile upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadURL, path: storagePath });
          } catch (err) {
            reject(err);
          }
        }
      );
    });
  } else {
    // Development fallback reader with realistic progression
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(30);
      setTimeout(() => {
        if (onProgress) onProgress(75);
        setTimeout(() => {
          if (onProgress) onProgress(100);
          fallbackReader(file, resolve, reject, storagePath);
        }, 180);
      }, 120);
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Error Classification Parser
// Distinguishes between all 7 error conditions requested
// ---------------------------------------------------------------------------
export function parseUploadError(err: any): {
  category: 'auth' | 'permission' | 'bucket' | 'network' | 'type' | 'size' | 'database' | 'unknown';
  message: string;
} {
  if (!err) {
    return { category: 'unknown', message: 'An unexpected error occurred. Please try again.' };
  }

  const raw = (err.message || err.toString() || '').toLowerCase();
  const code = (err.code || '').toLowerCase();

  // 1. User not authenticated
  if (
    code === 'not_authenticated' ||
    code === 'auth/unauthenticated' ||
    raw.includes('not authenticated') ||
    raw.includes('session expired') ||
    raw.includes('please sign in')
  ) {
    return {
      category: 'auth',
      message: 'Please sign in to upload your profile photo.'
    };
  }

  // 2. Storage permission denied
  if (
    code === 'storage/unauthorized' ||
    raw.includes('storage/unauthorized') ||
    raw.includes('permission denied') ||
    raw.includes('permission')
  ) {
    return {
      category: 'permission',
      message: 'Storage permission denied. You can only update your own profile photo.'
    };
  }

  // 3. Invalid or missing Storage bucket
  if (
    code === 'storage/bucket-not-found' ||
    code === 'storage/project-not-found' ||
    code === 'storage/invalid-checksum' ||
    raw.includes('bucket-not-found') ||
    raw.includes('project-not-found')
  ) {
    return {
      category: 'bucket',
      message: 'Firebase Storage bucket not found. Please verify your Firebase project storage bucket configuration.'
    };
  }

  // 4. Network failure
  if (
    code === 'storage/retry-limit-exceeded' ||
    code === 'storage/cannot-slice-blob' ||
    raw.includes('network') ||
    raw.includes('failed to fetch') ||
    (typeof navigator !== 'undefined' && !navigator.onLine)
  ) {
    return {
      category: 'network',
      message: 'Network connection failed. Please check your internet connection and try again.'
    };
  }

  // 5. Unsupported image type
  if (code === 'unsupported_image_type' || raw.includes('unsupported image') || raw.includes('valid jpg')) {
    return {
      category: 'type',
      message: 'Unsupported image format. Please select a JPG, JPEG, PNG, or WEBP photo.'
    };
  }

  // 6. Image exceeding size limit
  if (code === 'size_limit_exceeded' || raw.includes('5mb') || raw.includes('size limit') || raw.includes('too large')) {
    return {
      category: 'size',
      message: 'Photo size exceeds 5MB limit. Please choose a smaller photo under 5MB.'
    };
  }

  // 7. Database profile update failure
  if (raw.includes('database') || raw.includes('failed to update profile') || raw.includes('updatecustomerprofile')) {
    return {
      category: 'database',
      message: 'Failed to update profile record in database. Please try again.'
    };
  }

  return {
    category: 'unknown',
    message: err.message || 'Failed to upload photo. Please try again.'
  };
}

function fallbackReader(
  file: File,
  resolve: (value: { url: string; path: string }) => void,
  reject: (reason?: any) => void,
  storagePath: string
) {
  const reader = new FileReader();
  reader.onload = () => {
    const result = reader.result as string;
    resolve({ url: result, path: storagePath });
  };
  reader.onerror = (error) => reject(error);
  reader.readAsDataURL(file);
}
