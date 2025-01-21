'use client'
import { useState } from 'react';
import { auth } from '../firebase/ClientApp';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setStatus({
        type: 'success',
        message: 'Password reset link has been sent to your email.'
      });
      setEmail('');
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
      }
      
      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          {/* Replace with your app's logo */}
          <div className="mx-auto h-12 w-12 relative mb-4">
            <Image
              src="/TruePace.svg" // Replace with your logo path
              alt="TruePace"
              layout="fill"
              objectFit="contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {status.message && (
            <div
              className={`p-4 text-sm rounded-md ${
                status.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-600'
                  : 'bg-red-50 border border-red-200 text-red-500'
              }`}
            >
              <p className="flex items-center justify-center">
                {status.message}
              </p>
            </div>
          )}
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-2 border-gray-300 px-3 py-2 shadow-sm 
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                  transition-colors duration-200"
                required
                placeholder="Enter your email address"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-200"></div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors duration-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>

            <Link
              href="/"
              className="w-full text-center py-2.5 px-4 rounded-md border-2 border-gray-300 
                text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
                focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Back to SignIn
            </Link>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}