<template>
  <!-- Teleport modal ke body untuk menghindari masalah z-index -->
  <Teleport to="body">
    <!-- Profile Modal -->
    <div
      class="modal fade"
      id="profileModal"
      tabindex="-1"
      aria-labelledby="profileModalLabel"
      aria-hidden="true"
      data-bs-backdrop="static"
      data-bs-keyboard="false"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body">
            <!-- Profile Form -->
            <form @submit.prevent="updateProfile">
              <!-- User Avatar Display -->
              <div class="text-center mb-4">
                <div class="user-avatar-large">
                  {{ userInitials }}
                </div>
                <p class="text-muted small mt-2">{{ authStore.user?.email }}</p>
              </div>

              <!-- Full Name Input -->
              <div class="mb-3">
                <label for="fullName" class="form-label">
                  <i class="bi bi-person me-1"></i>
                  Full Name
                </label>
                <input
                  id="fullName"
                  v-model="profileForm.fullName"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.fullName }"
                  placeholder="Enter your full name"
                  required
                />
                <div v-if="errors.fullName" class="invalid-feedback">
                  {{ errors.fullName }}
                </div>
              </div>

              <!-- Phone Number Input (Optional) -->
              <div class="mb-3">
                <label for="phone" class="form-label">
                  <i class="bi bi-telephone me-1"></i>
                  Phone Number <span class="text-muted">(Optional)</span>
                </label>
                <input
                  id="phone"
                  v-model="profileForm.phone"
                  type="tel"
                  class="form-control"
                  placeholder="Enter your phone number"
                />
              </div>

              <!-- Bio/Description Input (Optional) -->
              <div class="mb-3">
                <label for="bio" class="form-label">
                  <i class="bi bi-card-text me-1"></i>
                  Bio <span class="text-muted">(Optional)</span>
                </label>
                <textarea
                  id="bio"
                  v-model="profileForm.bio"
                  class="form-control"
                  rows="3"
                  placeholder="Tell us about yourself..."
                  maxlength="200"
                ></textarea>
                <div class="form-text">{{ profileForm.bio?.length || 0 }}/200 characters</div>
              </div>

              <!-- Error Display -->
              <div v-if="error" class="alert alert-danger" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>
                {{ error }}
              </div>

              <!-- Success Display -->
              <div v-if="success" class="alert alert-success" role="alert">
                <i class="bi bi-check-circle me-2"></i>
                {{ success }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="bi bi-x-circle me-1"></i>
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="updateProfile"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i v-else class="bi bi-check-circle me-1"></i>
              {{ loading ? 'Updating...' : 'Update Profile' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Reactive form data
const profileForm = reactive({
  fullName: '',
  phone: '',
  bio: '',
})

// Component state
const loading = ref(false)
const error = ref('')
const success = ref('')
const errors = reactive({
  fullName: '',
})

let modalInstance = null

// Computed properties
const userInitials = computed(() => {
  const name =
    profileForm.fullName || authStore.user?.user_metadata?.full_name || authStore.user?.email || 'U'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const isFormValid = computed(() => {
  return profileForm.fullName.trim().length >= 2 && !errors.fullName
})

// Watchers
watch(
  () => profileForm.fullName,
  (newValue) => {
    if (newValue.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters'
    } else if (newValue.trim().length > 50) {
      errors.fullName = 'Full name must be less than 50 characters'
    } else {
      errors.fullName = ''
    }
  },
)

// Methods
const loadUserData = () => {
  if (authStore.user?.user_metadata) {
    profileForm.fullName = authStore.user.user_metadata.full_name || ''
    profileForm.phone = authStore.user.user_metadata.phone || ''
    profileForm.bio = authStore.user.user_metadata.bio || ''
  }
}

const getModalInstance = () => {
  const modalElement = document.getElementById('profileModal')
  if (modalElement && typeof bootstrap !== 'undefined') {
    return bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false,
    })
  }
  return null
}

const closeModal = () => {
  const modal = getModalInstance()
  if (modal) {
    modal.hide()
  }
}

const updateProfile = async () => {
  if (!isFormValid.value) {
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    // Update user metadata
    const updates = {
      full_name: profileForm.fullName.trim(),
      phone: profileForm.phone.trim(),
      bio: profileForm.bio.trim(),
    }

    await authStore.updateProfile(updates)

    success.value = 'Profile updated successfully!'

    // Close modal after 1.5 seconds
    setTimeout(() => {
      const modal = getModalInstance()
      if (modal) {
        modal.hide()
      }
      // Reset success message after modal is closed
      setTimeout(() => {
        success.value = ''
      }, 300)
    }, 1500)
  } catch (err) {
    console.error('Profile update error:', err)
    error.value = err.message || 'Failed to update profile. Please try again.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  loadUserData()
  error.value = ''
  success.value = ''
  errors.fullName = ''
}

// Initialize modal after component is mounted and teleported
const initializeModal = async () => {
  await nextTick()
  
  // Wait a bit more for teleport to complete
  setTimeout(() => {
    const modalElement = document.getElementById('profileModal')
    if (modalElement && typeof bootstrap !== 'undefined') {
      modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false,
      })

      // Reset form when modal is shown
      modalElement.addEventListener('show.bs.modal', resetForm)
    }
  }, 100)
}

// Lifecycle
onMounted(() => {
  loadUserData()
  initializeModal()
})

onUnmounted(() => {
  // Clean up event listeners
  const modalElement = document.getElementById('profileModal')
  if (modalElement) {
    modalElement.removeEventListener('show.bs.modal', resetForm)
  }
})
</script>

<style scoped>


.modal-dialog {
  /* Hapus positioning manual yang bermasalah */
  margin-top: 0 !important;
  transform: none !important;
  position: relative !important;
  top: auto !important;
  left: auto !important;
}

.modal-content {
  border-radius: 15px;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.user-avatar-large {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 auto;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1.5rem;
}

.alert {
  border-radius: 10px;
  border: none;
}

.form-control {
  border-radius: 8px;
  border: 1px solid #e1e5e9;
  padding: 0.75rem 1rem;
}

.form-control:focus {
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 576px) {
  .modal-dialog {
    margin: 0.5rem;
  }

  .user-avatar-large {
    width: 30px;
    height: 30px;
    font-size: 1rem;
  }
}
</style>
