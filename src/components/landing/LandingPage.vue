<template>
  <div class="landing-theme">
    <section class="hero-section position-relative overflow-hidden">
      <div class="container pt-5">
        <div class="row align-items-center g-4">
          <div class="col-lg-6">
            <div class="hero-badge text-uppercase fw-bold mb-3">
              <i class="bi bi-currency-dollar me-2"></i>
              Kelola keuangan dengan mudah
            </div>
            <h1 class="display-4 fw-bold lh-tight hero-title">
              Pantau Cashflow, Budgeting, dan Capai Target Finansial
            </h1>
            <p class="lead text-light mt-3">
              CashFlow membantu Anda mengelola keuangan pribadi dengan mudah. Catat transaksi, atur
              budget, dan pantau laporan keuangan dalam satu aplikasi yang simpel.
            </p>

            <div class="d-flex justify-content-center justify-content-lg-start my-4">
              <button class="btn btn-gradient btn-lg px-4 shadow-lg" @click="$emit('show-auth')">
                Mulai Sekarang
              </button>
            </div>
          </div>

          <div class="col-lg-6">
            <LandingVisual />
          </div>
        </div>
      </div>
    </section>

    <section id="fitur" class="container-fluid px-5 mt-4 mb-6">
      <div class="text-center mb-4">
        <h2 class="fw-bold">Fitur Lengkap untuk Keuangan Anda</h2>
        <p class="text-muted">
          Dirancang simpel dan mudah digunakan untuk membantu mencapai kebebasan finansial.
        </p>
      </div>

      <div class="row g-3 g-md-4 mb-5">
        <div class="col-6 col-lg-3" v-for="feature in features" :key="feature.id">
          <div class="feature-card h-100">
            <div class="icon-bubble" :class="feature.iconClass">
              <i :class="feature.icon"></i>
            </div>
            <div>
              <h6 class="mt-3 mb1">{{ feature.title }}</h6>
              <p class="text-muted small mb-0">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mb-2 d-none d-md-flex justify-content-center">
        <button class="btn btn-gradient btn-lg px-4 shadow" @click="$emit('show-auth')">
          Login Sekarang
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import LandingVisual from './LandingVisual.vue'

defineEmits(['show-auth'])

onMounted(() => {
  try {
    document.body.classList.add('no-header')
  } catch {}
})

onUnmounted(() => {
  try {
    document.body.classList.remove('no-header')
  } catch {}
})

const features = ref([
  {
    id: 1,
    title: 'Catat Transaksi',
    description: 'Pencatatan pemasukan dan pengeluaran yang mudah dan cepat.',
    icon: 'bi bi-journal-text',
    iconClass: 'text-primary bg-primary-subtle',
  },
  {
    id: 2,
    title: 'Budget Planning',
    description: 'Atur anggaran bulanan dan pantau realisasinya secara real-time.',
    icon: 'bi bi-pie-chart-fill',
    iconClass: 'text-success bg-success-subtle',
  },
  {
    id: 3,
    title: 'Laporan Visual',
    description: 'Grafik dan chart yang memudahkan analisis pola keuangan Anda.',
    icon: 'bi bi-bar-chart-fill',
    iconClass: 'text-info bg-info-subtle',
  },
  {
    id: 4,
    title: 'Target Finansial',
    description: 'Tetapkan dan tracking progress goal keuangan jangka pendek maupun panjang.',
    icon: 'bi bi-trophy-fill',
    iconClass: 'text-warning bg-warning-subtle',
  },
])
</script>
