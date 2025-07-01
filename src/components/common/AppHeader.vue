<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Page Title -->
      <div class="header-title">
        <h2>{{ pageTitle }}</h2>
        <p>{{ pageDescription }}</p>
      </div>
      
      <!-- Header Actions -->
      <div class="header-actions">
        <!-- Notifications -->
        <button class="btn btn-outline-primary btn-sm me-2">
          <i class="bi bi-bell"></i>
        </button>
        
        <!-- User Menu -->
        <div class="dropdown">
          <div class="user-menu" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="user-avatar">
              {{ userInitials }}
            </div>
            <div class="user-info d-none d-md-block">
              <h6>{{ authStore.user?.user_metadata?.full_name || 'User' }}</h6>
              <p>{{ authStore.user?.email }}</p>
            </div>
            <i class="bi bi-chevron-down ms-2"></i>
          </div>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-person me-2"></i>
                Profile
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#">
                <i class="bi bi-gear me-2"></i>
                Settings
              </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click="logout">
                <i class="bi bi-box-arrow-right me-2"></i>
                Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const titles = {
    'dashboard': 'Dashboard',
    'transactions': 'Transactions',
    'categories': 'Categories',
    'reports': 'Reports',
    'settings': 'Settings'
  }
  return titles[route.name] || 'CashFlow'
})

const pageDescription = computed(() => {
  const descriptions = {
    'dashboard': 'Overview of your financial status',
    'transactions': 'Manage your income and expenses',
    'categories': 'Organize your transaction categories',
    'reports': 'Analyze your financial data',
    'settings': 'Configure your account settings'
  }
  return descriptions[route.name] || 'Personal Finance Management'
})

const userInitials = computed(() => {
  const name = authStore.user?.user_metadata?.full_name || authStore.user?.email || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
})

const logout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

