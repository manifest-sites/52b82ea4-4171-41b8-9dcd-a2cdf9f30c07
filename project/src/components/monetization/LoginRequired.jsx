import { useState, useEffect } from 'react'
import manifestConfig from '../../../manifest.config.json'
import { API_BASE_URL } from '../../../utils/apiConfig'

function LoginRequired() {
    const openGoogleLoginInPopup = window.location.href.includes('dev.madewithmanifest.com')

    const handleGoogleLogin = () => {
        if (openGoogleLoginInPopup) {
            // Create the callback URL - use current URL structure to maintain path when in iframe
            const currentUrl = window.location.href
            const callbackUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1) + 'auth-callback.html'
            const authUrl = `${API_BASE_URL}/auth/google?appId=${manifestConfig.appId}&redirectUrl=${encodeURIComponent(callbackUrl)}`
            
            const popup = window.open(
                authUrl,
                'googleLogin',
                'width=500,height=600,scrollbars=yes,resizable=yes,top=' + (window.screenY + 100) + ',left=' + (window.screenX + 100)
            )
            
            // Listen for messages from popup
            const handleMessage = (event) => {
                console.log('Received message:', event.data)
                if (event.origin !== window.location.origin) return
                
                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    console.log('Auth success - reloading page')
                    // Authentication successful, clean up and reload
                    popup.close()
                    window.removeEventListener('message', handleMessage)
                    clearInterval(checkClosed)
                    // Small delay to ensure popup is closed before reload
                    setTimeout(() => {
                        window.location.reload()
                    }, 100)
                } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                    console.log('Auth error')
                    // Handle authentication error
                    popup.close()
                    window.removeEventListener('message', handleMessage)
                    clearInterval(checkClosed)
                }
            }
            
            window.addEventListener('message', handleMessage)
            
            // Fallback: if popup is closed manually, check auth status and clean up
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    console.log('Popup closed - checking auth status')
                    clearInterval(checkClosed)
                    window.removeEventListener('message', handleMessage)
                    // Check if auth succeeded even if we didn't get the message
                    setTimeout(() => {
                        console.log('Reloading page after popup close')
                        window.location.reload()
                    }, 1000)
                }
            }, 1000)
        } else {
            const currentUrl = encodeURIComponent(window.location.href)
            window.location.href = `${API_BASE_URL}/auth/google?appId=${manifestConfig.appId}&redirectUrl=${currentUrl}`
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center md:p-4">
            <div className="bg-white md:rounded-2xl md:shadow-2xl p-12 w-full md:w-96 md:h-96 min-h-screen md:min-h-0 flex items-center justify-center">
                <div className="text-center">
                    {/* Colored circle with emoji */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">👋</span>
                    </div>
                    
                    {/* Welcome text */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h1>
                    <p className="text-gray-600 mb-8">Log in to get started</p>
                    
                    {/* Official Google login button */}
                    <button 
                        className="w-full h-12 px-6 text-base font-medium bg-white hover:bg-gray-50 border border-gray-300 hover:border-black rounded-md text-gray-700 hover:text-black flex items-center justify-center gap-3 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer"
                        onClick={handleGoogleLogin}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Login with Google
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LoginRequired