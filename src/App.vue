<template>
  <div id="app" class="h-screen w-full flex flex-col overflow-hidden">
    <!-- Fixed Header -->
    <header class="flex-shrink-0">
      <NavBar />
    </header>

    <!-- Scrolling Content Area -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>

    <!-- Fixed Footer -->
    <footer class="flex-shrink-0">
      <Breadcrumbs />
    </footer>
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/Navigation/NavBar.vue'
import Breadcrumbs from './components/Navigation/Breadcrumbs.vue'
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
