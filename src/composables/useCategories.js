import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Fetch categories
  const fetchCategories = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('name')

      if (fetchError) throw fetchError

      categories.value = data
    } catch (err) {
      error.value = err.message
      console.error('Error fetching categories:', err)
    } finally {
      loading.value = false
    }
  }

  // Get categories by type
  const getCategoriesByType = (type) => {
    return categories.value.filter(cat => cat.type === type)
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoriesByType
  }
}
