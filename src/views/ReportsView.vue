<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useReports } from '@/composables/useReports'
import AppLayout from '@/components/common/AppLayout.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// Use composables
const {
  transactions,
  loading,
  error,
  reportSummary,
  incomeCategories,
  expenseCategories,
  monthlyData,
  barChartData,
  pieChartData,
  fetchReportData
} = useReports()

// Report filters
const reportFilters = reactive({
  period: 'this-month',
  type: 'overview',
  startDate: '',
  endDate: ''
})

// Chart options
const barChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '500'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: function(context) {
          const value = context.parsed.y
          return `${context.dataset.label}: ${formatCurrency(value)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      },
      ticks: {
        font: {
          size: 11
        },
        callback: function(value) {
          return formatCurrency(value)
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
}))

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 11
        },
        generateLabels: function(chart) {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0]
              const value = dataset.data[i]
              const total = dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: '#fff',
                lineWidth: 2,
                hidden: false,
                index: i
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  },
  cutout: '50%',
  borderWidth: 2,
  borderColor: '#fff',
  hoverBorderWidth: 3,
  hoverBorderColor: '#fff'
}))

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const updateChartData = async () => {
  await fetchReportData(
    reportFilters.period,
    reportFilters.startDate,
    reportFilters.endDate
  )
}

const generateReport = async () => {
  console.log('Generating report...')
  await updateChartData()
}

const exportReport = () => {
  console.log('Exporting report...')
  // TODO: Implement export functionality (PDF, Excel, etc.)
  alert('Export functionality will be implemented soon!')
}

// Watch for filter changes
watch(
  () => reportFilters.period,
  () => {
    updateChartData()
  }
)

watch(
  () => [reportFilters.startDate, reportFilters.endDate],
  () => {
    if (reportFilters.period === 'custom' && reportFilters.startDate && reportFilters.endDate) {
      updateChartData()
    }
  }
)

onMounted(async () => {
  await updateChartData()
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
              <h1 class="h3 mb-1">Reports</h1>
              <p class="text-muted mb-0">Analyze your financial data and trends</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary" @click="exportReport">
                <i class="bi bi-download me-2"></i>
                Export Report
              </button>
              <button class="btn btn-primary" @click="generateReport" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="bi bi-graph-up me-2"></i>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Filters -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">Report Period</label>
                  <select v-model="reportFilters.period" class="form-select">
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-quarter">This Quarter</option>
                    <option value="this-year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Report Type</label>
                  <select v-model="reportFilters.type" class="form-select">
                    <option value="overview">Overview</option>
                    <option value="income">Income Analysis</option>
                    <option value="expense">Expense Analysis</option>
                    <option value="category">Category Breakdown</option>
                  </select>
                </div>
                <div class="col-md-3" v-if="reportFilters.period === 'custom'">
                  <label class="form-label">Start Date</label>
                  <input v-model="reportFilters.startDate" type="date" class="form-control">
                </div>
                <div class="col-md-3" v-if="reportFilters.period === 'custom'">
                  <label class="form-label">End Date</label>
                  <input v-model="reportFilters.endDate" type="date" class="form-control">
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
              <i class="bi bi-arrow-up-circle text-success" style="font-size: 2rem;"></i>
              <h5 class="card-title mt-2">Total Income</h5>
              <h3 class="text-success">{{ formatCurrency(reportSummary.totalIncome) }}</h3>
              <small class="text-muted">
                <i class="bi bi-arrow-up text-success"></i>
                Current period
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-arrow-down-circle text-danger" style="font-size: 2rem;"></i>
              <h5 class="card-title mt-2">Total Expenses</h5>
              <h3 class="text-danger">{{ formatCurrency(reportSummary.totalExpenses) }}</h3>
              <small class="text-muted">
                <i class="bi bi-arrow-down text-success"></i>
                Current period
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-wallet2 text-primary" style="font-size: 2rem;"></i>
              <h5 class="card-title mt-2">Net Savings</h5>
              <h3 :class="reportSummary.netSavings >= 0 ? 'text-success' : 'text-danger'">
                {{ formatCurrency(reportSummary.netSavings) }}
              </h3>
              <small class="text-muted">
                <i :class="reportSummary.netSavings >= 0 ? 'bi bi-arrow-up text-success' : 'bi bi-arrow-down text-danger'"></i>
                Current period
              </small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="bi bi-graph-up text-info" style="font-size: 2rem;"></i>
              <h5 class="card-title mt-2">Savings Rate</h5>
              <h3 class="text-info">{{ reportSummary.savingsRate }}%</h3>
              <small class="text-muted">
                <i class="bi bi-info-circle"></i>
                Of total income
              </small>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Income vs Expenses Trend</h5>
            </div>
            <div class="card-body">
              <div v-if="barChartData.labels && barChartData.labels.length > 0" style="height: 300px;">
                <BarChart 
                  :data="barChartData" 
                  :options="barChartOptions"
                />
              </div>
              <div v-else class="d-flex align-items-center justify-content-center" style="height: 300px;">
                <div class="text-center text-muted">
                  <i class="bi bi-bar-chart fs-1 mb-2 d-block"></i>
                  <p>No data available for the selected period</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Expense Categories</h5>
            </div>
            <div class="card-body">
              <div v-if="pieChartData.labels && pieChartData.labels.length > 0" style="height: 300px;">
                <PieChart 
                  :data="pieChartData" 
                  :options="pieChartOptions"
                />
              </div>
              <div v-else class="d-flex align-items-center justify-content-center" style="height: 300px;">
                <div class="text-center text-muted">
                  <i class="bi bi-pie-chart fs-1 mb-2 d-block"></i>
                  <p>No expense data available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Category Breakdown</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6 class="text-success mb-3">Income Categories</h6>
                  <div v-if="incomeCategories.length > 0">
                    <div v-for="category in incomeCategories" :key="category.name" class="d-flex justify-content-between align-items-center mb-2">
                      <div class="d-flex align-items-center">
                        <i :class="category.icon" :style="{ color: category.color }" class="me-2"></i>
                        <span>{{ category.name }}</span>
                      </div>
                      <div class="text-end">
                        <div class="fw-bold text-success">{{ formatCurrency(category.amount) }}</div>
                        <small class="text-muted">{{ category.percentage }}%</small>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-3 mb-2 d-block"></i>
                    <p class="mb-0">No income data available</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6 class="text-danger mb-3">Expense Categories</h6>
                  <div v-if="expenseCategories.length > 0">
                    <div v-for="category in expenseCategories" :key="category.name" class="d-flex justify-content-between align-items-center mb-2">
                      <div class="d-flex align-items-center">
                        <i :class="category.icon" :style="{ color: category.color }" class="me-2"></i>
                        <span>{{ category.name }}</span>
                      </div>
                      <div class="text-end">
                        <div class="fw-bold text-danger">{{ formatCurrency(category.amount) }}</div>
                        <small class="text-muted">{{ category.percentage }}%</small>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-3">
                    <i class="bi bi-inbox fs-3 mb-2 d-block"></i>
                    <p class="mb-0">No expense data available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Comparison -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Monthly Comparison</h5>
            </div>
            <div class="card-body p-0">
              <div v-if="monthlyData.length > 0" class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Month</th>
                      <th class="text-end">Income</th>
                      <th class="text-end">Expenses</th>
                      <th class="text-end">Net Amount</th>
                      <th class="text-end">Savings Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="month in monthlyData" :key="month.month">
                      <td>{{ month.month }}</td>
                      <td class="text-end text-success">{{ formatCurrency(month.income) }}</td>
                      <td class="text-end text-danger">{{ formatCurrency(month.expenses) }}</td>
                      <td class="text-end" :class="month.net >= 0 ? 'text-success' : 'text-danger'">
                        {{ formatCurrency(month.net) }}
                      </td>
                      <td class="text-end">
                        <span class="badge" :class="month.savingsRate >= 20 ? 'bg-success' : month.savingsRate >= 10 ? 'bg-warning' : 'bg-danger'">
                          {{ month.savingsRate }}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center text-muted py-5">
                <i class="bi bi-calendar-x fs-1 mb-2 d-block"></i>
                <h5>No monthly data available</h5>
                <p>Start adding transactions to see monthly comparisons</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

