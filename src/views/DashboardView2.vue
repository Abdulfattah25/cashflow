<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-danger mx-2" role="alert">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else class="px-2 px-sm-3">
      <!-- Welcome Card -->
      <div class="row">
        <div class="col-12">
          <div class="welcome-card card border-0">
            <div class="card-body p-3">
              <div class="row align-items-center">
                <div class="col-8">
                  <h4 class="mb-1 text-muted">Halo, {{ userName }}! 👋</h4>
                  <p class="mb-0 small opacity-75 text-muted">{{ getDayGreeting() }}</p>
                </div>
                <div class="col-4 text-end">
                  <div class="welcome-stats">
                    <p class="mb-0 small fw-medium text-muted">{{ formatDate(new Date()) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-3 g-2">
        <!-- Net Balance -->
        <div class="col-12 col-md-4 mb-2">
          <div class="stats-card card net border-0">
            <div class="card-body p-3 text-center">
              <div class="stats-icon net mb-2">
                <i class="bi bi-wallet2"></i>
              </div>
              <h3
                class="stats-value net mb-1"
                :class="summary.netAmount >= 0 ? 'positive' : 'negative'"
              >
                {{ formatCurrency(summary.netAmount) }}
              </h3>
              <p class="stats-label small mb-0">Net Balance</p>
            </div>
          </div>
        </div>

        <!-- Income -->
        <div class="col-6 col-md-4">
          <div class="stats-card card income border-0">
            <div class="card-body p-3 text-center">
              <div class="stats-icon income mb-2">
                <i class="bi bi-arrow-up-circle text-light"></i>
              </div>
              <h5 class="stats-value income mb-1">
                {{ formatCurrency(summary.totalIncome) }}
              </h5>
              <p class="stats-label small mb-0">Income</p>
            </div>
          </div>
        </div>

        <!-- Expenses -->
        <div class="col-6 col-md-4">
          <div class="stats-card card expense border-0">
            <div class="card-body p-3 text-center">
              <div class="stats-icon expense mb-2">
                <i class="bi bi-arrow-down-circle text-light"></i>
              </div>
              <h5 class="stats-value expense mb-1">
                {{ formatCurrency(summary.totalExpenses) }}
              </h5>
              <p class="stats-label small mb-0">Expenses</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card border-0">
            <div class="card-header bg-transparent border-0 pb-2">
              <h6 class="card-title mb-0 fw-medium">Quick Actions</h6>
            </div>
            <div class="card-body pt-0">
              <div class="row g-2">
                <div class="col-6 col-md-4 col-lg-3">
                  <button
                    class="btn btn-success w-100 d-flex flex-column align-items-center justify-content-center py-1"
                    @click="openTransactionModal('income')"
                    data-bs-toggle="modal"
                    data-bs-target="#transactionModal"
                  >
                    <i class="bi bi-plus-circle fs-4 mb-1"></i>
                    <span class="small">Add Income</span>
                  </button>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                  <button
                    class="btn btn-danger w-100 d-flex flex-column align-items-center justify-content-center py-1"
                    @click="openTransactionModal('expense')"
                    data-bs-toggle="modal"
                    data-bs-target="#transactionModal"
                  >
                    <i class="bi bi-dash-circle fs-4 mb-1"></i>
                    <span class="small">Add Expense</span>
                  </button>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                  <router-link
                    to="/transactions"
                    class="btn btn-primary w-100 d-flex flex-column align-items-center justify-content-center py-1 text-decoration-none"
                  >
                    <i class="bi bi-list-ul fs-4 mb-1"></i>
                    <span class="small">View All</span>
                  </router-link>
                </div>
                <div class="col-6 col-md-4 col-lg-3">
                  <router-link
                    to="/reports"
                    class="btn btn-info w-100 d-flex flex-column align-items-center justify-content-center py-1"
                  >
                    <i class="bi bi-graph-up fs-4 mb-1 text-light"></i>
                    <span class="small text-light">Reports</span>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions & Category Breakdown -->
      <div class="row g-2">
        <!-- Recent Transactions -->
        <div class="col-12 mb-3">
          <div class="card border-0">
            <div
              class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pb-2"
            >
              <h6 class="card-title mb-0 fw-medium">Recent Transactions</h6>
              <router-link to="/transactions" class="btn btn-outline-primary btn-sm">
                View All
              </router-link>
            </div>
            <div class="card-body p-0">
              <!-- Mobile Transaction List -->
              <div class="d-block">
                <div
                  v-for="transaction in recentTransactions"
                  :key="transaction.id"
                  class="transaction-item p-3 border-bottom"
                >
                  <div class="d-flex align-items-center">
                    <div
                      class="transaction-icon me-3 flex-shrink-0"
                      :style="{
                        background: transaction.color + '20',
                        color: transaction.color,
                      }"
                    >
                      <i :class="transaction.icon"></i>
                    </div>
                    <div class="flex-grow-1 min-w-0">
                      <div class="d-flex justify-content-between align-items-start">
                        <div class="me-2">
                          <div class="fw-medium text-truncate">{{ transaction.description }}</div>
                          <div class="d-flex align-items-center mt-1">
                            <span class="badge bg-light text-dark me-2 small">{{
                              transaction.category
                            }}</span>
                            <small class="text-muted">{{ formatDate(transaction.date) }}</small>
                          </div>
                        </div>
                        <div class="text-end flex-shrink-0">
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="recentTransactions.length === 0" class="empty-state py-4">
                <i class="bi bi-inbox"></i>
                <h6>No transactions yet</h6>
                <p class="small">Start by adding your first transaction!</p>
                <button
                  class="btn btn-primary btn-sm"
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
        <div class="col-12 mb-3">
          <div class="card border-0">
            <div class="card-header bg-transparent border-0 pb-2">
              <h6 class="card-title mb-0 fw-medium">Spending by Category</h6>
            </div>
            <div class="card-body">
              <div v-for="category in topCategories" :key="category.name" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <span class="small fw-medium">{{ category.name }}</span>
                  <span class="small text-muted">{{ formatCurrency(category.amount) }}</span>
                </div>
                <div class="progress" style="height: 6px">
                  <div
                    class="progress-bar"
                    :style="{ width: category.percentage + '%', background: category.color }"
                  ></div>
                </div>
              </div>

              <div v-if="topCategories.length === 0" class="text-center text-muted py-3">
                <i class="bi bi-pie-chart fs-2 mb-2 d-block"></i>
                <small>No spending data available</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Modal -->
      <div class="modal fade" id="transactionModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">Add New Transaction</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTransaction">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Type</label>
                  <div class="btn-group w-100" role="group">
                    <input
                      type="radio"
                      class="btn-check"
                      id="income"
                      v-model="transactionForm.type"
                      value="income"
                    />
                    <label class="btn btn-outline-success" for="income">
                      <i class="bi bi-arrow-up-circle me-1"></i>
                      Income
                    </label>
                    <input
                      type="radio"
                      class="btn-check"
                      id="expense"
                      v-model="transactionForm.type"
                      value="expense"
                    />
                    <label class="btn btn-outline-danger" for="expense">
                      <i class="bi bi-arrow-down-circle me-1"></i>
                      Expense
                    </label>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Amount</label>
                  <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input
                      v-model.number="transactionForm.amount"
                      type="number"
                      class="form-control form-control-lg"
                      placeholder="0"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Description</label>
                  <input
                    v-model="transactionForm.description"
                    type="text"
                    class="form-control"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Category</label>
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
                  <label class="form-label small fw-medium">Date</label>
                  <input v-model="transactionForm.date" type="date" class="form-control" required />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Notes (Optional)</label>
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
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
  addTransaction,
} = useTransactions()

const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
  getCategoriesByType,
} = useCategories()

// Form data
const transactionForm = reactive({
  type: 'expense',
  amount: null,
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
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
      notes: '',
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
  await Promise.all([fetchTransactions(), fetchCategories()])
})
</script>

<style scoped>
.welcome-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f4f4 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.stats-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stats-card.income {
  background: linear-gradient(135deg, #ffffff 0%, #e7e6e6 100%);
  color: white;
}

.stats-card.expense {
  background: linear-gradient(135deg, #ffffff 0%, #e7e6e6 100%);
  color: white;
}

.stats-card.net {
  background: linear-gradient(135deg, #ffffff 0%, #e7e6e6 100%);
  color: #333;
}

.stats-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stats-icon.income {
  background: rgba(61, 177, 38, 0.8);
}

.stats-icon.expense {
  background: rgba(230, 46, 46, 0.8);
}

.stats-icon.net {
  background: rgba(44, 83, 209, 0.808);
}

.transaction-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.transaction-item {
  transition: background-color 0.2s ease;
}

.transaction-item:hover {
  background-color: #f8f9fa;
}

.transaction-item:last-child {
  border-bottom: none !important;
}

.income {
  color: #383838;
}

.expense {
  color: #383838;
}

.stats-value.positive {
  color: #383838;
}

.stats-value.negative {
  color: #383838;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-state i {
  font-size: 2.5rem;
  color: #6c757d;
  margin-bottom: 1rem;
}

.card {
  border-radius: 12px;
}

.btn {
  border-radius: 8px;
}

.progress {
  border-radius: 3px;
}

.modal-dialog-centered {
  margin: 1rem;
}

@media (max-width: 576px) {
  .stats-value {
    font-size: 1.1rem;
  }

  .stats-card .card-body {
    padding: 0.75rem !important;
  }

  .transaction-amount {
    font-size: 0.9rem;
  }

  .modal-dialog {
    margin: 0.5rem;
  }
}
</style>
