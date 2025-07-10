<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useReports } from '@/composables/useReports'
import AppLayout from '@/components/common/AppLayout.vue'
import BarChart from '@/components/charts/BarChart.vue'
import PieChart from '@/components/charts/PieChart.vue'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

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
  fetchReportData,
} = useReports()

// Report filters
const reportFilters = reactive({
  period: 'this-month',
  type: 'overview',
  startDate: '',
  endDate: '',
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
        padding: 15,
        font: {
          size: 10,
          weight: '500',
        },
      },
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
        label: function (context) {
          const value = context.parsed.y
          return `${context.dataset.label}: ${formatCurrency(value)}`
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 9,
        },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
      ticks: {
        font: {
          size: 9,
        },
        callback: function (value) {
          return formatCurrency(value)
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
}))

const pieChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 10,
        font: {
          size: 9,
        },
        generateLabels: function (chart) {
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
                index: i,
              }
            })
          }
          return []
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function (context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${formatCurrency(value)} (${percentage}%)`
        },
      },
    },
  },
  cutout: '50%',
  borderWidth: 2,
  borderColor: '#fff',
  hoverBorderWidth: 3,
  hoverBorderColor: '#fff',
}))

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const updateChartData = async () => {
  await fetchReportData(reportFilters.period, reportFilters.startDate, reportFilters.endDate)
}

// Fungsi untuk generate data laporan
const generateReportData = () => {
  return {
    date: new Date().toLocaleDateString(),
    summary: reportSummary,
    income: incomeCategories,
    expenses: expenseCategories,
    monthly: monthlyData,
    charts: {
      bar: barChartData,
      pie: pieChartData,
    },
  }
}

// Fungsi export PDF
const exportReport = async () => {
  try {
    const element = document.getElementById('report-content')

    // Gunakan html2canvas dengan onclone callback
    const canvas = await html2canvas(element, {
      scale: 3,
      logging: false,
      useCORS: true,
      ignoreElements: (el) => el.classList.contains('no-export'),
      onclone: (clonedDoc) => {
        // Tambahkan header hanya di dokumen klon
        const cloneElement = clonedDoc.getElementById('report-content')
        const header = clonedDoc.createElement('div')
        header.innerHTML = `
          <div style="text-align:center;margin-bottom:20px">
            <h2 style="color:#2c3e50">Financial Report</h2>
            <p style="color:#7f8c8d">
              Period: ${getFormattedPeriod()}
            </p>
            <small style="color:#7f8c8d">
              Generated on: ${new Date().toLocaleDateString()}
            </small>
          </div>
        `
        cloneElement.insertBefore(header, cloneElement.firstChild)
      }
    })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.7)
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 295 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    pdf.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to generate report')
  }
}

// Helper function
const getFormattedPeriod = () => {
  if (reportFilters.period === 'custom') {
    return `${reportFilters.startDate} to ${reportFilters.endDate}`
  }
  return reportFilters.period
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Watch for filter changes
watch(
  () => reportFilters.period,
  () => {
    updateChartData()
  },
)

watch(
  () => [reportFilters.startDate, reportFilters.endDate],
  () => {
    if (reportFilters.period === 'custom' && reportFilters.startDate && reportFilters.endDate) {
      updateChartData()
    }
  },
)

onMounted(async () => {
  await updateChartData()
  if (window.innerWidth >= 768) {
    showFilter.value = true
  }
})

const showFilter = ref(false)

onMounted(() => {
  // Set showFilter ke true jika di desktop
  showFilter.value = window.innerWidth >= 768

  // Handler untuk resize window
  window.addEventListener('resize', () => {
    showFilter.value = window.innerWidth >= 768
  })
})
</script>

<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-2">
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
              <h4 class="mb-1">Reports</h4>
              <p class="text-muted mb-0 small">Analyze your financial data and trends</p>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-primary btn-sm d-sm-inline-flex p-2" @click="exportReport">
                <i class="bi bi-download me-1"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div id="report-content">
        <div class="report-section">
          <h5 class="section-title">Summary</h5>
          <div class="row mb-3 g-2">
            <div class="col-6 col-md-3">
              <div class="card summary-card income-card border-0 text-center">
                <div class="card-body p-3">
                  <i class="bi bi-arrow-up-circle summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small">Total Income</h5>
                  <h5 class="mb-0">{{ formatCurrency(reportSummary.totalIncome) }}</h5>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card summary-card expense-card border-0 text-center">
                <div class="card-body p-3">
                  <i class="bi bi-arrow-down-circle summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small">Total Expenses</h5>
                  <h5 class="mb-0">{{ formatCurrency(reportSummary.totalExpenses) }}</h5>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card summary-card savings-card border-0 text-center">
                <div class="card-body p-3">
                  <i class="bi bi-wallet2 summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small">Net Savings</h5>
                  <h5 class="mb-0">
                    {{ formatCurrency(reportSummary.netSavings) }}
                  </h5>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card summary-card rate-card border-0 text-center">
                <div class="card-body p-3">
                  <i class="bi bi-graph-up summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small">Savings Rate</h5>
                  <h5 class="mb-0">{{ reportSummary.savingsRate }}%</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Report Filters -->
        <div class="row mb-3 no-export">
          <div class="col-12">
            <div class="card border-0">
              <div class="card-header bg-transparent border-0 p-2">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="card-title mb-0 fw-medium">Report Filters</h6>
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
              <div :class="{ show: showFilter }" class="collapse d-md-block" id="filtersCollapse">
                <div class="card-body pt-0">
                  <div class="row g-2">
                    <div class="col-6 col-md-3">
                      <label class="form-label small fw-medium">Report Period</label>
                      <select v-model="reportFilters.period" class="form-select form-select-sm">
                        <option value="this-month">This Month</option>
                        <option value="last-month">Last Month</option>
                        <option value="this-quarter">This Quarter</option>
                        <option value="this-year">This Year</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                    <div class="col-6 col-md-3">
                      <label class="form-label small fw-medium">Report Type</label>
                      <select v-model="reportFilters.type" class="form-select form-select-sm">
                        <option value="overview">Overview</option>
                        <option value="income">Income Analysis</option>
                        <option value="expense">Expense Analysis</option>
                        <option value="category">Category Breakdown</option>
                      </select>
                    </div>
                    <div class="col-6 col-md-3" v-if="reportFilters.period === 'custom'">
                      <label class="form-label small fw-medium">Start Date</label>
                      <input
                        v-model="reportFilters.startDate"
                        type="date"
                        class="form-control form-control-sm"
                      />
                    </div>
                    <div class="col-6 col-md-3" v-if="reportFilters.period === 'custom'">
                      <label class="form-label small fw-medium">End Date</label>
                      <input
                        v-model="reportFilters.endDate"
                        type="date"
                        class="form-control form-control-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="report-section">
          <div class="row mb-3 g-2">
            <!-- Bar Chart - Full width on mobile -->
            <div class="col-12 col-lg-8 mb-3">
              <div class="card border-0">
                <div class="card-header bg-transparent border-0">
                  <h6 class="card-title mb-0 fw-medium">Income vs Expenses Trend</h6>
                </div>
                <div class="card-body">
                  <div
                    v-if="barChartData.labels && barChartData.labels.length > 0"
                    class="chart-container"
                  >
                    <BarChart :data="barChartData" :options="barChartOptions" />
                  </div>
                  <div v-else class="empty-chart">
                    <i class="bi bi-bar-chart text-muted"></i>
                    <p class="text-muted mb-0 small">No data available for the selected period</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie Chart - Full width on mobile -->
            <div class="col-12 col-lg-4 mb-3">
              <div class="card border-0">
                <div class="card-header bg-transparent border-0">
                  <h6 class="card-title mb-0 fw-medium">Expense Categories</h6>
                </div>
                <div class="card-body">
                  <div
                    v-if="pieChartData.labels && pieChartData.labels.length > 0"
                    class="chart-container"
                  >
                    <PieChart :data="pieChartData" :options="pieChartOptions" />
                  </div>
                  <div v-else class="empty-chart">
                    <i class="bi bi-pie-chart text-muted"></i>
                    <p class="text-muted mb-0 small">No expense data available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Category Breakdown -->
        <div class="report-section">
          <div class="row mb-3 g-2">
            <div class="col-12">
              <div class="card border-0 h-100">
                <div class="card-header bg-transparent border-0 p-3">
                  <h6 class="card-title mb-0 fw-medium">Category Breakdown</h6>
                </div>
                <div class="card-body p-2">
                  <div class="row g-2">
                    <div class="col-12 col-md-6">
                      <div class="card border-0 h-100">
                        <div class="card-header bg-transparent border-0 p-2">
                          <h6 class="text-success mb-0 d-flex align-items-center">
                            <i class="bi bi-arrow-up-circle me-2"></i>
                            Income Categories
                          </h6>
                        </div>
                        <div class="card-body p-2">
                          <div v-if="incomeCategories.length > 0" class="category-grid">
                            <div
                              v-for="category in incomeCategories"
                              :key="category.name"
                              class="category-item"
                            >
                              <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex align-items-center flex-grow-1 min-w-0">
                                  <i
                                    :class="category.icon"
                                    :style="{ color: category.color }"
                                    class="me-2 flex-shrink-0"
                                  ></i>
                                  <span class="text-truncate">{{ category.name }}</span>
                                </div>
                                <div class="text-end flex-shrink-0">
                                  <div class="fw-bold text-success small">
                                    {{ formatCurrency(category.amount) }}
                                  </div>
                                  <small class="text-muted">{{ category.percentage }}%</small>
                                </div>
                              </div>
                              <div class="progress mb-2" style="height: 4px">
                                <div
                                  class="progress-bar bg-success"
                                  :style="{ width: category.percentage + '%' }"
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div v-else class="empty-category">
                            <i class="bi bi-inbox text-muted"></i>
                            <p class="text-muted mb-0 small">No income data available</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Expense Categories -->
                    <div class="col-12 col-md-6">
                      <div class="card border-0 h-100">
                        <div class="card-header bg-transparent border-0 p-2">
                          <h6 class="text-danger mb-0 d-flex align-items-center">
                            <i class="bi bi-arrow-up-circle me-2"></i>
                            Expense Categories
                          </h6>
                          <div class="card-body p-2">
                            <div v-if="expenseCategories.length > 0" class="category-grid">
                              <div
                                v-for="category in expenseCategories"
                                :key="category.name"
                                class="category-item"
                              >
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                  <div class="d-flex align-items-center w-100">
                                    <i
                                      :class="category.icon"
                                      :style="{ color: category.color }"
                                      class="me-2"
                                    ></i>
                                    <span class="text-wrap flex-grow-1">{{ category.name }}</span>
                                  </div>
                                  <div class="text-end flex-shrink-0">
                                    <div class="fw-bold text-danger small">
                                      {{ formatCurrency(category.amount) }}
                                    </div>
                                    <small class="text-muted">{{ category.percentage }}%</small>
                                  </div>
                                </div>
                                <div class="progress mb-2" style="height: 4px">
                                  <div
                                    class="progress-bar bg-danger"
                                    :style="{ width: category.percentage + '%' }"
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div v-else class="empty-category">
                              <i class="bi bi-inbox text-muted"></i>
                              <p class="text-muted mb-0 small">No expense data available</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Comparison -->
        <div class="report-section">
          <div class="row g-2">
            <div class="col-12">
              <div class="card border-0 h-100">
                <!-- Added h-100 -->
                <div
                  class="card-header bg-transparent border-0 p-3 d-flex justify-content-between align-items-center"
                >
                  <!-- Consistent padding -->
                  <h6 class="card-title mb-0 fw-medium">Monthly Comparison</h6>
                  <button class="btn btn-sm btn-outline-secondary d-md-none">
                    <i class="bi bi-download"></i>
                  </button>
                </div>
                <div class="card-body p-0">
                  <div v-if="monthlyData.length > 0">
                    <!-- Mobile: Card-based layout -->
                    <div class="d-block d-md-none">
                      <div
                        v-for="month in monthlyData"
                        :key="month.month"
                        class="monthly-card p-3 border-bottom"
                      >
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <h6 class="mb-0 fw-medium">{{ month.month }}</h6>
                          <span
                            class="badge"
                            :class="
                              month.savingsRate >= 20
                                ? 'bg-success'
                                : month.savingsRate >= 10
                                  ? 'bg-warning'
                                  : 'bg-danger'
                            "
                          >
                            {{ month.savingsRate }}%
                          </span>
                        </div>
                        <div class="row g-2 text-center">
                          <div class="col-4">
                            <div class="metric-item">
                              <small class="text-muted d-block">Income</small>
                              <div class="fw-bold text-success small">
                                {{ formatCurrency(month.income) }}
                              </div>
                            </div>
                          </div>
                          <div class="col-4">
                            <div class="metric-item">
                              <small class="text-muted d-block">Expenses</small>
                              <div class="fw-bold text-danger small">
                                {{ formatCurrency(month.expenses) }}
                              </div>
                            </div>
                          </div>
                          <div class="col-4">
                            <div class="metric-item">
                              <small class="text-muted d-block">Net</small>
                              <div
                                class="fw-bold small"
                                :class="month.net >= 0 ? 'text-success' : 'text-danger'"
                              >
                                {{ formatCurrency(month.net) }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Desktop: Table layout -->
                    <div class="d-none d-md-block table-responsive">
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
                            <td class="fw-medium">{{ month.month }}</td>
                            <td class="text-end text-success">
                              {{ formatCurrency(month.income) }}
                            </td>
                            <td class="text-end text-danger">
                              {{ formatCurrency(month.expenses) }}
                            </td>
                            <td
                              class="text-end"
                              :class="month.net >= 0 ? 'text-success' : 'text-danger'"
                            >
                              {{ formatCurrency(month.net) }}
                            </td>
                            <td class="text-end">
                              <span
                                class="badge"
                                :class="
                                  month.savingsRate >= 20
                                    ? 'bg-success'
                                    : month.savingsRate >= 10
                                      ? 'bg-warning'
                                      : 'bg-danger'
                                "
                              >
                                {{ month.savingsRate }}%
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div v-else class="empty-state py-4">
                    <i class="bi bi-calendar-x text-muted"></i>
                    <h6 class="text-muted mt-3">No monthly data available</h6>
                    <p class="text-muted small">
                      Start adding transactions to see monthly comparisons
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="report-footer mt-4 text-center text-muted small">
          Generated by CashFlow App - © {{ new Date().getFullYear() }}
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
@media print {
  body {
    background: white !important;
    color: black !important;
  }

  .card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    page-break-inside: avoid;
  }

  .report-section {
    page-break-after: avoid;
    margin-bottom: 0.5rem;
  }

  .section-title {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    color: #333 !important;
  }

  .no-print,
  no-export {
    display: none !important;
  }
}

/* Style untuk tampilan normal */
.report-section {
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 1rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
  max-height: none !important; /* Hapus max-height sebelumnya */
  overflow: visible !important;
}

/* Item kategori */
.category-item {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

/* Responsive grid */
@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }
}

/* Progress bar tetap sama */
.progress {
  height: 4px;
}

/* Empty state */
.empty-category {
  padding: 1.5rem;
  text-align: center;
  opacity: 0.7;
}
/* Summary Cards */
.summary-card {
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.summary-card.income-card {
  background: linear-gradient(135deg, #ffffff 0%, #63e76a 100%);
}

.summary-card.expense-card {
  background: linear-gradient(135deg, #ffffff 0%, #e06565 100%);
}

.summary-card.savings-card {
  background: linear-gradient(135deg, #ffffff 0%, #839ef5 100%);
}

.summary-card.rate-card {
  background: linear-gradient(135deg, #ffffff 0%, hsl(61, 82%, 67%) 100%);
}

.summary-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

/* Chart Containers */
.chart-container {
  height: 250px;
  position: relative;
}

.empty-chart {
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-chart i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

/* Category Breakdown */
.category-section {
  height: 100%;
}

.category-list {
  max-height: 300px;
  overflow-x: auto;
}

.category-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.category-item:last-child {
  border-bottom: none;
}

.empty-category {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-category i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Monthly Comparison */
.monthly-card {
  transition: background-color 0.2s ease;
}

.monthly-card:hover {
  background-color: #f8f9fa;
}

.monthly-card:last-child {
  border-bottom: none !important;
}

.metric-item {
  padding: 0.5rem;
  border-radius: 6px;
  background-color: #f8f9fa;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.btn {
  border-radius: 8px;
}

.badge {
  font-size: 0.7rem;
  padding: 0.35em 0.65em;
}

.progress {
  border-radius: 2px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 2px;
  transition: width 0.6s ease;
}

/* Collapsible filters for mobile */
@media (max-width: 767px) {
  #filtersCollapse:not(.show) {
    display: none !important;
  }
}

/* Mobile specific styles */
@media (max-width: 576px) {
  .chart-container {
    height: 200px;
  }

  .empty-chart {
    height: 200px;
  }

  .empty-chart i {
    font-size: 2rem;
  }

  .summary-card .card-body {
    padding: 0.75rem !important;
  }

  .summary-icon {
    font-size: 1.2rem;
  }

  .card-body {
    padding: 0.75rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .form-select-sm,
  .form-control-sm {
    font-size: 0.8rem;
  }

  .badge {
    font-size: 0.65rem;
    padding: 0.25em 0.5em;
  }

  .category-list {
    max-height: 200px;
  }

  .category-item {
    padding: 0.75rem 0;
  }

  .metric-item {
    padding: 0.5rem 0.25rem;
  }

  .monthly-card {
    padding: 1rem !important;
  }

  .text-truncate {
    max-width: 100px;
  }
}

/* Tablet styles */
@media (min-width: 577px) and (max-width: 768px) {
  .chart-container {
    height: 220px;
  }

  .summary-card .card-body {
    padding: 1rem !important;
  }
}

/* Large mobile landscape */
@media (max-width: 767px) and (orientation: landscape) {
  .chart-container {
    height: 180px;
  }

  .empty-chart {
    height: 180px;
  }
}

/* Smooth transitions */
.collapse {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Custom scrollbar */
.category-list::-webkit-scrollbar {
  width: 4px;
}

.category-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

.category-list::-webkit-scrollbar-thumb:hover {
  background: #555;
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

  .fw-bold {
    font-size: 0.85rem;
  }
}

/* Loading and hover states */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.summary-card:hover .summary-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Chart responsive adjustments */
@media (max-width: 576px) {
  .chart-container canvas {
    max-height: 200px !important;
  }
}

/* Category item hover effects */
.category-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  margin: 0 -0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Monthly card enhancements */
.monthly-card {
  border-left: 4px solid transparent;
  transition: all 0.2s ease;
}

.monthly-card:hover {
  border-left-color: #007bff;
  background-color: #f8f9fa;
  transform: translateX(2px);
}

/* Improved empty states */
.empty-chart,
.empty-category,
.empty-state {
  opacity: 0.8;
}

.empty-chart:hover,
.empty-category:hover,
.empty-state:hover {
  opacity: 1;
}

/* Better spacing for mobile */
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
}

/* Enhanced card shadows */
.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transition: box-shadow 0.3s ease;
}

/* Better button spacing */
.d-flex.gap-1 > * + * {
  margin-left: 0.25rem;
}

/* Improved table responsiveness */
@media (max-width: 991px) {
  .table-responsive {
    font-size: 0.9rem;
  }

  .table th,
  .table td {
    padding: 0.5rem;
  }
}

/* Enhanced filter collapse animation */
.collapse {
  transition:
    height 0.35s ease,
    opacity 0.2s ease;
}

.collapse:not(.show) {
  opacity: 0;
}

.collapse.show {
  opacity: 1;
}

/* Better touch targets for mobile */
@media (max-width: 576px) {
  .btn {
    min-height: 38px;
    min-width: 38px;
  }

  .form-select,
  .form-control {
    min-height: 38px;
  }
}

/* Gradient text effects */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced progress bars */
.progress {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-bar {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Better visual hierarchy */
.card-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.card-title {
  color: #2c3e50;
  font-weight: 600;
}

/* Improved accessibility */
.btn:focus,
.form-control:focus,
.form-select:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  border-color: #80bdff;
}

/* Loading spinner enhancements */
.spinner-border-sm {
  width: 0.875rem;
  height: 0.875rem;
}

/* Better modal spacing on mobile */
@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-header,
  .modal-footer {
    padding: 0.75rem 1rem;
  }
}

/* Enhanced category icons */
.category-item i {
  width: 20px;
  text-align: center;
}

/* Better number formatting display */
.fw-bold {
  letter-spacing: -0.02em;
}

/* Improved card borders */
.card {
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Enhanced hover states */
.category-item,
.monthly-card {
  cursor: pointer;
}

/* Better visual feedback */
.btn:active {
  transform: translateY(1px);
}

/* Improved spacing consistency */
.card-body > *:last-child {
  margin-bottom: 0;
}

/* Enhanced mobile navigation */
@media (max-width: 576px) {
  .d-flex.justify-content-between {
    gap: 0.5rem;
  }

  .d-flex.gap-1 {
    gap: 0.25rem !important;
  }
}
</style>
