export const typeOptions = [
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' },
]

export const typeLabel = (value) => {
  return value === 'income' ? 'Pemasukan' : value === 'expense' ? 'Pengeluaran' : value
}
