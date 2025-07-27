import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

const user = ref(null)
const loading = ref(false)
const error = ref(null)

export function useAuth() {
  // Get current user
  const getCurrentUser = async () => {
    try {
      loading.value = true
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      
      user.value = currentUser
      return currentUser
    } catch (err) {
      console.error('Error getting current user:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  // Listen to auth changes
  const initAuth = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
    })
  }

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    loading,
    error,
    isAuthenticated,
    getCurrentUser,
    initAuth
  }
}
