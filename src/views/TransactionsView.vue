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

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="h3 mb-1">Transactions</h1>
              <p class="text-muted mb-0">Manage your income and expenses</p>
            </div>
            <button 
              class="btn btn-primary" 
              @click="openAddModal"
              data-bs-toggle="modal" 
              data-bs-target="#transactionModal"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">Date Range</label>
                  <select v-model="filters.dateRange" class="form-select">
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Category</label>
                  <select v-model="filters.category" class="form-select">
                    <option value="">All Categories</option>
                    <option v-for="category in categories" :key="category.id" :value="category.name">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Type</label>
                  <select v-model="filters.type" class="form-select">
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Search</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                    <input
                      v-model="filters.search"
                      type="text"
                      class="form-control"
                      placeholder="Search transactions..."
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-success">Total Income</h5>
              <h3 class="text-success">{{ formatCurrency(summary.totalIncome) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-danger">Total Expenses</h5>
              <h3 class="text-danger">{{ formatCurrency(summary.totalExpenses) }}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title text-primary">Net Amount</h5>
              <h3 :class="summary.netAmount >= 0 ? 'text-success' : 'text-danger'">
                {{ formatCurrency(summary.netAmount) }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Transaction History</h5>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary">
                  <i class="bi bi-download me-1"></i>
                  Export
                </button>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                    Sort by Date
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="sortBy('date', 'desc')">Newest First</a></li>
                    <li><a class="dropdown-item" href="#" @click="sortBy('date', 'asc')">Oldest First</a></li>
                    <li><a class="dropdown-item" href="#" @click="sortBy('amount', 'desc')">Highest Amount</a></li>
                    <li><a class="dropdown-item" href="#" @click="sortBy('amount', 'asc')">Lowest Amount</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th class="text-end">Amount</th>
                      <th class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                      <td>{{ formatDate(transaction.date) }}</td>
                      <td>
                        <div class="d-flex align-items-center">
                          <i :class="transaction.icon" :style="{ color: transaction.color }" class="me-2"></i>
                          {{ transaction.description }}
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-light text-dark">{{ transaction.category }}</span>
                      </td>
                      <td>
                        <span 
                          class="badge" 
                          :class="transaction.type === 'income' ? 'bg-success' : 'bg-danger'"
                        >
                          {{ transaction.type }}
                        </span>
                      </td>
                      <td class="text-end">
                        <span 
                          class="fw-bold"
                          :class="transaction.type === 'income' ? 'text-success' : 'text-danger'"
                        >
                          {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
                        </span>
                      </td>
                      <td class="text-center">
                        <div class="btn-group btn-group-sm">
                          <button 
                            class="btn btn-outline-primary" 
                            @click="editTransaction(transaction)"
                            data-bs-toggle="modal" 
                            data-bs-target="#transactionModal"
                          >
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button 
                            class="btn btn-outline-danger" 
                            @click="confirmDelete(transaction.id)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Empty State -->
              <div v-if="filteredTransactions.length === 0" class="text-center py-5">
                <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                <h5 class="text-muted mt-3">No transactions found</h5>
                <p class="text-muted">Try adjusting your filters or add a new transaction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Transaction Modal -->
      <div class="modal fade" id="transactionModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editingTransaction ? 'Edit Transaction' : 'Add New Transaction' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="resetForm"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTransaction">
                <div class="mb-3">
                  <label class="form-label">Type</label>
                  <div class="btn-group w-100" role="group">
                    <input type="radio" class="btn-check" id="income-edit" v-model="transactionForm.type" value="income">
                    <label class="btn btn-outline-success" for="income-edit">
                      <i class="bi bi-arrow-up-circle me-1"></i>
                      Income
                    </label>
                    <input type="radio" class="btn-check" id="expense-edit" v-model="transactionForm.type" value="expense">
                    <label class="btn btn-outline-danger" for="expense-edit">
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetForm">Cancel</button>
              <button 
                type="button" 
                class="btn btn-primary" 
                @click="saveTransaction"
                :disabled="transactionsLoading"
              >
                <span v-if="transactionsLoading" class="spinner-border spinner-border-sm me-2"></span>
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
  deleteTransaction
} = useTransactions()

const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
  getCategoriesByType
} = useCategories()

// Filters
const filters = reactive({
  dateRange: 'this-month',
  category: '',
  type: '',
  search: ''
})

// Transaction form
const transactionForm = reactive({
  type: 'expense',
  amount: null,
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: ''
})

const editingTransaction = ref(null)

// Computed properties
const loading = computed(() => transactionsLoading.value || categoriesLoading.value)
const error = computed(() => transactionsError.value || categoriesError.value)

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter(t => t.type === filters.type)
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(t => t.category === filters.category)
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower) ||
      t.notes?.toLowerCase().includes(searchLower)
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
    
    filtered = filtered.filter(t => new Date(t.date) >= startDate)
  }

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
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

const resetForm = () => {
  Object.assign(transactionForm, {
    type: 'expense',
    amount: null,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
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
    notes: transaction.notes || ''
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
watch(() => transactionForm.type, () => {
  transactionForm.category = ''
})

onMounted(async () => {
  // Fetch data when component mounts
  await Promise.all([
    fetchTransactions(),
    fetchCategories()
  ])
})
</script>

