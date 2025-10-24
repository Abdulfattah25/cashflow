<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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
  getReportData, // ✅ NEW: Instant cache access
  resetLoadingState,
  setupRealtime, // ✅ NEW
  cleanupRealtime, // ✅ NEW
} = useReports()

// Report filters
const reportFilters = reactive({
  period: 'this-month',
  startDate: '',
  endDate: '',
})
const showFilter = ref(false)

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
          const lbl = context.dataset.label
          const map = { Income: 'Pemasukan', Expenses: 'Pengeluaran' }
          const translated = map[lbl] || lbl
          return `${translated}: ${formatCurrency(value)}`
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

// ✅ OPTIMIZED: Use cache first, then fetch in background
const updateChartData = async () => {
  // Get cached data immediately (no loading state)
  getReportData(reportFilters.period, reportFilters.startDate, reportFilters.endDate)

  // Fetch fresh data in background
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

// Fungsi export PDF - FIT TO ONE PAGE
const exportReport = async () => {
  try {
    const element = document.getElementById('report-content')

    // Gunakan html2canvas dengan scale yang lebih rendah untuk 1 halaman
    const canvas = await html2canvas(element, {
      scale: 2, // Reduced from 3 to 2 for better fit
      logging: false,
      useCORS: true,
      ignoreElements: (el) => el.classList.contains('no-export'),
      onclone: (clonedDoc) => {
        // Tambahkan header hanya di dokumen klon
        const cloneElement = clonedDoc.getElementById('report-content')
        const header = clonedDoc.createElement('div')
        header.innerHTML = `
          <div style="text-align:center;margin-bottom:20px">
            <h2 style="color:#2c3e50">Laporan Keuangan</h2>
            <p style="color:#7f8c8d">
              Periode: ${getFormattedPeriod()}
            </p>
            <small style="color:#7f8c8d">
              Dibuat pada: ${new Date().toLocaleDateString('id-ID')}
            </small>
          </div>
        `
        cloneElement.insertBefore(header, cloneElement.firstChild)
      },
    })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.8) // Increased quality

    // A4 dimensions in mm
    const pdfWidth = 210
    const pdfHeight = 297

    // Add margins
    const margin = 10 // 10mm margin on each side
    const contentWidth = pdfWidth - margin * 2
    const contentHeight = pdfHeight - margin * 2

    // Calculate dimensions to fit content in one page
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const imgRatio = imgWidth / imgHeight

    let finalWidth = contentWidth
    let finalHeight = contentWidth / imgRatio

    // If height exceeds page, scale based on height instead
    if (finalHeight > contentHeight) {
      finalHeight = contentHeight
      finalWidth = contentHeight * imgRatio
    }

    // Center the image on the page
    const xOffset = margin + (contentWidth - finalWidth) / 2
    const yOffset = margin + (contentHeight - finalHeight) / 2

    // Add single page with fitted image
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight)

    pdf.save(`laporan-keuangan-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Gagal membuat laporan')
  }
}

// Helper function
const getFormattedPeriod = () => {
  if (reportFilters.period === 'custom') {
    return `${reportFilters.startDate} sampai ${reportFilters.endDate}`
  }
  const map = {
    'this-month': 'Bulan Ini',
    'last-month': 'Bulan Lalu',
    'this-year': 'Tahun Ini',
  }
  return map[reportFilters.period] || reportFilters.period
}

// Fungsi export monthly data ke PDF
const exportMonthlyDataPDF = async () => {
  try {
    if (monthlyData.value.length === 0) {
      alert('Tidak ada data bulanan untuk di-export')
      return
    }

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = 210
    const pageHeight = 297
    const margin = 15
    const contentWidth = pageWidth - margin * 2

    // Header
    pdf.setFontSize(18)
    pdf.setFont(undefined, 'bold')
    pdf.text('Perbandingan Bulanan', pageWidth / 2, margin + 5, { align: 'center' })

    pdf.setFontSize(10)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Periode: ${getFormattedPeriod()}`, pageWidth / 2, margin + 12, { align: 'center' })
    pdf.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, pageWidth / 2, margin + 17, {
      align: 'center',
    })

    // Table setup
    let yPos = margin + 25
    const colWidths = [40, 35, 35, 35, 35]
    const headers = ['Bulan', 'Pemasukan', 'Pengeluaran', 'Jumlah Bersih', 'Tingkat Tabungan']

    // Draw table header
    pdf.setFillColor(102, 126, 234)
    pdf.rect(margin, yPos, contentWidth, 8, 'F')

    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'bold')

    let xPos = margin + 2
    headers.forEach((header, i) => {
      pdf.text(header, xPos, yPos + 5.5)
      xPos += colWidths[i]
    })

    yPos += 8

    // Draw table rows
    pdf.setTextColor(0, 0, 0)
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(8)

    monthlyData.value.forEach((month, index) => {
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250)
        pdf.rect(margin, yPos, contentWidth, 7, 'F')
      }

      xPos = margin + 2

      // Bulan
      pdf.text(month.month, xPos, yPos + 4.5)
      xPos += colWidths[0]

      // Pemasukan
      pdf.setTextColor(40, 167, 69)
      pdf.text(formatCurrency(month.income), xPos, yPos + 4.5)
      xPos += colWidths[1]

      // Pengeluaran
      pdf.setTextColor(220, 53, 69)
      pdf.text(formatCurrency(month.expenses), xPos, yPos + 4.5)
      xPos += colWidths[2]

      // Jumlah Bersih
      pdf.setTextColor(
        month.net >= 0 ? 40 : 220,
        month.net >= 0 ? 167 : 53,
        month.net >= 0 ? 69 : 69,
      )
      pdf.text(formatCurrency(month.net), xPos, yPos + 4.5)
      xPos += colWidths[3]

      // Tingkat Tabungan
      pdf.setTextColor(0, 0, 0)
      pdf.text(`${month.savingsRate}%`, xPos, yPos + 4.5)

      yPos += 7

      // Check if need new page
      if (yPos > pageHeight - margin - 20) {
        pdf.addPage()
        yPos = margin
      }
    })

    // Footer
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text(`CashflowKu - © ${new Date().getFullYear()}`, pageWidth / 2, pageHeight - margin, {
      align: 'center',
    })

    // Save PDF
    pdf.save(`perbandingan-bulanan-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (error) {
    console.error('Export PDF failed:', error)
    alert('Gagal mengekspor data ke PDF')
  }
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

// ✅ OPTIMIZED: Load immediately from cache on mount
onMounted(async () => {
  // Get cached data first (instant display)
  getReportData(reportFilters.period, reportFilters.startDate, reportFilters.endDate)

  // Setup realtime updates
  setupRealtime()

  // Then fetch fresh data in background
  await updateChartData()

  showFilter.value = window.innerWidth >= 768
  window.addEventListener('resize', () => {
    showFilter.value = window.innerWidth >= 768
  })
})

onBeforeUnmount(() => {
  // Cleanup
  cleanupRealtime()
  resetLoadingState()
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
              <h4 class="mb-1">Laporan</h4>
              <p class="text-muted mb-0 small">Analisis data dan tren keuangan Kamu</p>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-primary btn-sm d-sm-inline-flex p-2" @click="exportReport">
                <i class="bi bi-download me-1"></i>
                Ekspor
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overview -->
      <div id="report-content">
        <div class="report-section">
          <h5 class="section-title">Ringkasan</h5>
          <div class="row mb-3 g-2">
            <div class="col-6 col-md-3">
              <div class="card summary-card income-card border-0 text-center text-white">
                <div class="card-body p-3">
                  <i class="bi bi-arrow-up-circle summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small text-light">Total Pemasukan</h5>
                  <h5 class="mb-0">{{ formatCurrency(reportSummary.totalIncome) }}</h5>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card summary-card expense-card border-0 text-center text-light">
                <div class="card-body p-3">
                  <i class="bi bi-arrow-down-circle summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small text-light">Total Pengeluaran</h5>
                  <h5 class="mb-0">{{ formatCurrency(reportSummary.totalExpenses) }}</h5>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card summary-card savings-card border-0 text-center text-light">
                <div class="card-body p-3">
                  <i class="bi bi-wallet2 summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small text-light">Sisa Saldo</h5>
                  <h5 class="mb-0">
                    {{ formatCurrency(reportSummary.netSavings) }}
                  </h5>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card summary-card rate-card border-0 text-center text-light">
                <div class="card-body p-3">
                  <i class="bi bi-graph-up summary-icon mb-2"></i>
                  <h5 class="card-title mb-1 small text-light">Rate Sisa Saldo</h5>
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
                  <h6 class="card-title mb-0 fw-medium">Filter Laporan</h6>
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
                      <label class="form-label small fw-medium">Periode Laporan</label>
                      <select v-model="reportFilters.period" class="form-select form-select-sm">
                        <option value="this-month">Bulan Ini</option>
                        <option value="last-month">Bulan Lalu</option>
                        <option value="this-year">Tahun Ini</option>
                        <option value="custom">Rentang Kustom</option>
                      </select>
                    </div>

                    <div class="col-6 col-md-3" v-if="reportFilters.period === 'custom'">
                      <label class="form-label small fw-medium">Tanggal Mulai</label>
                      <input
                        v-model="reportFilters.startDate"
                        type="date"
                        class="form-control form-control-sm"
                      />
                    </div>
                    <div class="col-6 col-md-3" v-if="reportFilters.period === 'custom'">
                      <label class="form-label small fw-medium">Tanggal Selesai</label>
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
                  <h6 class="card-title mb-0 fw-medium">Tren Pemasukan vs Pengeluaran</h6>
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
                    <p class="text-muted mb-0 small">Tidak ada data untuk periode yang dipilih</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie Chart - Full width on mobile -->
            <div class="col-12 col-lg-4 mb-3">
              <div class="card border-0">
                <div class="card-header bg-transparent border-0">
                  <h6 class="card-title mb-0 fw-medium">Kategori Pengeluaran</h6>
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
                    <p class="text-muted mb-0 small">Tidak ada data pengeluaran</p>
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
              <div class="border-0 h-100">
                <div class="bg-transparent border-0 p-3">
                  <h6 class="card-title mb-0 fw-medium">Rincian Kategori</h6>
                </div>
                <div class="card-body p-2">
                  <div class="row g-2">
                    <div class="col-12 col-md-6">
                      <div class="card border-0 h-100">
                        <div class="bg-transparent border-0 p-2">
                          <h6 class="text-success mb-0 d-flex align-items-center">
                            <i class="bi bi-arrow-up-circle me-2"></i>
                            Kategori Pemasukan
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
                            <p class="text-muted mb-0 small">Tidak ada data pemasukan</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Expense Categories -->
                    <div class="col-12 col-md-6">
                      <div class="card border-0 h-100">
                        <div class="bg-transparent border-0 p-2">
                          <h6 class="text-danger mb-0 d-flex align-items-center">
                            <i class="bi bi-arrow-up-circle me-2"></i>
                            Kategori Pengeluaran
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
                              <p class="text-muted mb-0 small">Tidak ada data pengeluaran</p>
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
                  <h6 class="card-title mb-0 fw-medium">Perbandingan Bulanan</h6>
                  <button
                    class="btn btn-sm btn-outline-primary"
                    @click="exportMonthlyDataPDF"
                    title="Download data bulanan (PDF)"
                  >
                    <i class="bi bi-file-earmark-pdf me-1 d-none d-md-inline"></i>
                    <span class="d-none d-md-inline">PDF</span>
                    <i class="bi bi-file-earmark-pdf d-md-none"></i>
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
                              <small class="text-muted d-block">Pemasukan</small>
                              <div class="fw-bold text-success small">
                                {{ formatCurrency(month.income) }}
                              </div>
                            </div>
                          </div>
                          <div class="col-4">
                            <div class="metric-item">
                              <small class="text-muted d-block">Pengeluaran</small>
                              <div class="fw-bold text-danger small">
                                {{ formatCurrency(month.expenses) }}
                              </div>
                            </div>
                          </div>
                          <div class="col-4">
                            <div class="metric-item">
                              <small class="text-muted d-block">Bersih</small>
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
                            <th>Bulan</th>
                            <th class="text-end">Pemasukan</th>
                            <th class="text-end">Pengeluaran</th>
                            <th class="text-end">Jumlah Bersih</th>
                            <th class="text-end">Tingkat Tabungan</th>
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
                    <h6 class="text-muted mt-3">Tidak ada data bulanan</h6>
                    <p class="text-muted small">
                      Mulai tambahkan transaksi untuk melihat perbandingan bulanan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="report-footer mt-4 text-center text-muted small">
          Dibuat oleh Aplikasi CashFlow - © {{ new Date().getFullYear() }}
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
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 15px rgba(56, 239, 125, 0.25);
}

.summary-card.expense-card {
  background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
  box-shadow: 0 4px 15px rgba(238, 9, 121, 0.25);
}

.summary-card.savings-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.25);
}

.summary-card.rate-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  box-shadow: 0 4px 15px rgba(240, 147, 251, 0.25);
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
