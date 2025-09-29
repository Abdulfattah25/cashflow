<template>
  <nav class="sidebar bg-primary text-white" style="width: 250px">
    <div class="p-3">
      <!-- Logo -->
      <div class="navbar-brand d-flex align-items-center mb-4">
        <i class="bi bi-wallet2 me-2 fs-3"></i>
        <span class="fs-4 fw-bold">CashFlow App</span>
      </div>

      <!-- Navigation Menu -->
      <ul class="nav nav-pills flex-column">
        <li class="nav-item mb-2">
          <router-link
            to="/"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'dashboard' }"
          >
            <i class="bi bi-speedometer2 me-2"></i>
            Dashboard
          </router-link>
        </li>

        <li class="nav-item mb-2">
          <router-link
            to="/transactions"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'transactions' }"
          >
            <i class="bi bi-list-ul me-2"></i>
            Transactions
          </router-link>
        </li>

        <li class="nav-item mb-2">
          <router-link
            to="/reports"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'reports' }"
          >
            <i class="bi bi-bar-chart me-2"></i>
            Reports
          </router-link>
        </li>

        <li class="nav-item mb-2">
          <router-link
            to="/budget"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'budget' }"
          >
            <i class="bi bi-piggy-bank me-2"></i>
            Budget
          </router-link>
        </li>

        <li class="nav-item mb-2">
          <router-link
            to="/goals"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'goals' }"
          >
            <i class="bi bi-bullseye me-2"></i>
            Goals
          </router-link>
        </li>

        <li class="nav-item mb-2">
          <router-link
            to="/profile"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'profile' }"
          >
            <i class="bi bi-person-circle me-2"></i>
            Profile
          </router-link>
        </li>

        <li v-if="authStore.user?.role === 'admin'" class="nav-item mb-2">
          <router-link
            to="/admin"
            class="nav-link text-white"
            :class="{ 'active bg-light text-primary': $route.name === 'admin' }"
          >
            <i class="bi bi-shield-check me-2"></i>
            Admin Panel
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1050;
  transition: transform 0.3s ease;
}

.nav-link {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.nav-link.active {
  background-color: white !important;
  color: var(--bs-primary) !important;
  font-weight: 600;
}

@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.mobile-show {
    transform: translateX(0);
  }
}
</style>
