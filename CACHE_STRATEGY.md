# Cache & Realtime Strategy

## Implementasi v3 (Global Realtime + Quick Fix) ⭐

Aplikasi sekarang menggunakan **global realtime subscriptions + manual cache invalidation** untuk performa optimal dan mencegah loading stuck:

### ✅ Fitur Utama

1. **Global Realtime Management** 🌐

   - Realtime setup HANYA sekali di `App.vue` saat user login
   - Single subscription untuk semua pages
   - Auto-cleanup saat logout
   - No more multiple subscriptions conflicts
   - No more cleanup issues di setiap page

2. **Cache Persisten**

   - Data tidak expire berdasarkan waktu
   - Cache hanya di-invalidate saat ada mutasi (add/update/delete)
   - Navigasi antar halaman instant (pakai cache)
   - Fallback ke stale cache jika fetch gagal

3. **Safety Timeout Protection** 🛡️

   - Loading state auto-reset setelah 15 detik
   - Prevent stuck loading selamanya
   - Console warning jika timeout terjadi
   - Timeout di-clear saat fetch selesai

4. **Abort Controller**

   - Cancel fetch sebelumnya jika masih berjalan
   - Mencegah race condition
   - Hemat bandwidth

5. **Simplified Page Lifecycle** ✨
   - Pages hanya `fetchData()` tanpa setup realtime
   - No more `enableRealtime` parameter
   - No more `cleanupRealtime` di `onUnmounted`
   - Simpler, cleaner code

## Perbaikan dari Versi Sebelumnya

### Masalah Lama (v2)

- ❌ Loading spinner stuck setelah pindah halaman
- ❌ Multiple realtime subscriptions conflict
- ❌ Promise.race timeout masih bisa stuck
- ❌ Cleanup conflicts di page transitions
- ❌ Prefetch conflict dengan page fetch

### Solusi Baru (v3)

- ✅ Global realtime di App.vue (single source of truth)
- ✅ Safety timeout (15s) force reset loading
- ✅ Remove Promise.race timeout dari views
- ✅ Remove prefetch dari router.beforeEach
- ✅ Simplified page onMounted (just fetch, no realtime)
- ✅ No cleanup needed di views
- ✅ Auto-reconnect still works
- ✅ Loading state always reset properly

## Architecture Overview

```
App.vue (onMounted)
  ↓
  Watch authStore.isAuthenticated
  ↓
  If authenticated → setupGlobalRealtime()
    ↓
    ├─ setupTransactionsRealtime() → supabase.channel('transactions')
    └─ setupCategoriesRealtime() → supabase.channel('categories')
  ↓
  Realtime events → invalidateCache() → auto refetch
  ↓
  If logout → cleanupGlobalRealtime()
```

```
DashboardView.vue (onMounted)
  ↓
  fetchTransactions() → check cache → return if valid
  fetchCategories() → check cache → return if valid
  ↓
  If cache invalid → fetch from DB
  ↓
  Safety timeout (15s) → force reset loading
  ↓
  Realtime update arrives → invalidateCache() → refetch
```

## Troubleshooting

**Loading masih stuck?**

- ✅ Check console untuk "Safety timeout: force reset loading state"
- ✅ Timeout otomatis setelah 15 detik
- ✅ Check console error untuk fetch failures

**Realtime tidak update?**

- ✅ Check console "Setting up global realtime subscriptions..."
- ✅ Check console "Realtime subscription status: SUBSCRIBED"
- ✅ Verify Supabase Realtime enabled di dashboard
- ✅ Check RLS policies untuk SELECT access

**Multiple subscriptions warning?**

- ✅ Fixed: Hanya 1 subscription per table (global)
- ✅ No more page-level subscriptions

**Data tidak sync antar tabs?**

- ✅ Working: Global realtime auto-sync semua tabs
- ✅ Test: Buka 2 tabs, ubah data di tab 1, lihat update di tab 2

## Composables API

### `useTransactions.js`

```js
const {
  transactions,
  loading,
  error,
  summary,
  fetchTransactions, // No enableRealtime param!
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setupRealtime, // Called from App.vue
  cleanupRealtime, // Called from App.vue
  invalidateCache,
} = useTransactions()
```

### `useCategories.js`

```js
const {
  categories,
  loading,
  error,
  fetchCategories, // No enableRealtime param!
  getCategoriesByType,
  addCategory,
  updateCategory,
  deleteCategory,
  setupRealtime, // Called from App.vue
  cleanupRealtime, // Called from App.vue
  invalidateCache,
} = useCategories()
```

## Penggunaan di Views

### ❌ OLD Way (v2 - Complex)

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'

const { fetchTransactions, cleanupRealtime } = useTransactions()

onMounted(async () => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Fetch timeout')), 10000),
  )

  try {
    await Promise.race([fetchTransactions({ enableRealtime: true }), timeout])
  } catch (err) {
    await fetchTransactions({ force: true })
  }
})

onUnmounted(() => {
  cleanupRealtime()
})
</script>
```

### ✅ NEW Way (v3 - Simple)

````vue
<script setup>
import { onMounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'

const { fetchTransactions } = useTransactions()

onMounted(async () => {
  try {
    await fetchTransactions()
  } catch (err) {
    console.error('Error loading data:', err)
  }
})

// No onUnmounted needed!
</script>

### ✅ Fitur Utama 1. **Cache Persisten** - Data tidak expire berdasarkan waktu - Cache hanya
di-invalidate saat ada mutasi (add/update/delete) - Navigasi antar halaman instant (pakai cache) -
Fallback ke stale cache jika fetch gagal 2. **Lazy Realtime Subscription** - Aktif hanya saat
halaman dibuka (Dashboard, Transaction, dll) - Auto-cleanup saat pindah halaman (onUnmounted) -
Auto-reconnect pada CHANNEL_ERROR - Timeout protection (10 detik) 3. **Abort Controller** - Cancel
fetch sebelumnya jika masih berjalan - Mencegah race condition - Hemat bandwidth 4. **Timeout
Fallback** - Fetch timeout setelah 10 detik - Fallback ke cached data - Retry tanpa realtime jika
perlu - Tidak stuck loading selamanya 5. **Prefetch Navigation** - App.vue prefetch data umum
sebelum masuk halaman - Timeout 3 detik untuk prefetch (non-blocking) - Fire-and-forget pattern -
Tidak menghambat navigasi ## Perbaikan dari Versi Sebelumnya ### Masalah Lama - ❌ Loading spinner
stuck setelah idle 1 menit - ❌ Realtime connection tidak cleanup dengan baik - ❌ Tidak ada timeout
protection - ❌ Harus refresh manual untuk fix ### Solusi Baru - ✅ Abort controller untuk cancel
fetch sebelumnya - ✅ Timeout protection (10s) di semua fetch - ✅ Auto-reconnect realtime channel -
✅ Fallback ke cached data jika timeout - ✅ Prefetch tidak blocking navigation - ✅ Loading state
always reset ## Troubleshooting **Loading stuck setelah idle?** - ✅ Fixed: Timeout fallback
otomatis setelah 10 detik - ✅ Fixed: Abort controller cancel fetch lama - ✅ Fixed: Auto-reconnect
realtime channel **Data tidak update?** - Pastikan `invalidateCache()` dipanggil setelah mutasi -
Check console log untuk "Realtime event" messages - Verify Supabase Realtime enabled **Memory
leak?** - ✅ Fixed: Proper cleanup dengan try-catch di cleanupRealtime() - Pastikan
`cleanupRealtime()` ada di `onUnmounted` **Realtime tidak jalan?** - Check console untuk "Realtime
subscription status" - Auto-reconnect akan retry dalam 2 detik - Check Supabase Realtime enabled di
dashboard - Verify RLS policies untuk tabel terkait ## Composables yang Diupdate ###
`useTransactions.js` ```js fetchTransactions({ force: false, enableRealtime: false })
invalidateCache() cleanupRealtime()
````

### `useCategories.js`

```js
fetchCategories({ force: false, enableRealtime: false })
invalidateCache()
cleanupRealtime()
```

## Penggunaan di Views

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useTransactions } from '@/composables/useTransactions'

const { fetchTransactions, cleanupRealtime } = useTransactions()

onMounted(async () => {
  // Enable realtime untuk halaman yang butuh sync
  await fetchTransactions({ enableRealtime: true })
})

onUnmounted(() => {
  // Cleanup wajib untuk hindari memory leak
  cleanupRealtime()
})
</script>
```

## Perbandingan Performa

### Sebelum (TTL-based)

- ❌ Fetch berulang tiap 1 menit (boros bandwidth)
- ❌ Data basi jika ada perubahan dalam 1 menit
- ❌ Delay loading saat pindah halaman

### Sesudah (Event-driven)

- ✅ Fetch hanya saat data benar-benar berubah
- ✅ Realtime sync multi-device
- ✅ Navigasi instant (cache valid)
- ✅ Hemat bandwidth & battery

## Best Practices

1. **Selalu cleanup realtime** di `onUnmounted`
2. **Invalidate cache** setelah mutasi (add/update/delete)
3. **Enable realtime** hanya di halaman yang butuh sync
4. **Force refresh** jika perlu data paling baru: `fetchTransactions({ force: true })`

## Troubleshooting

**Data tidak update?**

- Pastikan `invalidateCache()` dipanggil setelah mutasi
- Check koneksi internet untuk realtime

**Memory leak?**

- Pastikan `cleanupRealtime()` ada di `onUnmounted`

**Realtime tidak jalan?**

- Check Supabase Realtime enabled di dashboard
- Verify RLS policies untuk tabel terkait
