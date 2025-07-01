<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
   DoughnutController
} from 'chart.js'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController)

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      labels: [],
      datasets: []
    })
  },
  options: {
    type: Object,
    default: () => ({})
  },
  height: {
    type: Number,
    default: 300
  }
})

// Refs
const chartCanvas = ref(null)
let chartInstance = null

// Default options
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 11
        },
        generateLabels: function(chart) {
          const data = chart.data
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0]
              const value = dataset.data[i]
              const percentage = ((value / dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1)
              
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: dataset.borderColor ? dataset.borderColor[i] : '#fff',
                lineWidth: 2,
                hidden: false,
                index: i
              }
            })
          }
          return []
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${formatCurrency(value)} (${percentage}%)`
        }
      }
    }
  },
  cutout: '40%', // Makes it a doughnut chart
  borderWidth: 2,
  borderColor: '#fff',
  hoverBorderWidth: 3,
  hoverBorderColor: '#fff'
}

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Merge options
  const mergedOptions = {
    ...defaultOptions,
    ...props.options
  }

  // Create new chart
  chartInstance = new ChartJS(ctx, {
    type: 'doughnut',
    data: props.data,
    options: mergedOptions
  })
}

const updateChart = () => {
  if (chartInstance) {
    chartInstance.data = props.data
    chartInstance.update('active')
  }
}

// Watchers
watch(() => props.data, () => {
  updateChart()
}, { deep: true })

watch(() => props.options, () => {
  createChart()
}, { deep: true })

// Lifecycle
onMounted(async () => {
  await nextTick()
  createChart()
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
}

canvas {
  max-width: 100%;
  height: auto;
}
</style>
