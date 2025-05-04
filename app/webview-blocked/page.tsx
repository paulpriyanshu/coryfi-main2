// app/webview-blocked/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function WebViewBlocked() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [isInstagramWebView, setIsInstagramWebView] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);

      const ua = navigator.userAgent || "";
      if (ua.includes("Instagram")) {
        setIsInstagramWebView(true);
      }
    }
  }, []);

  const openInBrowser = () => {
    if (typeof window !== "undefined") {
      window.open(currentUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-4 text-red-600">WebView Login Not Supported</h1>
      <p className="mb-4">
        For your security, login and signup are not supported inside in-app browsers or WebViews.
      </p>
      <p className="mb-6">
        Please open this link in your default browser (like Safari or Chrome).
      </p>

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={openInBrowser}
      >
        Open in Browser
      </button>

      {isInstagramWebView && (
        <div className="absolute top-4 right-4 flex flex-col items-end text-sm text-gray-700 animate-bounce">
          <div className="mb-1">Tap here</div>
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="mt-1">Then choose "Open in Browser"</div>
        </div>
      )}
    </div>
  );
}