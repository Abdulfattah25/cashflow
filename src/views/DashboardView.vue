<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <!-- Content (existing template, but with real data) -->
    <div v-else>
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

      <!-- Recent Transactions -->
      <div class="row">
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
                <button 
                  class="btn btn-primary"
                  @click="openTransactionModal('expense')"
                  data-bs-toggle="modal"
                  data-bs-target="#transactionModal"
                >
                  Add Transaction
                </button>
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
                    <option 
                      v-for="category in getCategoriesByType(transactionForm.type)" 
                      :key="category.id" 
                      :value="category.name"
                    >
                      {{ category.name }}
                    </option>
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

                <div class="mb-3">
                  <label class="form-label">Notes (Optional)</label>
                  <textarea
                    v-model="transactionForm.notes"
                    class="form-control"
                    rows="3"
                    placeholder="Additional notes..."
                  ></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="saveTransaction"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Save Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import AppLayout from '@/components/common/AppLayout.vue'

const authStore = useAuthStore()

// Use composables
const {
  transactions,
  loading: transactionsLoading,
  error: transactionsError,
  summary,
  recentTransactions,
  fetchTransactions,
  addTransaction
} = useTransactions()

const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
  getCategoriesByType
} = useCategories()

// Form data
const transactionForm = reactive({
  type: 'expense',
  amount: null,
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: ''
})

// Computed properties
const loading = computed(() => transactionsLoading.value || categoriesLoading.value)
const error = computed(() => transactionsError.value || categoriesError.value)

const userName = computed(() => {
  return authStore.user?.user_metadata?.full_name || 'User'
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
    categoryTotals[transaction.category].amount += parseFloat(transaction.amount)
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
const openTransactionModal = (type) => {
  transactionForm.type = type
  transactionForm.category = ''
}

const saveTransaction = async () => {
  try {
    await addTransaction(transactionForm)
    
    // Reset form
    Object.assign(transactionForm, {
      type: 'expense',
      amount: null,
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    
    // Close modal
    const modal = document.getElementById('transactionModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    
    // Show success message (optional)
    // You can add a toast notification here
    
  } catch (err) {
    console.error('Failed to save transaction:', err)
    // Show error message to user
  }
}

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

onMounted(async () => {
  // Fetch data when component mounts
  await Promise.all([
    fetchTransactions(),
    fetchCategories()
  ])
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

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #6c757d;
  margin-bottom: 1rem;
}
</style>

                       
