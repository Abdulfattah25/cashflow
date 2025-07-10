<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useBudgets } from '@/composables/useBudgets'
import { useCategories } from '@/composables/useCategories'
import AppLayout from '@/components/common/AppLayout.vue'

// Use composables
const {
  budgets,
  loading,
  error,
  budgetSummary,
  fetchBudgets,
  addBudget,
  updateBudget,
  deleteBudget
} = useBudgets()

const {
  categories,
  fetchCategories,
  getCategoriesByType
} = useCategories()

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

// Computed properties
const expenseCategories = computed(() => getCategoriesByType('expense'))

const filteredBudgets = computed(() => {
  let filtered = [...budgets.value]

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
        b.name?.toLowerCase().includes(searchLower),
    )
  }

  return filtered
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

const saveBudget = async () => {
  try {
    if (editingBudget.value) {
      await updateBudget(editingBudget.value.id, budgetForm)
    } else {
      await addBudget(budgetForm)
    }

    // Close modal and reset form
    const modal = document.getElementById('budgetModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    resetForm()

  } catch (err) {
    console.error('Failed to save budget:', err)
    alert('Failed to save budget. Please try again.')
  }
}

const editBudget = (budget) => {
  editingBudget.value = budget
  Object.assign(budgetForm, {
    category: budget.category,
    limit: budget.amount,
    period: budget.period,
    startDate: budget.start_date,
    alertThreshold: 80,
    notes: budget.notes || '',
  })

  const modal = new bootstrap.Modal(document.getElementById('budgetModal'))
  modal.show()
}

const confirmDeleteBudget = async (id) => {
  if (confirm('Are you sure you want to delete this budget?')) {
    try {
      await deleteBudget(id)
    } catch (err) {
      console.error('Failed to delete budget:', err)
      alert('Failed to delete budget. Please try again.')
    }
  }
}

onMounted(async () => {
  await Promise.all([
    fetchBudgets(),
    fetchCategories()
  ])
})
</script>

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
              <h4 class="mb-1">Budget Management</h4>
              <p class="text-muted mb-0 small">Set and track your spending limits</p>
            </div>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#budgetModal">
              <i class="bi bi-plus-circle me-1"></i>
              <span class="d-none d-sm-inline">Create Budget</span>
              <span class="d-sm-none">Create</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-3 g-2">
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card summary-card total-budget border-0">
            <div class="card-body p-3 text-center">
              <i class="bi bi-wallet2 summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Total Budget</h6>
              <h5 class="mb-0">{{ formatCurrency(budgetSummary.totalBudget) }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card summary-card total-spent border-0">
            <div class="card-body p-3 text-center">
              <i class="bi bi-credit-card summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Total Spent</h6>
              <h5 class="mb-0">{{ formatCurrency(budgetSummary.totalSpent) }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card summary-card remaining border-0">
            <div class="card-body p-3 text-center">
              <i class="bi bi-piggy-bank summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Remaining</h6>
              <h5 class="mb-0" :class="budgetSummary.remaining >= 0 ? 'text-dark' : 'text-danger'">
                {{ formatCurrency(budgetSummary.remaining) }}
              </h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card summary-card usage-rate border-0">
            <div class="card-body p-3 text-center">
              <i class="bi bi-speedometer2 summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Usage Rate</h6>
              <h5 class="mb-0">{{ budgetSummary.usageRate }}%</h5>
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
                    <label class="form-label small fw-medium">Budget Period</label>
                    <select v-model="budgetFilters.period" class="form-select form-select-sm">
                      <option value="current">Current Month</option>
                      <option value="next">Next Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Category</label>
                    <select v-model="budgetFilters.category" class="form-select form-select-sm">
                      <option value="">All Categories</option>
                      <option v-for="category in expenseCategories" :key="category.id" :value="category.name">
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Status</label>
                    <select v-model="budgetFilters.status" class="form-select form-select-sm">
                      <option value="">All Status</option>
                      <option value="on-track">On Track</option>
                      <option value="warning">Warning</option>
                      <option value="exceeded">Exceeded</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Search</label>
                    <div class="input-group input-group-sm">
                      <span class="input-group-text">
                        <i class="bi bi-search"></i>
                      </span>
                      <input
                        v-model="budgetFilters.search"
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

      <!-- Budget Cards -->
      <div class="row">
        <div class="col-12">
          <div class="row g-2">
            <div v-for="budget in filteredBudgets" :key="budget.id" class="col-12 col-md-6 col-lg-4">
              <div class="card budget-card border-0 h-100">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center flex-grow-1">
                      <i
                        :class="budget.icon"
                        :style="{ color: budget.color }"
                        class="me-2 budget-icon"
                      ></i>
                      <div class="flex-grow-1 min-w-0">
                        <h6 class="card-title mb-0 text-truncate">{{ budget.category }}</h6>
                        <small class="text-muted">{{ budget.period }}</small>
                      </div>
                    </div>
                    <div class="dropdown">
                      <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a class="dropdown-item" href="#" @click="editBudget(budget)">
                            <i class="bi bi-pencil me-2"></i>Edit
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="#"
                            @click="confirmDeleteBudget(budget.id)"
                          >
                            <i class="bi bi-trash me-2"></i>Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div class="mb-3">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted small">Spent</span>
                      <span class="fw-bold small">
                        {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount) }}
                      </span>
                    </div>
                    <div class="progress mb-2" style="height: 8px">
                      <div
                        class="progress-bar"
                        :class="getProgressBarClass(budget.percentage)"
                        :style="{ width: Math.min(budget.percentage, 100) + '%' }"
                      ></div>
                    </div>
                    <div class="d-flex justify-content-between">
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
          <div v-if="filteredBudgets.length === 0" class="col-12">
            <div class="empty-state py-4">
              <i class="bi bi-wallet text-muted"></i>
              <h6 class="text-muted mt-3">No budgets found</h6>
              <p class="text-muted small">Create your first budget to start tracking your expenses.</p>
              <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#budgetModal">
                <i class="bi bi-plus-circle me-2"></i>
                Create Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Budget Modal -->
      <div class="modal fade" id="budgetModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">{{ editingBudget ? 'Edit Budget' : 'Create New Budget' }}</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="resetForm"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveBudget">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Category</label>
                  <select v-model="budgetForm.category" class="form-select" required>
                    <option value="">Select Category</option>
                    <option v-for="category in expenseCategories" :key="category.id" :value="category.name">
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Budget Limit</label>
                  <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input
                      v-model.number="budgetForm.limit"
                      type="number"
                      class="form-control form-control-lg"
                      placeholder="0"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Period</label>
                  <select v-model="budgetForm.period" class="form-select" required>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Start Date</label>
                  <input v-model="budgetForm.startDate" type="date" class="form-control" required />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Alert Threshold (%)</label>
                  <input
                    v-model.number="budgetForm.alertThreshold"
                    type="number"
                    class="form-control"
                    placeholder="80"
                    min="1"
                    max="100"
                  />
                  <small class="form-text text-muted">
                    Get notified when you reach this percentage of your budget
                  </small>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Notes (Optional)</label>
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetForm">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveBudget" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingBudget ? 'Update' : 'Create' }} Budget
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Summary Cards */
.summary-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.summary-card.total-budget {
  background: linear-gradient(135deg, #ffffff 0%, #63e76a 100%);
}

.summary-card.total-spent {
  background: linear-gradient(135deg, #ffffff 0%, #e06565 100%);
}

.summary-card.remaining {
  background: linear-gradient(135deg, #ffffff 0%, #839ef5 100%);
}

.summary-card.usage-rate {
  background: linear-gradient(135deg, #ffffff 0%, hsl(61, 82%, 67%) 100%);
}

.summary-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

/* Budget Cards */
.budget-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.budget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.budget-icon {
  font-size: 1.2rem;
}

.progress {
  border-radius: 4px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 4px;
  transition: width 0.6s ease;
}

.badge {
  font-size: 0.7rem;
  padding: 0.35em 0.65em;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* General Styles */
.card {
  border-radius: 12px;
}

.btn {
  border-radius: 8px;
}

.modal-dialog-centered {
  margin: 1rem;
}

/* Collapsible filters for mobile */
@media (max-width: 767px) {
  #filtersCollapse:not(.show) {
    display: none !important;
  }
}

/* Mobile specific styles */
@media (max-width: 576px) {
  .summary-card .card-body {
    padding: 0.75rem !important;
  }
  
  .summary-icon {
    font-size: 1.2rem;
  }
  
  .budget-card .card-body {
    padding: 0.75rem !important;
  }
  
  .budget-icon {
    font-size: 1rem;
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
  
  .progress {
    height: 6px !important;
  }
  
  .dropdown-menu {
    font-size: 0.85rem;
  }
  
  .text-truncate {
    max-width: 120px;
  }
}

/* Tablet styles */
@media (min-width: 577px) and (max-width: 768px) {
  .budget-card .card-body {
    padding: 1rem !important;
  }
  
  .summary-card .card-body {
    padding: 1rem !important;
  }
}

/* Medium screens - 2 columns for budget cards */
@media (min-width: 768px) and (max-width: 991px) {
  .budget-card {
    margin-bottom: 1rem;
  }
}

/* Smooth transitions */
.collapse {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.budget-card .btn-sm:hover {
  transform: scale(1.05);
}

/* Progress bar animations */
@keyframes progressAnimation {
  0% {
    width: 0%;
  }
  100% {
    width: var(--progress-width);
  }
}

.progress-bar {
  animation: progressAnimation 1s ease-in-out;
}

/* Status badge colors */
.bg-success {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
}

.bg-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14) !important;
}

.bg-danger {
  background: linear-gradient(135deg, #dc3545, #e83e8c) !important;
}

/* Responsive font sizes */
@media (max-width: 576px) {
  h4 {
    font-size: 1.1rem;
  }
  
  h5 {
    font-size: 1rem;
  }
  
  h6 {
    font-size: 0.9rem;
  }
  
  .small {
    font-size: 0.8rem;
  }
}

/* Loading and hover states */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card:hover .budget-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Custom scrollbar for mobile */
@media (max-width: 576px) {
  .modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }
  
  .modal-body::-webkit-scrollbar {
    width: 4px;
  }
  
  .modal-body::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }
  
  .modal-body::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
  
  .modal-body::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}
</style>
