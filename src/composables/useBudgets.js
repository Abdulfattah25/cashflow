import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const budgetsCache = ref([])
const cacheValid = ref(false)
let fetchPromise = null
let fetchController = null

export function useBudgets() {
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const budgets = computed(() => budgetsCache.value)

  const resetLoadingState = () => {
    if (fetchController) {
      fetchController.abort()
      fetchController = null
    }
    loading.value = false
    error.value = null
  }

  const fetchBudgets = async ({ force = false } = {}) => {
    try {
      if (!force && cacheValid.value && budgetsCache.value.length > 0) {
        return budgetsCache.value
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
        return budgetsCache.value
      }
      error.value = err.message
      console.error('Error fetching budgets:', err)
      return budgetsCache.value
    } finally {
      loading.value = false
      fetchController = null
      fetchPromise = null
    }
  }

  const _performFetch = async () => {
    const { data, error: fetchError } = await supabase
      .from('budgets')
      .select(
        `
          *,
          categories (
            name,
            color,
            icon
          )
        `,
      )
      .eq('user_id', authStore.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .abortSignal(fetchController?.signal)

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
          limit: budget.amount,
        }
      }),
    )

    budgetsCache.value = budgetsWithSpent
    cacheValid.value = true
    return budgetsCache.value
  }

  // ✅ NEW: Get budgets from cache instantly
  const getBudgets = () => {
    if (cacheValid.value && budgetsCache.value.length > 0) {
      return budgetsCache.value
    }
    fetchBudgets() // Background refresh
    return budgetsCache.value
  }

  // Invalidate cache
  const invalidateCache = () => {
    cacheValid.value = false
  }

  // Clear cache
  const clearCache = () => {
    budgetsCache.value = []
    cacheValid.value = false
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
            is_active: true,
          },
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
          end_date: endDate.toISOString().split('T')[0],
        })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()

      if (updateError) throw updateError

      // Invalidate cache and refresh budgets
      invalidateCache()
      await fetchBudgets({ force: true })

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

      // Remove from cache immediately (optimistic update)
      budgetsCache.value = budgetsCache.value.filter((b) => b.id !== id)
      invalidateCache()
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
    const totalBudget = budgetsCache.value.reduce((sum, b) => sum + parseFloat(b.amount), 0)
    const totalSpent = budgetsCache.value.reduce((sum, b) => sum + b.spent, 0)
    const remaining = totalBudget - totalSpent
    const usageRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

    return {
      totalBudget,
      totalSpent,
      remaining,
      usageRate,
    }
  })

  const exceededBudgets = computed(() => {
    return budgetsCache.value.filter((budget) => budget.percentage >= 100)
  })

  return {
    budgets,
    loading,
    error,
    budgetSummary,
    exceededBudgets,
    fetchBudgets,
    getBudgets, // ✅ NEW: Instant cache access
    addBudget,
    updateBudget,
    deleteBudget,
    invalidateCache,
    clearCache,
    resetLoadingState,
  }
}
