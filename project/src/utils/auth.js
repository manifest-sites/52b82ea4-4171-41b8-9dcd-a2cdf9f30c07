import { API_BASE_URL } from '../../utils/apiConfig'
import manifestConfig from '../../manifest.config.json'

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/apps/${manifestConfig.appId}/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.ok) {
      // Optionally reload the page to reset the app state
      window.location.reload()
    } else {
      console.error('Logout failed:', response.status)
    }
  } catch (error) {
    console.error('Error during logout:', error)
  }
}