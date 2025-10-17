<template>
  <AppLayout>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Memuat...</span>
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
              <h4 class="mb-1">Transaksi</h4>
              <p class="text-muted mb-0 small">Kelola pemasukan dan pengeluaran Kamu</p>
            </div>
            <button
              class="btn btn-primary btn-sm"
              @click="openAddModal"
              data-bs-toggle="modal"
              data-bs-target="#transactionModal"
            >
              <i class="bi bi-plus-circle me-1"></i>
              <span class="d-none d-sm-inline">Tambah Transaksi</span>
              <span class="d-sm-none">Tambah</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="row mb-0 g-2">
        <div class="col-12 col-md-4 mt-0">
          <div class="card net-card border-0">
            <div class="card-body p-3 text-center text-light">
              <div class="mb-2">
                <i class="bi bi-wallet2"></i>
              </div>
              <h5 class="card-title mb-1 smallFont text-light">Jumlah Bersih</h5>
              <h5
                class="smallFont mb-0"
                :class="filteredSummary.netAmount >= 0 ? 'positive' : 'negative'"
              >
                {{ formatCurrency(filteredSummary.netAmount) }}
              </h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 mt-0">
          <div class="card income-card border-0">
            <div class="card-body p-3 text-center text-light">
              <div class="mb-2">
                <i class="bi bi-arrow-up-circle"></i>
              </div>
              <h5 class="card-title mb-1 smallFont text-light">Pemasukan</h5>
              <h5 class="smallFont mb-0">{{ formatCurrency(filteredSummary.totalIncome) }}</h5>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-4 mt-0">
          <div class="card expense-card border-0">
            <div class="card-body p-3 text-center text-light">
              <div class="mb-2">
                <i class="bi bi-arrow-down-circle"></i>
              </div>
              <h5 class="card-title mb-1 smallFont text-light">Pengeluaran</h5>
              <h5 class="smallFont mb-0">
                {{ formatCurrency(filteredSummary.totalExpenses) }}
              </h5>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters - Mobile Optimized -->
      <div class="row mb-0">
        <div class="col-12">
          <div class="card border-0">
            <div class="card-header bg-transparent border-0 py-3">
              <div class="d-flex justify-content-between align-items-center">
                <h6 class="card-title mb-0 fw-medium">Filter</h6>
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
                    <label class="form-label small fw-medium">Rentang Tanggal</label>
                    <select v-model="filters.dateRange" class="form-select form-select-sm">
                      <option value="this-month">Bulan Ini</option>
                      <option value="last-month">Bulan Lalu</option>
                      <option value="this-year">Tahun Ini</option>
                      <option value="custom">Rentang Kustom</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Jenis</label>
                    <select v-model="filters.type" class="form-select form-select-sm">
                      <option value="">Semua Jenis</option>
                      <option value="income">Pemasukan</option>
                      <option value="expense">Pengeluaran</option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Kategori</label>
                    <select v-model="filters.category" class="form-select form-select-sm">
                      <option value="">Semua Kategori</option>
                      <option
                        v-for="category in categories"
                        :key="category.id"
                        :value="category.name"
                      >
                        {{ category.name }}
                      </option>
                    </select>
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Cari</label>
                    <div class="input-group input-group-md">
                      <span class="input-group-text">
                        <i class="bi bi-search"></i>
                      </span>
                      <input
                        v-model="filters.search"
                        type="text"
                        class="form-control"
                        placeholder="Cari..."
                      />
                    </div>
                  </div>
                </div>
                <!-- Custom range inputs -->
                <div class="row g-2 mt-2" v-if="filters.dateRange === 'custom'">
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Mulai</label>
                    <input
                      v-model="filters.customStartDate"
                      type="date"
                      class="form-control form-control-sm"
                      :max="filters.customEndDate || undefined"
                    />
                  </div>
                  <div class="col-6 col-md-3">
                    <label class="form-label small fw-medium">Selesai</label>
                    <input
                      v-model="filters.customEndDate"
                      type="date"
                      class="form-control form-control-sm"
                      :min="filters.customStartDate || undefined"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions List -->
      <div class="row">
        <div class="col-12">
          <div class="card border-0">
            <div
              class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pb-2"
            >
              <h6 class="card-title mb-0 fw-medium">Riwayat Transaksi</h6>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-sm btn-outline-secondary d-md-inline-flex"
                  @click="exportToPDF"
                  :disabled="filteredTransactions.length === 0"
                >
                  <i class="bi bi-download me-1"></i>
                  Ekspor
                </button>
                <div class="dropdown">
                  <button
                    class="btn btn-sm btn-outline-secondary dropdown-toggle"
                    data-bs-toggle="dropdown"
                  >
                    <i class="bi bi-sort-down d-md-none"></i>
                    <span class="d-none d-md-inline">Urutkan</span>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="sortBy('date', 'desc')">
                        <i
                          class="bi bi-check2"
                          v-if="sortConfig.field === 'date' && sortConfig.order === 'desc'"
                        ></i>
                        Terbaru
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="sortBy('date', 'asc')">
                        <i
                          class="bi bi-check2"
                          v-if="sortConfig.field === 'date' && sortConfig.order === 'asc'"
                        ></i>
                        Terlama
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="sortBy('amount', 'desc')">
                        <i
                          class="bi bi-check2"
                          v-if="sortConfig.field === 'amount' && sortConfig.order === 'desc'"
                        ></i>
                        Nominal Tertinggi
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="sortBy('amount', 'asc')">
                        <i
                          class="bi bi-check2"
                          v-if="sortConfig.field === 'amount' && sortConfig.order === 'asc'"
                        ></i>
                        Nominal Terendah
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body p-0">
              <!-- Mobile Transaction List -->
              <div class="d-block">
                <div
                  v-for="transaction in filteredTransactions"
                  :key="transaction.id"
                  class="transaction-item p-3 border-bottom position-relative"
                >
                  <div class="d-flex justify-content-between align-items-start gap-2">
                    <!-- Left: icon + description + category -->
                    <div class="transaction-left d-flex align-items-start flex-grow-1 min-w-0">
                      <div
                        class="transaction-icon me-2 flex-shrink-0"
                        :style="{
                          background: transaction.color + '20',
                          color: transaction.color,
                        }"
                      >
                        <i :class="transaction.icon"></i>
                      </div>

                      <div class="transaction-description flex-grow-1 min-w-0 me-2">
                        <div
                          class="transaction-title fw-medium text-truncate"
                          :title="transaction.description"
                        >
                          {{ transaction.description }}
                        </div>
                        <div class="mt-1">
                          <span class="badge bg-light text-dark">{{ transaction.category }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Middle: amount + date -->
                    <div class="transaction-amount-date text-end flex-shrink-0 ms-2">
                      <div
                        class="transaction-amount fw-bold small"
                        :class="transaction.type === 'income' ? 'text-success' : 'text-danger'"
                      >
                        {{ transaction.type === 'expense' ? '-' : '+'
                        }}{{ formatCurrency(transaction.amount) }}
                      </div>
                      <small class="text-muted d-block mt-1">{{
                        formatDate(transaction.date)
                      }}</small>
                    </div>

                    <!-- Right: action buttons -->
                    <div class="action-buttons d-flex flex-shrink-0 gap-1 ms-2">
                      <button
                        class="btn btn-primary btn-sm"
                        @click="editTransaction(transaction)"
                        data-bs-toggle="modal"
                        data-bs-target="#transactionModal"
                        title="Ubah"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button
                        class="btn btn-danger btn-sm"
                        @click="confirmDelete(transaction.id)"
                        title="Hapus"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="filteredTransactions.length === 0" class="empty-state py-4">
                <i class="bi bi-inbox text-muted"></i>
                <h6 class="text-muted mt-3">Tidak ada transaksi</h6>
                <p class="text-muted small">
                  Coba sesuaikan filter Anda atau tambah transaksi baru.
                </p>
                <button
                  class="btn btn-primary btn-sm"
                  @click="openAddModal"
                  data-bs-toggle="modal"
                  data-bs-target="#transactionModal"
                >
                  Tambah Transaksi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Transaction Modal -->
      <div class="modal fade" id="transactionModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">
                {{ editingTransaction ? 'Ubah Transaksi' : 'Tambah Transaksi Baru' }}
              </h6>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                @click="resetForm"
              ></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTransaction">
                <div class="mb-3">
                  <label class="form-label small fw-medium">Jenis</label>
                  <div class="btn-group w-100" role="group">
                    <input
                      type="radio"
                      class="btn-check"
                      id="income-edit"
                      v-model="transactionForm.type"
                      value="income"
                    />
                    <label class="btn btn-outline-success" for="income-edit">
                      <i class="bi bi-arrow-up-circle me-1"></i>
                      Pemasukan
                    </label>
                    <input
                      type="radio"
                      class="btn-check"
                      id="expense-edit"
                      v-model="transactionForm.type"
                      value="expense"
                    />
                    <label class="btn btn-outline-danger" for="expense-edit">
                      <i class="bi bi-arrow-down-circle me-1"></i>
                      Pengeluaran
                    </label>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Jumlah</label>
                  <div class="input-group">
                    <span class="input-group-text">Rp</span>
                    <input
                      v-model.number="transactionForm.amount"
                      type="number"
                      class="form-control form-control-lg"
                      placeholder="0"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Deskripsi</label>
                  <input
                    v-model="transactionForm.description"
                    type="text"
                    class="form-control"
                    placeholder="Masukkan deskripsi"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Kategori</label>
                  <select v-model="transactionForm.category" class="form-select" required>
                    <option value="">Pilih Kategori</option>
                    <option
                      v-for="category in getCategoriesByType(transactionForm.type)"
                      :key="category.id"
                      :value="category.name"
                    >
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-medium">Tanggal</label>
                  <input v-model="transactionForm.date" type="date" class="form-control" required />
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                data-bs-dismiss="modal"
                @click="resetForm"
              >
                Batal
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="saveTransaction"
                :disabled="transactionsLoading"
              >
                <span
                  v-if="transactionsLoading"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                {{ editingTransaction ? 'Perbarui' : 'Simpan' }} Transaksi
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div class="modal fade" id="confirmDeleteModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">Hapus Transaksi?</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p class="mb-2">Anda yakin ingin menghapus transaksi berikut?</p>
              <div class="p-2 bg-light rounded small" v-if="pendingDelete">
                <div class="fw-medium">{{ pendingDelete.description }}</div>
                <div class="d-flex justify-content-between mt-1">
                  <span class="text-muted">{{ formatDate(pendingDelete.date) }}</span>
                  <span
                    class="fw-semibold"
                    :class="pendingDelete.type === 'income' ? 'text-success' : 'text-danger'"
                  >
                    {{ pendingDelete.type === 'expense' ? '-' : '+'
                    }}{{ formatCurrency(pendingDelete.amount) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
                Batal
              </button>
              <button type="button" class="btn btn-danger btn-sm" @click="performDelete">
                Hapus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue'
import { useTransactions } from '@/composables/useTransactions'
import { useCategories } from '@/composables/useCategories'
import AppLayout from '@/components/common/AppLayout.vue'

// Use composables
const {
  transactions,
  loading: transactionsLoading,
  error: transactionsError,
  summary,
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  resetLoadingState: resetTransactionsLoading,
} = useTransactions()

const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  fetchCategories,
  getCategoriesByType,
  resetLoadingState: resetCategoriesLoading,
} = useCategories()

// Filters
const filters = reactive({
  dateRange: 'this-month',
  category: '',
  type: '',
  search: '',
  customStartDate: '',
  customEndDate: '',
})

// Sorting state
const sortConfig = reactive({
  field: 'date',
  order: 'desc',
})

// Transaction form
const transactionForm = reactive({
  type: 'expense',
  amount: null,
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
})

const editingTransaction = ref(null)
const pendingDelete = ref(null)

// Computed properties
const loading = computed(() => transactionsLoading.value || categoriesLoading.value)
const error = computed(() => transactionsError.value || categoriesError.value)

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  // Filter by type
  if (filters.type) {
    filtered = filtered.filter((t) => t.type === filters.type)
  }

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter((t) => t.category === filters.category)
  }

  // Filter by search
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        t.notes?.toLowerCase().includes(searchLower),
    )
  }

  // Locale-aware date range filtering (inclusive)
  const parseLocalDate = (value) => {
    // value can be 'YYYY-MM-DD' or ISO; ensure local date without TZ offset issues
    if (!value) return null
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number)
      return new Date(y, m - 1, d)
    }
    const dt = new Date(value)
    return isNaN(dt.getTime()) ? null : dt
  }

  const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0, 0)
  const endOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59, 999)

  const getDateRange = () => {
    const now = new Date()
    const todayStart = startOfDay(now)
    switch (filters.dateRange) {
      case 'this-month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = endOfDay(now)
        return { start: startOfDay(start), end }
      }
      case 'last-month': {
        const firstLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start: startOfDay(firstLastMonth), end: endOfDay(lastLastMonth) }
      }
      case 'this-year': {
        const start = new Date(now.getFullYear(), 0, 1)
        const end = endOfDay(now)
        return { start: startOfDay(start), end }
      }
      case 'custom': {
        const start = parseLocalDate(filters.customStartDate)
        const end = parseLocalDate(filters.customEndDate)
        if (!start && !end) return null
        const startFinal = start ? startOfDay(start) : new Date(0)
        const endFinal = end ? endOfDay(end) : endOfDay(now)
        return { start: startFinal, end: endFinal }
      }
      default:
        return { start: todayStart, end: endOfDay(now) }
    }
  }

  const range = getDateRange()
  if (range) {
    filtered = filtered.filter((t) => {
      const tDate = parseLocalDate(t.date)
      if (!tDate) return false
      return tDate >= range.start && tDate <= range.end
    })
  }

  return filtered.sort((a, b) => {
    // Apply sorting based on sortConfig
    let comparison = 0

    if (sortConfig.field === 'date') {
      comparison = new Date(a.date) - new Date(b.date)
    } else if (sortConfig.field === 'amount') {
      comparison = Number(a.amount) - Number(b.amount)
    }

    return sortConfig.order === 'asc' ? comparison : -comparison
  })
})

// Summary that respects current filters
const filteredSummary = computed(() => {
  let totalIncome = 0
  let totalExpenses = 0
  for (const t of filteredTransactions.value) {
    const amt = Number(t.amount) || 0
    if (t.type === 'income') totalIncome += amt
    else if (t.type === 'expense') totalExpenses += amt
  }
  return {
    totalIncome,
    totalExpenses,
    netAmount: totalIncome - totalExpenses,
  }
})

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

const resetForm = () => {
  Object.assign(transactionForm, {
    type: 'expense',
    amount: null,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  editingTransaction.value = null
}

const openAddModal = () => {
  resetForm()
}

const saveTransaction = async () => {
  try {
    if (editingTransaction.value) {
      await updateTransaction(editingTransaction.value.id, transactionForm)
    } else {
      await addTransaction(transactionForm)
    }

    const modal = document.getElementById('transactionModal')
    // eslint-disable-next-line no-undef
    const bsModal =
      typeof bootstrap !== 'undefined' && bootstrap?.Modal?.getInstance
        ? bootstrap.Modal.getInstance(modal)
        : null
    if (bsModal) bsModal.hide()

    resetForm()
  } catch (err) {
    console.error('Failed to save transaction:', err)
    alert('Gagal menyimpan transaksi. Silakan coba lagi.')
  }
}

const editTransaction = (transaction) => {
  editingTransaction.value = transaction
  Object.assign(transactionForm, {
    type: transaction.type,
    amount: parseFloat(transaction.amount),
    description: transaction.description,
    category: transaction.category,
    date: new Date(transaction.date).toISOString().split('T')[0],
    notes: transaction.notes || '',
  })
}

const confirmDelete = (id) => {
  const tx = transactions.value.find((t) => t.id === id)
  pendingDelete.value = tx
  const modalEl = document.getElementById('confirmDeleteModal')
  // eslint-disable-next-line no-undef
  const modal =
    typeof bootstrap !== 'undefined' && bootstrap?.Modal ? new bootstrap.Modal(modalEl) : null
  if (modal) modal.show()
}

const performDelete = async () => {
  if (!pendingDelete.value?.id) return
  try {
    await deleteTransaction(pendingDelete.value.id)
    await fetchTransactions()
  } catch (err) {
    console.error('Failed to delete transaction:', err)
    alert('Gagal menghapus transaksi. Silakan coba lagi.')
  } finally {
    const modalEl = document.getElementById('confirmDeleteModal')
    // eslint-disable-next-line no-undef
    const instance =
      typeof bootstrap !== 'undefined' && bootstrap?.Modal?.getInstance
        ? bootstrap.Modal.getInstance(modalEl)
        : null
    if (instance) instance.hide()
    pendingDelete.value = null
  }
}

const sortBy = (field, order) => {
  sortConfig.field = field
  sortConfig.order = order
}

const exportToPDF = async () => {
  try {
    // Import jsPDF and autoTable
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text('Riwayat Transaksi', 14, 20)

    // Add date range info
    doc.setFontSize(11)
    const dateRangeText =
      filters.dateRange === 'this-month'
        ? 'Bulan Ini'
        : filters.dateRange === 'last-month'
          ? 'Bulan Lalu'
          : filters.dateRange === 'this-year'
            ? 'Tahun Ini'
            : filters.dateRange === 'custom'
              ? `${filters.customStartDate || ''} - ${filters.customEndDate || ''}`
              : 'Semua'
    doc.text(`Periode: ${dateRangeText}`, 14, 28)

    // Add summary
    doc.text(`Total Pemasukan: ${formatCurrency(filteredSummary.value.totalIncome)}`, 14, 34)
    doc.text(`Total Pengeluaran: ${formatCurrency(filteredSummary.value.totalExpenses)}`, 14, 40)
    doc.text(`Saldo Bersih: ${formatCurrency(filteredSummary.value.netAmount)}`, 14, 46)

    // Prepare table data
    const tableData = filteredTransactions.value.map((t) => [
      formatDate(t.date),
      t.description,
      t.category,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      formatCurrency(t.amount),
    ])

    // Add table using autoTable
    autoTable(doc, {
      startY: 52,
      head: [['Tanggal', 'Deskripsi', 'Kategori', 'Jenis', 'Nominal']],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35, halign: 'right' },
      },
    })

    // Save PDF
    const fileName = `Transaksi_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  } catch (err) {
    console.error('Failed to export PDF:', err)
    alert('Gagal mengekspor PDF. Silakan coba lagi.')
  }
}

watch(
  () => transactionForm.type,
  () => {
    transactionForm.category = ''
  },
)

// Clear custom dates when range is not 'custom'
watch(
  () => filters.dateRange,
  (val) => {
    if (val !== 'custom') {
      filters.customStartDate = ''
      filters.customEndDate = ''
    }
  },
)

onMounted(async () => {
  // Simple fetch with cache - realtime handled globally
  try {
    await Promise.all([fetchTransactions(), fetchCategories()])
  } catch (err) {
    console.error('Error loading transaction data:', err)
  }
})

onBeforeUnmount(() => {
  // Reset loading state saat component akan di-destroy
  resetTransactionsLoading()
  resetCategoriesLoading()
})

onUnmounted(() => {
  // No cleanup needed - realtime managed globally
})
</script>

<style scoped>
.net-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.25);
}

.income-card {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  box-shadow: 0 4px 15px rgba(56, 239, 125, 0.25);
}

.expense-card {
  background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%);
  box-shadow: 0 4px 15px rgba(238, 9, 121, 0.25);
}

/* Ensure transaction icons are always circular and properly sized */
.transaction-icon {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-sizing: border-box;
  aspect-ratio: 1;
  padding: 0;
  margin: 0;
}

/* Ensure the icon container doesn't interfere */
.transaction-item .d-flex > .transaction-icon {
  flex-shrink: 0;
  flex-grow: 0;
}

/* Mobile specific transaction icon - more specific selector */
@media (max-width: 576px) {
  .transaction-item .transaction-icon,
  .transaction-item .d-flex .transaction-icon {
    width: 30px !important;
    height: 30px !important;
    font-size: 0.8rem !important;
    margin-right: 0.5rem !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 30px !important;
    min-height: 30px !important;
    max-width: 30px !important;
    max-height: 30px !important;
    box-sizing: border-box !important;
    padding: 0 !important;
    margin-left: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    aspect-ratio: 1 !important;
    transform: none !important;
    scale: 1 !important;
  }
}

.transaction-item {
  transition: all 0.2s ease;
  border-radius: 0;
}

.transaction-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.transaction-item:last-child {
  border-bottom: none !important;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.btn {
  border-radius: 8px;
}

.badge {
  font-size: 0.7rem;
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

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 1rem;
}

/* Mobile specific styles */
@media (max-width: 576px) {
  .transaction-item {
    padding: 1rem !important;
  }

  .fw-medium {
    font-size: 0.9rem;
  }

  .action-buttons {
    flex-shrink: 0;
    margin-left: auto;
  }

  .transaction-item .d-flex {
    gap: 0.25rem;
  }

  /* Better layout for mobile transaction items */
  .transaction-item .d-flex.justify-content-between {
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  /* Left section (icon + description) - allow to shrink */
  .transaction-item .transaction-left {
    flex: 1 1 auto;
    min-width: 0;
    max-width: calc(100% - 170px); /* Reserve space for amount+buttons */
  }

  /* Description container */
  .transaction-item .transaction-description {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
  }

  /* Title with ellipsis */
  .transaction-item .transaction-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    max-width: 100%;
  }

  /* Ensure amount and date have enough space and don't get truncated */
  .transaction-item .transaction-amount-date {
    flex: 0 0 96px;
    min-width: 96px;
    max-width: 96px;
    white-space: nowrap;
  }

  .transaction-item .transaction-amount-date .transaction-amount {
    white-space: nowrap;
    font-size: 0.85rem;
  }

  /* Action buttons fixed width */
  .action-buttons {
    flex: 0 0 64px;
    min-width: 64px;
    max-width: 64px;
  }

  /* Compact amount and date section */
  .transaction-amount-date {
    flex-shrink: 0;
  }

  /* Responsive adjustments for very small screens */
  @media (max-width: 375px) {
    /* Left section gets even less space */
    .transaction-item .transaction-left {
      max-width: calc(100% - 150px); /* Tighter constraint */
    }

    /* Amount section more compact */
    .transaction-item .transaction-amount-date {
      flex: 0 0 80px;
      min-width: 80px;
      max-width: 80px;
    }

    .transaction-item .transaction-amount-date .transaction-amount {
      font-size: 0.75rem;
    }

    .transaction-item .transaction-amount-date small {
      font-size: 0.65rem;
    }

    /* Buttons more compact */
    .action-buttons {
      flex: 0 0 56px;
      min-width: 56px;
      max-width: 56px;
      gap: 0.25rem !important;
    }

    .action-buttons .btn-sm {
      padding: 0.2rem 0.35rem;
    }
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

  .smallFont {
    font-size: 0.95rem;
  }
}

/* Tablet styles */
@media (min-width: 577px) and (max-width: 768px) {
  .transaction-item {
    padding: 1.25rem !important;
  }
}

/* Collapsible filters for mobile */
@media (max-width: 767px) {
  #filtersCollapse:not(.show) {
    display: none !important;
  }
}

/* Smooth transitions */
.collapse {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.transaction-item .btn-sm:hover {
  transform: scale(1.05);
}

/* Global transaction layout improvements */
.transaction-item .d-flex {
  align-items: flex-start;
}

.transaction-description {
  overflow: hidden;
}

.transaction-amount-date {
  text-align: right;
  white-space: nowrap;
}

/* Ensure buttons don't shrink */
.action-buttons {
  flex-shrink: 0;
}

/* Sort dropdown checkmark */
.dropdown-item .bi-check2 {
  margin-right: 0.5rem;
  color: #198754;
  font-weight: bold;
}

.dropdown-item {
  cursor: pointer;
}

.dropdown-item:active {
  background-color: #0d6efd;
  color: white;
}
</style>
<style>
/* Ensure modal overlays bottom navigation on mobile */
.modal {
  z-index: 2000 !important;
}

.modal-backdrop {
  z-index: 1990 !important;
}
</style>
