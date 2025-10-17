import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useTransactions() {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Cache management
  const cacheValid = ref(false)
  let realtimeChannel = null
  let fetchController = null
  let safetyTimeout = null

  // Reset loading state (untuk navigation cleanup)
  const resetLoadingState = () => {
    // IMPORTANT: Clear safety timeout FIRST!
    if (safetyTimeout) {
      clearTimeout(safetyTimeout)
      safetyTimeout = null
    }

    // Then cancel any ongoing fetch
    if (fetchController) {
      fetchController.abort()
      fetchController = null
    }

    // Reset loading state
    loading.value = false
    error.value = null
  }

  // Fetch transactions from database
  const fetchTransactions = async ({ force = false } = {}) => {
    // Use cache if valid and not forced
    if (!force && cacheValid.value && transactions.value.length > 0) {
      return
    }

    // Cancel previous fetch if still running
    if (fetchController) {
      fetchController.abort()
    }

    // Clear any existing safety timeout BEFORE creating new one
    if (safetyTimeout) {
      clearTimeout(safetyTimeout)
      safetyTimeout = null
    }

    fetchController = new AbortController()

    try {
      loading.value = true
      error.value = null

      // Safety timeout: force reset loading after 10s
      safetyTimeout = setTimeout(() => {
        console.warn('Safety timeout: force reset loading state')
        loading.value = false
        fetchController = null
        safetyTimeout = null // Clear reference
      }, 10000)

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
        .abortSignal(fetchController.signal)

      if (fetchError) throw fetchError

      transactions.value = data.map((transaction) => ({
        ...transaction,
        category: transaction.categories?.name || 'Unknown',
        color: transaction.categories?.color || '#6c757d',
        icon: transaction.categories?.icon || 'bi-circle',
      }))

      cacheValid.value = true
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        console.log('Fetch aborted (navigation or new request)')
        return
      }

      error.value = err.message
      console.error('Error fetching transactions:', err)

      // Keep cache valid if we have data (fallback to stale data)
      if (transactions.value.length > 0) {
        cacheValid.value = true
      }
    } finally {
      // Clear safety timeout
      if (safetyTimeout) {
        clearTimeout(safetyTimeout)
        safetyTimeout = null
      }
      loading.value = false
      fetchController = null
    }
  }

  // Setup realtime subscription
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
          console.log('Realtime event:', payload.eventType)

          if (payload.eventType === 'INSERT') {
            invalidateCache()
            await fetchTransactions({ force: true })
          } else if (payload.eventType === 'UPDATE') {
            invalidateCache()
            await fetchTransactions({ force: true })
          } else if (payload.eventType === 'DELETE') {
            transactions.value = transactions.value.filter((t) => t.id !== payload.old.id)
            invalidateCache()
          }
        },
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)

        // Handle reconnection
        if (status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel error, attempting reconnect...')
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
        console.warn('Error removing channel:', err)
      }
      realtimeChannel = null
    }
  }

  // Invalidate cache
  const invalidateCache = () => {
    cacheValid.value = false
  }

  // Add new transaction
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

      // Optimistic update + invalidate cache
      transactions.value = transactions.value.filter((t) => t.id !== id)
      invalidateCache()
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
    const totalIncome = transactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = transactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
    }
  })

  const recentTransactions = computed(() => {
    return transactions.value.slice(0, 5)
  })

  return {
    transactions,
    loading,
    error,
    summary,
    recentTransactions,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    invalidateCache,
    setupRealtime,
    cleanupRealtime,
    resetLoadingState,
  }
}
