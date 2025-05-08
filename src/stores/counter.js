import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

const actions = {
  logout({ commit }) {
    // Make API call to invalidate token if needed
    return axios.post('/api/logout').finally(() => {
      commit('CLEAR_AUTH');
      localStorage.removeItem('token');
    });
  }
}
