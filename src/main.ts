import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Initialize theme from localStorage before mounting the app
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme && savedTheme !== 'default') {
    // Remove all theme classes first
    document.documentElement.classList.remove('dark-theme', 'disco-theme', 'forest-theme', 'pastel-theme')
    // Apply the saved theme
    document.documentElement.classList.add(savedTheme)
  }
}

// Apply saved theme immediately
initializeTheme()

createApp(App).use(router).mount('#app')
