<template>
  <div class="loading-spinner" :class="{ 'overlay': overlay }">
    <div class="spinner-border" :class="spinnerClass" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    <div v-if="text" class="mt-2 text-center">
      <small :class="textClass">{{ text }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md', // sm, md, lg
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'].includes(value)
  },
  overlay: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})

const spinnerClass = computed(() => {
  const classes = [`text-${props.variant}`]
  
  if (props.size === 'sm') {
    classes.push('spinner-border-sm')
  }
  
  return classes.join(' ')
})

const textClass = computed(() => {
  return `text-${props.variant}`
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}
</style>
