import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

// Global cache for categories to prevent unnecessary refetches
const categoriesCache = ref([])
const lastFetchTime = ref(0)
const cacheTimeout = 5 * 60 * 1000 // 5 minutes
let fetchPromise = null

export function useCategories() {
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Check if cache is valid
  const isCacheValid = () => {
    return categoriesCache.value.length > 0 && Date.now() - lastFetchTime.value < cacheTimeout
  }

  // Fetch categories with caching
  const fetchCategories = async (forceRefresh = false) => {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && isCacheValid()) {
        return categoriesCache.value
      }

      // If already fetching, return existing promise
      if (fetchPromise) {
        return await fetchPromise
      }

      // Ensure user is authenticated
      if (!authStore.user?.id) {
        console.warn('Cannot fetch categories: user not authenticated')
        return []
      }

      loading.value = true
      error.value = null

      fetchPromise = _performFetch()
      const result = await fetchPromise
      return result
    } catch (err) {
      error.value = err.message
      console.error('Error fetching categories:', err)
      return categoriesCache.value // Return cached data on error
    } finally {
      loading.value = false
      fetchPromise = null
    }
  }

  const _performFetch = async () => {
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', authStore.user.id)
      .order('name')

    if (fetchError) throw fetchError

    // Update cache
    categoriesCache.value = data || []
    lastFetchTime.value = Date.now()

    return categoriesCache.value
  }

  // Get categories from cache or fetch if needed
  const getCategories = () => {
    if (isCacheValid()) {
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

      // Refresh cache
      await fetchCategories(true)
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

      // Update cache locally for immediate UI update
      const categoryIndex = categoriesCache.value.findIndex((cat) => cat.id === id)
      if (categoryIndex !== -1) {
        categoriesCache.value[categoryIndex] = {
          ...categoriesCache.value[categoryIndex],
          ...fields,
        }
      }

      // Background refresh to ensure consistency
      setTimeout(() => fetchCategories(true), 100)
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

      // Remove from cache immediately
      categoriesCache.value = categoriesCache.value.filter((cat) => cat.id !== id)

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
    lastFetchTime.value = 0
    fetchPromise = null
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
    isCacheValid,
  }
}
