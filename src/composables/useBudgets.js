import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useBudgets() {
  const budgets = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Fetch budgets from database
  const fetchBudgets = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (
            name,
            color,
            icon
          )
        `)
        .eq('user_id', authStore.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Calculate spent amount for each budget
      const budgetsWithSpent = await Promise.all(
        data.map(async (budget) => {
          const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', authStore.user.id)
            .eq('category_id', budget.category_id)
            .eq('type', 'expense')
            .gte('date', budget.start_date)
            .lte('date', budget.end_date)

          if (transError) throw transError

          const spent = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
          const percentage = Math.round((spent / budget.amount) * 100)
          const remaining = budget.amount - spent
          const daysLeft = Math.ceil((new Date(budget.end_date) - new Date()) / (1000 * 60 * 60 * 24))

          return {
            ...budget,
            category: budget.categories?.name || 'Unknown',
            icon: budget.categories?.icon || 'bi-circle',
            color: budget.categories?.color || '#6c757d',
            spent,
            percentage,
            remaining,
            daysLeft: Math.max(0, daysLeft),
            limit: budget.amount // alias for compatibility
          }
        })
      )

      budgets.value = budgetsWithSpent

    } catch (err) {
      error.value = err.message
      console.error('Error fetching budgets:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new budget
  const addBudget = async (budgetData) => {
    try {
      loading.value = true
      error.value = null

      // Get category_id
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', authStore.user.id)
        .eq('name', budgetData.category)
        .eq('type', 'expense')
        .single()

      if (!category) {
        throw new Error('Category not found')
      }

      // Calculate end date based on period
      const startDate = new Date(budgetData.startDate)
      const endDate = new Date(startDate)
      
      switch (budgetData.period) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }

      const { data, error: insertError } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: authStore.user.id,
            category_id: category.id,
            name: budgetData.category,
            amount: budgetData.limit,
            period: budgetData.period,
            start_date: budgetData.startDate,
            end_date: endDate.toISOString().split('T')[0],
            is_active: true
          }
        ])
        .select()

      if (insertError) throw insertError

      // Refresh budgets
      await fetchBudgets()
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error adding budget:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update budget
  const updateBudget = async (id, budgetData) => {
    try {
      loading.value = true
      error.value = null

      // Get category_id
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', authStore.user.id)
        .eq('name', budgetData.category)
        .eq('type', 'expense')
        .single()

      if (!category) {
        throw new Error('Category not found')
      }

      // Calculate end date
      const startDate = new Date(budgetData.startDate)
      const endDate = new Date(startDate)
      
      switch (budgetData.period) {
        case 'weekly':
          endDate.setDate(endDate.getDate() + 7)
          break
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1)
          break
        case 'yearly':
          endDate.setFullYear(endDate.getFullYear() + 1)
          break
      }

      const { data, error: updateError } = await supabase
        .from('budgets')
        .update({
          category_id: category.id,
          name: budgetData.category,
          amount: budgetData.limit,
          period: budgetData.period,
          start_date: budgetData.startDate,
          end_date: endDate.toISOString().split('T')[0]
        })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()

      if (updateError) throw updateError

      // Refresh budgets
      await fetchBudgets()
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error updating budget:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete budget
  const deleteBudget = async (id) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id)

      if (deleteError) throw deleteError

      // Remove from local state
      budgets.value = budgets.value.filter(b => b.id !== id)
      
    } catch (err) {
      error.value = err.message
      console.error('Error deleting budget:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const budgetSummary = computed(() => {
    const totalBudget = budgets.value.reduce((sum, b) => sum + parseFloat(b.amount), 0)
    const totalSpent = budgets.value.reduce((sum, b) => sum + b.spent, 0)
    const remaining = totalBudget - totalSpent
    const usageRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

    return {
      totalBudget,
      totalSpent,
      remaining,
      usageRate
    }
  })

  return {
    budgets,
    loading,
    error,
    budgetSummary,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget
  }
}
