export function showToast(
  message: string,
  type: "success" | "error" | "info" = "info"
) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  const bgColor =
    type === "success"
      ? "#10b981"
      : type === "error"
        ? "#ef4444"
        : "#3b82f6";
  const bgLightColor =
    type === "success"
      ? "#ecfdf5"
      : type === "error"
        ? "#fef2f2"
        : "#eff6ff";

  toast.style.cssText = `
    background-color: ${bgLightColor};
    color: ${bgColor};
    padding: 12px 16px;
    border-radius: 6px;
    border: 1px solid ${bgColor};
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Add animation
  const style = document.createElement("style");
  if (!document.getElementById("toast-animation")) {
    style.id = "toast-animation";
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Auto-remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      toast.remove();
      if (toastContainer?.children.length === 0) {
        toastContainer?.remove();
      }
    }, 300);
  }, 4000);
}
