<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useGoals } from '@/composables/useGoals'
import AppLayout from '@/components/common/AppLayout.vue'

// Use composables
const {
  goals,
  loading,
  error,
  goalSummary,
  fetchGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addProgress
} = useGoals()

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

// Computed properties
const filteredGoals = computed(() => {
  let filtered = [...goals.value]

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

const saveGoal = async () => {
  try {
    if (editingGoal.value) {
      await updateGoal(editingGoal.value.id, goalForm)
    } else {
      await addGoal(goalForm)
    }

    // Close modal and reset form
    const modal = document.getElementById('goalModal')
    const bsModal = bootstrap.Modal.getInstance(modal)
    bsModal.hide()
    resetForm()

  } catch (err) {
    console.error('Failed to save goal:', err)
    alert('Failed to save goal. Please try again.')
  }
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

const confirmDeleteGoal = async (id) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    try {
      await deleteGoal(id)
    } catch (err) {
      console.error('Failed to delete goal:', err)
      alert('Failed to delete goal. Please try again.')
    }
  }
}

const openProgressModal = (goal) => {
  selectedGoal.value = goal
  resetProgressForm()

  const modal = new bootstrap.Modal(document.getElementById('progressModal'))
  modal.show()
}

const saveProgress = async () => {
  try {
    if (selectedGoal.value && progressForm.amount > 0) {
      await addProgress(selectedGoal.value.id, progressForm.amount)

      // Close modal and reset form
      const modal = document.getElementById('progressModal')
      const bsModal = bootstrap.Modal.getInstance(modal)
      bsModal.hide()
      resetProgressForm()
    }
  } catch (err) {
    console.error('Failed to add progress:', err)
    alert('Failed to add progress. Please try again.')
  }
}

onMounted(async () => {
  await fetchGoals()
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
    <div v-else class="px-2 px-sm-3">
      <!-- Header -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="mb-1">Financial Goals</h4>
              <p class="text-muted mb-0 small">Set and track your financial objectives</p>
            </div>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#goalModal">
              <i class="bi bi-plus-circle me-1"></i>
              <span class="d-none d-sm-inline">Add Goal</span>
              <span class="d-sm-none">Add</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-3 g-2">
        <div class="col-6 col-md-3">
          <div class="card summary-card total-goals border-0 text-center">
            <div class="card-body p-3">
              <i class="bi bi-bullseye summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Total Goals</h6>
              <h5 class="mb-0">{{ goalSummary.totalGoals }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card summary-card completed-goals border-0 text-center">
            <div class="card-body p-3">
              <i class="bi bi-check-circle summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Completed</h6>
              <h5 class="mb-0">{{ goalSummary.completedGoals }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card summary-card total-target border-0 text-center">
            <div class="card-body p-3">
              <i class="bi bi-piggy-bank summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Total Target</h6>
              <h5 class="mb-0">{{ formatCurrency(goalSummary.totalTarget) }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card summary-card total-saved border-0 text-center">
            <div class="card-body p-3">
              <i class="bi bi-graph-up summary-icon mb-2"></i>
              <h6 class="card-title text-muted mb-1 small">Total Saved</h6>
              <h5 class="mb-0">{{ formatCurrency(goalSummary.totalSaved) }}</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Goal Filters -->
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
                    <label class="form-label small fw-medium">Goal Type</label>
                    <select v-model="goalFilters.type" class="form-select form-select-sm">
                      <option value="">All Types</option>
                      <option value="savings">Savings</option>
                      <option value="debt">Debt Payoff</option>
                      <option value="investment">Investment</option>
                      <option value="purchase">Purchase</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Status</label>
                    <select v-model="goalFilters.status" class="form-select form-select-sm">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Priority</label>
                    <select v-model="goalFilters.priority" class="form-select form-select-sm">
                      <option value="">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Search</label>
                    <div class="input-group input-group-sm">
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
      </div>

      <!-- Goals Grid -->
      <div class="row">
        <div class="col-12">
          <div class="row g-2">
            <div v-for="goal in filteredGoals" :key="goal.id" class="col-12 col-md-6 col-lg-4">
              <div class="card goal-card border-0 h-100">
                <div class="card-body p-3">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center flex-grow-1 min-w-0">
                      <i
                        :class="goal.icon"
                        :style="{ color: goal.color }"
                        class="me-2 goal-icon flex-shrink-0"
                      ></i>
                      <div class="flex-grow-1 min-w-0">
                        <h6 class="card-title mb-0 text-truncate">{{ goal.title }}</h6>
                        <small class="text-muted">{{ goal.type }}</small>
                      </div>
                    </div>
                    <div class="d-flex align-items-center gap-1">
                      <span class="badge priority-badge" :class="getPriorityClass(goal.priority)">
                        {{ goal.priority }}
                      </span>
                      <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-btn" data-bs-toggle="dropdown">
                          <i class="bi bi-three-dots"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                          <li>
                            <a class="dropdown-item" href="#" @click="openProgressModal(goal)">
                              <i class="bi bi-plus-circle me-2"></i>Add Progress
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item" href="#" @click="editGoal(goal)">
                              <i class="bi bi-pencil me-2"></i>Edit                            </a>
                          </li>
                          <li><hr class="dropdown-divider" /></li>
                          <li>
                            <a class="dropdown-item text-danger" href="#" @click="confirmDeleteGoal(goal.id)">
                              <i class="bi bi-trash me-2"></i>Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p class="text-muted small mb-3 goal-description">{{ goal.description }}</p>

                  <!-- Progress Section -->
                  <div class="progress-section mb-3">
                    <div class="d-flex justify-content-between mb-2">
                      <span class="text-muted small">Progress</span>
                      <span class="fw-bold small">{{ goal.percentage }}%</span>
                    </div>
                    <div class="progress mb-2" style="height: 8px">
                      <div
                        class="progress-bar progress-bar-animated"
                        :class="goal.percentage >= 100 ? 'bg-success' : goal.percentage >= 75 ? 'bg-info' : goal.percentage >= 50 ? 'bg-warning' : 'bg-primary'"
                        :style="{ width: Math.min(goal.percentage, 100) + '%' }"
                      ></div>
                    </div>
                    <div class="d-flex justify-content-between">
                      <small class="text-muted">{{ formatCurrency(goal.currentAmount) }}</small>
                      <small class="text-muted">{{ formatCurrency(goal.targetAmount) }}</small>
                    </div>
                  </div>

                  <!-- Goal Stats -->
                  <div class="goal-stats mb-3">
                    <div class="row g-2 text-center">
                      <div class="col-6">
                        <div class="stat-item">
                          <small class="text-muted d-block">Target Date</small>
                          <div class="fw-bold small">{{ formatDate(goal.targetDate) }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="stat-item">
                          <small class="text-muted d-block">Days Left</small>
                          <div class="fw-bold small" :class="goal.daysLeft < 30 ? 'text-danger' : 'text-success'">
                            {{ goal.daysLeft }} days
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Remaining Amount -->
                  <div class="remaining-section mb-3">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-muted small">Remaining</span>
                      <span class="fw-bold text-primary">{{ formatCurrency(goal.remainingAmount) }}</span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge status-badge" :class="getStatusClass(goal.status)">
                      {{ goal.status }}
                    </span>
                    <button class="btn btn-sm btn-primary" @click="openProgressModal(goal)">
                      <i class="bi bi-plus-circle me-1"></i>
                      <span class="d-none d-sm-inline">Add Progress</span>
                      <span class="d-sm-none">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredGoals.length === 0" class="empty-state py-4">
            <i class="bi bi-target text-muted"></i>
            <h6 class="text-muted mt-3">No goals found</h6>
            <p class="text-muted small">Set your first financial goal to start tracking your progress.</p>
            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#goalModal">
              <i class="bi bi-plus-circle me-2"></i>
              Add Goal
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Goal Modal -->
      <div class="modal fade" id="goalModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">{{ editingGoal ? 'Edit Goal' : 'Add New Goal' }}</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="resetForm"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveGoal">
                <div class="row">
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-medium">Goal Title</label>
                      <input
                        v-model="goalForm.title"
                        type="text"
                        class="form-control"
                        placeholder="e.g., Emergency Fund"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-medium">Goal Type</label>
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
                  <label class="form-label small fw-medium">Description</label>
                  <textarea
                    v-model="goalForm.description"
                    class="form-control"
                    rows="2"
                    placeholder="Describe your goal..."
                  ></textarea>
                </div>

                <div class="row">
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-medium">Target Amount</label>
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
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-medium">Current Amount</label>
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
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-medium">Target Date</label>
                      <input
                        v-model="goalForm.targetDate"
                        type="date"
                        class="form-control"
                        required
                      />
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label small fw-medium">Priority</label>
                      <select v-model="goalForm.priority" class="form-select" required>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Monthly Contribution (Optional)</label>
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
                  <small class="form-text text-muted">
                    Suggested amount to save monthly to reach your goal
                  </small>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Notes (Optional)</label>
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetForm">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveGoal" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ editingGoal ? 'Update' : 'Save' }} Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Progress Modal -->
      <div class="modal fade" id="progressModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">Add Progress</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="resetProgressForm"></button>
            </div>
            <div class="modal-body">
              <div v-if="selectedGoal" class="goal-info mb-3 p-3 bg-light rounded">
                <h6 class="mb-1">{{ selectedGoal.title }}</h6>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">
                    Current: {{ formatCurrency(selectedGoal.currentAmount) }}
                  </small>
                  <small class="text-muted">
                    Target: {{ formatCurrency(selectedGoal.targetAmount) }}
                  </small>
                </div>
                <div class="progress mt-2" style="height: 6px">
                  <div
                    class="progress-bar bg-primary"
                    :style="{ width: selectedGoal.percentage + '%' }"
                  ></div>
                </div>
              </div>

              <form @submit.prevent="saveProgress">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Amount to Add</label>
                  <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input
                      v-model.number="progressForm.amount"
                      type="number"
                      class="form-control form-control-lg"
                      placeholder="0"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Date</label>
                  <input v-model="progressForm.date" type="date" class="form-control" required />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Notes (Optional)</label>
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
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetProgressForm">Cancel</button>
              <button type="button" class="btn btn-primary" @click="saveProgress" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Add Progress
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

.summary-card.total-goals {
  background: linear-gradient(135deg, #ffffff 0%, #63e76a 100%);
}

.summary-card.completed-goals {
  background: linear-gradient(135deg, #ffffff 0%, #e06565 100%);
}

.summary-card.total-target {
  background: linear-gradient(135deg, #ffffff 0%, #839ef5 100%);
}

.summary-card.total-saved {
  background: linear-gradient(135deg, #ffffff 0%, hsl(61, 82%, 67%) 100%);
}

.summary-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

/* Goal Cards */
.goal-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.goal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.goal-icon {
  font-size: 1.2rem;
}

.goal-description {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

/* Progress Section */
.progress-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
}

.progress {
  border-radius: 4px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-bar-animated {
  animation: progress-bar-stripes 1s linear infinite;
}

/* Goal Stats */
.goal-stats {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
}

.stat-item {
  padding: 0.5rem;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

/* Remaining Section */
.remaining-section {
  padding: 0.5rem 0.75rem;
  background-color: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

/* Badges */
.priority-badge, .status-badge {
  font-size: 0.7rem;
  padding: 0.35em 0.65em;
  border-radius: 6px;
}

.priority-badge.bg-danger {
  background: linear-gradient(135deg, #dc3545, #e83e8c) !important;
}

.priority-badge.bg-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14) !important;
}

.priority-badge.bg-secondary {
  background: linear-gradient(135deg, #6c757d, #495057) !important;
}

.status-badge.bg-success {
  background: linear-gradient(135deg, #28a745, #20c997) !important;
}

.status-badge.bg-primary {
  background: linear-gradient(135deg, #007bff, #6610f2) !important;
}

.status-badge.bg-warning {
  background: linear-gradient(135deg, #ffc107, #fd7e14) !important;
}

/* Dropdown */
.dropdown-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: none;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 4px;
  margin: 0.125rem 0.5rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  width: 16px;
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

/* Modal Enhancements */
.modal-content {
  border-radius: 12px;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.modal-header {
  border-bottom: 1px solid #f0f0f0;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #f0f0f0;
  padding: 1rem 1.5rem;
}

.goal-info {
  border: 1px solid #e9ecef;
}

/* Form Enhancements */
.form-label {
  color: #495057;
  font-weight: 500;
}

.form-control, .form-select {
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control-lg {
  font-size: 1.1rem;
  font-weight: 500;
}

.input-group-text {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px 0 0 8px;
}

/* Button Enhancements */
.btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Card Enhancements */
.card {
  border-radius: 12px;
  border: none;
}

.card-header {
  background-color: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
}

/* Collapsible Filters */
.collapse {
  transition: all 0.3s ease;
}

.collapse:not(.show) {
  opacity: 0;
}

.collapse.show {
  opacity: 1;
}

/* Mobile Specific Styles */
@media (max-width: 576px) {
  .px-2 {
    padding-left: 0.75rem !important;
    padding-right: 0.75rem !important;
  }
  
  .mb-3 {
    margin-bottom: 0.75rem !important;
  }
  
  .g-2 > * {
    padding: 0.25rem;
  }
  
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
  
  .summary-card .card-body {
    padding: 0.75rem !important;
  }
  
  .summary-icon {
    font-size: 1.2rem;
  }
  
  .goal-card .card-body {
    padding: 1rem !important;
  }
  
  .goal-icon {
    font-size: 1rem;
  }
  
  .progress-section, .goal-stats, .remaining-section {
    padding: 0.5rem;
  }
  
  .stat-item {
    padding: 0.375rem;
  }
  
  .dropdown-btn {
    width: 28px;
    height: 28px;
  }
  
  .badge {
    font-size: 0.65rem;
    padding: 0.25em 0.5em;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .form-control, .form-select {
    font-size: 0.9rem;
  }
  
  .form-control-sm, .form-select-sm {
    font-size: 0.8rem;
  }
  
  .input-group-sm .input-group-text {
    font-size: 0.8rem;
  }
  
  .modal-dialog {
    margin: 0.5rem;
  }
  
  .modal-header, .modal-body, .modal-footer {
    padding: 1rem;
  }
  
  .goal-info {
    padding: 0.75rem !important;
  }
  
  .empty-state {
    padding: 2rem 1rem;
  }
  
  .empty-state i {
    font-size: 2.5rem;
  }
  
  .text-truncate {
    max-width: 120px;
  }
}

/* Tablet Styles */
@media (min-width: 577px) and (max-width: 768px) {
  .summary-card .card-body {
    padding: 1rem !important;
  }
  
  .goal-card .card-body {
    padding: 1.25rem !important;
  }
  
  .text-truncate {
    max-width: 150px;
  }
}

/* Large Mobile Landscape */
@media (max-width: 767px) and (orientation: landscape) {
  .summary-card .card-body {
    padding: 0.5rem !important;
  }
  
  .summary-icon {
    font-size: 1rem;
  }
  
  .goal-card .card-body {
    padding: 0.75rem !important;
  }
  
  .progress-section, .goal-stats, .remaining-section {
    padding: 0.375rem;
  }
}

/* Touch Improvements */
@media (max-width: 576px) {
  .btn {
    min-height: 38px;
    min-width: 38px;
  }
  
  .form-control, .form-select {
    min-height: 38px;
  }
  
  .dropdown-btn {
    min-height: 32px;
    min-width: 32px;
  }
}

/* Progress Bar Animations */
@keyframes progress-bar-stripes {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}

.progress-bar-animated {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
}

/* Hover Effects */
.goal-card:hover .goal-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.summary-card:hover .summary-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.stat-item:hover {
  background-color: #f0f8ff;
  border-color: #007bff;
  transition: all 0.2s ease;
}

/* Loading States */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

/* Custom Scrollbar */
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

/* Better Visual Hierarchy */
.card-title {
  line-height: 1.2;
}

.goal-description {
  color: #6c757d;
  line-height: 1.4;
}

/* Enhanced Focus States */
.btn:focus, .form-control:focus, .form-select:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Better Spacing */
.card-body > *:last-child {
  margin-bottom: 0;
}

.row.g-2 {
  --bs-gutter-x: 0.5rem;
  --bs-gutter-y: 0.5rem;
}

/* Improved Typography */
.fw-medium {
  font-weight: 500;
}

.text-muted {
  color: #6c757d !important;
}

/* Enhanced Borders */
.border-0 {
  border: none !important;
}

/* Better Shadows */
.card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

/* Responsive Grid */
@media (max-width: 576px) {
  .col-12.col-md-6.col-lg-4 {
    margin-bottom: 0.5rem;
  }
}

/* Enhanced Modal */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, -50px);
}

.modal.show .modal-dialog {
  transform: none;
}

/* Better Form Validation */
.form-control:invalid {
  border-color: #dc3545;
}

.form-control:valid {
  border-color: #28a745;
}

/* Enhanced Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Print Styles */
@media print {
  .btn, .dropdown, .modal {
    display: none !important;
  }
  
  .card {
    box-shadow: none;
    border: 1px solid #dee2e6;
  }
}
</style>

