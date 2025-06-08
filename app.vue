<template>
  <div id="app" class="h-screen w-full flex flex-col overflow-hidden">
    <!-- Fixed Header -->
    <header class="flex-shrink-0">
      <NavBar />
    </header>

    <!-- Scrolling Content Area -->
    <main class="flex-1 overflow-y-auto">
      <NuxtPage />
    </main>

    <!-- Fixed Footer -->
    <footer class="flex-shrink-0">
      <Breadcrumbs />
    </footer>
  </div>
</template>

<script setup lang="ts">
// Import navigation components explicitly
import NavBar from './components/Navigation/NavBar.vue'
import Breadcrumbs from './components/Navigation/Breadcrumbs.vue'

// Theme initialization is handled by the theme.client.ts plugin
</script>

<style>
/* Global app styles can go here */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
}
</style>
