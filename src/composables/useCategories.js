import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const categoriesCache = ref([])
const cacheValid = ref(false)
let fetchPromise = null
let realtimeChannel = null
let fetchController = null

export function useCategories() {
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const resetLoadingState = () => {
    if (fetchController) {
      fetchController.abort()
      fetchController = null
    }

    fetchPromise = null
    loading.value = false
    error.value = null
  }

  const fetchCategories = async ({ force = false } = {}) => {
    try {
      if (!force && cacheValid.value && categoriesCache.value.length > 0) {
        return categoriesCache.value
      }

      if (fetchPromise) {
        return await fetchPromise
      }

      if (!authStore.user?.id) {
        return []
      }

      if (fetchController) {
        fetchController.abort()
      }
      fetchController = new AbortController()

      loading.value = true
      error.value = null

      fetchPromise = _performFetch()
      const result = await fetchPromise

      return result
    } catch (err) {
      if (err.name === 'AbortError') {
        return categoriesCache.value
      }

      error.value = err.message
      console.error('Error fetching categories:', err)

      return categoriesCache.value
    } finally {
      loading.value = false
      fetchPromise = null
      fetchController = null
    }
  }

  const _performFetch = async () => {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('name')
      .abortSignal(fetchController?.signal)

    if (fetchError) throw fetchError

    categoriesCache.value = data || []
    cacheValid.value = true

    return categoriesCache.value
  }

  const setupRealtime = () => {
    if (!authStore.user?.id) return

    // Cleanup existing channel first
    if (realtimeChannel) {
      cleanupRealtime()
    }

    realtimeChannel = supabase
      .channel(`categories:${authStore.user.id}`, {
        config: {
          broadcast: { self: false },
          presence: { key: authStore.user.id },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${authStore.user.id}`,
        },
        async () => {
          invalidateCache()
          await fetchCategories({ force: true })
        },
      )
      .subscribe((status) => {
        // Handle reconnection
        if (status === 'CHANNEL_ERROR') {
          console.warn('Categories channel error, attempting reconnect...')
          setTimeout(() => {
            cleanupRealtime()
            setupRealtime()
          }, 2000)
        }
      })
  }

  // Cleanup realtime subscription
  const cleanupRealtime = () => {
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel)
      } catch (err) {
        console.warn('Error removing categories channel:', err)
      }
      realtimeChannel = null
    }
  }

  // Invalidate cache
  const invalidateCache = () => {
    cacheValid.value = false
  }

  // Get categories from cache or fetch if needed
  const getCategories = () => {
    if (cacheValid.value && categoriesCache.value.length > 0) {
      return categoriesCache.value
    }
    // Trigger background fetch but return cached data immediately
    fetchCategories()
    return categoriesCache.value
  }

  // Get categories by type
  const getCategoriesByType = (type) => {
    const categories = getCategories()
    return categories.filter((cat) => cat.type === type)
  }

  // Create category
  const addCategory = async ({ name, type, color = '#6c757d', icon = 'bi-circle' }) => {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const payload = {
        user_id: authStore.user.id,
        name,
        type,
        color,
        icon,
      }

      const { error: insertError } = await supabase.from('categories').insert(payload)
      if (insertError) throw insertError

      // Invalidate and refresh cache
      invalidateCache()
      await fetchCategories({ force: true })
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error adding category:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Update category
  const updateCategory = async (id, { name, color, icon }) => {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const fields = {}
      if (name !== undefined) fields.name = name
      if (color !== undefined) fields.color = color
      if (icon !== undefined) fields.icon = icon

      const { error: updateError } = await supabase
        .from('categories')
        .update(fields)
        .eq('id', id)
        .eq('user_id', authStore.user.id)

      if (updateError) throw updateError

      // Invalidate and refresh cache
      invalidateCache()
      await fetchCategories({ force: true })
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error updating category:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Delete category
  const deleteCategory = async (id) => {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user?.id) {
        throw new Error('User not authenticated')
      }

      const { error: delError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id)

      if (delError) throw delError

      // Optimistic update + invalidate cache
      categoriesCache.value = categoriesCache.value.filter((cat) => cat.id !== id)
      invalidateCache()

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting category:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Clear cache (useful for logout)
  const clearCache = () => {
    categoriesCache.value = []
    cacheValid.value = false
    fetchPromise = null
    cleanupRealtime()
  }

  return {
    categories: categoriesCache,
    loading,
    error,
    fetchCategories,
    getCategories,
    getCategoriesByType,
    addCategory,
    updateCategory,
    deleteCategory,
    clearCache,
    invalidateCache,
    setupRealtime,
    cleanupRealtime,
    resetLoadingState,
  }
}
