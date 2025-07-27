<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useBudgets } from '@/composables/useBudgets'
import { useCategories } from '@/composables/useCategories'
import { useExpenseTypes } from '@/composables/useExpenseTypes'
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
  deleteBudget,
} = useBudgets()

const { categories, fetchCategories, getCategoriesByType } = useCategories()

const {
  expenseTypes,
  expenseItems,
  loading: expenseTypesLoading,
  error: expenseTypesError,
  expenseTypesWithItems,
  fetchExpenseTypes,
  fetchExpenseItems,
  addExpenseType,
  updateExpenseType,
  deleteExpenseType,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
} = useExpenseTypes()

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

// Expense Type form
const expenseTypeForm = reactive({
  name: '',
  color: '#6c757d',
  icon: 'bi-circle',
})

// Expense Item form
const expenseItemForm = reactive({
  expense_type_id: '',
  name: '',
})

const editingBudget = ref(null)
const editingExpenseType = ref(null)
const editingExpenseItem = ref(null)
const selectedExpenseType = ref(null)

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

const resetBudgetForm = () => {
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

const resetExpenseTypeForm = () => {
  Object.assign(expenseTypeForm, {
    name: '',
    color: '#6c757d',
    icon: 'bi-circle',
  })
  editingExpenseType.value = null
}

const resetExpenseItemForm = () => {
  Object.assign(expenseItemForm, {
    expense_type_id: '',
    name: '',
  })
  editingExpenseItem.value = null
  selectedExpenseType.value = null
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
    resetBudgetForm()
  } catch (err) {
    console.error('Failed to save budget:', err)
    alert('Failed to save budget. Please try again.')
  }
}

const saveExpenseType = async () => {
  try {
    if (editingExpenseType.value) {
      await updateExpenseType(editingExpenseType.value.id, expenseTypeForm)
    } else {
      await addExpenseType(expenseTypeForm)
    }

    // Close modal and reset form
    const modal = document.getElementById('expenseTypeModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    resetExpenseTypeForm()
  } catch (err) {
    console.error('Failed to save expense type:', err)
    alert('Failed to save expense type. Please try again.')
  }
}

const saveExpenseItem = async () => {
  try {
    if (editingExpenseItem.value) {
      await updateExpenseItem(editingExpenseItem.value.id, expenseItemForm)
    } else {
      await addExpenseItem(expenseItemForm)
    }

    // Close modal and reset form
    const modal = document.getElementById('expenseItemModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    resetExpenseItemForm()
  } catch (err) {
    console.error('Failed to save expense item:', err)
    alert('Failed to save expense item. Please try again.')
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

const editExpenseType = (expenseType) => {
  editingExpenseType.value = expenseType
  Object.assign(expenseTypeForm, {
    name: expenseType.name,
    color: expenseType.color,
    icon: expenseType.icon,
  })

  const modal = new bootstrap.Modal(document.getElementById('expenseTypeModal'))
  modal.show()
}

const editExpenseItem = (expenseItem) => {
  editingExpenseItem.value = expenseItem
  Object.assign(expenseItemForm, {
    expense_type_id: expenseItem.expense_type_id,
    name: expenseItem.name,
  })

  const modal = new bootstrap.Modal(document.getElementById('expenseItemModal'))
  modal.show()
}

const openAddItemModal = (expenseType) => {
  selectedExpenseType.value = expenseType
  expenseItemForm.expense_type_id = expenseType.id

  const modal = new bootstrap.Modal(document.getElementById('expenseItemModal'))
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

const confirmDeleteExpenseType = async (id) => {
  if (
    confirm(
      'Are you sure you want to delete this expense type? All related items will also be deleted.',
    )
  ) {
    try {
      await deleteExpenseType(id)
    } catch (err) {
      console.error('Failed to delete expense type:', err)
      alert('Failed to delete expense type. Please try again.')
    }
  }
}

const confirmDeleteExpenseItem = async (id) => {
  if (confirm('Are you sure you want to delete this expense item?')) {
    try {
      await deleteExpenseItem(id)
    } catch (err) {
      console.error('Failed to delete expense item:', err)
      alert('Failed to delete expense item. Please try again.')
    }
  }
}

onMounted(async () => {
  await Promise.all([fetchBudgets(), fetchCategories(), fetchExpenseTypes(), fetchExpenseItems()])

  // Initialize dropdown positioning for expense items
  const dropdowns = document.querySelectorAll('.expense-item-dropdown')
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener('show.bs.dropdown', function (e) {
      const button = e.target.querySelector('[data-bs-toggle="dropdown"]')
      const rect = button.getBoundingClientRect()
      const dropdownMenu = this.querySelector('.dropdown-menu')

      // Calculate position to ensure dropdown is visible
      let left = rect.left - dropdownMenu.offsetWidth + button.offsetWidth
      let top = rect.bottom + 5

      // Ensure dropdown doesn't go off-screen
      if (left < 10) {
        left = 10
      }
      if (left + dropdownMenu.offsetWidth > window.innerWidth - 10) {
        left = window.innerWidth - dropdownMenu.offsetWidth - 10
      }
      if (top + dropdownMenu.offsetHeight > window.innerHeight - 10) {
        top = rect.top - dropdownMenu.offsetHeight - 5
      }

      // Position dropdown outside the container
      dropdownMenu.style.position = 'fixed'
      dropdownMenu.style.top = top + 'px'
      dropdownMenu.style.left = left + 'px'
      dropdownMenu.style.zIndex = '9999'
      dropdownMenu.style.display = 'block'

      // Add body class to prevent overflow issues
      document.body.classList.add('dropdown-open')
    })

    dropdown.addEventListener('hidden.bs.dropdown', function (e) {
      // Remove body class when dropdown is closed
      document.body.classList.remove('dropdown-open')
    })
  })
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
            <button
              class="btn btn-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#budgetModal"
            >
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
                      <option
                        v-for="category in expenseCategories"
                        :key="category.id"
                        :value="category.name"
                      >
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
      <div class="row mb-4">
        <div class="col-12">
          <div class="row g-2">
            <div
              v-for="budget in filteredBudgets"
              :key="budget.id"
              class="col-12 col-md-6 col-lg-4"
            >
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

          <!-- Empty State for Budgets -->
          <div v-if="filteredBudgets.length === 0" class="col-12">
            <div class="empty-state py-4">
              <i class="bi bi-wallet text-muted"></i>
              <h6 class="text-muted mt-3">No budgets found</h6>
              <p class="text-muted small">
                Create your first budget to start tracking your expenses.
              </p>
              <button
                class="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#budgetModal"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Create Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- NEW SECTION: Expense Types Management -->
      <div class="row">
        <div class="col-12">
          <!-- Section Header -->
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 class="mb-1">Expense Types</h5>
              <p class="text-muted mb-0 small">Manage your expense categories and items</p>
            </div>
            <button
              class="btn btn-outline-primary btn-sm"
              data-bs-toggle="modal"
              data-bs-target="#expenseTypeModal"
            >
              <i class="bi bi-plus-circle me-1"></i>
              <span class="d-none d-sm-inline">Add Category</span>
              <span class="d-sm-none">Add</span>
            </button>
          </div>

          <!-- Loading State for Expense Types -->
          <div v-if="expenseTypesLoading" class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <!-- Error State for Expense Types -->
          <div v-if="expenseTypesError" class="alert alert-danger" role="alert">
            {{ expenseTypesError }}
          </div>

          <!-- Expense Types Cards -->
          <div class="row g-2">
            <div
              v-for="expenseType in expenseTypesWithItems"
              :key="expenseType.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <div class="card expense-type-card border-0 h-100">
                <div class="card-header bg-transparent border-0 pb-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center flex-grow-1 min-w-0">
                      <i
                        :class="expenseType.icon"
                        :style="{ color: expenseType.color }"
                        class="me-2 expense-type-icon flex-shrink-0"
                      ></i>
                      <h6 class="card-title mb-0 expense-type-title">{{ expenseType.name }}</h6>
                    </div>
                    <div class="dropdown flex-shrink-0">
                      <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <ul class="dropdown-menu dropdown-menu-end">
                        <li>
                          <a class="dropdown-item" href="#" @click="editExpenseType(expenseType)">
                            <i class="bi bi-pencil me-2"></i>Edit Category
                          </a>
                        </li>
                        <li>
                          <a class="dropdown-item" href="#" @click="openAddItemModal(expenseType)">
                            <i class="bi bi-plus me-2"></i>Add Item
                          </a>
                        </li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                          <a
                            class="dropdown-item text-danger"
                            href="#"
                            @click="confirmDeleteExpenseType(expenseType.id)"
                          >
                            <i class="bi bi-trash me-2"></i>Delete Category
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="card-body pt-0">
                  <!-- Items List -->
                  <div v-if="expenseType.items.length > 0" class="expense-items-list">
                    <div
                      v-for="item in expenseType.items"
                      :key="item.id"
                      class="d-flex justify-content-between align-items-center expense-item py-1"
                    >
                      <span class="expense-item-name flex-grow-1">{{ item.name }}</span>
                      <div class="dropdown flex-shrink-0">
                        <button
                          class="btn btn-sm btn-link text-muted p-0"
                          data-bs-toggle="dropdown"
                          data-bs-boundary="viewport"
                          data-bs-popper="static"
                        >
                          <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end expense-item-dropdown">
                          <li>
                            <a class="dropdown-item" href="#" @click="editExpenseItem(item)">
                              <i class="bi bi-pencil me-2"></i>Edit
                            </a>
                          </li>
                          <li>
                            <a
                              class="dropdown-item text-danger"
                              href="#"
                              @click="confirmDeleteExpenseItem(item.id)"
                            >
                              <i class="bi bi-trash me-2"></i>Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Empty State for Items -->
                  <div v-else class="text-center py-3">
                    <i class="bi bi-inbox text-muted" style="font-size: 2rem"></i>
                    <p class="text-muted small mb-2">No items yet</p>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="openAddItemModal(expenseType)"
                    >
                      <i class="bi bi-plus me-1"></i>Add First Item
                    </button>
                  </div>

                  <!-- Add Item Button -->
                  <div v-if="expenseType.items.length > 0" class="mt-2 pt-2 border-top">
                    <button
                      class="btn btn-sm btn-outline-primary w-100"
                      @click="openAddItemModal(expenseType)"
                    >
                      <i class="bi bi-plus me-1"></i>Add Item
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State for Expense Types -->
          <div v-if="expenseTypesWithItems.length === 0 && !expenseTypesLoading" class="col-12">
            <div class="empty-state py-4">
              <i class="bi bi-tags text-muted"></i>
              <h6 class="text-muted mt-3">No expense categories yet</h6>
              <p class="text-muted small">
                Create your first expense category to organize your spending items.
              </p>
              <button
                class="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#expenseTypeModal"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Create Category
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Modal -->
      <div class="modal fade" id="budgetModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">{{ editingBudget ? 'Edit Budget' : 'Create New Budget' }}</h6>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="resetBudgetForm"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveBudget">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Category</label>
                  <select v-model="budgetForm.category" class="form-select" required>
                    <option value="">Select Category</option>
                    <option
                      v-for="category in expenseCategories"
                      :key="category.id"
                      :value="category.name"
                    >
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
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="resetBudgetForm"
              >
                Cancel
              </button>
              <button type="button" class="btn btn-primary" @click="saveBudget" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingBudget ? 'Update' : 'Create' }} Budget
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Type Modal -->
      <div class="modal fade" id="expenseTypeModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">
                {{ editingExpenseType ? 'Edit Expense Category' : 'Create New Expense Category' }}
              </h6>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="resetExpenseTypeForm"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveExpenseType">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Category Name</label>
                  <input
                    v-model="expenseTypeForm.name"
                    type="text"
                    class="form-control"
                    placeholder="e.g., Food, Transportation, Healthcare"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Color</label>
                  <div class="d-flex align-items-center">
                    <input
                      v-model="expenseTypeForm.color"
                      type="color"
                      class="form-control form-control-color me-2"
                      style="width: 50px; height: 38px"
                    />
                    <input
                      v-model="expenseTypeForm.color"
                      type="text"
                      class="form-control"
                      placeholder="#6c757d"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Icon</label>
                  <div class="row g-2">
                    <div class="col-12">
                      <input
                        v-model="expenseTypeForm.icon"
                        type="text"
                        class="form-control"
                        placeholder="bi-circle"
                      />
                      <small class="form-text text-muted">
                        Use Bootstrap Icons class (e.g., bi-house, bi-car-front, bi-heart-pulse)
                      </small>
                    </div>
                  </div>

                  <!-- Icon Preview -->
                  <div class="mt-2 p-2 bg-light rounded text-center">
                    <i
                      :class="expenseTypeForm.icon"
                      :style="{ color: expenseTypeForm.color, fontSize: '1.5rem' }"
                    ></i>
                    <small class="d-block text-muted mt-1">Preview</small>
                  </div>

                  <!-- Common Icons -->
                  <div class="mt-2">
                    <small class="text-muted d-block mb-1">Quick select:</small>
                    <div class="d-flex flex-wrap gap-1">
                      <button
                        v-for="icon in [
                          'bi-house',
                          'bi-car-front',
                          'bi-heart-pulse',
                          'bi-bag',
                          'bi-cup-hot',
                          'bi-phone',
                          'bi-book',
                          'bi-controller',
                        ]"
                        :key="icon"
                        type="button"
                        class="btn btn-sm btn-outline-secondary"
                        @click="expenseTypeForm.icon = icon"
                      >
                        <i :class="icon"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="resetExpenseTypeForm"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveExpenseType"
                :disabled="expenseTypesLoading"
              >
                <span
                  v-if="expenseTypesLoading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ editingExpenseType ? 'Update' : 'Create' }} Category
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense Item Modal -->
      <div class="modal fade" id="expenseItemModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">
                {{ editingExpenseItem ? 'Edit Expense Item' : 'Add New Expense Item' }}
                <span v-if="selectedExpenseType" class="text-muted small">
                  to {{ selectedExpenseType.name }}
                </span>
              </h6>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="resetExpenseItemForm"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveExpenseItem">
                <div class="mb-3" v-if="!selectedExpenseType">
                  <label class="form-label small fw-medium">Category</label>
                  <select v-model="expenseItemForm.expense_type_id" class="form-select" required>
                    <option value="">Select Category</option>
                    <option
                      v-for="expenseType in expenseTypes"
                      :key="expenseType.id"
                      :value="expenseType.id"
                    >
                      {{ expenseType.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Item Name</label>
                  <input
                    v-model="expenseItemForm.name"
                    type="text"
                    class="form-control"
                    placeholder="e.g., Rice, Gasoline, Medicine"
                    required
                  />
                  <small class="form-text text-muted">
                    Enter specific items that belong to this category
                  </small>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="resetExpenseItemForm"
              >
                Cancel
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveExpenseItem"
                :disabled="expenseTypesLoading"
              >
                <span
                  v-if="expenseTypesLoading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ editingExpenseItem ? 'Update' : 'Add' }} Item
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

/* Expense Type Cards */
.expense-type-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.expense-type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.expense-type-icon {
  font-size: 1.2rem;
}

.expense-items-list {
  max-height: 200px;
  overflow-y: auto;
  position: relative;
}

.expense-item {
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.expense-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
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
  display: flex;
  align-items: center;
  min-height: calc(100vh - 1rem);
}

.modal-dialog {
  margin: 1rem auto;
  max-width: 500px;
  width: 100%;
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

  .budget-card .card-body,
  .expense-type-card .card-body {
    padding: 0.75rem !important;
  }

  .budget-icon,
  .expense-type-icon {
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

  .expense-items-list {
    max-height: 150px;
  }

  /* Mobile dropdown positioning */
  .expense-item-dropdown {
    position: fixed !important;
    z-index: 9999 !important;
    max-width: 200px;
  }

  .expense-item-dropdown .dropdown-menu {
    position: fixed !important;
    z-index: 9999 !important;
    max-width: 180px;
    font-size: 0.85rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
  }

  /* Ensure dropdown is always on top */
  .expense-item-dropdown .dropdown-menu.show {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  }

  /* Force dropdown to be visible */
  .expense-item-dropdown .dropdown-menu {
    display: none;
  }

  .expense-item-dropdown .dropdown-menu.show {
    display: block !important;
  }

  /* Mobile specific dropdown positioning */
  .expense-item-dropdown .dropdown-menu {
    position: fixed !important;
    z-index: 9999 !important;
    max-width: 180px;
    min-width: 120px;
    font-size: 0.85rem;
    padding: 0.25rem 0;
  }

  .expense-item-dropdown .dropdown-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
  .modal-dialog {
    margin: 0.5rem;
    max-width: none;
    width: calc(100% - 1rem);
  }

  .modal-dialog-centered {
    min-height: calc(100vh - 1rem);
    align-items: center;
  }

  .modal-content {
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }
}

/* Tablet styles */
@media (min-width: 577px) and (max-width: 768px) {
  .budget-card .card-body,
  .expense-type-card .card-body {
    padding: 1rem !important;
  }

  .summary-card .card-body {
    padding: 1rem !important;
  }
}

/* Medium screens - 2 columns for budget cards */
@media (min-width: 768px) and (max-width: 991px) {
  .budget-card,
  .expense-type-card {
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

.budget-card .btn-sm:hover,
.expense-type-card .btn-sm:hover {
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

.card:hover .budget-icon,
.card:hover .expense-type-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Custom scrollbar for mobile */
@media (max-width: 576px) {
  .modal-body {
    max-height: 70vh;
    overflow-y: auto;
  }

  .modal-body::-webkit-scrollbar,
  .expense-items-list::-webkit-scrollbar {
    width: 4px;
  }

  .modal-body::-webkit-scrollbar-track,
  .expense-items-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  .modal-body::-webkit-scrollbar-thumb,
  .expense-items-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }

  .modal-body::-webkit-scrollbar-thumb:hover,
  .expense-items-list::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

/* Color picker styles */
.form-control-color {
  border-radius: 6px;
  border: 1px solid #ced4da;
}

.form-control-color:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Icon preview styles */
.bg-light {
  background-color: #f8f9fa !important;
}

/* Quick select icons */
.gap-1 {
  gap: 0.25rem;
}

/* Expense items scrollbar */
.expense-items-list::-webkit-scrollbar {
  width: 4px;
}

.expense-items-list::-webkit-scrollbar-track {
  background: transparent;
}

.expense-items-list::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 2px;
}

.expense-items-list::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}

/* Dropdown improvements */
.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
}

/* Expense item dropdown specific styles */
.expense-item-dropdown {
  z-index: 9999 !important;
  position: fixed !important;
  transform: none !important;
  margin: 0 !important;
}

.expense-item-dropdown.show {
  display: block !important;
}

/* Override Bootstrap's default dropdown behavior */
.expense-item-dropdown .dropdown-menu {
  position: fixed !important;
  z-index: 9999 !important;
  transform: none !important;
  margin: 0 !important;
  display: none;
}

.expense-item-dropdown .dropdown-menu.show {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Ensure dropdown appears outside container */
.expense-items-list .dropdown {
  position: static;
}

.expense-items-list .dropdown-menu {
  position: absolute !important;
  z-index: 9999 !important;
}

/* Override any parent overflow settings */
.expense-type-card,
.expense-type-card .card-body,
.expense-items-list,
.expense-items-list * {
  overflow: visible !important;
}

/* Ensure dropdown is rendered in body */
.expense-item-dropdown {
  position: static !important;
}

.expense-item-dropdown .dropdown-menu {
  position: fixed !important;
  z-index: 9999 !important;
}

/* Prevent dropdown from being clipped */
.expense-items-list {
  overflow: visible !important;
}

.expense-items-list .dropdown-menu {
  overflow: visible !important;
  clip: auto !important;
}

/* Ensure dropdown is always visible */
.expense-item-dropdown .dropdown-menu {
  position: fixed !important;
  z-index: 9999 !important;
  max-height: none !important;
  overflow: visible !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
  background: white !important;
  border-radius: 8px !important;
  padding: 0.5rem 0 !important;
}

/* Ensure dropdown is always on top of everything */
.expense-item-dropdown .dropdown-menu {
  z-index: 99999 !important;
  position: fixed !important;
  transform: none !important;
  margin: 0 !important;
  display: none;
}

.expense-item-dropdown .dropdown-menu.show {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Desktop dropdown improvements */
@media (min-width: 768px) {
  .expense-item-dropdown .dropdown-menu {
    min-width: 150px;
    font-size: 0.9rem;
    padding: 0.5rem 0;
  }

  .expense-item-dropdown .dropdown-item {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Tablet dropdown improvements */
@media (min-width: 577px) and (max-width: 767px) {
  .expense-item-dropdown .dropdown-menu {
    min-width: 140px;
    font-size: 0.85rem;
    padding: 0.375rem 0;
  }

  .expense-item-dropdown .dropdown-item {
    padding: 0.5rem 0.875rem;
    font-size: 0.85rem;
  }
}

/* Override Bootstrap's overflow hidden on body when dropdown is open */
body.dropdown-open {
  overflow: visible !important;
}

/* Ensure dropdown container doesn't clip */
.expense-type-card {
  overflow: visible !important;
}

.expense-type-card .card-body {
  overflow: visible !important;
}

/* Ensure all parent containers don't clip dropdown */
.expense-type-card,
.expense-type-card .card-body,
.expense-items-list,
.expense-items-list *,
.card,
.card-body {
  overflow: visible !important;
}

/* Force dropdown to be rendered in body */
.expense-item-dropdown .dropdown-menu {
  position: fixed !important;
  z-index: 99999 !important;
  transform: none !important;
  margin: 0 !important;
  display: none;
}

.expense-item-dropdown .dropdown-menu.show {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Override any Bootstrap or other CSS that might hide dropdown */
.expense-item-dropdown .dropdown-menu {
  display: none !important;
}

.expense-item-dropdown .dropdown-menu.show {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.dropdown-item {
  border-radius: 4px;
  margin: 2px 4px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.dropdown-item.text-danger:hover {
  background-color: #f8d7da;
  color: #721c24 !important;
}

/* Form improvements */
.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Modal improvements */
.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  border-radius: 0 0 12px 12px;
}

/* Button improvements */
.btn-outline-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.btn-outline-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(108, 117, 125, 0.3);
}

/* Card header improvements */
.card-header.bg-transparent {
  background-color: transparent !important;
}

/* Expense type specific styles */
.expense-type-card .card-header {
  padding: 0.75rem 1rem 0.5rem 1rem;
}

.expense-type-card .card-body {
  padding: 0.5rem 1rem 1rem 1rem;
}

/* Border improvements */
.border-top {
  border-top: 1px solid #e9ecef !important;
}

/* Animation for new items */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expense-item {
  animation: fadeInUp 0.3s ease;
}

/* Hover effects for expense items */
.expense-item:hover .btn-link {
  opacity: 1;
}

.expense-item .btn-link {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

/* Loading spinner improvements */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Text truncation improvements */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive improvements for expense type cards */
@media (max-width: 576px) {
  .expense-type-card .card-header {
    padding: 0.5rem 0.75rem 0.25rem 0.75rem;
  }

  .expense-type-card .card-body {
    padding: 0.25rem 0.75rem 0.75rem 0.75rem;
  }

  .expense-type-icon {
    font-size: 1rem;
  }

  .expense-item {
    font-size: 0.85rem;
  }
}

/* Focus improvements */
.btn:focus,
.form-control:focus,
.form-select:focus {
  outline: none;
}

/* Accessibility improvements */
.btn[aria-expanded='true'] {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Print styles */
@media print {
  .btn,
  .dropdown,
  .modal {
    display: none !important;
  }

  .card {
    break-inside: avoid;
    box-shadow: none !important;
    border: 1px solid #dee2e6 !important;
  }
}
</style>
