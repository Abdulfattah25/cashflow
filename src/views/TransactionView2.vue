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
    <div v-else>
      <!-- Header -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-1">Transactions</h4>
              <p class="text-muted mb-0 small">Manage your income and expenses</p>
            </div>
            <button
              class="btn btn-primary btn-sm"
              @click="openAddModal"
              data-bs-toggle="modal"
              data-bs-target="#transactionModal"
            >
              <i class="bi bi-plus-circle me-1"></i>
              <span class="d-none d-sm-inline">Add Transaction</span>
              <span class="d-sm-none">Add</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-3 g-2">
        <div class="col-4 col-md-4">
          <div class="card net-card border-0">
            <div class="card-body p-3 text-center">
              <h5 class="card-title mb-1 small text-muted">Net Amount</h5>
              <h5
                class="small mb-0"
                :class="summary.netAmount >= 0 ? 'positive' : 'negative'"
              >
                {{ formatCurrency(summary.netAmount) }}
              </h5>
            </div>
          </div>
        </div>
        <div class="col-4 col-md-4">
          <div class="card income-card border-0">
            <div class="card-body p-3 text-center">
              <h5 class="card-title text-white mb-1 small text-muted">Income</h5>
              <h5 class="small mb-0">{{ formatCurrency(summary.totalIncome) }}</h5>
            </div>
          </div>
        </div>
        <div class="col-4 col-md-4">
          <div class="card expense-card border-0">
            <div class="card-body p-3 text-center">
              <h5 class="card-title text-white mb-1 small text-muted">Expenses</h5>
              <h5 class="small mb-0">
                {{ formatCurrency(summary.totalExpenses) }}
              </h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters - Mobile Optimized -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="card border-0">
            <div class="card-header bg-transparent border-0 pb-2">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0 fw-medium">Filters</h6>
                <button
                  class="btn btn-sm btn-outline-secondary d-md-none"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#filtersCollapse"
                >
                  <i class="bi bi-funnel"></i>
                </button>
              </div>
            </div>
            <div class="collapse d-md-block" id="filtersCollapse">
              <div class="card-body pt-0">
                <div class="row g-2">
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Date Range</label>
                    <select v-model="filters.dateRange" class="form-select form-select-sm">
                      <option value="this-month">This Month</option>
                      <option value="last-month">Last Month</option>
                      <option value="this-year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Type</label>
                    <select v-model="filters.type" class="form-select form-select-sm">
                      <option value="">All Types</option>
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Category</label>
                    <select v-model="filters.category" class="form-select form-select-sm">
                      <option value="">All Categories</option>
                      <option
                        v-for="category in categories"
                        :key="category.id"
                        :value="category.name"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Search</label>
                    <div class="input-group input-group-md">
                      <span class="input-group-text">
                        <i class="bi bi-search"></i>
                      </span>
                      <input
                        v-model="filters.search"
                        type="text"
                        class="form-control"
                        placeholder="Search..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0">
            <div
              class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pb-2"
            >
              <h6 class="card-title mb-0 fw-medium">Transaction History</h6>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary d-md-inline-flex">
                  <i class="bi bi-download me-1"></i>
                  Export
                </button>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-sort-down d-md-none"></i>
                    <span class="d-none d-md-inline">Sort</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="#" @click="sortBy('date', 'desc')"
                        >Newest First</a
                      >
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click="sortBy('date', 'asc')"
                        >Oldest First</a
                      >
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click="sortBy('amount', 'desc')"
                        >Highest Amount</a
                      >
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click="sortBy('amount', 'asc')"
                        >Lowest Amount</a
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body p-0">
              <!-- Mobile Transaction List -->
              <div class="d-block">
                <div
                  v-for="transaction in filteredTransactions"
                  :key="transaction.id"
                  class="transaction-item p-3 border-bottom position-relative"
                >
                  <div class="d-flex align-items-start">
                    <div
                      class="transaction-icon me-2 flex-shrink-0"
                      :style="{
                        background: transaction.color + '20',
                        color: transaction.color,
                      }"
                    >
                      <i :class="transaction.icon"></i>
                    </div>
                    <div class="flex-grow-1 min-w-0">
                      <div class="d-flex justify-content-between align-items-start mb-1">
                        <div class="me-2 flex-grow-1">
                          <div class="fw-medium text-truncate">{{ transaction.description }}</div>
                          <div class="d-flex align-items-center flex-wrap gap-1 mt-1">
                            <span class="badge bg-light text-dark">{{
                              transaction.category
                            }}</span>
                            <span
                              class="badge"
                              :class="transaction.type === 'income' ? 'bg-success' : 'bg-danger'"
                            >
                              {{ transaction.type }}
                            </span>
                          </div>
                        </div>
                        <div class="text-end flex-shrink-0">
                          <span
                            class="fw-bold d-block small"
                            :class="transaction.type === 'income' ? 'text-success' : 'text-danger'"
                          >
                            {{ transaction.type === 'expense' ? '-' : '+'
                            }}{{ formatCurrency(transaction.amount) }}
                          </span>
                          <small class="text-muted">{{ formatDate(transaction.date) }}</small>
                        </div>
                        <div class="tombol mx-2 d-flex gap-1">
                          <button
                            class="btn btn-primary btn-sm"
                            @click="editTransaction(transaction)"
                            data-bs-toggle="modal"
                            data-bs-target="#transactionModal"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button
                            class="btn btn-danger btn-sm"
                            @click="confirmDelete(transaction.id)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredTransactions.length === 0" class="empty-state py-4">
                <i class="bi bi-inbox text-muted"></i>
                <h6 class="text-muted mt-3">No transactions found</h6>
                <p class="text-muted small">Try adjusting your filters or add a new transaction.</p>
                <button
                  class="btn btn-primary btn-sm"
                  @click="openAddModal"
                  data-bs-toggle="modal"
                  data-bs-target="#transactionModal"
                >
                  Add Transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Transaction Modal -->
      <div class="modal fade" id="transactionModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">
                {{ editingTransaction ? 'Edit Transaction' : 'Add New Transaction' }}
              </h6>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="resetForm"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTransaction">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Type</label>
                  <div class="btn-group w-100" role="group">
                    <input
                      type="radio"
                      class="btn-check"
                      id="income-edit"
                      v-model="transactionForm.type"
                      value="income"
                    />
                    <label class="btn btn-outline-success" for="income-edit">
                      <i class="bi bi-arrow-up-circle me-1"></i>
                      Income
                    </label>
                    <input
                      type="radio"
                      class="btn-check"
                      id="expense-edit"
                      v-model="transactionForm.type"
                      value="expense"
                    />
                    <label class="btn btn-outline-danger" for="expense-edit">
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
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="resetForm"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveTransaction"
                :disabled="transactionsLoading"
              >
                <span
                  v-if="transactionsLoading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ editingTransaction ? 'Update' : 'Save' }} Transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import AppLayout from '@/components/common/AppLayout.vue'

// Use composables
const {
  transactions,
  loading: transactionsLoading,
  error: transactionsError,
  summary,
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = useTransactions()

const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
  getCategoriesByType,
} = useCategories()

// Filters
const filters = reactive({
  dateRange: 'this-month',
  category: '',
  type: '',
  search: '',
})

// Transaction form
const transactionForm = reactive({
  type: 'expense',
  amount: null,
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const editingTransaction = ref(null)

// Computed properties
const loading = computed(() => transactionsLoading.value || categoriesLoading.value)
const error = computed(() => transactionsError.value || categoriesError.value)

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((t) => t.type === filters.type)
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((t) => t.category === filters.category)
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        t.notes?.toLowerCase().includes(searchLower),
    )
  }

  // Filter by date range
  if (filters.dateRange !== 'custom') {
    const now = new Date()
    const startDate = new Date()

    switch (filters.dateRange) {
      case 'this-month':
        startDate.setDate(1)
        break
      case 'last-month':
        startDate.setMonth(now.getMonth() - 1)
        startDate.setDate(1)
        break
      case 'this-year':
        startDate.setMonth(0)
        startDate.setDate(1)
        break
    }

    filtered = filtered.filter((t) => new Date(t.date) >= startDate)
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
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

const resetForm = () => {
  Object.assign(transactionForm, {
    type: 'expense',
    amount: null,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  editingTransaction.value = null
}

const openAddModal = () => {
  resetForm()
}

const saveTransaction = async () => {
  try {
    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, transactionForm)
    } else {
      await addTransaction(transactionForm)
    }

    // Close modal and reset form
    const modal = document.getElementById('transactionModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    resetForm()
  } catch (err) {
    console.error('Failed to save transaction:', err)
    // Show error message to user
    alert('Failed to save transaction. Please try again.')
  }
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  Object.assign(transactionForm, {
    type: transaction.type,
    amount: parseFloat(transaction.amount),
    description: transaction.description,
    category: transaction.category,
    date: new Date(transaction.date).toISOString().split('T')[0],
    notes: transaction.notes || '',
  })
}

const confirmDelete = async (id) => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    try {
      await deleteTransaction(id)
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      alert('Failed to delete transaction. Please try again.')
    }
  }
}

const sortBy = (field, order) => {
  // This will be handled by the computed property
  // You can add sorting state if needed
}

// Watch for type changes to reset category
watch(
  () => transactionForm.type,
  () => {
    transactionForm.category = ''
  },
)

onMounted(async () => {
  // Fetch data when component mounts
  await Promise.all([fetchTransactions(), fetchCategories()])
})
</script>

<style scoped>
.net-card {
  background: linear-gradient(135deg, #ffffff 0%, #839ef5 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.income-card {
  background: linear-gradient(135deg, #ffffff 0%, #63e76a 100%);
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.expense-card {
  background: linear-gradient(135deg, #ffffff 0%, #e06565 100%);
  box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);
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
  transition: all 0.2s ease;
  border-radius: 0;
}

.transaction-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.transaction-item:last-child {
  border-bottom: none !important;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.btn {
  border-radius: 8px;
}

.badge {
  font-size: 0.7rem;
}

.modal-dialog-centered {
  margin: 1rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
}

/* Mobile specific styles */
@media (max-width: 576px) {
  .transaction-item {
    padding: 1rem !important;
  }

  .transaction-icon {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }

  .fw-medium {
    font-size: 0.9rem;
  }

  .modal-dialog {
    margin: 0.5rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .form-select-sm {
    font-size: 0.8rem;
  }

  .input-group-sm .form-control {
    font-size: 0.8rem;
  }

  .card-body {
    padding: 0.75rem;
  }

  .badge {
    font-size: 0.65rem;
    padding: 0.25em 0.5em;
  }
  .small {
    font-size: 0.95rem;
  }
}

/* Tablet styles */
@media (min-width: 577px) and (max-width: 768px) {
  .transaction-item {
    padding: 1.25rem !important;
  }
}

/* Collapsible filters for mobile */
@media (max-width: 767px) {
  #filtersCollapse:not(.show) {
    display: none !important;
  }
}

/* Smooth transitions */
.collapse {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.transaction-item .btn-sm:hover {
  transform: scale(1.05);
}
</style>
