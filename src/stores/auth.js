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

  // Initialize auth state
  const initAuth = async () => {
    // Prevent duplicate initialization
    if (initialized.value) return

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
    } catch (err) {
      error.value = err.message
      console.error('Auth initialization error:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch user profile data
  const fetchUserProfile = async (authUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) throw profileError

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
      user.value = null
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
    fetchUserProfile,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }
})
