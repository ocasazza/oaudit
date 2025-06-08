export default defineNuxtPlugin(() => {
  // Initialize theme from localStorage on client side
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
})
