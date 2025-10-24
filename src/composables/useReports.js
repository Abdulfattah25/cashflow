import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

// ✅ Cache global untuk reports (seperti di useTransactions)
const transactionsCache = ref([])
const cacheValid = ref(false)
const currentFilters = ref({ period: '', startDate: '', endDate: '' })
let realtimeChannel = null
let fetchController = null
let fetchPromise = null

export function useReports() {
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Reset loading state
  const resetLoadingState = () => {
    if (fetchController) {
      fetchController.abort()
      fetchController = null
    }
    loading.value = false
    error.value = null
  }

  // ✅ NEW: Check if filters changed
  const filtersChanged = (period, startDate, endDate) => {
    return (
      currentFilters.value.period !== period ||
      currentFilters.value.startDate !== startDate ||
      currentFilters.value.endDate !== endDate
    )
  }

  // ✅ NEW: Instant access to cached data
  const getReportData = (period = 'this-month', startDate = null, endDate = null) => {
    // If cache valid and filters same, return immediately
    if (cacheValid.value && !filtersChanged(period, startDate, endDate)) {
      return transactionsCache.value
    }

    // Otherwise fetch in background
    fetchReportData(period, startDate, endDate)
    return transactionsCache.value
  }

  // Fetch transactions for reports
  const fetchReportData = async (period = 'this-month', startDate = null, endDate = null) => {
    // ✅ If cache valid and same filters, skip fetch
    if (cacheValid.value && !filtersChanged(period, startDate, endDate)) {
      return transactionsCache.value
    }

    // ✅ Prevent duplicate requests
    if (fetchPromise) {
      return await fetchPromise
    }

    if (fetchController) {
      fetchController.abort()
    }
    fetchController = new AbortController()

    loading.value = true
    error.value = null

    fetchPromise = _performFetch(period, startDate, endDate)
    const result = await fetchPromise

    return result
  }

  // ✅ NEW: Separate fetch logic
  const _performFetch = async (period, startDate, endDate) => {
    try {
      let query = supabase
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

      // Apply date filters
      if (period === 'custom' && startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate)
      } else {
        const { start, end } = getDateRange(period)
        query = query.gte('date', start).lte('date', end)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      transactionsCache.value = data.map((transaction) => ({
        ...transaction,
        category: transaction.categories?.name || 'Unknown',
        color: transaction.categories?.color || '#6c757d',
        icon: transaction.categories?.icon || 'bi-circle',
      }))

      // ✅ Update cache state
      cacheValid.value = true
      currentFilters.value = { period, startDate, endDate }

      return transactionsCache.value
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return transactionsCache.value
      }

      error.value = err.message
      console.error('Error fetching report data:', err)
      return transactionsCache.value
    } finally {
      loading.value = false
      fetchController = null
      fetchPromise = null
    }
  }

  // Get date range based on period
  const getDateRange = (period) => {
    const now = new Date()
    const start = new Date()
    const end = new Date()

    switch (period) {
      case 'this-month':
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        break
      case 'last-month':
        start.setMonth(now.getMonth() - 1)
        start.setDate(1)
        end.setMonth(now.getMonth())
        end.setDate(0)
        break
      case 'this-quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        start.setMonth(quarterStart)
        start.setDate(1)
        end.setMonth(quarterStart + 3)
        end.setDate(0)
        break
      case 'this-year':
        start.setMonth(0)
        start.setDate(1)
        end.setMonth(11)
        end.setDate(31)
        break
      default:
        start.setDate(1)
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }

  // ✅ NEW: Setup realtime updates (like useTransactions)
  const setupRealtime = () => {
    if (!authStore.user?.id) return

    if (realtimeChannel) {
      cleanupRealtime()
    }

    realtimeChannel = supabase
      .channel(`reports:${authStore.user.id}`, {
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
        async () => {
          // Invalidate cache when data changes
          invalidateCache()
          await fetchReportData(
            currentFilters.value.period || 'this-month',
            currentFilters.value.startDate,
            currentFilters.value.endDate,
          )
        },
      )
      .subscribe()
  }

  // ✅ NEW: Cleanup realtime
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

  // ✅ NEW: Invalidate cache
  const invalidateCache = () => {
    cacheValid.value = false
  }

  // ✅ NEW: Clear cache
  const clearCache = () => {
    transactionsCache.value = []
    cacheValid.value = false
    currentFilters.value = { period: '', startDate: '', endDate: '' }
    cleanupRealtime()
  }

  // ✅ Use cached data instead of reactive ref
  const transactions = computed(() => transactionsCache.value)

  // Computed properties for reports
  const reportSummary = computed(() => {
    const totalIncome = transactionsCache.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = transactionsCache.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
    }
  })

  const incomeCategories = computed(() => {
    const categoryTotals = {}
    const incomeTransactions = transactionsCache.value.filter((t) => t.type === 'income')
    const totalIncome = reportSummary.value.totalIncome

    incomeTransactions.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = {
          name: transaction.category,
          amount: 0,
          icon: transaction.icon,
          color: transaction.color,
        }
      }
      categoryTotals[transaction.category].amount += parseFloat(transaction.amount)
    })

    return Object.values(categoryTotals)
      .map((category) => ({
        ...category,
        percentage: totalIncome > 0 ? Math.round((category.amount / totalIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const expenseCategories = computed(() => {
    const categoryTotals = {}
    const expenseTransactions = transactionsCache.value.filter((t) => t.type === 'expense')
    const totalExpenses = reportSummary.value.totalExpenses

    expenseTransactions.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = {
          name: transaction.category,
          amount: 0,
          icon: transaction.icon,
          color: transaction.color,
        }
      }
      categoryTotals[transaction.category].amount += parseFloat(transaction.amount)
    })

    return Object.values(categoryTotals)
      .map((category) => ({
        ...category,
        percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const monthlyData = computed(() => {
    const monthlyTotals = {}

    transactionsCache.value.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthName,
          income: 0,
          expenses: 0,
          net: 0,
          savingsRate: 0,
        }
      }

      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += parseFloat(transaction.amount)
      } else {
        monthlyTotals[monthKey].expenses += parseFloat(transaction.amount)
      }
    })

    // Calculate net and savings rate
    Object.values(monthlyTotals).forEach((month) => {
      month.net = month.income - month.expenses
      month.savingsRate = month.income > 0 ? Math.round((month.net / month.income) * 100) : 0
    })

    return Object.values(monthlyTotals)
      .sort((a, b) => new Date(b.month) - new Date(a.month))
      .slice(0, 6)
  })

  // Chart data
  const barChartData = computed(() => {
    const data = monthlyData.value.slice().reverse()

    return {
      labels: data.map((item) => {
        const [month, year] = item.month.split(' ')
        return `${month.substring(0, 3)} ${year}`
      }),
      datasets: [
        {
          label: 'Income',
          data: data.map((item) => item.income),
          backgroundColor: 'rgba(40, 167, 69, 0.8)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: data.map((item) => item.expenses),
          backgroundColor: 'rgba(220, 53, 69, 0.8)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    }
  })

  const pieChartData = computed(() => {
    const categories = expenseCategories.value.slice(0, 5) // Top 5 categories

    return {
      labels: categories.map((cat) => cat.name),
      datasets: [
        {
          data: categories.map((cat) => cat.amount),
          backgroundColor: categories.map((cat) => cat.color),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverBorderColor: '#ffffff',
        },
      ],
    }
  })

  return {
    transactions,
    loading,
    error,
    reportSummary,
    incomeCategories,
    expenseCategories,
    monthlyData,
    barChartData,
    pieChartData,
    fetchReportData,
    getReportData, // ✅ NEW: Instant cache access
    resetLoadingState,
    setupRealtime, // ✅ NEW
    cleanupRealtime, // ✅ NEW
    invalidateCache, // ✅ NEW
    clearCache, // ✅ NEW
  }
}
