<template>
  <AppLayout>
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
            <button class="btn btn-primary" @click="generateReport">
              <i class="bi bi-graph-up me-2"></i>
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
                <select v-model="reportFilters.period" class="form-select" @change="updateChartData">
                  <option value="this-month">This Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="this-quarter">This Quarter</option>
                  <option value="this-year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Report Type</label>
                <select v-model="reportFilters.type" class="form-select" @change="updateChartData">
                  <option value="overview">Overview</option>
                  <option value="income">Income Analysis</option>
                  <option value="expense">Expense Analysis</option>
                  <option value="category">Category Breakdown</option>
                </select>
              </div>
              <div class="col-md-3" v-if="reportFilters.period === 'custom'">
                <label class="form-label">Start Date</label>
                <input v-model="reportFilters.startDate" type="date" class="form-control" @change="updateChartData">
              </div>
              <div class="col-md-3" v-if="reportFilters.period === 'custom'">
                <label class="form-label">End Date</label>
                <input v-model="reportFilters.endDate" type="date" class="form-control" @change="updateChartData">
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
              +12% from last period
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
              -5% from last period
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
              <i class="bi bi-arrow-up text-success"></i>
              +25% from last period
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
              <i class="bi bi-arrow-up text-success"></i>
              +3% from last period
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
            <BarChart 
              :data="barChartData" 
              :options="barChartOptions"
              :height="300"
            />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Expense Categories</h5>
          </div>
          <div class="card-body">
            <PieChart 
              :data="pieChartData" 
              :options="pieChartOptions"
              :height="300"
            />
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
              <div class="col-md-6">
                <h6 class="text-danger mb-3">Expense Categories</h6>
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
            <div class="table-responsive">
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
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/components/common/AppLayout.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'

// Report filters
const reportFilters = reactive({
  period: 'this-month',
  type: 'overview',
  startDate: '',
  endDate: ''
})

// Sample report data
const reportSummary = ref({
  totalIncome: 10000000,
  totalExpenses: 7500000,
  netSavings: 2500000,
  savingsRate: 25
})

const incomeCategories = ref([
  { name: 'Salary', amount: 8500000, percentage: 85, icon: 'bi bi-cash-coin', color: '#28a745' },
  { name: 'Freelance', amount: 1500000, percentage: 15, icon: 'bi bi-laptop', color: '#17a2b8' }
])

const expenseCategories = ref([
  { name: 'Food & Dining', amount: 2500000, percentage: 33, icon: 'bi bi-cart3', color: '#dc3545' },
  { name: 'Transportation', amount: 1500000, percentage: 20, icon: 'bi bi-fuel-pump', color: '#fd7e14' },
  { name: 'Shopping', amount: 1200000, percentage: 16, icon: 'bi bi-bag', color: '#6f42c1' },
  { name: 'Entertainment', amount: 800000, percentage: 11, icon: 'bi bi-film', color: '#e83e8c' },
  { name: 'Bills & Utilities', amount: 1500000, percentage: 20, icon: 'bi bi-receipt', color: '#20c997' }
])

const monthlyData = ref([
  { month: 'January 2024', income: 10000000, expenses: 7500000, net: 2500000, savingsRate: 25 },
  { month: 'December 2023', income: 9500000, expenses: 8000000, net: 1500000, savingsRate: 16 },
  { month: 'November 2023', income: 9000000, expenses: 7200000, net: 1800000, savingsRate: 20 },
  { month: 'October 2023', income: 9500000, expenses: 7800000, net: 1700000, savingsRate: 18 },
  { month: 'September 2023', income: 8800000, expenses: 6900000, net: 1900000, savingsRate: 22 },
  { month: 'August 2023', income: 9200000, expenses: 7100000, net: 2100000, savingsRate: 23 }
])

// Chart data computed properties
const barChartData = computed(() => {
  const labels = monthlyData.value.slice(0, 6).reverse().map(item => {
    const [month, year] = item.month.split(' ')
    return `${month.substring(0, 3)} ${year}`
  })

  return {
    labels,
    datasets: [
      {
        label: 'Income',
        data: monthlyData.value.slice(0, 6).reverse().map(item => item.income),
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: monthlyData.value.slice(0, 6).reverse().map(item => item.expenses),
        backgroundColor: 'rgba(220, 53, 69, 0.8)',
        borderColor: 'rgba(220, 53, 69, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  }
})

const pieChartData = computed(() => {
  return {
    labels: expenseCategories.value.map(cat => cat.name),
    datasets: [
      {
        data: expenseCategories.value.map(cat => cat.amount),
        backgroundColor: expenseCategories.value.map(cat => cat.color),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#ffffff'
      }
    ]
  }
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

const updateChartData = () => {
  // This method will be called when filters change
  // Here you can implement logic to fetch new data based on filters
  console.log('Updating chart data for period:', reportFilters.period)
  console.log('Report type:', reportFilters.type)
  
  // TODO: Implement data fetching based on filters
  // For now, we're using static data
}

const generateReport = () => {
  // Generate report functionality
  console.log('Generating report...')
  updateChartData()
}

const exportReport = () => {
  // Export report functionality
  console.log('Exporting report...')
  // TODO: Implement export functionality (PDF, Excel, etc.)
}

onMounted(() => {
  // TODO: Fetch report data from Supabase
  console.log('Reports view mounted')
  updateChartData()
})
</script>

<style scoped>
.chart-placeholder {
  min-height: 300px;
  background-color: #f8f9fa;
  border: 2px dashed #dee2e6;
  border-radius: 0.375rem;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.table th {
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .row.mb-4 .col-md-8,
  .row.mb-4 .col-md-4 {
    margin-bottom: 1rem;
  }
}
</style>
