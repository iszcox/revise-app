<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useNotesStore } from '../stores/notes';
import { marked } from 'marked';
import { Shuffle, Eye, RotateCw } from 'lucide-vue-next';
import TopBar from '../components/TopBar.vue';

const store = useNotesStore();
const currentNoteId = ref<string | null>(null);
const isRevealed = ref(false);

const currentNote = computed(() => {
  if (!currentNoteId.value) return null;
  return store.notes.find(n => n.id === currentNoteId.value);
});

const renderedContent = computed(() => {
  if (!currentNote.value) return '';
  return marked(currentNote.value.content);
});

const pickRandom = () => {
  if (store.notes.length === 0) return;
  const ids = store.notes.map(n => n.id);
  
  let nextId = ids[Math.floor(Math.random() * ids.length)];
  if (ids.length > 1 && nextId === currentNoteId.value) {
      let attempts = 0;
      while (nextId === currentNoteId.value && attempts < 5) {
         nextId = ids[Math.floor(Math.random() * ids.length)];
         attempts++;
      }
  }
  if (nextId) {
      currentNoteId.value = nextId;
      isRevealed.value = false;
      // Scroll to top
      const contentArea = document.getElementById('revision-content');
      if (contentArea) contentArea.scrollTop = 0;
  }
};

watch(() => store.notes.length, (newVal) => {
  if (newVal > 0 && !currentNoteId.value) {
    pickRandom();
  }
});

onMounted(() => {
  if (!currentNoteId.value && store.notes.length > 0) {
    pickRandom();
  }
});
</script>

<template>
  <div class="page-wrapper h-screen flex flex-col">
    <TopBar title="Flashcard Mode">
       <template #actions>
          <button @click="pickRandom" class="text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors">Skip</button>
       </template>
    </TopBar>

    <div class="flex-1 flex flex-col pt-14 pb-24 bg-slate-100 overflow-hidden">
      <div v-if="currentNote" class="flex-1 p-5 flex flex-col overflow-hidden">
        <!-- Card Container -->
        <div class="flex-1 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 flex flex-col relative overflow-hidden transition-all duration-500">
          
          <!-- Question / Header Side -->
          <div class="p-6 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] uppercase tracking-widest font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">Topic</span>
              <span class="text-slate-300 text-xs">#{{ currentNoteId?.substring(0,4) }}</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-800 leading-tight">{{ currentNote.title }}</h2>
          </div>
          
          <!-- Answer / Content Side -->
          <div id="revision-content" class="flex-1 relative overflow-y-auto custom-scrollbar">
            <!-- Blur Overlay -->
            <div 
              class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl z-20 transition-all duration-500 p-8 text-center"
              :class="{ 'opacity-0 pointer-events-none': isRevealed }"
            >
               <div class="bg-white p-4 rounded-full shadow-lg mb-4">
                 <Eye :size="32" class="text-blue-500" />
               </div>
               <h3 class="font-bold text-slate-800 text-lg mb-2">Recall Phase</h3>
               <p class="text-slate-500 text-sm mb-6 leading-relaxed">Take a moment to mentally review the key points of this topic before revealing.</p>
               <button 
                 @click="isRevealed = true" 
                 class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:scale-105 active:scale-95 transition-all w-full max-w-xs"
               >
                 Reveal Answer
               </button>
            </div>
            
            <div class="p-6 prose prose-slate max-w-none prose-p:text-slate-600 prose-headings:text-slate-800 prose-li:text-slate-600 prose-strong:text-slate-800">
              <div v-html="renderedContent"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div class="bg-slate-200 p-6 rounded-full animate-pulse">
          <RotateCw :size="40" class="text-slate-400" />
        </div>
        <p class="text-slate-400 font-medium">Loading your revision stack...</p>
      </div>

      <!-- Bottom Action -->
      <div class="px-5 pb-2 pt-0 flex justify-center">
        <button 
          @click="pickRandom" 
          class="w-full max-w-md bg-blue-600 text-white p-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="store.notes.length === 0"
        >
          <Shuffle :size="24" />
          {{ currentNote ? 'Next Topic' : 'Start Revising' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>