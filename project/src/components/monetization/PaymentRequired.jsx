import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../utils/apiConfig'
import { logout } from '../../utils/auth'

function PaymentRequired() {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [appId, setAppId] = useState(null)

  useEffect(() => {
    const fetchAppIdAndPrices = async () => {
      try {
        // First, fetch the appId from manifest.config.json
        const manifestResponse = await fetch('/manifest.config.json')
        const manifestData = await manifestResponse.json()
        const fetchedAppId = manifestData.appId
        
        if (!fetchedAppId) {
          throw new Error('App ID not found in manifest.config.json')
        }
        
        setAppId(fetchedAppId)
        
        // Then fetch prices using the appId
        const response = await fetch(`${API_BASE_URL}/apps/${fetchedAppId}/stripe/prices`)
        
        if (response.ok) {
          const result = await response.json()
          setPrices(result)
        } else {
          setError('Failed to load pricing options')
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAppIdAndPrices()
  }, [])

  const handleSelectPrice = (price) => {
    if (!appId) {
      setError('App ID not available')
      return
    }
    const checkoutUrl = `${API_BASE_URL}/apps/${appId}/stripe/checkout/prices/${price.id}`
    window.location.href = checkoutUrl
  }

  const formatPrice = (unitAmount, currency = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(unitAmount / 100)
  }

  const getRecurrencyText = (price) => {
    if (price.type === 'one_time') return 'One-time payment'
    if (price.recurring) {
      const { interval, interval_count } = price.recurring
      if (interval_count === 1) {
        return `Per ${interval}`
      }
      return `Every ${interval_count} ${interval}${interval_count > 1 ? 's' : ''}`
    }
    return 'One-time payment'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="p-12 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full h-12 px-6 text-base font-medium bg-indigo-600 hover:bg-indigo-700 rounded-md text-white flex items-center justify-center transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If only one price, show a simple card
  if (prices.length === 1) {
    const price = prices[0]
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md">
          <div className="text-center">
            {/* Colored circle with emoji */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">💎</span>
            </div>
            
            {/* Premium access text */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{price.nickname || 'Plan'}</h1>
            <p className="text-gray-600 mb-4">Unlock all features</p>
            
            {/* Price */}
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {formatPrice(price.unit_amount, price.currency)}
            </div>
            <p className="text-sm text-gray-500 mb-8">
              {getRecurrencyText(price)}
            </p>
            
            {/* Get access button */}
            <button 
              onClick={() => handleSelectPrice(price)}
              className="w-full h-12 px-6 text-base font-medium bg-indigo-600 hover:bg-indigo-700 rounded-md text-white flex items-center justify-center transition-all duration-200 mb-4"
            >
              Get Access
            </button>
            
            {/* Back link */}
            <button
              onClick={logout}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Multiple prices - show grid
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include full access to premium features.
          </p>
        </div>

        {/* Price Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {prices.map((price) => (
            <div
              key={price.id}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {/* Plan Name */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {price.nickname || 'Plan'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {getRecurrencyText(price)}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {formatPrice(price.unit_amount, price.currency)}
                </div>
                {price.recurring && (
                  <div className="text-gray-500 text-sm">
                    per {price.recurring.interval}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-8">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Full access to all features
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {price.type === 'one_time' ? 'Lifetime access' : 'Cancel anytime'}
                  </li>
                </ul>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleSelectPrice(price)}
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium text-white transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 pb-12">
          <p className="text-gray-600 text-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure payment processing • Your data is protected
          </p>
          <p className="text-gray-500 text-xs max-w-md mx-auto">
            By proceeding, you agree to our terms of service and privacy policy. All payments are processed securely through Stripe.
          </p>
          <button
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← back
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentRequired