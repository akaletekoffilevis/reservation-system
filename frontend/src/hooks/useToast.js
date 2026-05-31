import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ message: null, type: 'info' });

  return {
    message: toast.message,
    type: toast.type,
    success: (msg) => setToast({ message: msg, type: 'success' }),
    error: (msg) => setToast({ message: msg, type: 'error' }),
    info: (msg) => setToast({ message: msg, type: 'info' }),
    clear: () => setToast({ message: null, type: 'info' }),
  };
}
