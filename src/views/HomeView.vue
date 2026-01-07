<script setup lang="ts">
import { useNotesStore } from '../stores/notes';
import NoteImporter from '../components/NoteImporter.vue';
import TopBar from '../components/TopBar.vue';
import { computed } from 'vue';

const store = useNotesStore();
const noteCount = computed(() => store.notes.length);
</script>

<template>
  <div class="page-wrapper">
    <TopBar title="Dashboard" />

    <div class="p-5 space-y-8 max-w-md mx-auto animate-in fade-in duration-500">
      <!-- Welcome Section -->
      <section>
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Good Afternoon,</h2>
        <p class="text-slate-500 font-medium">Ready to revise your notes?</p>
      </section>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 gap-4">
        <div class="relative group overflow-hidden bg-gradient-to-br from-blue-600 to-blue-500 text-white p-5 rounded-2xl shadow-lg shadow-blue-200 transition-transform active:scale-[0.98]">
          <div class="absolute top-0 right-0 p-3 opacity-10">
            <svg width="60" height="60" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path></svg>
          </div>
          <span class="text-blue-100 text-sm font-semibold tracking-wide uppercase">Library</span>
          <div class="mt-4 flex items-baseline gap-1">
            <span class="text-4xl font-bold">{{ noteCount }}</span>
            <span class="text-blue-100 text-sm">notes</span>
          </div>
        </div>

        <div class="relative group overflow-hidden bg-white border border-slate-100 p-5 rounded-2xl shadow-lg shadow-slate-100 transition-transform active:scale-[0.98]">
          <span class="text-slate-400 text-sm font-semibold tracking-wide uppercase">Status</span>
          <div class="mt-4">
            <span class="text-2xl font-bold text-emerald-500 flex items-center gap-2">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Active
            </span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800">Quick Actions</h3>
        </div>
        <NoteImporter />
      </section>
    </div>
  </div>
</template>