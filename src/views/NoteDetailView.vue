<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useNotesStore } from '../stores/notes';
import { marked } from 'marked';
import { Search, Highlighter, X, ChevronDown, ChevronUp } from 'lucide-vue-next';
import TopBar from '../components/TopBar.vue';
import Mark from 'mark.js';

const route = useRoute();
const store = useNotesStore();

const noteId = route.params.id as string;
const note = computed(() => store.notes.find(n => n.id === noteId));

// Search feature
const showSearch = ref(false);
const searchQuery = ref('');
const searchInstance = ref<Mark | null>(null);
const currentResultIndex = ref(0);
const totalResults = ref(0);

// Highlighting feature
const showHighlighter = ref(false);
const colors = [
  { name: 'Yellow', class: 'hl-yellow', hex: '#fef08a' },
  { name: 'Green', class: 'hl-green', hex: '#bbf7d0' },
  { name: 'Blue', class: 'hl-blue', hex: '#bfdbfe' },
  { name: 'Pink', class: 'hl-pink', hex: '#fbcfe8' },
  { name: 'Purple', class: 'hl-purple', hex: '#e9d5ff' },
];
const selectedColor = ref(colors[0]);

const renderedContent = computed(() => {
  if (!note.value) return '';
  return marked(note.value.content);
});

const formatDate = (ts: number) => {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// Search Logic
const performSearch = () => {
  if (!searchInstance.value) return;
  
  searchInstance.value.unmark({
    done: () => {
      if (!searchQuery.value) {
        totalResults.value = 0;
        return;
      }
      
      searchInstance.value?.mark(searchQuery.value, {
        className: 'search-match',
        done: (count) => {
          totalResults.value = count;
          currentResultIndex.value = 0;
          if (count > 0) {
            scrollToResult();
          }
        }
      });
    }
  });
};

const scrollToResult = () => {
  const matches = document.querySelectorAll('.search-match');
  matches.forEach(m => m.classList.remove('current-match'));
  
  const current = matches[currentResultIndex.value];
  if (current) {
    current.classList.add('current-match');
    current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

const nextResult = () => {
  if (totalResults.value === 0) return;
  currentResultIndex.value = (currentResultIndex.value + 1) % totalResults.value;
  scrollToResult();
};

const prevResult = () => {
  if (totalResults.value === 0) return;
  currentResultIndex.value = (currentResultIndex.value - 1 + totalResults.value) % totalResults.value;
  scrollToResult();
};

// Highlighting Logic
const applyHighlight = () => {
  if (!showHighlighter.value) return;
  
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

  const range = selection.getRangeAt(0);
  const text = selection.toString().trim();
  if (!text) return;

  const span = document.createElement('span');
  span.className = `custom-hl ${selectedColor.value.class} px-0.5 rounded transition-colors cursor-help`;
  span.dataset.color = selectedColor.value.name;
  
  try {
    range.surroundContents(span);
    selection.removeAllRanges();
  } catch (e) {
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
    selection.removeAllRanges();
  }
};

// Global click handler to remove highlights
const handleContentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('custom-hl')) {
        const text = target.innerText;
        target.replaceWith(text);
    }
};

onMounted(async () => {
  await nextTick();
  const content = document.querySelector('.note-content');
  if (content) {
    searchInstance.value = new Mark(content);
  }
});

watch(searchQuery, () => {
  performSearch();
});

watch(showSearch, (val) => {
    if (!val && searchInstance.value) {
        searchInstance.value.unmark();
        totalResults.value = 0;
        searchQuery.value = '';
    }
});
</script>

<template>
  <div class="page-wrapper">
    <TopBar :title="note?.title" show-back>
       <template #actions>
          <button 
            @click="showSearch = !showSearch; if(showSearch) showHighlighter = false" 
            class="p-2 rounded-full transition-colors"
            :class="showSearch ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'"
          >
            <Search :size="20" />
          </button>
          <button 
            @click="showHighlighter = !showHighlighter; if(showHighlighter) showSearch = false" 
            class="p-2 rounded-full transition-colors"
            :class="showHighlighter ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'"
          >
            <Highlighter :size="20" />
          </button>
       </template>
    </TopBar>

    <!-- Search Bar -->
    <transition name="slide-down">
      <div v-if="showSearch" class="fixed top-14 left-0 right-0 z-30 bg-white border-b border-slate-200 shadow-lg p-3 max-w-2xl mx-auto flex items-center gap-2">
         <div class="relative flex-1">
            <Search class="absolute left-3 top-2.5 text-slate-400" :size="18" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Find in note..." 
              class="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
              autofocus
            >
         </div>
         <div class="flex items-center gap-1 text-slate-500">
            <span class="text-xs font-medium mr-1">{{ totalResults > 0 ? currentResultIndex + 1 : 0 }}/{{ totalResults }}</span>
            <button @click="prevResult" class="p-1.5 hover:bg-slate-100 rounded-md"><ChevronUp :size="18" /></button>
            <button @click="nextResult" class="p-1.5 hover:bg-slate-100 rounded-md"><ChevronDown :size="18" /></button>
            <button @click="showSearch = false" class="p-1.5 hover:bg-slate-100 rounded-md"><X :size="18" /></button>
         </div>
      </div>
    </transition>

    <!-- Highlighter Toolbar -->
    <transition name="slide-down">
      <div v-if="showHighlighter" class="fixed top-14 left-0 right-0 z-30 bg-white border-b border-slate-200 shadow-lg p-3 max-w-2xl mx-auto flex flex-col gap-2">
         <div class="flex items-center justify-between px-1">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-tight">Select Highlight Color</span>
            <button @click="showHighlighter = false" class="text-slate-400 hover:text-slate-600"><X :size="16" /></button>
         </div>
         <div class="flex items-center gap-3 justify-center py-1">
            <button 
              v-for="color in colors" 
              :key="color.name"
              @click="selectedColor = color"
              class="w-10 h-10 rounded-full border-2 transition-transform active:scale-90"
              :style="{ backgroundColor: color.hex }"
              :class="selectedColor.name === color.name ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent'"
            ></button>
         </div>
         <p class="text-[10px] text-center text-slate-500 font-medium px-4">Long-press text to select a sentence, then tap "Apply" below.</p>
         <button 
            @click="applyHighlight"
            class="mt-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 active:scale-95 transition-all shadow-md shadow-slate-200"
         >
            Apply Highlight to Selection
         </button>
      </div>
    </transition>

    <div class="bg-white min-h-screen pb-24 transition-all" :class="{ 'pt-32': showHighlighter, 'pt-14': showSearch && !showHighlighter }">
      <div v-if="note" class="max-w-2xl mx-auto">
        <!-- Meta Header -->
        <div class="px-6 pt-6 pb-2">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Imported {{ formatDate(note.importedAt) }}</span>
          <h1 class="text-3xl font-bold text-slate-900 mt-2 leading-tight">{{ note.title }}</h1>
          <div class="h-1 w-20 bg-blue-500 rounded-full mt-4"></div>
        </div>

        <!-- Content -->
        <div 
          class="note-content select-text touch-auto -webkit-user-select-text break-words px-6 py-6 prose prose-slate prose-lg max-w-none 
          prose-headings:font-bold prose-headings:text-slate-800 
          prose-h1:text-2xl prose-h2:text-xl 
          prose-p:text-slate-600 prose-p:leading-relaxed
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
          prose-li:text-slate-600
          prose-strong:text-slate-800 prose-strong:font-bold
          prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:bg-slate-50 prose-blockquote:px-4 prose-blockquote:py-1 prose-blockquote:italic prose-blockquote:rounded-r-lg
          prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-slate-800 prose-code:before:content-[''] prose-code:after:content-['']"
          @click="handleContentClick"
          style="-webkit-tap-highlight-color: transparent;"
        >
          <div v-html="renderedContent"></div>
        </div>
      </div>
      
      <div v-else class="p-12 text-center text-slate-400">
        <p>Note not found.</p>
      </div>
    </div>
  </div>
</template>

<style>
/* Global styles for marks because Mark.js injects them outside scoped scope */
.search-match {
  background-color: #fde68a; /* yellow-200 */
  color: #000;
  border-radius: 2px;
  transition: all 0.2s;
}

.search-match.current-match {
  background-color: #f97316; /* orange-500 */
  color: #fff;
  box-shadow: 0 0 0 2px #f97316;
}

.custom-hl.hl-yellow { background-color: #fef08a; color: #713f12; }
.custom-hl.hl-green { background-color: #bbf7d0; color: #14532d; }
.custom-hl.hl-blue { background-color: #bfdbfe; color: #1e3a8a; }
.custom-hl.hl-pink { background-color: #fbcfe8; color: #831843; }
.custom-hl.hl-purple { background-color: #e9d5ff; color: #581c87; }
</style>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>