import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple toast notification
export function showToast(message: string, type: "success" | "error" | "info" = "success") {
  const existing = document.getElementById("policylens-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "policylens-toast";
  toast.className = `toast-enter fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm shadow-lg backdrop-blur-lg border ${
    type === "success"
      ? "bg-green-500/10 border-green-500/20 text-green-400"
      : type === "error"
      ? "bg-red-500/10 border-red-500/20 text-red-400"
      : "bg-blue-500/10 border-blue-500/20 text-blue-400"
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.className = "toast-exit";
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}
