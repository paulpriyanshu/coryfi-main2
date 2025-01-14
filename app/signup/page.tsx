'use client'
import React from 'react'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
  const handleSignin = async () => {
    await signIn("google")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <a
              href="#"
              className="font-medium text-blue-600 hover:underline"
              onClick={handleSignin}
            >
              sign in to your existing account
            </a>
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="mt-8">
          <button
            onClick={handleSignin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition duration-300"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span className="ml-2 text-sm font-medium text-gray-800">Sign up with Google</span>
          </button>
        </div>
      </div>
    </div>
  )
}