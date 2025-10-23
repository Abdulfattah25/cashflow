<template>
  <div>
    <div class="modal-backdrop fade show" @click="closeModal"></div>
    <div class="modal fade show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header border-0 pb-2">
            <div>
              <h5 class="modal-title fw-bold text-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Peringatan Anggaran
              </h5>
              <p class="text-muted small mb-0">Beberapa anggaran Anda telah melebihi batas</p>
            </div>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body pt-2">
            <div v-for="budget in exceededBudgets" :key="budget.id" class="budget-alert-card mb-3">
              <div class="d-flex align-items-start gap-3">
                <div class="budget-icon-wrapper" :style="{ backgroundColor: budget.color + '20' }">
                  <i :class="budget.icon" :style="{ color: budget.color }" class="fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 class="mb-1 fw-bold">{{ budget.category }}</h6>
                      <small class="text-muted">{{ budget.period }}</small>
                    </div>
                    <span class="badge bg-danger">{{ budget.percentage }}%</span>
                  </div>
                  <div class="mb-2">
                    <div class="d-flex justify-content-between text-muted small mb-1">
                      <span>Anggaran</span>
                      <span class="fw-medium text-dark">{{ formatCurrency(budget.amount) }}</span>
                    </div>
                    <div class="d-flex justify-content-between text-muted small mb-1">
                      <span>Terpakai</span>
                      <span class="fw-medium text-danger">{{ formatCurrency(budget.spent) }}</span>
                    </div>
                    <div class="d-flex justify-content-between small">
                      <span class="text-danger fw-bold">Melebihi</span>
                      <span class="fw-bold text-danger">
                        {{ formatCurrency(Math.abs(budget.remaining)) }}
                      </span>
                    </div>
                  </div>
                  <div class="progress" style="height: 6px">
                    <div
                      class="progress-bar bg-danger"
                      :style="{ width: Math.min(budget.percentage, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="alert alert-warning border-0 mb-0 mt-3">
              <div class="d-flex align-items-start gap-2">
                <i class="bi bi-info-circle me-1 mt-1"></i>
                <div class="flex-grow-1">
                  <small class="d-block mb-2">
                    Segera tinjau pengeluaran Anda dan sesuaikan anggaran jika diperlukan.
                  </small>
                  <small class="d-block text-muted">
                    <i class="bi bi-clock me-1"></i>
                    Peringatan ini akan muncul lagi dalam <strong>{{ hoursUntilNext }} jam</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  exceededBudgets: {
    type: Array,
    required: true,
  },
  hoursUntilNext: {
    type: Number,
    default: 12,
  },
})

const emit = defineEmits(['close'])

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const closeModal = () => {
  cleanupModal()
  emit('close')
}

const cleanupModal = () => {
  document.body.classList.remove('modal-open')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
  document.querySelectorAll('.modal-backdrop').forEach((b) => b.remove())
}

onMounted(() => {
  document.body.classList.add('modal-open')
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  cleanupModal()
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
}

.modal-dialog {
  max-width: 600px;
  margin: 1.75rem auto;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  outline: 0;
}

.budget-alert-card {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #dc3545;
  transition: all 0.3s ease;
}

.budget-alert-card:hover {
  background: #f1f3f5;
  transform: translateX(2px);
}

.budget-icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.progress {
  border-radius: 3px;
  background-color: #e9ecef;
}

.progress-bar {
  border-radius: 3px;
  transition: width 0.6s ease;
}

.modal-header {
  padding: 1.25rem 1.5rem;
}

.modal-body {
  padding: 0 1.5rem 1rem;
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

.alert {
  border-radius: 8px;
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }

  .budget-alert-card {
    padding: 0.75rem;
  }

  .budget-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .budget-icon-wrapper i {
    font-size: 1.25rem !important;
  }

  .modal-body {
    padding: 0 1rem 0.75rem;
  }

  .modal-header {
    padding: 1rem;
  }
}
</style>
