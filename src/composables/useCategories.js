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
    return categories.value.filter((cat) => cat.type === type)
  }

  // Create category
  const addCategory = async ({ name, type, color = '#6c757d', icon = 'bi-circle' }) => {
    try {
      loading.value = true
      error.value = null
      const payload = {
        user_id: authStore.user.id,
        name,
        type,
        color,
        icon,
      }
      const { error: insertError } = await supabase.from('categories').insert(payload)
      if (insertError) throw insertError
      await fetchCategories()
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
      await fetchCategories()
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
      const { error: delError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id)
      if (delError) throw delError
      await fetchCategories()
      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting category:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    getCategoriesByType,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
