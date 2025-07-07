import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useTransactions() {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Fetch transactions from database
  const fetchTransactions = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color,
            icon
          )
        `)
        .eq('user_id', authStore.user.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      transactions.value = data.map(transaction => ({
        ...transaction,
        category: transaction.categories?.name || 'Unknown',
        color: transaction.categories?.color || '#6c757d',
        icon: transaction.categories?.icon || 'bi-circle'
      }))

    } catch (err) {
      error.value = err.message
      console.error('Error fetching transactions:', err)
    } finally {
      loading.value = false
    }
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
            date: transactionData.date
          }
        ])
        .select()

      if (insertError) throw insertError

      // Refresh transactions
      await fetchTransactions()
      
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
          date: transactionData.date
        })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()

      if (updateError) throw updateError

      // Refresh transactions
      await fetchTransactions()
      
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

      // Remove from local state
      transactions.value = transactions.value.filter(t => t.id !== id)
      
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
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    return {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses
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
    deleteTransaction
  }
}
