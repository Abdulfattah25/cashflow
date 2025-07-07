import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

export function useGoals() {
  const goals = ref([])
  const loading = ref(false)
  const error = ref(null)
  const authStore = useAuthStore()

  // Fetch goals from database
  const fetchGoals = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', authStore.user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Add calculated fields
      goals.value = data.map(goal => ({
        ...goal,
        percentage: Math.round((goal.current_amount / goal.target_amount) * 100),
        remainingAmount: goal.target_amount - goal.current_amount,
        daysLeft: getDaysLeft(goal.target_date),
        status: goal.is_completed ? 'completed' : 'active',
        // Map database fields to component expected fields
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        targetDate: goal.target_date,
        title: goal.name,
        description: goal.description || '',
        // Add default values for UI
        type: getGoalType(goal.name),
        priority: 'medium',
        icon: getGoalIcon(getGoalType(goal.name)),
        color: getGoalColor(getGoalType(goal.name))
      }))

    } catch (err) {
      error.value = err.message
      console.error('Error fetching goals:', err)
    } finally {
      loading.value = false
    }
  }

  // Add new goal
  const addGoal = async (goalData) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: insertError } = await supabase
        .from('goals')
        .insert([
          {
            user_id: authStore.user.id,
            name: goalData.title,
            description: goalData.description,
            target_amount: goalData.targetAmount,
            current_amount: goalData.currentAmount || 0,
            target_date: goalData.targetDate,
            is_completed: false
          }
        ])
        .select()

      if (insertError) throw insertError

      // Refresh goals
      await fetchGoals()
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error adding goal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update goal
  const updateGoal = async (id, goalData) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: updateError } = await supabase
        .from('goals')
        .update({
          name: goalData.title,
          description: goalData.description,
          target_amount: goalData.targetAmount,
          current_amount: goalData.currentAmount,
          target_date: goalData.targetDate,
          is_completed: goalData.currentAmount >= goalData.targetAmount
        })
        .eq('id', id)
        .eq('user_id', authStore.user.id)
        .select()

      if (updateError) throw updateError

      // Refresh goals
      await fetchGoals()
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error updating goal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete goal
  const deleteGoal = async (id) => {
    try {
      loading.value = true
      error.value = null

      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.user.id)

      if (deleteError) throw deleteError

      // Remove from local state
      goals.value = goals.value.filter(g => g.id !== id)
      
    } catch (err) {
      error.value = err.message
      console.error('Error deleting goal:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Add progress to goal
  const addProgress = async (goalId, amount) => {
    try {
      loading.value = true
      error.value = null

      // Get current goal
      const goal = goals.value.find(g => g.id === goalId)
      if (!goal) throw new Error('Goal not found')

      const newAmount = goal.currentAmount + amount
      const isCompleted = newAmount >= goal.targetAmount

      const { data, error: updateError } = await supabase
        .from('goals')
        .update({
          current_amount: newAmount,
          is_completed: isCompleted
        })
        .eq('id', goalId)
        .eq('user_id', authStore.user.id)
        .select()

      if (updateError) throw updateError

      // Refresh goals
      await fetchGoals()
      
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error adding progress:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper functions
  const getDaysLeft = (targetDate) => {
    if (!targetDate) return 0
    const now = new Date()
    const target = new Date(targetDate)
    const diffTime = target - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getGoalType = (name) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('emergency') || nameLower.includes('saving')) return 'savings'
    if (nameLower.includes('laptop') || nameLower.includes('car') || nameLower.includes('house')) return 'purchase'
    if (nameLower.includes('investment') || nameLower.includes('stock')) return 'investment'
    if (nameLower.includes('debt') || nameLower.includes('loan')) return 'debt'
    return 'savings'
  }

  const getGoalIcon = (type) => {
    const icons = {
      savings: 'bi bi-piggy-bank',
      debt: 'bi bi-credit-card',
      investment: 'bi bi-graph-up',
      purchase: 'bi bi-bag'
    }
    return icons[type] || 'bi bi-target'
  }

  const getGoalColor = (type) => {
    const colors = {
      savings: '#28a745',
      debt: '#dc3545',
      investment: '#ffc107',
      purchase: '#007bff'
    }
    return colors[type] || '#6c757d'
  }

  // Computed properties
  const goalSummary = computed(() => {
    const totalGoals = goals.value.length
    const completedGoals = goals.value.filter(g => g.is_completed).length
    const totalTarget = goals.value.reduce((sum, g) => sum + parseFloat(g.target_amount), 0)
    const totalSaved = goals.value.reduce((sum, g) => sum + parseFloat(g.current_amount), 0)

    return {
      totalGoals,
      completedGoals,
      totalTarget,
      totalSaved
    }
  })

  return {
    goals,
    loading,
    error,
    goalSummary,
    fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    addProgress
  }
}

