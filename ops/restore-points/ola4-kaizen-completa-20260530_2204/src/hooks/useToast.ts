import { useState, useCallback } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState("");
  const [showStatusToast, setShowStatusToast] = useState(false);

  const showToast = useCallback((message: string, duration = 3000) => {
    setToastMessage(message);
    setShowStatusToast(true);
    setTimeout(() => setShowStatusToast(false), duration);
  }, []);

  return { toastMessage, showStatusToast, showToast };
}
