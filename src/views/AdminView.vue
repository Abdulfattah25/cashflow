<template>
  <AppLayout>
    <div class="admin-page fade-in">
      <div class="d-flex justify-content-between align-items-center mt-3 mb-3">
        <h4>👑 Panel Admin</h4>
        <div class="badge bg-danger">Admin Access</div>
      </div>

      <div class="row mb-4">
        <div class="col-6 col-md-3 mb-3">
          <div class="card dashboard-card card-accent card-accent--primary text-center">
            <div class="card-body py-3">
              <div class="h4 text-primary">{{ adminStats.totalUsers }}</div>
              <small class="text-muted">Total Users</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <div class="card dashboard-card card-accent card-accent--success text-center">
            <div class="card-body py-3">
              <div class="h4 text-success">{{ adminStats.activeUsers }}</div>
              <small class="text-muted">Active Users</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <div class="card dashboard-card card-accent card-accent--warning text-center">
            <div class="card-body py-3">
              <div class="h4 text-warning">{{ adminStats.usedLicenses }}</div>
              <small class="text-muted">Lisensi Digunakan</small>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <div class="card dashboard-card card-accent card-accent--violet text-center">
            <div class="card-body py-3">
              <div class="h4 text-info">{{ adminStats.totalLicenses }}</div>
              <small class="text-muted">Total Lisensi</small>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 mb-4">
          <div class="card dashboard-card card-accent card-accent--primary">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">👥 Manajemen Pengguna</h5>
              <button class="btn btn-sm btn-outline-primary" @click="loadUsers">🔄 Refresh</button>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th style="min-width: 200px">Email</th>
                      <th style="min-width: 150px">Nama</th>
                      <th style="min-width: 80px">Role</th>
                      <th style="min-width: 120px">Bergabung</th>
                      <th style="min-width: 80px">Status</th>
                      <th style="min-width: 100px">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>{{ user.email }}</td>
                      <td>{{ user.full_name || '-' }}</td>
                      <td>
                        <span
                          class="badge"
                          :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'"
                        >
                          {{ user.role || 'user' }}
                        </span>
                      </td>
                      <td>{{ formatDate(user.created_at) }}</td>
                      <td>
                        <span class="badge" :class="user.is_active ? 'bg-success' : 'bg-warning'">
                          {{ user.is_active ? 'Aktif' : 'Nonaktif' }}
                        </span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-warning"
                            @click="editUser(user)"
                            title="Edit Data User"
                          >
                            ✏️
                          </button>
                          <button
                            class="btn btn-outline-danger"
                            @click="confirmDeleteUser(user)"
                            title="Hapus User"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-md-4 mb-4">
          <div class="card dashboard-card card-accent card-accent--success">
            <div class="card-header">
              <h5 class="mb-0">🎫 Generator Lisensi</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Jumlah Lisensi</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="licenseCount"
                  min="1"
                  max="100"
                  placeholder="Masukkan jumlah lisensi"
                />
              </div>
              <button
                class="btn btn-success w-100"
                @click="generateLicenses"
                :disabled="generating"
              >
                <i class="bi bi-plus-circle me-2"></i>
                {{ generating ? 'Generating...' : 'Generate Lisensi' }}
              </button>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-8">
          <div class="card dashboard-card card-accent card-accent--warning">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">📜 Daftar Lisensi</h5>
              <button class="btn btn-sm btn-outline-warning" @click="loadRecentLicenses">
                🔄 Refresh
              </button>
            </div>
            <div class="card-body">
              <div v-if="recentLicenses.length === 0" class="text-center text-muted py-4">
                <i class="bi bi-inbox display-6 text-muted"></i>
                <p class="mt-2">Belum ada lisensi</p>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm table-hover license-table">
                  <thead class="table">
                    <tr>
                      <th style="min-width: 120px">Kode Lisensi</th>
                      <th style="min-width: 80px">Status</th>
                      <th style="min-width: 150px">Email Pengguna</th>
                      <th style="min-width: 120px">Tanggal Dibuat</th>
                      <th style="min-width: 120px">Digunakan</th>
                      <th style="min-width: 80px">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="license in recentLicenses" :key="license.id">
                      <td>
                        <code class="small">{{ license.code }}</code>
                      </td>
                      <td>
                        <span class="badge badge-sm" :class="getLicenseStatusClass(license.status)">
                          {{ getLicenseStatusText(license.status) }}
                        </span>
                      </td>
                      <td>
                        <span v-if="license.assigned_email" class="small">
                          {{ license.assigned_email }}
                        </span>
                        <span v-else class="text-muted small">-</span>
                      </td>
                      <td class="small">
                        {{ formatDate(license.created_at) }}
                      </td>
                      <td class="small">
                        <span v-if="license.used_at">
                          {{ formatDate(license.used_at) }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button
                            class="btn btn-outline-secondary btn-sm"
                            @click="copyLicense(license.code)"
                            title="Copy Kode"
                          >
                            📋
                          </button>
                          <button
                            class="btn btn-outline-danger btn-sm"
                            @click="revokeLicense(license)"
                            title="Revoke"
                            v-if="license.status === 'valid'"
                          >
                            🚫
                          </button>
                          <button
                            class="btn btn-outline-danger btn-sm"
                            @click="confirmDeleteLicense(license)"
                            title="Hapus Lisensi"
                            v-if="license.status === 'revoked'"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="editUserModal" tabindex="-1" v-show="showEditModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">✏️ Edit Data User</h5>
              <button type="button" class="btn-close" @click="showEditModal = false"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" :value="editingUser?.email" readonly />
              </div>
              <div class="mb-3">
                <label class="form-label">Role</label>
                <select class="form-select" v-model="editingUserRole">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Status</label>
                <select class="form-select" v-model="editingUserStatus">
                  <option :value="true">✅ Aktif</option>
                  <option :value="false">❌ Nonaktif</option>
                </select>
                <div class="form-text">
                  Status menentukan apakah user dapat mengakses sistem atau tidak.
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showEditModal = false">
                Batal
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="updateUserRole"
                :disabled="updating"
              >
                {{ updating ? 'Updating...' : 'Update' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="deleteUserModal" tabindex="-1" v-show="showDeleteModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">⚠️ Konfirmasi Hapus</h5>
              <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
            </div>
            <div class="modal-body">
              <p>
                Apakah Anda yakin ingin menghapus user <strong>{{ deletingUser?.email }}</strong
                >?
              </p>
              <p class="text-danger">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
                Batal
              </button>
              <button type="button" class="btn btn-danger" @click="deleteUser" :disabled="deleting">
                {{ deleting ? 'Menghapus...' : 'Hapus' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="deleteLicenseModal" tabindex="-1" v-show="showDeleteLicenseModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">⚠️ Konfirmasi Hapus Lisensi</h5>
              <button
                type="button"
                class="btn-close"
                @click="showDeleteLicenseModal = false"
              ></button>
            </div>
            <div class="modal-body">
              <p>
                Apakah Anda yakin ingin menghapus lisensi
                <strong
                  ><code>{{ deletingLicense?.code }}</code></strong
                >?
              </p>
              <p class="text-danger">
                Tindakan ini tidak dapat dibatalkan dan akan menghapus lisensi secara permanen dari
                database.
              </p>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="showDeleteLicenseModal = false"
              >
                Batal
              </button>
              <button
                type="button"
                class="btn btn-danger"
                @click="deleteLicense"
                :disabled="deletingLicenseLoading"
              >
                {{ deletingLicenseLoading ? 'Menghapus...' : 'Hapus Lisensi' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/common/AppLayout.vue'

const users = ref([])
const adminStats = ref({
  totalUsers: 0,
  activeUsers: 0,
  usedLicenses: 0,
  totalLicenses: 0,
})
const recentLicenses = ref([])
const loading = ref(false)
const generating = ref(false)
const updating = ref(false)
const deleting = ref(false)
const deletingLicenseLoading = ref(false)
const licenseCount = ref(1)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteLicenseModal = ref(false)
const editingUser = ref(null)
const editingUserRole = ref('user')
const editingUserStatus = ref(true)
const deletingUser = ref(null)
const deletingLicense = ref(null)

let editModal = null
let deleteModal = null
let deleteLicenseModal = null

onMounted(async () => {
  await loadAdminData()
  setupModals()
})

const setupModals = () => {
  nextTick(() => {
    if (window.bootstrap) {
      const editModalEl = document.getElementById('editUserModal')
      const deleteModalEl = document.getElementById('deleteUserModal')
      const deleteLicenseModalEl = document.getElementById('deleteLicenseModal')
      if (editModalEl) editModal = new window.bootstrap.Modal(editModalEl)
      if (deleteModalEl) deleteModal = new window.bootstrap.Modal(deleteModalEl)
      if (deleteLicenseModalEl)
        deleteLicenseModal = new window.bootstrap.Modal(deleteLicenseModalEl)
    }
  })
}

const loadAdminData = async () => {
  await Promise.all([loadUsers(), loadAdminStats(), loadRecentLicenses()])
}

const loadUsers = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    users.value = data || []
  } catch (error) {
    console.error('Error loading users:', error)
    showToast('Gagal memuat daftar user: ' + error.message, 'danger')
  } finally {
    loading.value = false
  }
}

const loadAdminStats = async () => {
  try {
    const { data: usersData } = await supabase.from('profiles').select('id, created_at, is_active')
    const { data: licensesData } = await supabase.from('licenses').select('id, status')

    adminStats.value = {
      totalUsers: (usersData || []).length,
      activeUsers: (usersData || []).filter((u) => u.is_active).length,
      usedLicenses: (licensesData || []).filter((l) => l.status === 'used').length,
      totalLicenses: (licensesData || []).length,
    }
  } catch (error) {
    console.error('Error loading admin stats:', error)
  }
}

const loadRecentLicenses = async () => {
  try {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    recentLicenses.value = data || []
  } catch (error) {
    console.error('Error loading recent licenses:', error)
  }
}

const generateLicenses = async () => {
  try {
    generating.value = true

    const promises = []
    for (let i = 0; i < licenseCount.value; i++) {
      promises.push(supabase.rpc('admin_generate_license'))
    }

    const results = await Promise.all(promises)
    const errors = results.filter((result) => result.error)

    if (errors.length > 0) {
      throw errors[0].error
    }

    await loadRecentLicenses()
    await loadAdminStats()
    showToast(`Berhasil generate ${licenseCount.value} lisensi`, 'success')
  } catch (error) {
    console.error('Error generating licenses:', error)
    showToast('Gagal generate lisensi: ' + error.message, 'danger')
  } finally {
    generating.value = false
  }
}

const editUser = (user) => {
  editingUser.value = user
  editingUserRole.value = user.role || 'user'
  editingUserStatus.value = user.is_active !== false
  showEditModal.value = true
  if (editModal) editModal.show()
}

const updateUserRole = async () => {
  try {
    updating.value = true
    const { error } = await supabase
      .from('profiles')
      .update({
        role: editingUserRole.value,
        is_active: editingUserStatus.value,
      })
      .eq('id', editingUser.value.id)

    if (error) throw error

    await loadUsers()
    await loadAdminStats()
    showEditModal.value = false
    if (editModal) editModal.hide()
    showToast('Data user berhasil diupdate', 'success')
  } catch (error) {
    console.error('Error updating user:', error)
    showToast('Gagal update data user: ' + error.message, 'danger')
  } finally {
    updating.value = false
  }
}

const confirmDeleteUser = (user) => {
  deletingUser.value = user
  showDeleteModal.value = true
  if (deleteModal) deleteModal.show()
}

const deleteUser = async () => {
  try {
    deleting.value = true
    const targetId = deletingUser.value?.id
    const deletedEmail = deletingUser.value?.email || ''

    if (!targetId) throw new Error('ID user tidak ditemukan')

    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: targetId,
    })

    if (error) throw error

    users.value = users.value.filter((u) => u.id !== targetId)
    await loadAdminStats()
    showDeleteModal.value = false
    if (deleteModal) deleteModal.hide()
    deletingUser.value = null
    showToast(`User ${deletedEmail} berhasil dihapus`, 'success')
  } catch (error) {
    console.error('Error deleting user:', error)
    showToast('Gagal menghapus user: ' + error.message, 'danger')
  } finally {
    deleting.value = false
  }
}

const copyLicense = (code) => {
  navigator.clipboard
    .writeText(code)
    .then(() => {
      showToast('Kode lisensi berhasil dicopy', 'success')
    })
    .catch(() => {
      showToast('Gagal copy kode lisensi', 'danger')
    })
}

const revokeLicense = async (license) => {
  if (!confirm(`Yakin ingin merevoke lisensi ${license.code}?`)) return

  try {
    const { error } = await supabase
      .from('licenses')
      .update({ status: 'revoked' })
      .eq('id', license.id)

    if (error) throw error

    await loadRecentLicenses()
    showToast('Lisensi berhasil direvoke', 'success')
  } catch (error) {
    console.error('Error revoking license:', error)
    showToast('Gagal revoke lisensi: ' + error.message, 'danger')
  }
}

const confirmDeleteLicense = (license) => {
  deletingLicense.value = license
  showDeleteLicenseModal.value = true
  if (deleteLicenseModal) deleteLicenseModal.show()
}

const deleteLicense = async () => {
  try {
    deletingLicenseLoading.value = true

    const { error } = await supabase.from('licenses').delete().eq('id', deletingLicense.value.id)

    if (error) throw error

    await loadRecentLicenses()
    await loadAdminStats()
    showDeleteLicenseModal.value = false
    if (deleteLicenseModal) deleteLicenseModal.hide()
    deletingLicense.value = null
    showToast('Lisensi berhasil dihapus', 'success')
  } catch (error) {
    console.error('Error deleting license:', error)
    showToast('Gagal menghapus lisensi: ' + error.message, 'danger')
  } finally {
    deletingLicenseLoading.value = false
  }
}

const getLicenseStatusClass = (status) => {
  const classes = {
    valid: 'bg-success',
    used: 'bg-primary',
    revoked: 'bg-danger',
    expired: 'bg-warning text-dark',
  }
  return classes[status] || 'bg-secondary'
}

const getLicenseStatusText = (status) => {
  const texts = {
    valid: 'Valid',
    used: 'Digunakan',
    revoked: 'Direvoke',
    expired: 'Expired',
  }
  return texts[status] || status
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const showToast = (message, variant = 'primary', delay = 3000) => {
  try {
    const container = document.getElementById('toastContainer')
    if (!container) return
    const toastEl = document.createElement('div')
    toastEl.className = `toast align-items-center text-bg-${variant} border-0`
    toastEl.setAttribute('role', 'alert')
    toastEl.setAttribute('aria-live', 'assertive')
    toastEl.setAttribute('aria-atomic', 'true')
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`
    container.appendChild(toastEl)
    const t = new window.bootstrap.Toast(toastEl, { delay })
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove())
    t.show()
  } catch (e) {
    console.error('Toast error:', e)
  }
}
</script>

<style scoped>
.table-responsive {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.125);
}

@media (max-width: 768px) {
  .table-responsive {
    display: block;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .table {
    min-width: 700px;
  }

  .table th,
  .table td {
    padding: 0.5rem 0.3rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .license-table {
    min-width: 800px;
  }
}

.badge-sm {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.dashboard-card {
  border: none;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.dashboard-card .card-header {
  font-weight: 600;
  background: rgba(var(--bs-primary-rgb), 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

code {
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.85em;
  background-color: var(--bs-gray-100);
  color: var(--primary);
}

.display-6 {
  font-size: 3rem;
  opacity: 0.3;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
