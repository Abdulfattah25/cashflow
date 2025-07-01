<template>
  <AppLayout>
    <!-- Welcome Section -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1">Welcome back, {{ userName }}! 👋</h1>
            <p class="text-muted mb-0">Here's what's happening with your finances today.</p>
          </div>
          <div>
            <button class="btn btn-primary">
              <i class="bi bi-plus-circle me-2"></i>
              Add Transaction
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card card-stats h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="card-category text-muted mb-1">Total Balance</p>
                <h3 class="card-title mb-0">{{ formatCurrency(totalBalance) }}</h3>
              </div>
              <div class="text-primary">
                <i class="bi bi-wallet2" style="font-size: 2rem;"></i>
              </div>
            </div>
            <div class="mt-2">
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> +2.5% from last month
              </small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card card-stats h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="card-category text-muted mb-1">This Month Income</p>
                <h3 class="card-title mb-0">{{ formatCurrency(monthlyIncome) }}</h3>
              </div>
              <div class="text-success">
                <i class="bi bi-arrow-up-circle" style="font-size: 2rem;"></i>
              </div>
            </div>
            <div class="mt-2">
              <small class="text-success">
                <i class="bi bi-arrow-up"></i> +5.2% from last month
              </small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card card-stats h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="card-category text-muted mb-1">This Month Expenses</p>
                <h3 class="card-title mb-0">{{ formatCurrency(monthlyExpenses) }}</h3>
              </div>
              <div class="text-danger">
                <i class="bi bi-arrow-down-circle" style="font-size: 2rem;"></i>
              </div>
            </div>
            <div class="mt-2">
              <small class="text-danger">
                <i class="bi bi-arrow-up"></i> +12.3% from last month
              </small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 mb-3">
        <div class="card card-stats h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <p class="card-category text-muted mb-1">Savings Goal</p>
                <h3 class="card-title mb-0">75%</h3>
              </div>
              <div class="text-info">
                <i class="bi bi-target" style="font-size: 2rem;"></i>
              </div>
            </div>
            <div class="mt-2">
              <div class="progress" style="height: 4px;">
                <div class="progress-bar bg-info" style="width: 75%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts & Recent Transactions -->
    <div class="row">
      <!-- Expense Categories Chart -->
      <div class="col-lg-8 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Expense Categories</h5>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                This Month
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">This Week</a></li>
                <li><a class="dropdown-item" href="#">This Month</a></li>
                <li><a class="dropdown-item" href="#">Last 3 Months</a></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <!-- Placeholder for Chart -->
            <div class="d-flex align-items-center justify-content-center" style="height: 300px;">
              <div class="text-center text-muted">
                <i class="bi bi-pie-chart" style="font-size: 3rem;"></i>
                <p class="mt-2">Chart will be implemented with Chart.js</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Recent Transactions</h5>
            <router-link to="/transactions" class="btn btn-sm btn-outline-primary">
              View All
            </router-link>
          </div>
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <div v-for="transaction in recentTransactions" :key="transaction.id" class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="d-flex align-items-center">
                    <div class="me-3">
                      <i :class="transaction.icon" :style="{ color: transaction.color }"></i>
                    </div>
                    <div>
                      <h6 class="mb-1">{{ transaction.description }}</h6>
                      <small class="text-muted">{{ transaction.category }}</small>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold" :class="transaction.type === 'expense' ? 'text-danger' : 'text-success'">
                      {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
                    </div>
                    <small class="text-muted">{{ formatDate(transaction.date) }}</small>
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div v-if="recentTransactions.length === 0" class="list-group-item text-center py-4">
                <i class="bi bi-inbox text-muted" style="font-size: 2rem;"></i>
                <p class="text-muted mt-2 mb-0">No transactions yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget Overview -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Budget Overview</h5>
            <button class="btn btn-sm btn-outline-primary">
              <i class="bi bi-gear me-1"></i>
              Manage Budget
            </button>
          </div>
          <div class="card-body">
            <div class="row">
              <div v-for="budget in budgetOverview" :key="budget.category" class="col-lg-3 col-md-6 mb-3">
                <div class="border rounded p-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-semibold">{{ budget.category }}</span>
                    <span class="badge" :class="budget.percentage > 90 ? 'bg-danger' : budget.percentage > 70 ? 'bg-warning' : 'bg-success'">
                      {{ Math.round(budget.percentage) }}%
                    </span>
                  </div>
                  <div class="progress mb-2" style="height: 8px;">
                    <div 
                      class="progress-bar" 
                      :class="budget.percentage > 90 ? 'bg-danger' : budget.percentage > 70 ? 'bg-warning' : 'bg-success'"
                      :style="{ width: Math.min(budget.percentage, 100) + '%' }"
                    ></div>
                  </div>
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">{{ formatCurrency(budget.spent) }}</small>
                    <small class="text-muted">{{ formatCurrency(budget.limit) }}</small>
                  </div>
                </div>
              </div>
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

// Sample data (will be replaced with real data from Supabase)
const totalBalance = ref(15750000)
const monthlyIncome = ref(8500000)
const monthlyExpenses = ref(3250000)

const recentTransactions = ref([
  {
    id: 1,
    description: 'Grocery Shopping',
    category: 'Food',
    amount: 250000,
    type: 'expense',
    date: new Date('2024-01-15'),
    icon: 'bi bi-cart3',
    color: '#dc3545'
  },
  {
    id: 2,
    description: 'Salary',
    category: 'Income',
    amount: 8500000,
    type: 'income',
    date: new Date('2024-01-01'),
    icon: 'bi bi-cash-coin',
    color: '#28a745'
  },
  {
    id: 3,
    description: 'Coffee Shop',
    category: 'Food',
    amount: 45000,
    type: 'expense',
    date: new Date('2024-01-14'),
    icon: 'bi bi-cup-hot',
    color: '#dc3545'
  },
  {
    id: 4,
    description: 'Gas Station',
    category: 'Transportation',
    amount: 150000,
    type: 'expense',
    date: new Date('2024-01-13'),
    icon: 'bi bi-fuel-pump',
    color: '#dc3545'
  },
  {
    id: 5,
    description: 'Freelance Work',
    category: 'Income',
    amount: 1500000,
    type: 'income',
    date: new Date('2024-01-12'),
    icon: 'bi bi-laptop',
    color: '#28a745'
  }
])

const budgetOverview = ref([
  {
    category: 'Food',
    spent: 850000,
    limit: 1000000,
    percentage: 85
  },
  {
    category: 'Transportation',
    spent: 450000,
    limit: 500000,
    percentage: 90
  },
  {
    category: 'Entertainment',
    spent: 200000,
    limit: 400000,
    percentage: 50
  },
  {
    category: 'Shopping',
    spent: 750000,
    limit: 600000,
    percentage: 125
  }
])

// Computed properties
const userName = computed(() => {
  return authStore.user?.email?.split('@')[0] || 'User'
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
    day: 'numeric',
    month: 'short'
  }).format(date)
}

onMounted(() => {
  // TODO: Fetch real data from Supabase
  console.log('Dashboard mounted, fetch data here')
})
</script>

