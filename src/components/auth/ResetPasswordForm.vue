<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div v-if="!emailSent">
      <div v-if="authError" class="alert alert-danger">{{ authError }}</div>

      <p class="text-muted small mb-3">
        Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
      </p>

      <div class="mb-3 field">
        <i class="bi bi-envelope icon"></i>
        <input
          type="email"
          class="form-control form-control-modern"
          v-model="email"
          placeholder="Email"
          required
        />
      </div>

      <button type="submit" class="btn btn-gradient-auth w-100 py-2 mb-3" :disabled="authLoading">
        <span v-if="!authLoading">Kirim Link Reset</span>
        <span v-else>Mengirim...</span>
      </button>
    </div>

    <div v-else class="alert alert-success">
      <i class="bi bi-check-circle me-2"></i>
      Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.
    </div>

    <div class="text-center small text-muted">
      Sudah ingat password?
      <a href="#" @click.prevent="$emit('back-to-login')" class="fw-semibold"> Login di sini </a>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  authError: String,
  authLoading: Boolean,
})

const emit = defineEmits(['reset-password', 'back-to-login'])

const email = ref('')
const emailSent = ref(false)

const handleSubmit = () => {
  emit('reset-password', email.value)
  emailSent.value = true
}
</script>
