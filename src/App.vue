<template>
  <div id="app" class="bg-gradient-to-br from-primary-50 to-secondary-50 transition-colors duration-50">
    <NavBar />
    <Breadcrumbs />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/Navigation/NavBar.vue'
import Breadcrumbs from './components/Navigation/Breadcrumbs.vue'
</script>

<style>
/* Global app styles can go here */
</style>
