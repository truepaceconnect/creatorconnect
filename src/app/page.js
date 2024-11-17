'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import RegisterForm from './(auth)/register/page'
import LoginForm from './(auth)/login/page'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'Login to Creator Studio' : 'Register as Content Creator'}
        </h1>
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-sm text-gray-600 hover:text-gray-800 mt-4"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </main>
  )
}