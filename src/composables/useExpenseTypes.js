import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export function useExpenseTypes() {
  const expenseTypes = ref([])
  const expenseItems = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Get current user from Supabase auth
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Fetch expense types
  const fetchExpenseTypes = async () => {
    try {
      loading.value = true
      error.value = null

      const user = await getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('expense_types')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (fetchError) throw fetchError

      expenseTypes.value = data || []
    } catch (err) {
      console.error('Error fetching expense types:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Fetch expense items
  const fetchExpenseItems = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: fetchError } = await supabase
        .from('expense_items')
        .select(`
          *,
          expense_types (
            id,
            name,
            color,
            icon,
            user_id
          )
        `)
        .order('name')

      if (fetchError) throw fetchError

      expenseItems.value = data || []
    } catch (err) {
      console.error('Error fetching expense items:', err)
      error.value = err.message
    }
  }

  // Add new expense type
  const addExpenseType = async (typeData) => {
    try {
      loading.value = true
      error.value = null

      const user = await getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: insertError } = await supabase
        .from('expense_types')
        .insert([{
          user_id: user.id,
          name: typeData.name,
          color: typeData.color || '#6c757d',
          icon: typeData.icon || 'bi-circle'
        }])
        .select()

      if (insertError) throw insertError

      expenseTypes.value.push(data[0])
      return data[0]
    } catch (err) {
      console.error('Error adding expense type:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update expense type
  const updateExpenseType = async (typeId, typeData) => {
    try {
      loading.value = true
      error.value = null

      const user = await getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: updateError } = await supabase
        .from('expense_types')
        .update({
          name: typeData.name,
          color: typeData.color,
          icon: typeData.icon
        })
        .eq('id', typeId)
        .eq('user_id', user.id)
        .select()

      if (updateError) throw updateError

      const index = expenseTypes.value.findIndex(t => t.id === typeId)
      if (index !== -1) {
        expenseTypes.value[index] = data[0]
      }

      return data[0]
    } catch (err) {
      console.error('Error updating expense type:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete expense type
  const deleteExpenseType = async (typeId) => {
    try {
      loading.value = true
      error.value = null

      const user = await getCurrentUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error: deleteError } = await supabase
        .from('expense_types')
        .delete()
        .eq('id', typeId)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      expenseTypes.value = expenseTypes.value.filter(t => t.id !== typeId)
      // Also remove related items
      expenseItems.value = expenseItems.value.filter(i => i.expense_type_id !== typeId)
    } catch (err) {
      console.error('Error deleting expense type:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add new expense item
  const addExpenseItem = async (itemData) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('expense_items')
        .insert([{
          expense_type_id: itemData.expense_type_id,
          name: itemData.name
        }])
        .select(`
          *,
          expense_types (
            id,
            name,
            color,
            icon,
            user_id
          )
        `)

      if (insertError) throw insertError      
      expenseItems.value.push(data[0])
        return data[0]
      } catch (err) {
        console.error('Error adding expense item:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }
  
    // Update expense item
    const updateExpenseItem = async (itemId, itemData) => {
      try {
        loading.value = true
        error.value = null
  
        const { data, error: updateError } = await supabase
          .from('expense_items')
          .update({
            name: itemData.name
          })
          .eq('id', itemId)
          .select(`
            *,
            expense_types (
              id,
              name,
              color,
              icon,
              user_id
            )
          `)
  
        if (updateError) throw updateError
  
        const index = expenseItems.value.findIndex(i => i.id === itemId)
        if (index !== -1) {
          expenseItems.value[index] = data[0]
        }
  
        return data[0]
      } catch (err) {
        console.error('Error updating expense item:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }
  
    // Delete expense item
    const deleteExpenseItem = async (itemId) => {
      try {
        loading.value = true
        error.value = null
  
        const { error: deleteError } = await supabase
          .from('expense_items')
          .delete()
          .eq('id', itemId)
  
        if (deleteError) throw deleteError
  
        expenseItems.value = expenseItems.value.filter(i => i.id !== itemId)
      } catch (err) {
        console.error('Error deleting expense item:', err)
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }
  
    // Get items by expense type
    const getItemsByType = (typeId) => {
      return expenseItems.value.filter(item => item.expense_type_id === typeId)
    }
  
    // Computed properties
    const expenseTypesWithItems = computed(() => {
      return expenseTypes.value.map(type => ({
        ...type,
        items: getItemsByType(type.id)
      }))
    })
  
    return {
      expenseTypes,
      expenseItems,
      loading,
      error,
      expenseTypesWithItems,
      fetchExpenseTypes,
      fetchExpenseItems,
      addExpenseType,
      updateExpenseType,
      deleteExpenseType,
      addExpenseItem,
      updateExpenseItem,
      deleteExpenseItem,
      getItemsByType
    }
  }
  
