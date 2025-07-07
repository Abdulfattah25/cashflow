import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useReports() {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Fetch transactions for reports
  const fetchReportData = async (period = 'this-month', startDate = null, endDate = null) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
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

      // Apply date filters
      if (period === 'custom' && startDate && endDate) {
        query = query.gte('date', startDate).lte('date', endDate)
      } else {
        const { start, end } = getDateRange(period)
        query = query.gte('date', start).lte('date', end)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      transactions.value = data.map(transaction => ({
        ...transaction,
        category: transaction.categories?.name || 'Unknown',
        color: transaction.categories?.color || '#6c757d',
        icon: transaction.categories?.icon || 'bi-circle'
      }))

    } catch (err) {
      error.value = err.message
      console.error('Error fetching report data:', err)
    } finally {
      loading.value = false
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
      end: end.toISOString().split('T')[0]
    }
  }

  // Computed properties for reports
  const reportSummary = computed(() => {
    const totalIncome = transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate
    }
  })

  const incomeCategories = computed(() => {
    const categoryTotals = {}
    const incomeTransactions = transactions.value.filter(t => t.type === 'income')
    const totalIncome = reportSummary.value.totalIncome

    incomeTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = {
          name: transaction.category,
          amount: 0,
          icon: transaction.icon,
          color: transaction.color
        }
      }
      categoryTotals[transaction.category].amount += parseFloat(transaction.amount)
    })

    return Object.values(categoryTotals)
      .map(category => ({
        ...category,
        percentage: totalIncome > 0 ? Math.round((category.amount / totalIncome) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const expenseCategories = computed(() => {
    const categoryTotals = {}
    const expenseTransactions = transactions.value.filter(t => t.type === 'expense')
    const totalExpenses = reportSummary.value.totalExpenses

    expenseTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = {
          name: transaction.category,
          amount: 0,
          icon: transaction.icon,
          color: transaction.color
        }
      }
      categoryTotals[transaction.category].amount += parseFloat(transaction.amount)
    })

    return Object.values(categoryTotals)
      .map(category => ({
        ...category,
        percentage: totalExpenses > 0 ? Math.round((category.amount / totalExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const monthlyData = computed(() => {
    const monthlyTotals = {}
    
    transactions.value.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = {
          month: monthName,
          income: 0,
          expenses: 0,
          net: 0,
          savingsRate: 0
        }
      }
      
      if (transaction.type === 'income') {
        monthlyTotals[monthKey].income += parseFloat(transaction.amount)
      } else {
        monthlyTotals[monthKey].expenses += parseFloat(transaction.amount)
      }
    })

    // Calculate net and savings rate
    Object.values(monthlyTotals).forEach(month => {
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
      labels: data.map(item => {
        const [month, year] = item.month.split(' ')
        return `${month.substring(0, 3)} ${year}`
      }),
      datasets: [
        {
          label: 'Income',
          data: data.map(item => item.income),
          backgroundColor: 'rgba(40, 167, 69, 0.8)',
          borderColor: 'rgba(40, 167, 69, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: data.map(item => item.expenses),
          backgroundColor: 'rgba(220, 53, 69, 0.8)',
          borderColor: 'rgba(220, 53, 69, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    }
  })

  const pieChartData = computed(() => {
    const categories = expenseCategories.value.slice(0, 5) // Top 5 categories
    
    return {
      labels: categories.map(cat => cat.name),
      datasets: [
        {
          data: categories.map(cat => cat.amount),
          backgroundColor: categories.map(cat => cat.color),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverBorderColor: '#ffffff'
        }
      ]
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
    fetchReportData
  }
}
