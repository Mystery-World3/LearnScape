'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It surfaces errors to the developer in development or logs them in production.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (err: FirestorePermissionError) => {
      // Selalu log ke konsol untuk debugging di browser (F12)
      console.error('Firestore Permission Error:', err.message, err.request);
      setError(err);
    };

    errorEmitter.on('permission-error', handleError);
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // Hanya melempar error ke UI Next.js di lingkungan development
  // Di production, kita biarkan komponen lokal menangani state error-nya sendiri
  // agar tidak terjadi crash aplikasi (White Screen/Client Exception).
  if (error && process.env.NODE_ENV === 'development') {
    throw error;
  }

  return null;
}
