<template>
  <AppLayout>
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1">Transactions</h1>
            <p class="text-muted mb-0">Manage your income and expenses</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#transactionModal">
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
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="income">Income</option>
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
                        <button class="btn btn-outline-primary" @click="editTransaction(transaction)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" @click="deleteTransaction(transaction.id)">
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
            <button type="button" class="btn btn-primary" @click="saveTransaction">
              {{ editingTransaction ? 'Update' : 'Save' }} Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'

// Sample data (will be replaced with Supabase data)
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
    color: '#28a745'
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
    color: '#dc3545'
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
    color: '#dc3545'
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
    color: '#28a745'
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
    color: '#dc3545'
  }
])

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

  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const summary = computed(() => {
  const totalIncome = filteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses
  }
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

const saveTransaction = () => {
  if (editingTransaction.value) {
    // Update existing transaction
    const index = transactions.value.findIndex(t => t.id === editingTransaction.value.id)
    if (index !== -1) {
      transactions.value[index] = {
        ...editingTransaction.value,
        ...transactionForm,
        date: new Date(transactionForm.date),
        icon: getTransactionIcon(transactionForm.category),
        color: transactionForm.type === 'income' ? '#28a745' : '#dc3545'
      }
    }
  } else {
    // Add new transaction
    const newTransaction = {
      id: Date.now(),
      ...transactionForm,
      date: new Date(transactionForm.date),
      icon: getTransactionIcon(transactionForm.category),
      color: transactionForm.type === 'income' ? '#28a745' : '#dc3545'
    }
    transactions.value.unshift(newTransaction)
  }

  // Close modal and reset form
  const modal = document.getElementById('transactionModal')
  const bsModal = bootstrap.Modal.getInstance(modal)
  bsModal.hide()
  resetForm()
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  Object.assign(transactionForm, {
    ...transaction,
    date: new Date(transaction.date).toISOString().split('T')[0]
  })
  
  const modal = new bootstrap.Modal(document.getElementById('transactionModal'))
  modal.show()
}

const deleteTransaction = (id) => {
  if (confirm('Are you sure you want to delete this transaction?')) {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value.splice(index, 1)
    }
  }
}

const sortBy = (field, order) => {
  transactions.value.sort((a, b) => {
    if (order === 'asc') {
      return a[field] > b[field] ? 1 : -1
    } else {
      return a[field] < b[field] ? 1 : -1
    }
  })
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

onMounted(() => {
  // TODO: Fetch transactions from Supabase
  console.log('Transactions view mounted')
})
</script>

