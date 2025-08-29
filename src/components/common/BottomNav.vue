<template>
  <nav class="bottom-nav d-lg-none">
    <router-link to="/" class="nav-item" :class="{ active: $route.name === 'dashboard' }">
      <i class="bi bi-house"></i>
      <span>Home</span>
    </router-link>

    <router-link
      to="/transactions"
      class="nav-item"
      :class="{ active: $route.name === 'transactions' }"
    >
      <i class="bi bi-list-ul"></i>
      <span>Transaksi</span>
    </router-link>

    <router-link to="/budget" class="nav-item" :class="{ active: $route.name === 'budget' }">
      <i class="bi bi-piggy-bank"></i>
      <span>Budget</span>
    </router-link>

    <router-link to="/goals" class="nav-item" :class="{ active: $route.name === 'goals' }">
      <i class="bi bi-bullseye"></i>
      <span>Goal</span>
    </router-link>

    <router-link to="/reports" class="nav-item" :class="{ active: $route.name === 'reports' }">
      <i class="bi bi-bar-chart"></i>
      <span>Report</span>
    </router-link>
  </nav>
</template>

<script setup>
// purely presentational; relies on router-link active state
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  z-index: 1100;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  text-decoration: none;
  font-size: 11px;
  gap: 4px;
}

.nav-item i {
  font-size: 18px;
}

.nav-item.active,
.nav-item.router-link-active {
  color: var(--bs-primary);
  font-weight: 600;
}
</style>
