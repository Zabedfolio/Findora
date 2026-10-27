import toast from "react-hot-toast";

// Extend react-hot-toast with info and warning helper methods
if (typeof toast === "function" || typeof toast === "object") {
  if (!toast.info) {
    toast.info = (message, opts = {}) => {
      return toast(message, {
        icon: "ℹ️",
        style: {
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid rgba(59, 130, 246, 0.4)",
          ...opts.style,
        },
        ...opts,
      });
    };
  }

  if (!toast.warning) {
    toast.warning = (message, opts = {}) => {
      return toast(message, {
        icon: "⚠️",
        style: {
          background: "#0f172a",
          color: "#f8fafc",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          ...opts.style,
        },
        ...opts,
      });
    };
  }

  if (!toast.warn) {
    toast.warn = toast.warning;
  }
}

export { toast };
export default toast;

