<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotesStore } from '../stores/notes';
import { Search, FileText, ChevronRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';

const store = useNotesStore();
const router = useRouter();
const searchQuery = ref('');

const filteredNotes = computed(() => {
  if (!searchQuery.value) return store.notes;
  const q = searchQuery.value.toLowerCase();
  return store.notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
});

const openNote = (id: string) => {
  router.push(`/note/${id}`);
};
</script>

<template>
  <div class="page-wrapper">
    <TopBar title="Library" />

    <div class="max-w-md mx-auto min-h-screen flex flex-col">
      <!-- Search Header -->
      <div class="sticky top-14 bg-slate-50/95 backdrop-blur-sm z-30 px-5 py-3 border-b border-slate-100 transition-all">
        <div class="relative group">
          <Search class="absolute left-4 top-3.5 text-slate-400 transition-colors group-focus-within:text-blue-500" :size="20" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search topics, keywords..." 
            class="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium"
          >
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-3 pb-24">
        <div 
          v-for="note in filteredNotes" 
          :key="note.id" 
          @click="openNote(note.id)"
          class="group bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 active:scale-[0.99] transition-all cursor-pointer flex items-start gap-4"
        >
          <div class="bg-blue-50 text-blue-500 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
            <FileText :size="20" />
          </div>
          
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{{ note.title }}</h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {{ note.content.substring(0, 120).replace(/[#*_`]/g, '') }}...
            </p>
            <div class="flex items-center gap-2 mt-2">
               <span class="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Medical</span>
            </div>
          </div>

          <div class="self-center text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
            <ChevronRight :size="20" />
          </div>
        </div>
        
        <!-- Empty States -->
        <div v-if="filteredNotes.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div class="bg-slate-100 p-6 rounded-full">
             <Search :size="40" class="text-slate-300" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-slate-700">No matches found</h3>
            <p class="text-sm text-slate-400 max-w-xs mx-auto">Try adjusting your search terms or import more notes.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>