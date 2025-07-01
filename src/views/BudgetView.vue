<template>
  <AppLayout>
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1">Budget Management</h1>
            <p class="text-muted mb-0">Set and track your spending limits</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#budgetModal">
            <i class="bi bi-plus-circle me-2"></i>
            Create Budget
          </button>
        </div>
      </div>
    </div>

    <!-- Budget Overview -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Budget Period</label>
                <select v-model="budgetFilters.period" class="form-select">
                  <option value="current">Current Month</option>
                  <option value="next">Next Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Category Filter</label>
                <select v-model="budgetFilters.category" class="form-select">
                  <option value="">All Categories</option>
                  <option value="food">Food & Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="shopping">Shopping</option>
                  <option value="bills">Bills & Utilities</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Status Filter</label>
                <select v-model="budgetFilters.status" class="form-select">
                  <option value="">All Status</option>
                  <option value="on-track">On Track</option>
                  <option value="warning">Warning</option>
                  <option value="exceeded">Exceeded</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Search</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    v-model="budgetFilters.search"
                    type="text"
                    class="form-control"
                    placeholder="Search budgets..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-wallet2 text-primary" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Total Budget</h5>
            <h3 class="text-primary">{{ formatCurrency(budgetSummary.totalBudget) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-credit-card text-warning" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Total Spent</h5>
            <h3 class="text-warning">{{ formatCurrency(budgetSummary.totalSpent) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-piggy-bank text-success" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Remaining</h5>
            <h3 :class="budgetSummary.remaining >= 0 ? 'text-success' : 'text-danger'">
              {{ formatCurrency(budgetSummary.remaining) }}
            </h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <i class="bi bi-speedometer2 text-info" style="font-size: 2rem"></i>
            <h5 class="card-title mt-2">Usage Rate</h5>
            <h3 class="text-info">{{ budgetSummary.usageRate }}%</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Budget Cards -->
    <div class="row">
      <div class="col-12">
        <div class="row g-4">
          <div v-for="budget in filteredBudgets" :key="budget.id" class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="d-flex align-items-center">
                    <i
                      :class="budget.icon"
                      :style="{ color: budget.color }"
                      class="me-2"
                      style="font-size: 1.5rem"
                    ></i>
                    <div>
                      <h6 class="card-title mb-0">{{ budget.category }}</h6>
                      <small class="text-muted">{{ budget.period }}</small>
                    </div>
                  </div>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots"></i>
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item" href="#" @click="editBudget(budget)">Edit</a>
                      </li>
                      <li>
                        <a
                          class="dropdown-item text-danger"
                          href="#"
                          @click="deleteBudget(budget.id)"
                          >Delete</a
                        >
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Spent</span>
                    <span class="fw-bold"
                      >{{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.limit) }}</span
                    >
                  </div>
                  <div class="progress" style="height: 8px">
                    <div
                      class="progress-bar"
                      :class="getProgressBarClass(budget.percentage)"
                      :style="{ width: Math.min(budget.percentage, 100) + '%' }"
                    ></div>
                  </div>
                  <div class="d-flex justify-content-between mt-1">
                    <small class="text-muted">{{ budget.percentage }}% used</small>
                    <small :class="budget.remaining >= 0 ? 'text-success' : 'text-danger'">
                      {{ budget.remaining >= 0 ? 'Remaining: ' : 'Over by: '
                      }}{{ formatCurrency(Math.abs(budget.remaining)) }}
                    </small>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge" :class="getBudgetStatusClass(budget.percentage)">
                    {{ getBudgetStatus(budget.percentage) }}
                  </span>
                  <small class="text-muted">{{ budget.daysLeft }} days left</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredBudgets.length === 0" class="text-center py-5">
          <i class="bi bi-wallet text-muted" style="font-size: 3rem"></i>
          <h5 class="text-muted mt-3">No budgets found</h5>
          <p class="text-muted">Create your first budget to start tracking your expenses.</p>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#budgetModal">
            <i class="bi bi-plus-circle me-2"></i>
            Create Budget
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Budget Modal -->
    <div class="modal fade" id="budgetModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingBudget ? 'Edit Budget' : 'Create New Budget' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveBudget">
              <div class="mb-3">
                <label class="form-label">Category</label>
                <select v-model="budgetForm.category" class="form-select" required>
                  <option value="">Select Category</option>
                  <option value="food">Food & Dining</option>
                  <option value="transportation">Transportation</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="bills">Bills & Utilities</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Budget Limit</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="budgetForm.limit"
                    type="number"
                    class="form-control"
                    placeholder="0"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Period</label>
                <select v-model="budgetForm.period" class="form-select" required>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Start Date</label>
                <input v-model="budgetForm.startDate" type="date" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Alert Threshold (%)</label>
                <input
                  v-model.number="budgetForm.alertThreshold"
                  type="number"
                  class="form-control"
                  placeholder="80"
                  min="1"
                  max="100"
                />
                <small class="form-text text-muted"
                  >Get notified when you reach this percentage of your budget</small
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Notes (Optional)</label>
                <textarea
                  v-model="budgetForm.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Additional notes about this budget..."
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveBudget">
              {{ editingBudget ? 'Update' : 'Create' }} Budget
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

// Budget filters
const budgetFilters = reactive({
  period: 'current',
  category: '',
  status: '',
  search: '',
})

// Budget form
const budgetForm = reactive({
  category: '',
  limit: null,
  period: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
  alertThreshold: 80,
  notes: '',
})

const editingBudget = ref(null)

// Sample budget data
const budgets = ref([
  {
    id: 1,
    category: 'Food & Dining',
    limit: 2000000,
    spent: 1200000,
    period: 'January 2024',
    startDate: '2024-01-01',
    alertThreshold: 80,
    icon: 'bi bi-cart3',
    color: '#dc3545',
    daysLeft: 15,
  },
  {
    id: 2,
    category: 'Transportation',
    limit: 1000000,
    spent: 850000,
    period: 'January 2024',
    startDate: '2024-01-01',
    alertThreshold: 80,
    icon: 'bi bi-fuel-pump',
    color: '#fd7e14',
    daysLeft: 15,
  },
  {
    id: 3,
    category: 'Entertainment',
    limit: 500000,
    spent: 600000,
    period: 'January 2024',
    startDate: '2024-01-01',
    alertThreshold: 80,
    icon: 'bi bi-film',
    color: '#e83e8c',
    daysLeft: 15,
  },
  {
    id: 4,
    category: 'Shopping',
    limit: 800000,
    spent: 300000,
    period: 'January 2024',
    startDate: '2024-01-01',
    alertThreshold: 80,
    icon: 'bi bi-bag',
    color: '#6f42c1',
    daysLeft: 15,
  },
])

// Computed properties
const filteredBudgets = computed(() => {
  let filtered = [...budgets.value]

  // Add calculated fields
  filtered = filtered.map((budget) => ({
    ...budget,
    percentage: Math.round((budget.spent / budget.limit) * 100),
    remaining: budget.limit - budget.spent,
  }))

  // Filter by category
  if (budgetFilters.category) {
    filtered = filtered.filter((b) =>
      b.category.toLowerCase().includes(budgetFilters.category.toLowerCase()),
    )
  }

  // Filter by status
  if (budgetFilters.status) {
    filtered = filtered.filter((b) => {
      const status = getBudgetStatus(b.percentage).toLowerCase().replace(' ', '-')
      return status === budgetFilters.status
    })
  }

  // Filter by search
  if (budgetFilters.search) {
    const searchLower = budgetFilters.search.toLowerCase()
    filtered = filtered.filter(
      (b) =>
        b.category.toLowerCase().includes(searchLower) ||
        b.notes?.toLowerCase().includes(searchLower),
    )
  }

  return filtered
})

const budgetSummary = computed(() => {
  const totalBudget = budgets.value.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.value.reduce((sum, b) => sum + b.spent, 0)
  const remaining = totalBudget - totalSpent
  const usageRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return {
    totalBudget,
    totalSpent,
    remaining,
    usageRate,
  }
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const getBudgetStatus = (percentage) => {
  if (percentage >= 100) return 'Exceeded'
  if (percentage >= 80) return 'Warning'
  return 'On Track'
}

const getBudgetStatusClass = (percentage) => {
  if (percentage >= 100) return 'bg-danger'
  if (percentage >= 80) return 'bg-warning'
  return 'bg-success'
}

const getProgressBarClass = (percentage) => {
  if (percentage >= 100) return 'bg-danger'
  if (percentage >= 80) return 'bg-warning'
  return 'bg-success'
}

const resetForm = () => {
  Object.assign(budgetForm, {
    category: '',
    limit: null,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    alertThreshold: 80,
    notes: '',
  })
  editingBudget.value = null
}

const saveBudget = () => {
  if (editingBudget.value) {
    // Update existing budget
    const index = budgets.value.findIndex((b) => b.id === editingBudget.value.id)
    if (index !== -1) {
      budgets.value[index] = {
        ...editingBudget.value,
        ...budgetForm,
        icon: getBudgetIcon(budgetForm.category),
        color: getBudgetColor(budgetForm.category),
      }
    }
  } else {
    // Add new budget
    const newBudget = {
      id: Date.now(),
      ...budgetForm,
      spent: 0,
      period: getPeriodLabel(budgetForm.period, budgetForm.startDate),
      icon: getBudgetIcon(budgetForm.category),
      color: getBudgetColor(budgetForm.category),
      daysLeft: getDaysLeft(budgetForm.period, budgetForm.startDate),
    }
    budgets.value.push(newBudget)
  }

  // Close modal and reset form
  const modal = document.getElementById('budgetModal')
  const bsModal = bootstrap.Modal.getInstance(modal)
  bsModal.hide()
  resetForm()
}

const editBudget = (budget) => {
  editingBudget.value = budget
  Object.assign(budgetForm, {
    category: budget.category,
    limit: budget.limit,
    period: 'monthly', // Default, should be derived from budget data
    startDate: budget.startDate,
    alertThreshold: budget.alertThreshold,
    notes: budget.notes || '',
  })

  const modal = new bootstrap.Modal(document.getElementById('budgetModal'))
  modal.show()
}

const deleteBudget = (id) => {
  if (confirm('Are you sure you want to delete this budget?')) {
    const index = budgets.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      budgets.value.splice(index, 1)
    }
  }
}

const getBudgetIcon = (category) => {
  const icons = {
    food: 'bi bi-cart3',
    transportation: 'bi bi-fuel-pump',
    shopping: 'bi bi-bag',
    entertainment: 'bi bi-film',
    bills: 'bi bi-receipt',
    healthcare: 'bi bi-heart-pulse',
    education: 'bi bi-book',
    other: 'bi bi-circle',
  }
  return icons[category] || 'bi bi-circle'
}

const getBudgetColor = (category) => {
  const colors = {
    food: '#dc3545',
    transportation: '#fd7e14',
    shopping: '#6f42c1',
    entertainment: '#e83e8c',
    bills: '#20c997',
    healthcare: '#17a2b8',
    education: '#ffc107',
    other: '#6c757d',
  }
  return colors[category] || '#6c757d'
}

const getPeriodLabel = (period, startDate) => {
  const date = new Date(startDate)
  const month = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  switch (period) {
    case 'monthly':
      return month
    case 'quarterly':
      return `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`
    case 'yearly':
      return date.getFullYear().toString()
    default:
      return month
  }
}

const getDaysLeft = (period, startDate) => {
  const start = new Date(startDate)
  const now = new Date()
  let endDate = new Date(start)

  switch (period) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1)
      break
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3)
      break
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1)
      break
  }

  const diffTime = endDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

onMounted(() => {
  // TODO: Fetch budgets from Supabase
  console.log('Budget view mounted')
})
</script>
