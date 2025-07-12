<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Hamburger Menu Button (Mobile Only) -->
      <button class="btn btn-outline-secondary d-lg-none me-3" type="button" @click="toggleSidebar">
        <i class="bi bi-list"></i>
      </button>
      <!-- Page Title -->
      <div class="header-title"></div>

      <!-- Header Actions -->
      <div class="header-actions">
        <!-- User Menu -->
        <div class="dropdown">
          <div class="user-menu" data-bs-toggle="dropdown" aria-expanded="false">
            <div class="user-avatar">
              {{ userInitials }}
            </div>
            <div class="user-info d-none d-md-block">
              <h6>{{ displayName }}</h6>
              <p>{{ authStore.user?.email }}</p>
            </div>
            <i class="bi bi-chevron-down ms-2"></i>
          </div>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" @click="showProfileModal">
                <i class="bi bi-person me-2"></i>
                Edit Profile
              </a>
            </li>
            <li><hr class="dropdown-divider" /></li>
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

    <!-- Profile Modal - Sekarang akan di-teleport ke body -->
    <UserProfileModal />
  </header>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserProfileModal from './UserProfileModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const showProfileModal = () => {
  // Tunggu sebentar untuk memastikan modal sudah di-teleport
  setTimeout(() => {
    const modalElement = document.getElementById('profileModal')
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement)
      modal.show()
    }
  }, 50)
}

// Inject sidebar toggle function from AppLayout
const toggleSidebar = inject('toggleSidebar', () => {})

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    categories: 'Categories',
    reports: 'Reports',
    settings: 'Settings',
  }
  return titles[route.name] || 'CashFlow'
})

const pageDescription = computed(() => {
  const descriptions = {
    dashboard: 'Overview of your financial status',
    transactions: 'Manage your income and expenses',
    categories: 'Organize your transaction categories',
    settings: 'Configure your account settings',
  }
  return descriptions[route.name] || 'Personal Finance Management'
})

const displayName = computed(() => {
  return authStore.user?.user_metadata?.full_name || 
         authStore.user?.email?.split('@')[0] || 
         'User'
})

const userInitials = computed(() => {
  const name = displayName.value
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const logout = async () => {
  try {
    await authStore.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.user-menu {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* Hapus z-index yang tidak perlu */
}

.user-menu:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  margin-right: 0.75rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.user-info h6 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.user-info p {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
  opacity: 0.8;
}

.dropdown-menu {
  border-radius: 12px;
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
  min-width: 200px;
  /* Biarkan Bootstrap menangani z-index dropdown */
}

.dropdown-item {
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  transform: translateX(5px);
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

.dropdown-divider {
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .user-info {
    display: none !important;
  }
  
  .user-menu {
    padding: 0.5rem;
  }
  
  .user-avatar {
    margin-right: 0.5rem;
  }
}
</style>

