import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  // Track if auth has been initialized to prevent duplicate calls
  const initialized = ref(false)
  const initPromise = ref(null)

  // Initialize auth state
  const initAuth = async () => {
    // Prevent duplicate initialization
    if (initialized.value) return user.value

    // If already initializing, return existing promise
    if (initPromise.value) return initPromise.value

    initPromise.value = _performInit()
    return initPromise.value
  }

  const _performInit = async () => {
    loading.value = true
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        user.value = null
      }

      initialized.value = true
      return user.value
    } catch (err) {
      error.value = err.message
      console.error('Auth initialization error:', err)
      initialized.value = true // Mark as initialized even on error
      return null
    } finally {
      loading.value = false
      initPromise.value = null // Clear promise
    }
  }

  // Reset initialization state (for logout)
  const resetAuth = () => {
    initialized.value = false
    initPromise.value = null
    user.value = null
    error.value = null
  }

  // Fetch user profile data
  const fetchUserProfile = async (authUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        throw profileError
      }

      user.value = {
        ...authUser,
        ...profile,
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      user.value = authUser
    }
  }

  // Sign up
  const signUp = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) throw signUpError
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign in
  const signIn = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    loading.value = true
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      resetAuth()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Update Profile - METHOD BARU
  const updateProfile = async (updates) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: updates,
      })

      if (updateError) throw updateError

      // Update local user state
      user.value = data.user

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialized,
    initAuth,
    resetAuth,
    fetchUserProfile,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
})
