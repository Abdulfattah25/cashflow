<template>
  <div class="landing-visual glass-card p-0">
    <div class="p-4">
      <div class="row g-3">
        <div class="col-6">
          <div class="mini-card">
            <div class="d-flex align-items-center">
              <div class="icon-bubble bg-success-subtle text-success me-3">
                <i class="bi bi-arrow-up-circle"></i>
              </div>
              <div>
                <div class="small text-muted">Pemasukan</div>
                <div class="h4 mb-0 fw-bold text-success">Rp 3.6 jt</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="mini-card">
            <div class="d-flex align-items-center">
              <div class="icon-bubble bg-danger-subtle text-danger me-3">
                <i class="bi bi-arrow-down-circle"></i>
              </div>
              <div>
                <div class="small text-muted">Pengeluaran</div>
                <div class="h4 mb-0 fw-bold text-danger">Rp 2.8 jt</div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mock-panel">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <strong class="text-dark">Transaksi Terbaru</strong>
              <span class="badge bg-primary-subtle text-primary">Hari Ini</span>
            </div>
            <div class="transaction-row">
              <div class="transaction-icon bg-success-subtle text-success">
                <i class="bi bi-arrow-up"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium text-dark">Gaji Bulanan</div>
                <div class="small text-muted">Pemasukan</div>
              </div>
              <div class="text-success fw-bold">+Rp 3.600.000</div>
            </div>
            <div class="transaction-row">
              <div class="transaction-icon bg-danger-subtle text-danger">
                <i class="bi bi-arrow-down"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium text-dark">Belanja Groceries</div>
                <div class="small text-muted">Pengeluaran</div>
              </div>
              <div class="text-danger fw-bold">-Rp 350.000</div>
            </div>
            <div class="transaction-row">
              <div class="transaction-icon bg-info-subtle text-info">
                <i class="bi bi-arrow-down"></i>
              </div>
              <div class="flex-grow-1">
                <div class="fw-medium text-dark">Bayar Listrik</div>
                <div class="small text-muted">Pengeluaran</div>
              </div>
              <div class="text-danger fw-bold">-Rp 125.000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>
