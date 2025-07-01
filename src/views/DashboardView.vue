<template>
  <AppLayout>
    <!-- Welcome Card -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="welcome-card card">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h3>Welcome back, {{ userName }}! 👋</h3>
                <p>Here's what's happening with your finances today.</p>
              </div>
              <div class="col-md-4 text-end">
                <div class="welcome-stats">
                  <h4 class="mb-0">{{ formatDate(new Date()) }}</h4>
                  <p class="mb-0 opacity-75">{{ getDayGreeting() }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="stats-card card income">
          <div class="card-body">
            <div class="stats-icon income">
              <i class="bi bi-arrow-up-circle"></i>
            </div>
            <h3 class="stats-value income">{{ formatCurrency(summary.totalIncome) }}</h3>
            <p class="stats-label">Total Income</p>
            <small class="text-success">
              <i class="bi bi-arrow-up"></i>
              +12% from last month
            </small>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="stats-card card expense">
          <div class="card-body">
            <div class="stats-icon expense">
              <i class="bi bi-arrow-down-circle"></i>
            </div>
            <h3 class="stats-value expense">{{ formatCurrency(summary.totalExpenses) }}</h3>
            <p class="stats-label">Total Expenses</p>
            <small class="text-danger">
              <i class="bi bi-arrow-up"></i>
              +5% from last month
            </small>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="stats-card card net">
          <div class="card-body">
            <div class="stats-icon net">
              <i class="bi bi-wallet2"></i>
            </div>
            <h3 class="stats-value net" :class="summary.netAmount >= 0 ? 'positive' : 'negative'">
              {{ formatCurrency(summary.netAmount) }}
            </h3>
            <p class="stats-label">Net Balance</p>
            <small :class="summary.netAmount >= 0 ? 'text-success' : 'text-danger'">
              <i :class="summary.netAmount >= 0 ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ summary.netAmount >= 0 ? 'Positive' : 'Negative' }} balance
            </small>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-3 col-6 mb-3">
                <button class="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                  <i class="bi bi-plus-circle fs-2 mb-2"></i>
                  <span>Add Income</span>
                </button>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <button class="btn btn-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                  <i class="bi bi-dash-circle fs-2 mb-2"></i>
                  <span>Add Expense</span>
                </button>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <router-link to="/transactions" class="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 text-decoration-none">
                  <i class="bi bi-list-ul fs-2 mb-2"></i>
                  <span>View All</span>
                </router-link>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <button class="btn btn-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3">
                  <i class="bi bi-graph-up fs-2 mb-2"></i>
                  <span>Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions & Chart -->
    <div class="row">
      <!-- Recent Transactions -->
      <div class="col-lg-8 mb-4">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title">Recent Transactions</h5>
            <router-link to="/transactions" class="btn btn-outline-primary btn-sm">
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in recentTransactions" :key="transaction.id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="transaction-icon me-3" :style="{ background: transaction.color + '20', color: transaction.color }">
                          <i :class="transaction.icon"></i>
                        </div>
                        <div>
                          <div class="fw-medium">{{ transaction.description }}</div>
                          <small class="text-muted">{{ transaction.notes }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-light text-dark">{{ transaction.category }}</span>
                    </td>
                    <td class="text-muted">{{ formatDate(transaction.date) }}</td>
                    <td class="text-end">
                      <span class="fw-bold" :class="transaction.type === 'income' ? 'transaction-amount income' : 'transaction-amount expense'">
                        {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Empty State -->
            <div v-if="recentTransactions.length === 0" class="empty-state">
              <i class="bi bi-inbox"></i>
              <h5>No transactions yet</h5>
              <p>Start by adding your first transaction!</p>
              <button class="btn btn-primary">Add Transaction</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Category Breakdown -->
      <div class="col-lg-4 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Spending by Category</h5>
          </div>
          <div class="card-body">
            <div v-for="category in topCategories" :key="category.name" class="mb-3">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small fw-medium">{{ category.name }}</span>
                <span class="small text-muted">{{ formatCurrency(category.amount) }}</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div 
                  class="progress-bar" 
                  :style="{ width: category.percentage + '%', background: category.color }"
                ></div>
              </div>
            </div>
            
            <div v-if="topCategories.length === 0" class="text-center text-muted py-4">
              <i class="bi bi-pie-chart fs-1 mb-2 d-block"></i>
              <small>No spending data available</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/common/AppLayout.vue'

const authStore = useAuthStore()

// Sample data (akan diganti dengan data dari Supabase)
const transactions = ref([
  {
    id: 1,
    description: 'Monthly Salary',
    category: 'salary',
    amount: 8500000,
    type: 'income',
    date: new Date('2024-01-01'),
    notes: 'Regular monthly salary',
    icon: 'bi bi-cash-coin',
    color: '#10b981'
  },
  {
    id: 2,
    description: 'Grocery Shopping',
    category: 'food',
    amount: 250000,
    type: 'expense',
    date: new Date('2024-01-15'),
    notes: 'Weekly groceries',
    icon: 'bi bi-cart3',
    color: '#ef4444'
  },
  {
    id: 3,
    description: 'Gas Station',
    category: 'transportation',
    amount: 150000,
    type: 'expense',
    date: new Date('2024-01-13'),
    notes: 'Fuel for car',
    icon: 'bi bi-fuel-pump',
    color: '#ef4444'
  },
  {
    id: 4,
    description: 'Freelance Project',
    category: 'freelance',
    amount: 1500000,
    type: 'income',
    date: new Date('2024-01-12'),
    notes: 'Web development project',
    icon: 'bi bi-laptop',
    color: '#10b981'
  },
  {
    id: 5,
    description: 'Movie Tickets',
    category: 'entertainment',
    amount: 100000,
    type: 'expense',
    date: new Date('2024-01-10'),
    notes: 'Weekend movie',
    icon: 'bi bi-film',
    color: '#ef4444'
  }
])

// Computed properties
const userName = computed(() => {
  return authStore.user?.user_metadata?.full_name || 'User'
})

const recentTransactions = computed(() => {
  return transactions.value
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

const summary = computed(() => {
  const totalIncome = transactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses
  }
})

const topCategories = computed(() => {
  const categoryTotals = {}
  const expenses = transactions.value.filter(t => t.type === 'expense')
  
  expenses.forEach(transaction => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = {
        name: transaction.category,
        amount: 0,
        color: transaction.color
      }
    }
    categoryTotals[transaction.category].amount += transaction.amount
  })

  const totalExpenses = summary.value.totalExpenses
  
  return Object.values(categoryTotals)
    .map(category => ({
      ...category,
      percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
}

const getDayGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

onMounted(() => {
  // TODO: Fetch data from Supabase
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.welcome-stats h4 {
  font-size: 1.5rem;
  font-weight: 600;
}

.stats-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
</style>

