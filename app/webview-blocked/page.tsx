// app/webview-blocked/page.tsx
export default function WebViewBlocked() {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">WebView Login Not Supported</h1>
        <p className="mb-4">
          For your security, login and signup are not supported inside in-app browsers or WebViews.
        </p>
        <p className="mb-6">
          Please open this link in your default browser (like Safari or Chrome).
        </p>
        {/* <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.open(window.location.href, '_blank');
            }
          }}
        >
          Open in Browser
        </button> */}
      </div>
    );
  }