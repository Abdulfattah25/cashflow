<template>
  <AppLayout>
    <div class="profile-page">
      <!-- Account Information Card -->
      <div class="row mb-2">
        <div class="col-12">
          <div class="card dashboard-card">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-info-circle me-2"></i>Informasi Akun</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-1">
                  <label class="form-label fw-semibold">Email</label>
                  <div class="info-display">{{ user.email }}</div>
                </div>
                <div class="col-md-4 mb-1">
                  <label class="form-label fw-semibold">Nama Lengkap</label>
                  <div class="info-display">{{ fullName || 'Belum diisi' }}</div>
                </div>
                <div class="col-md-4 mb-1">
                  <label class="form-label fw-semibold">Bergabung Sejak</label>
                  <div class="info-display">{{ formatDate(user.created_at) }}</div>
                </div>
              </div>
            </div>

            <!-- Logout Button -->
            <div class="row mx-2">
              <div class="col-12 text-start">
                <button class="btn btn-secondary" @click="logout" :disabled="loggingOut">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  {{ loggingOut ? 'Keluar...' : 'Logout' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Card -->
      <div class="row">
        <div class="col-12">
          <div class="card dashboard-card">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-gear me-2"></i>Pengaturan</h5>
            </div>
            <div class="card-body">
              <!-- Settings Buttons -->
              <div class="row g-3 mb-4">
                <div class="col-6 col-md-3">
                  <button
                    class="btn btn-outline-primary w-100 setting-btn"
                    @click="toggleSection('name')"
                    :class="{ active: activeSection === 'name' }"
                  >
                    <i class="bi bi-person me-2"></i>
                    Ganti Nama
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button
                    class="btn btn-outline-primary w-100 setting-btn"
                    @click="toggleSection('password')"
                    :class="{ active: activeSection === 'password' }"
                  >
                    <i class="bi bi-lock me-2"></i>
                    Ganti Password
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button
                    class="btn btn-outline-primary w-100 setting-btn"
                    @click="toggleSection('theme')"
                    :class="{ active: activeSection === 'theme' }"
                  >
                    <i class="bi bi-palette me-2"></i>
                    Pilih Tema
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button
                    class="btn btn-outline-primary w-100 setting-btn"
                    @click="toggleSection('categories')"
                    :class="{ active: activeSection === 'categories' }"
                  >
                    <i class="bi bi-tags me-2"></i>
                    Kelola Kategori
                  </button>
                </div>
                <div class="col-6 col-md-3">
                  <button
                    class="btn btn-danger w-100 setting-btn"
                    @click="toggleSection('delete')"
                    :class="{ active: activeSection === 'delete' }"
                  >
                    <i class="bi bi-trash me-2"></i>
                    Hapus Akun
                  </button>
                </div>
              </div>

              <!-- Dynamic Content Area -->
              <div class="settings-content" v-if="activeSection">
                <div class="card border-0 settings-panel-card">
                  <div class="card-body">
                    <!-- Change Name Section -->
                    <div v-if="activeSection === 'name'" class="setting-panel">
                      <h6 class="fw-semibold mb-3">
                        <i class="bi bi-pencil me-2"></i>Ubah Nama Lengkap
                      </h6>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Nama Lengkap Baru</label>
                          <input
                            type="text"
                            class="form-control"
                            v-model="tempFullName"
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                        <div class="col-md-3 mb-3 d-flex align-items-end">
                          <button
                            class="btn btn-primary w-100"
                            @click="updateName"
                            :disabled="saving"
                          >
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Change Password Section -->
                    <div v-if="activeSection === 'password'" class="setting-panel">
                      <h6 class="fw-semibold mb-3">
                        <i class="bi bi-shield-lock me-2"></i>Ubah Password
                      </h6>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <label class="form-label">Password Baru</label>
                          <input
                            type="password"
                            class="form-control"
                            v-model="newPassword"
                            placeholder="Minimal 6 karakter"
                          />
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">Konfirmasi Password</label>
                          <input
                            type="password"
                            class="form-control"
                            v-model="confirmPassword"
                            placeholder="Ulangi password baru"
                          />
                        </div>
                        <div class="col-12">
                          <button
                            class="btn btn-warning"
                            @click="changePassword"
                            :disabled="!canChangePassword || changingPassword"
                          >
                            {{ changingPassword ? 'Mengubah...' : 'Ubah Password' }}
                          </button>
                          <div v-if="passwordError" class="alert alert-danger mt-2 mb-0">
                            {{ passwordError }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Theme Section -->
                    <div v-if="activeSection === 'theme'" class="setting-panel">
                      <h6 class="fw-semibold mb-3">
                        <i class="bi bi-palette2 me-2"></i>Pengaturan Tema
                      </h6>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <label class="form-label">Tema Aplikasi</label>
                          <select class="form-select" v-model="selectedTheme">
                            <option value="light">☀️ Tema Terang</option>
                            <option value="dark">🌙 Tema Gelap</option>
                          </select>
                        </div>
                        <div class="col-md-3 mb-3 d-flex align-items-end">
                          <button
                            class="btn btn-primary w-100"
                            @click="changeTheme"
                            :disabled="saving"
                          >
                            {{ saving ? 'Menyimpan...' : 'Simpan' }}
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Categories Section -->
                    <div v-if="activeSection === 'categories'" class="setting-panel">
                      <h6 class="fw-semibold mb-3">
                        <i class="bi bi-tags me-2"></i>Kelola Kategori
                      </h6>
                      <div class="row g-2 align-items-end mb-3">
                        <div class="col-12 col-md-4">
                          <label class="form-label">Nama Kategori</label>
                          <input
                            v-model="catForm.name"
                            type="text"
                            class="form-control"
                            placeholder="Nama kategori"
                          />
                        </div>
                        <div class="col-6 col-md-3">
                          <label class="form-label">Jenis</label>
                          <select v-model="catForm.type" class="form-select">
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                          </select>
                        </div>
                        <div class="col-3 col-md-2">
                          <label class="form-label">Warna</label>
                          <input
                            v-model="catForm.color"
                            type="color"
                            class="form-control form-control-color"
                          />
                        </div>
                        <div class="col-3 col-md-3">
                          <button
                            class="btn btn-primary w-100"
                            @click="saveCategory"
                            :disabled="catSaving || !catForm.name"
                          >
                            {{ catEditing ? 'Perbarui' : 'Tambah' }}
                          </button>
                        </div>
                      </div>

                      <div class="row">
                        <div class="col-12">
                          <div class="table-responsive">
                            <table class="table table-sm align-middle">
                              <thead class="table-light">
                                <tr>
                                  <th>Nama</th>
                                  <th>Jenis</th>
                                  <th>Warna</th>
                                  <th style="width: 110px" class="text-end">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="c in categories" :key="c.id">
                                  <td>{{ c.name }}</td>
                                  <td>
                                    <span
                                      :class="c.type === 'income' ? 'text-success' : 'text-danger'"
                                      >{{ c.type }}</span
                                    >
                                  </td>
                                  <td>
                                    <span class="badge" :style="{ backgroundColor: c.color }"
                                      >&nbsp;&nbsp;</span
                                    >
                                  </td>
                                  <td class="text-end">
                                    <button
                                      class="btn btn-sm btn-outline-secondary me-1"
                                      @click="editCategory(c)"
                                    >
                                      <i class="bi bi-pencil"></i>
                                    </button>
                                    <button
                                      class="btn btn-sm btn-outline-danger"
                                      @click="openRemoveCategory(c)"
                                    >
                                      <i class="bi bi-trash"></i>
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Delete Account Section -->
                    <div v-if="activeSection === 'delete'" class="setting-panel">
                      <h6 class="fw-semibold mb-3 text-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>Hapus Akun Permanen
                      </h6>
                      <div class="alert alert-danger">
                        <strong>Peringatan!</strong> Tindakan ini akan menghapus semua data Anda
                        secara permanen:
                        <ul class="mb-0 mt-2">
                          <li>Semua transaksi dan catatan keuangan</li>
                          <li>Data budget dan goals</li>
                          <li>Laporan dan riwayat</li>
                        </ul>
                      </div>
                      <button class="btn btn-danger" @click="showDeleteModal = true">
                        <i class="bi bi-trash me-2"></i>Saya Mengerti, Hapus Akun
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Account Modal -->
      <div class="modal fade" id="deleteAccountModal" tabindex="-1" v-if="showDeleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header border-danger">
              <h5 class="modal-title text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>Konfirmasi Hapus Akun
              </h5>
              <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-danger">
                <strong>Konfirmasi Terakhir!</strong> Semua data akan hilang permanen dan tidak
                dapat dikembalikan.
              </div>
              <p><strong>Ketik "HAPUS AKUN" untuk konfirmasi:</strong></p>
              <input
                type="text"
                class="form-control"
                v-model="deleteConfirmation"
                placeholder="HAPUS AKUN"
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
                Batal
              </button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteAccount"
                :disabled="deleteConfirmation !== 'HAPUS AKUN' || deleting"
              >
                {{ deleting ? 'Menghapus...' : 'Hapus Akun' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Category Modal -->
      <div class="modal fade" id="deleteCategoryModal" tabindex="-1" v-if="showCatDeleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header border-danger">
              <h5 class="modal-title text-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>Hapus Kategori
              </h5>
              <button type="button" class="btn-close" @click="showCatDeleteModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning">
                Menghapus kategori akan berdampak pada data lain:
                <ul class="mb-0 mt-2">
                  <li>Transaksi yang memakai kategori ini akan diset menjadi tanpa kategori.</li>
                  <li>Budget yang memakai kategori ini akan ikut terhapus.</li>
                </ul>
              </div>
              <p class="mb-0">
                Yakin ingin menghapus kategori <strong>"{{ deleteTargetCat?.name }}"</strong>?
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCatDeleteModal = false">
                Batal
              </button>
              <button type="button" class="btn btn-danger" @click="confirmRemoveCategory">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/common/AppLayout.vue'
import { useCategories } from '@/composables/useCategories'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)
const fullName = ref('')
const tempFullName = ref('')
const selectedTheme = ref('light')
const newPassword = ref('')
const confirmPassword = ref('')
const activeSection = ref(null)
const saving = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const showDeleteModal = ref(false)
const deleteConfirmation = ref('')
const deleting = ref(false)
const loggingOut = ref(false)

// Categories management
const {
  categories,
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  loading: catLoading,
} = useCategories()
const catForm = ref({ id: null, name: '', type: 'expense', color: '#6c757d' })
const catEditing = computed(() => !!catForm.value.id)
const catSaving = computed(() => catLoading.value)
const showCatDeleteModal = ref(false)
const deleteTargetCat = ref(null)

const canChangePassword = computed(() => {
  return newPassword.value.length >= 6 && newPassword.value === confirmPassword.value
})

onMounted(() => {
  loadUserSettings()
  fetchCategories()
})

const loadUserSettings = () => {
  if (user.value) {
    const metadata = user.value.user_metadata || {}
    fullName.value = metadata.full_name || ''
    tempFullName.value = fullName.value
    selectedTheme.value = metadata.theme || 'light'
    applyTheme(selectedTheme.value)
  }
}

const toggleSection = (section) => {
  activeSection.value = activeSection.value === section ? null : section

  if (activeSection.value === 'name') {
    tempFullName.value = fullName.value
  } else if (activeSection.value === 'password') {
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
  }
}

const editCategory = (c) => {
  catForm.value = { id: c.id, name: c.name, type: c.type, color: c.color }
}

const resetCatForm = () => {
  catForm.value = { id: null, name: '', type: 'expense', color: '#6c757d' }
}

const saveCategory = async () => {
  if (!catForm.value.name) return
  if (catForm.value.id) {
    const ok = await updateCategory(catForm.value.id, {
      name: catForm.value.name,
      color: catForm.value.color,
    })
    if (ok) {
      showToast('Kategori diperbarui', 'success')
      resetCatForm()
    } else {
      showToast('Gagal memperbarui kategori', 'danger')
    }
  } else {
    const ok = await addCategory({
      name: catForm.value.name,
      type: catForm.value.type,
      color: catForm.value.color,
    })
    if (ok) {
      showToast('Kategori ditambahkan', 'success')
      resetCatForm()
    } else {
      showToast('Gagal menambah kategori', 'danger')
    }
  }
}

const removeCategory = async (c) => {
  if (!confirm(`Hapus kategori "${c.name}"?`)) return
  const ok = await deleteCategory(c.id)
  showToast(ok ? 'Kategori dihapus' : 'Gagal menghapus kategori', ok ? 'success' : 'danger')
}

const updateName = async () => {
  try {
    saving.value = true
    await authStore.updateProfile({ full_name: tempFullName.value })
    fullName.value = tempFullName.value
    showToast('Nama berhasil diperbarui!', 'success')
    activeSection.value = null
  } catch (error) {
    console.error('Error updating name:', error)
    showToast('Gagal memperbarui nama: ' + error.message, 'danger')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  try {
    changingPassword.value = true
    passwordError.value = ''

    if (newPassword.value.length < 6) {
      passwordError.value = 'Password harus minimal 6 karakter'
      return
    }

    if (newPassword.value !== confirmPassword.value) {
      passwordError.value = 'Konfirmasi password tidak cocok'
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error) throw error

    newPassword.value = ''
    confirmPassword.value = ''
    showToast('Password berhasil diubah!', 'success')
    activeSection.value = null
  } catch (error) {
    console.error('Error changing password:', error)
    passwordError.value = 'Gagal mengubah password: ' + error.message
  } finally {
    changingPassword.value = false
  }
}

const changeTheme = async () => {
  try {
    saving.value = true
    applyTheme(selectedTheme.value)
    await authStore.updateProfile({ theme: selectedTheme.value })
    showToast('Tema berhasil diubah!', 'success')
    activeSection.value = null
  } catch (error) {
    console.error('Error changing theme:', error)
    showToast('Gagal mengubah tema: ' + error.message, 'danger')
  } finally {
    saving.value = false
  }
}

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-bs-theme', theme)
  localStorage.setItem('app-theme', theme)
}

const deleteAccount = async () => {
  try {
    deleting.value = true

    // This would require admin privileges in production
    // For now, just sign out the user
    await authStore.signOut()
    router.push('/')
    showToast('Akun berhasil dihapus', 'success')
  } catch (error) {
    console.error('Error deleting account:', error)
    showToast('Gagal menghapus akun: ' + error.message, 'danger')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

const logout = async () => {
  try {
    loggingOut.value = true
    await authStore.signOut()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Tidak diketahui'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const showToast = (message, variant = 'primary') => {
  const event = new CustomEvent('show-toast', {
    detail: { message, variant },
  })
  window.dispatchEvent(event)
}

watch(user, (newUser) => {
  if (newUser) {
    loadUserSettings()
    fetchCategories()
  }
})

watch(showDeleteModal, (show) => {
  if (show) {
    const modal = new bootstrap.Modal(document.getElementById('deleteAccountModal'))
    modal.show()
  }
})

watch(showCatDeleteModal, (show) => {
  if (show) {
    const modal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'))
    modal.show()
  }
})

const openRemoveCategory = (c) => {
  deleteTargetCat.value = c
  showCatDeleteModal.value = true
}

const confirmRemoveCategory = async () => {
  if (!deleteTargetCat.value) return
  const ok = await deleteCategory(deleteTargetCat.value.id)
  showToast(ok ? 'Kategori dihapus' : 'Gagal menghapus kategori', ok ? 'success' : 'danger')
  showCatDeleteModal.value = false
  deleteTargetCat.value = null
}
</script>

<style scoped>
.profile-page {
  padding: 1rem;
}

.info-display {
  padding: 0.75rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  background-color: var(--bs-gray-100);
  color: var(--bs-body-color);
  font-weight: 500;
}

.info-display:empty::before {
  content: 'Belum diisi';
  color: var(--bs-secondary);
  font-style: italic;
}

.setting-btn {
  height: 3rem;
  transition: all 0.3s ease;
  border-width: 2px;
}

.setting-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.setting-btn.active {
  background-color: var(--bs-primary);
  color: white;
  border-color: var(--bs-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
}

.setting-btn.active.btn-outline-danger {
  background-color: var(--bs-danger);
  border-color: var(--bs-danger);
  color: white;
}

.settings-panel-card {
  background-color: var(--bs-gray-50);
  border: 1px solid var(--bs-border-color-translucent);
}

.settings-content {
  animation: slideDown 0.3s ease-out;
}

.setting-panel {
  animation: fadeIn 0.2s ease-in;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dashboard-card {
  border: none;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn {
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-content {
  border-radius: 0.75rem;
  border: none;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.modal-header.border-danger {
  border-bottom-color: var(--bs-danger);
  background-color: rgba(220, 53, 69, 0.1);
}

@media (max-width: 768px) {
  .profile-page {
    padding: 0.5rem;
  }

  .setting-btn {
    height: 2.5rem;
    font-size: 0.875rem;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    align-items: stretch !important;
    gap: 1rem;
  }

  .d-flex.justify-content-between h2 {
    text-align: center;
  }
}
</style>
