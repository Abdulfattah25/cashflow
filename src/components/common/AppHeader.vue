<template>
  <header class="app-header">
    <div class="header-content">
  <!-- Brand text instead of hamburger on mobile -->
  <div class="brand d-lg-none me-2 fw-bold text-gradient fs-2">CashFlow App</div>
  <!-- Page Title (desktop) -->
  <div class="header-title d-none d-lg-block"></div>

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

// Sidebar toggle no longer used on mobile (hamburger removed)
const toggleSidebar = () => {}

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
.app-header {
  position: fixed; /* align with global layout */
  top: 0;
  z-index: 1040;
  background: #fff;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  height: var(--header-height);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
}

.brand {
  font-size: 1rem;
}

/* Mobile-only tuning */
@media (max-width: 991.98px) {
  .header-content {
    padding: 0.5rem 0.75rem;
  }
  .brand {
    font-size: 1.05rem;
    letter-spacing: 0.2px;
  }
}

/* Desktop refinements */
@media (min-width: 992px) {
  .app-header {
    left: var(--sidebar-width, 250px);
    right: 0;
  }
  .header-content {
    padding: 0.5rem 1.5rem; /* beri ruang kanan agar dropdown tidak menempel tepi */
  }
  .header-actions {
    padding-right: 0.25rem;
  }
}

.user-menu {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.875rem;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu:hover {
  background: #f8f9fa;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}

.user-menu:focus,
.user-menu:focus-visible {
  outline: 2px solid rgba(99,102,241,0.25);
  outline-offset: 2px;
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
  display: flex;
  align-items: center;
  padding: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  }
 
  
  .user-avatar {
    margin-right: 0.5rem;
    width: 36px;
    height: 36px;
    font-size: 0.95rem;
  }

  /* Hide chevron on mobile to save space */
  .user-menu > i.bi-chevron-down {
    display: none;
  }

  /* Mobile-friendly dropdown sizing */
  .dropdown-menu {
    width: calc(100vw - 1.25rem);
    max-width: 50px;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  }
}
</style>

