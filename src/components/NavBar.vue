<script setup lang="ts">
import { Home as HomeIcon, Shuffle as ShuffleIcon, BookOpen as BookOpenIcon } from 'lucide-vue-next';
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 pb-6 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
    <router-link to="/" class="flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors">
      <HomeIcon :size="24" />
      <span class="text-[10px] font-medium mt-1">Home</span>
    </router-link>
    <router-link to="/revise" class="flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors">
      <ShuffleIcon :size="24" />
      <span class="text-[10px] font-medium mt-1">Revise</span>
    </router-link>
    <router-link to="/library" class="flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors">
      <BookOpenIcon :size="24" />
      <span class="text-[10px] font-medium mt-1">Library</span>
    </router-link>
  </nav>
</template>

<style scoped>
.router-link-active {
  color: #2563eb; /* blue-600 */
}
</style>
