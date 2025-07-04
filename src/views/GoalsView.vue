<template>
  <AppLayout>
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h1 class="h3 mb-1">Financial Goals</h1>
            <p class="text-muted mb-0">Set and track your financial objectives</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#goalModal">
            <i class="bi bi-plus-circle me-2"></i>
            Add Goal
          </button>
        </div>
      </div>
    </div>

    <!-- Goal Filters -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Goal Type</label>
                <select v-model="goalFilters.type" class="form-select">
                  <option value="">All Types</option>
                  <option value="savings">Savings</option>
                  <option value="debt">Debt Payoff</option>
                  <option value="investment">Investment</option>
                  <option value="purchase">Purchase</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Status</label>
                <select v-model="goalFilters.status" class="form-select">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Priority</label>
                <select v-model="goalFilters.priority" class="form-select">
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Search</label>
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    v-model="goalFilters.search"
                    type="text"
                    class="form-control"
                    placeholder="Search goals..."
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
      <div class="col-md-3 col-6 mb-3">
        <div class="card text-center h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <i class="bi bi-bullseye text-primary mb-2" style="font-size: 2rem"></i>
            <h5 class="card-title">Total Goals</h5>
            <h4 class="text-primary mb-0">{{ goalSummary.totalGoals }}</h4>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6 mb-3">
        <div class="card text-center h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <i class="bi bi-check-circle text-success mb-2" style="font-size: 2rem"></i>
            <h5 class="card-title">Completed</h5>
            <h4 class="text-success mb-0">{{ goalSummary.completedGoals }}</h4>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6 mb-3">
        <div class="card text-center h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <i class="bi bi-piggy-bank text-info mb-2" style="font-size: 2rem"></i>
            <h5 class="card-title">Total Target</h5>
            <h4 class="text-info mb-0">{{ formatCurrency(goalSummary.totalTarget) }}</h4>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6 mb-3">
        <div class="card text-center h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <i class="bi bi-graph-up text-warning mb-2" style="font-size: 2rem"></i>
            <h5 class="card-title">Total Saved</h5>
            <h4 class="text-warning mb-0">{{ formatCurrency(goalSummary.totalSaved) }}</h4>
          </div>
        </div>
      </div>
    </div>

    <!-- Goals Grid -->
    <div class="row">
      <div class="col-12">
        <div class="row g-4">
          <div v-for="goal in filteredGoals" :key="goal.id" class="col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="d-flex align-items-center">
                    <i
                      :class="goal.icon"
                      :style="{ color: goal.color }"
                      class="me-2"
                      style="font-size: 1.5rem"
                    ></i>
                    <div>
                      <h6 class="card-title mb-0">{{ goal.title }}</h6>
                      <small class="text-muted">{{ goal.type }}</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge" :class="getPriorityClass(goal.priority)">
                      {{ goal.priority }}
                    </span>
                    <div class="dropdown">
                      <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li>
                          <a class="dropdown-item" href="#" @click="addProgress(goal)"
                            >Add Progress</a
                          >
                        </li>
                        <li><a class="dropdown-item" href="#" @click="editGoal(goal)">Edit</a></li>
                        <li><hr class="dropdown-divider" /></li>
                        <li>
                          <a class="dropdown-item text-danger" href="#" @click="deleteGoal(goal.id)"
                            >Delete</a
                          >
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <p class="text-muted small mb-3">{{ goal.description }}</p>

                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted">Progress</span>
                    <span class="fw-bold"
                      >{{ formatCurrency(goal.currentAmount) }} /
                      {{ formatCurrency(goal.targetAmount) }}</span
                    >
                  </div>
                  <div class="progress" style="height: 8px">
                    <div
                      class="progress-bar bg-success"
                      :style="{ width: Math.min(goal.percentage, 100) + '%' }"
                    ></div>
                  </div>
                  <div class="d-flex justify-content-between mt-1">
                    <small class="text-muted">{{ goal.percentage }}% completed</small>
                    <small class="text-muted"
                      >{{ formatCurrency(goal.remainingAmount) }} to go</small
                    >
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <small class="text-muted d-block">Target Date</small>
                    <span class="fw-bold">{{ formatDate(goal.targetDate) }}</span>
                  </div>
                  <div class="text-end">
                    <small class="text-muted d-block">Days Left</small>
                    <span
                      class="fw-bold"
                      :class="goal.daysLeft < 30 ? 'text-danger' : 'text-success'"
                    >
                      {{ goal.daysLeft }} days
                    </span>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge" :class="getStatusClass(goal.status)">
                    {{ goal.status }}
                  </span>
                  <button class="btn btn-sm btn-outline-primary" @click="addProgress(goal)">
                    <i class="bi bi-plus-circle me-1"></i>
                    Add Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredGoals.length === 0" class="text-center py-5">
          <i class="bi bi-target text-muted" style="font-size: 3rem"></i>
          <h5 class="text-muted mt-3">No goals found</h5>
          <p class="text-muted">Set your first financial goal to start tracking your progress.</p>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#goalModal">
            <i class="bi bi-plus-circle me-2"></i>
            Add Goal
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Goal Modal -->
    <div class="modal fade" id="goalModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingGoal ? 'Edit Goal' : 'Add New Goal' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveGoal">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Goal Title</label>
                    <input
                      v-model="goalForm.title"
                      type="text"
                      class="form-control"
                      placeholder="e.g., Emergency Fund"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Goal Type</label>
                    <select v-model="goalForm.type" class="form-select" required>
                      <option value="">Select Type</option>
                      <option value="savings">Savings</option>
                      <option value="debt">Debt Payoff</option>
                      <option value="investment">Investment</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  v-model="goalForm.description"
                  class="form-control"
                  rows="2"
                  placeholder="Describe your goal..."
                ></textarea>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Target Amount</label>
                    <div class="input-group">
                      <span class="input-group-text">Rp</span>
                      <input
                        v-model.number="goalForm.targetAmount"
                        type="number"
                        class="form-control"
                        placeholder="0"
                        required
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Current Amount</label>
                    <div class="input-group">
                      <span class="input-group-text">Rp</span>
                      <input
                        v-model.number="goalForm.currentAmount"
                        type="number"
                        class="form-control"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Target Date</label>
                    <input
                      v-model="goalForm.targetDate"
                      type="date"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Priority</label>
                    <select v-model="goalForm.priority" class="form-select" required>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Monthly Contribution (Optional)</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="goalForm.monthlyContribution"
                    type="number"
                    class="form-control"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <small class="form-text text-muted"
                  >Suggested amount to save monthly to reach your goal</small
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Notes (Optional)</label>
                <textarea
                  v-model="goalForm.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Additional notes about this goal..."
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveGoal">
              {{ editingGoal ? 'Update' : 'Save' }} Goal
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Progress Modal -->
    <div class="modal fade" id="progressModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add Progress</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedGoal" class="mb-3">
              <h6>{{ selectedGoal.title }}</h6>
              <p class="text-muted small">
                Current: {{ formatCurrency(selectedGoal.currentAmount) }} /
                {{ formatCurrency(selectedGoal.targetAmount) }}
              </p>
            </div>

            <form @submit.prevent="saveProgress">
              <div class="mb-3">
                <label class="form-label">Amount to Add</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="progressForm.amount"
                    type="number"
                    class="form-control"
                    placeholder="0"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Date</label>
                <input v-model="progressForm.date" type="date" class="form-control" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Notes (Optional)</label>
                <textarea
                  v-model="progressForm.notes"
                  class="form-control"
                  rows="2"
                  placeholder="Notes about this progress..."
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="saveProgress">
              Add Progress
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

// Goal filters
const goalFilters = reactive({
  type: '',
  status: '',
  priority: '',
  search: '',
})

// Goal form
const goalForm = reactive({
  title: '',
  type: '',
  description: '',
  targetAmount: null,
  currentAmount: 0,
  targetDate: '',
  priority: 'medium',
  monthlyContribution: null,
  notes: '',
})

// Progress form
const progressForm = reactive({
  amount: null,
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const editingGoal = ref(null)
const selectedGoal = ref(null)

// Sample goals data
const goals = ref([
  {
    id: 1,
    title: 'Emergency Fund',
    type: 'savings',
    description: 'Build emergency fund for 6 months expenses',
    targetAmount: 50000000,
    currentAmount: 15000000,
    targetDate: '2024-12-31',
    priority: 'high',
    status: 'active',
    monthlyContribution: 2500000,
    icon: 'bi bi-shield-check',
    color: '#28a745',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    title: 'New Laptop',
    type: 'purchase',
    description: 'Save for MacBook Pro for work',
    targetAmount: 25000000,
    currentAmount: 8000000,
    targetDate: '2024-06-30',
    priority: 'medium',
    status: 'active',
    monthlyContribution: 3000000,
    icon: 'bi bi-laptop',
    color: '#007bff',
    createdAt: '2024-01-01',
  },
  {
    id: 3,
    title: 'Vacation Fund',
    type: 'savings',
    description: 'Family vacation to Japan',
    targetAmount: 30000000,
    currentAmount: 30000000,
    targetDate: '2024-03-31',
    priority: 'low',
    status: 'completed',
    monthlyContribution: 2000000,
    icon: 'bi bi-airplane',
    color: '#17a2b8',
    createdAt: '2023-10-01',
  },
  {
    id: 4,
    title: 'Investment Portfolio',
    type: 'investment',
    description: 'Build diversified investment portfolio',
    targetAmount: 100000000,
    currentAmount: 25000000,
    targetDate: '2025-12-31',
    priority: 'high',
    status: 'active',
    monthlyContribution: 4000000,
    icon: 'bi bi-graph-up',
    color: '#ffc107',
    createdAt: '2024-01-01',
  },
])

// Computed properties
const filteredGoals = computed(() => {
  let filtered = [...goals.value]

  // Add calculated fields
  filtered = filtered.map((goal) => ({
    ...goal,
    percentage: Math.round((goal.currentAmount / goal.targetAmount) * 100),
    remainingAmount: goal.targetAmount - goal.currentAmount,
    daysLeft: getDaysLeft(goal.targetDate),
  }))

  // Filter by type
  if (goalFilters.type) {
    filtered = filtered.filter((g) => g.type === goalFilters.type)
  }

  // Filter by status
  if (goalFilters.status) {
    filtered = filtered.filter((g) => g.status === goalFilters.status)
  }

  // Filter by priority
  if (goalFilters.priority) {
    filtered = filtered.filter((g) => g.priority === goalFilters.priority)
  }

  // Filter by search
  if (goalFilters.search) {
    const searchLower = goalFilters.search.toLowerCase()
    filtered = filtered.filter(
      (g) =>
        g.title.toLowerCase().includes(searchLower) ||
        g.description.toLowerCase().includes(searchLower) ||
        g.notes?.toLowerCase().includes(searchLower),
    )
  }

  return filtered.sort((a, b) => {
    // Sort by priority first, then by target date
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return new Date(a.targetDate) - new Date(b.targetDate)
  })
})

const goalSummary = computed(() => {
  const totalGoals = goals.value.length
  const completedGoals = goals.value.filter((g) => g.status === 'completed').length
  const totalTarget = goals.value.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalSaved = goals.value.reduce((sum, g) => sum + g.currentAmount, 0)

  return {
    totalGoals,
    completedGoals,
    totalTarget,
    totalSaved,
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

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

const getDaysLeft = (targetDate) => {
  const now = new Date()
  const target = new Date(targetDate)
  const diffTime = target - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

const getPriorityClass = (priority) => {
  const classes = {
    high: 'bg-danger',
    medium: 'bg-warning',
    low: 'bg-secondary',
  }
  return classes[priority] || 'bg-secondary'
}

const getStatusClass = (status) => {
  const classes = {
    active: 'bg-success',
    completed: 'bg-primary',
    paused: 'bg-warning',
  }
  return classes[status] || 'bg-secondary'
}

const resetForm = () => {
  Object.assign(goalForm, {
    title: '',
    type: '',
    description: '',
    targetAmount: null,
    currentAmount: 0,
    targetDate: '',
    priority: 'medium',
    monthlyContribution: null,
    notes: '',
  })
  editingGoal.value = null
}

const resetProgressForm = () => {
  Object.assign(progressForm, {
    amount: null,
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  selectedGoal.value = null
}

const saveGoal = () => {
  if (editingGoal.value) {
    // Update existing goal
    const index = goals.value.findIndex((g) => g.id === editingGoal.value.id)
    if (index !== -1) {
      goals.value[index] = {
        ...editingGoal.value,
        ...goalForm,
        icon: getGoalIcon(goalForm.type),
        color: getGoalColor(goalForm.type),
      }
    }
  } else {
    // Add new goal
    const newGoal = {
      id: Date.now(),
      ...goalForm,
      status: 'active',
      icon: getGoalIcon(goalForm.type),
      color: getGoalColor(goalForm.type),
      createdAt: new Date().toISOString().split('T')[0],
    }
    goals.value.push(newGoal)
  }

  // Close modal and reset form
  const modal = document.getElementById('goalModal')
  const bsModal = bootstrap.Modal.getInstance(modal)
  bsModal.hide()
  resetForm()
}

const editGoal = (goal) => {
  editingGoal.value = goal
  Object.assign(goalForm, {
    title: goal.title,
    type: goal.type,
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    targetDate: goal.targetDate,
    priority: goal.priority,
    monthlyContribution: goal.monthlyContribution,
    notes: goal.notes || '',
  })

  const modal = new bootstrap.Modal(document.getElementById('goalModal'))
  modal.show()
}

const deleteGoal = (id) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    const index = goals.value.findIndex((g) => g.id === id)
    if (index !== -1) {
      goals.value.splice(index, 1)
    }
  }
}

const addProgress = (goal) => {
  selectedGoal.value = goal
  resetProgressForm()

  const modal = new bootstrap.Modal(document.getElementById('progressModal'))
  modal.show()
}

const saveProgress = () => {
  if (selectedGoal.value && progressForm.amount > 0) {
    // Update goal's current amount
    const index = goals.value.findIndex((g) => g.id === selectedGoal.value.id)
    if (index !== -1) {
      goals.value[index].currentAmount += progressForm.amount

      // Check if goal is completed
      if (goals.value[index].currentAmount >= goals.value[index].targetAmount) {
        goals.value[index].status = 'completed'
      }
    }

    // TODO: Save progress entry to database for history tracking

    // Close modal and reset form
    const modal = document.getElementById('progressModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    resetProgressForm()
  }
}

const getGoalIcon = (type) => {
  const icons = {
    savings: 'bi bi-piggy-bank',
    debt: 'bi bi-credit-card',
    investment: 'bi bi-graph-up',
    purchase: 'bi bi-bag',
  }
  return icons[type] || 'bi bi-target'
}

const getGoalColor = (type) => {
  const colors = {
    savings: '#28a745',
    debt: '#dc3545',
    investment: '#ffc107',
    purchase: '#007bff',
  }
  return colors[type] || '#6c757d'
}

onMounted(() => {
  // TODO: Fetch goals from Supabase
  console.log('Goals view mounted')
})
</script>

<style scoped>
.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  border-radius: 10px;
}

.badge {
  font-size: 0.75rem;
}
</style>
