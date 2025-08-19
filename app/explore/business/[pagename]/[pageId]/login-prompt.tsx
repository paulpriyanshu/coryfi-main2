"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export function LoginPrompt() {
  const [webViewDetected, setWebViewDetected] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || window.location.pathname

  // Detect WebView on client side
  useEffect(() => {
    const ua = navigator.userAgent || ""
    const isWebView =
      /\bwv\b/.test(ua) || // Android WebView
      /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/.test(ua) || // iOS WebView
      (!/Chrome|Safari/.test(ua) && /AppleWebKit/.test(ua)) || // Generic fallback
      /instagram|fbav|line|linkedin|Snapchat|medial/.test(ua.toLowerCase()) // In-app browsers

    if (isWebView) setWebViewDetected(true)
  }, [])

  const handleSignin = async () => {
    if (!webViewDetected) {
      console.log("redirecting url", callbackUrl)
      await signIn("google", { callbackUrl })
    }
  }

  // Show this message if WebView is detected
  if (webViewDetected) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md px-4">
        <div className="text-center p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">WebView Not Supported</h2>
          <p className="text-gray-700">
            Please open this page in your browser (e.g. Chrome or Safari) to sign up or log in.
          </p>
        </div>
      </div>
    )
  }

  // Normal Login UI
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-md px-4">
      <div className="w-full p-6 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">Sign In to Continue</h2>
          {/* <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <a href="/signup" className="font-medium text-blue-600 hover:underline">
              create a new account
            </a>
          </p> */}
        </div>

        {/* Google Sign-In Button */}
       <div className="mt-8">
            <button
              onClick={handleSignin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 
                        bg-white dark:bg-gray-800 
                        border border-gray-300 dark:border-gray-700 
                        rounded-lg shadow-sm 
                        text-gray-800 dark:text-gray-200
                        hover:bg-gray-50 dark:hover:bg-gray-700 
                        transition duration-300"
            >
              <svg 
                className="w-5 h-5" 
                aria-hidden="true" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span className="ml-2 text-sm font-medium">Sign in with Google</span>
            </button>
          </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
