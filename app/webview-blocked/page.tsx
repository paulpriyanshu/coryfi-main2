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

      {/* <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={openInBrowser}
      >
        Open in Browser
      </button> */}

      {isInstagramWebView && (
        <div className="absolute top-4 right-1 flex flex-col items-center text-sm text-gray-700">
          <div className="mb-1 font-bold text-lg">⋯</div>
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              className="animate-bounce"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19V6"
            />
          </svg>
          <div className="mt-1 w-32 text-center">Tap the menu above, then choose “Open in Browser”</div>
        </div>
      )}
    </div>
  );
}