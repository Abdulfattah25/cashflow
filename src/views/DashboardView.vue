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
                <button
                  class="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                  @click="openTransactionModal('income')"
                  data-bs-toggle="modal"
                  data-bs-target="#transactionModal"
                >
                  <i class="bi bi-plus-circle fs-2 mb-2"></i>
                  <span>Add Income</span>
                </button>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <button
                  class="btn btn-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                  @click="openTransactionModal('expense')"
                  data-bs-toggle="modal"
                  data-bs-target="#transactionModal"
                >
                  <i class="bi bi-dash-circle fs-2 mb-2"></i>
                  <span>Add Expense</span>
                </button>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <router-link
                  to="/transactions"
                  class="btn btn-primary w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3 text-decoration-none"
                >
                  <i class="bi bi-list-ul fs-2 mb-2"></i>
                  <span>View All</span>
                </router-link>
              </div>
              <div class="col-md-3 col-6 mb-3">
                <router-link
                  to="/reports"
                  class="btn btn-info w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                >
                  <i class="bi bi-graph-up fs-2 mb-2"></i>
                  <span>Reports</span>
                </router-link>
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
                        <div
                          class="transaction-icon me-3"
                          :style="{
                            background: transaction.color + '20',
                            color: transaction.color,
                          }"
                        >
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
                      <span
                        class="fw-bold"
                        :class="
                          transaction.type === 'income'
                            ? 'transaction-amount income'
                            : 'transaction-amount expense'
                        "
                      >
                        {{ transaction.type === 'expense' ? '-' : '+'
                        }}{{ formatCurrency(transaction.amount) }}
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
              <div class="progress" style="height: 8px">
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
    <!-- Transaction Modal -->
  <div class="modal fade" id="transactionModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add New Transaction</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveTransaction">
            <div class="mb-3">
              <label class="form-label">Type</label>
              <div class="btn-group w-100" role="group">
                <input type="radio" class="btn-check" id="income" v-model="transactionForm.type" value="income">
                <label class="btn btn-outline-success" for="income">
                  <i class="bi bi-arrow-up-circle me-1"></i>
                  Income
                </label>
                <input type="radio" class="btn-check" id="expense" v-model="transactionForm.type" value="expense">
                <label class="btn btn-outline-danger" for="expense">
                  <i class="bi bi-arrow-down-circle me-1"></i>
                  Expense
                </label>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Amount</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input
                  v-model.number="transactionForm.amount"
                  type="number"
                  class="form-control"
                  placeholder="0"
                  required
                  min="1"
                >
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Description</label>
              <input
                v-model="transactionForm.description"
                type="text"
                class="form-control"
                placeholder="Enter description"
                required
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Category</label>
              <select v-model="transactionForm.category" class="form-select" required>
                <option value="">Select Category</option>
                <optgroup v-if="transactionForm.type === 'income'" label="Income Categories">
                  <option value="salary">Salary</option>
                  <option value="freelance">Freelance</option>
                  <option value="business">Business</option>
                  <option value="investment">Investment</option>
                  <option value="other-income">Other Income</option>
                </optgroup>
                <optgroup v-if="transactionForm.type === 'expense'" label="Expense Categories">
                  <option value="food">Food & Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="bills">Bills & Utilities</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="other-expense">Other Expense</option>
                </optgroup>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Date</label>
              <input
                v-model="transactionForm.date"
                type="date"
                class="form-control"
                required
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" @click="saveTransaction">
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/common/AppLayout.vue'

const authStore = useAuthStore()

// Tambahkan reactive form
const transactionForm = reactive({
  type: 'expense',
  amount: null,
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0]
})

// Tambahkan methods
const openTransactionModal = (type) => {
  transactionForm.type = type
  transactionForm.category = ''
}

const saveTransaction = () => {
  // Buat transaction baru
  const newTransaction = {
    id: Date.now(),
    ...transactionForm,
    date: new Date(transactionForm.date),
    icon: getTransactionIcon(transactionForm.category),
    color: transactionForm.type === 'income' ? '#10b981' : '#ef4444'
  }
  
  // Tambahkan ke array transactions
  transactions.value.unshift(newTransaction)
  
  // Reset form
  Object.assign(transactionForm, {
    type: 'expense',
    amount: null,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })
  
  // Tutup modal
  const modal = document.getElementById('transactionModal')
  const bsModal = bootstrap.Modal.getInstance(modal)
  bsModal.hide()
}

const getTransactionIcon = (category) => {
  const icons = {
    salary: 'bi bi-cash-coin',
    freelance: 'bi bi-laptop',
    business: 'bi bi-briefcase',
    investment: 'bi bi-graph-up',
    food: 'bi bi-cart3',
    transportation: 'bi bi-fuel-pump',
    shopping: 'bi bi-bag',
    entertainment: 'bi bi-film',
    bills: 'bi bi-receipt',
    healthcare: 'bi bi-heart-pulse',
    education: 'bi bi-book'
  }
  return icons[category] || 'bi bi-circle'
}

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
    color: '#10b981',
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
    color: '#ef4444',
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
    color: '#ef4444',
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
    color: '#10b981',
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
    color: '#ef4444',
  },
])

// Computed properties
const userName = computed(() => {
  return authStore.user?.user_metadata?.full_name || 'User'
})

const recentTransactions = computed(() => {
  return transactions.value.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
})

const summary = computed(() => {
  const totalIncome = transactions.value
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.value
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses,
  }
})

const topCategories = computed(() => {
  const categoryTotals = {}
  const expenses = transactions.value.filter((t) => t.type === 'expense')

  expenses.forEach((transaction) => {
    if (!categoryTotals[transaction.category]) {
      categoryTotals[transaction.category] = {
        name: transaction.category,
        amount: 0,
        color: transaction.color,
      }
    }
    categoryTotals[transaction.category].amount += transaction.amount
  })

  const totalExpenses = summary.value.totalExpenses

  return Object.values(categoryTotals)
    .map((category) => ({
      ...category,
      percentage: totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
