import { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", durationMs = 10000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (durationMs > 0) {
      setTimeout(() => {
        removeToast(id);
      }, durationMs);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-DEFAULT border-2 border-primary shadow-[4px_4px_0px_#000000] text-body-sm font-bold animate-fade-in ${
              toast.type === "error"
                ? "bg-error-container text-on-error-container"
                : toast.type === "success"
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-surface-container-lowest text-on-surface"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] shrink-0">
                {toast.type === "error"
                  ? "error"
                  : toast.type === "success"
                  ? "check_circle"
                  : "info"}
              </span>
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-current hover:opacity-70 transition-opacity p-0.5 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
