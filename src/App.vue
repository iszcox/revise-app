<script setup lang="ts">
import { onMounted } from 'vue';
import { useLessonsStore } from './stores/lessons';
import NavBar from './components/NavBar.vue';

const store = useLessonsStore();

onMounted(() => {
  store.loadLessons();
});
</script>

<template>
  <div class="bg-slate-50 min-h-screen pb-24 font-sans text-slate-900">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <NavBar />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>