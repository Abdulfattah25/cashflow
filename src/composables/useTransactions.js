import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const transactionsCache = ref([])
const cacheValid = ref(false)
let realtimeChannel = null
let fetchController = null
let fetchPromise = null

export function useTransactions() {
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  const resetLoadingState = () => {
    if (fetchController) {
      fetchController.abort()
      fetchController = null
    }
    loading.value = false
    error.value = null
  }

  const fetchTransactions = async ({ force = false } = {}) => {
    if (!force && cacheValid.value && transactionsCache.value.length > 0) {
      return transactionsCache.value
    }

    if (fetchPromise) {
      return await fetchPromise
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
  }

  const _performFetch = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('transactions')
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
        .order('date', { ascending: false })
        .abortSignal(fetchController?.signal)

      if (fetchError) throw fetchError

      transactionsCache.value = data.map((transaction) => ({
        ...transaction,
        category: transaction.categories?.name || 'Unknown',
        color: transaction.categories?.color || '#6c757d',
        icon: transaction.categories?.icon || 'bi-circle',
      }))

      cacheValid.value = true
      return transactionsCache.value
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return transactionsCache.value
      }

      error.value = err.message
      console.error('Error fetching transactions:', err)

      return transactionsCache.value
    } finally {
      loading.value = false
      fetchController = null
      fetchPromise = null
    }
  }

  const getTransactions = () => {
    if (cacheValid.value && transactionsCache.value.length > 0) {
      return transactionsCache.value
    }
    fetchTransactions()
    fetchTransactions()
    return transactionsCache.value
  }

  const transactions = computed(() => transactionsCache.value)

  const setupRealtime = () => {
    if (!authStore.user?.id) return

    // Cleanup existing channel first
    if (realtimeChannel) {
      cleanupRealtime()
    }

    realtimeChannel = supabase
      .channel(`transactions:${authStore.user.id}`, {
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
          table: 'transactions',
          filter: `user_id=eq.${authStore.user.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            invalidateCache()
            await fetchTransactions({ force: true })
          } else if (payload.eventType === 'DELETE') {
            // Optimistic update: remove from cache immediately
            transactionsCache.value = transactionsCache.value.filter((t) => t.id !== payload.old.id)
            invalidateCache()
          }
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel error, attempting reconnect...')
          setTimeout(() => {
            cleanupRealtime()
            setupRealtime()
          }, 2000)
        }
      })
  }

  const cleanupRealtime = () => {
    if (realtimeChannel) {
      try {
        supabase.removeChannel(realtimeChannel)
      } catch (err) {
        console.warn('Error removing channel:', err)
      }
      realtimeChannel = null
    }
  }

  const invalidateCache = () => {
    cacheValid.value = false
  }

  const clearCache = () => {
    transactionsCache.value = []
    cacheValid.value = false
    cleanupRealtime()
  }

  const addTransaction = async (transactionData) => {
    try {
      loading.value = true
      error.value = null

      // First, get category_id
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', authStore.user.id)
        .eq('name', transactionData.category)
        .eq('type', transactionData.type)
        .single()

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: authStore.user.id,
            category_id: category?.id,
            amount: transactionData.amount,
            description: transactionData.description,
            notes: transactionData.notes,
            type: transactionData.type,
            date: transactionData.date,
          },
        ])
        .select()

      if (insertError) throw insertError

      // Invalidate cache and refresh
      invalidateCache()
      await fetchTransactions({ force: true })

      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error adding transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    try {
      loading.value = true
      error.value = null

      // Get category_id
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', authStore.user.id)
        .eq('name', transactionData.category)
        .eq('type', transactionData.type)
        .single()

      const { data, error: updateError } = await supabase
        .from('transactions')
        .update({
          category_id: category?.id,
          amount: transactionData.amount,
          description: transactionData.description,
          notes: transactionData.notes,
          type: transactionData.type,
          date: transactionData.date,
        })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()

      if (updateError) throw updateError

      // Invalidate cache and refresh
      invalidateCache()
      await fetchTransactions({ force: true })

      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error updating transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id)

      if (deleteError) throw deleteError

      // Optimistic update: remove from cache immediately
      transactionsCache.value = transactionsCache.value.filter((t) => t.id !== id)
      invalidateCache()

      return true
    } catch (err) {
      error.value = err.message
      console.error('Error deleting transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const summary = computed(() => {
    const totalIncome = transactionsCache.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = transactionsCache.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
    }
  })

  const recentTransactions = computed(() => {
    return transactionsCache.value.slice(0, 5)
  })

  return {
    transactions,
    loading,
    error,
    summary,
    recentTransactions,
    fetchTransactions,
    getTransactions, // ✅ NEW: Instant cache access
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearCache,
    invalidateCache,
    setupRealtime,
    cleanupRealtime,
    resetLoadingState,
  }
}
