<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLessonsStore } from '../stores/lessons';
import { Search, Book, Trash2 } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import TopBar from '../components/TopBar.vue';

const store = useLessonsStore();
const router = useRouter();
const searchQuery = ref('');
const sortMode = ref<'recent' | 'alpha' | 'level'>('recent');

onMounted(() => {
    store.loadLessons();
});

const filteredLessons = computed(() => {
  let list = [...store.lessons];
  
  // Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(l => l.title.toLowerCase().includes(q) || l.note.toLowerCase().includes(q));
  }

  // Sort
  if (sortMode.value === 'recent') {
     list.sort((a, b) => (b.lastRevised || 0) - (a.lastRevised || 0));
  } else if (sortMode.value === 'alpha') {
     list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortMode.value === 'level') {
     // Sort by difficulty (Hardest/Lowest Proficiency first)
     list.sort((a, b) => (a.proficiency || 1) - (b.proficiency || 1));
  }
  
  return list;
});

const getProficiencyBg = (p: number) => {
    if (p <= 1) return 'bg-rose-500';
    if (p === 2) return 'bg-amber-500';
    return 'bg-emerald-500';
};

const openLesson = (id: string) => {
  router.push(`/lesson/${id}`);
};

const deleteLesson = async (id: string, event: Event) => {
  event.stopPropagation();
  if (confirm('Remove this course from your list?')) {
    await store.deleteLesson(id);
  }
};

const formatTime = (ts: number | null) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
</script>

<template>
  <div class="page-wrapper">
    <TopBar title="Library" />

    <div class="max-w-md mx-auto min-h-screen flex flex-col">
      <!-- Search & Filter Header -->
      <div class="sticky top-14 bg-slate-50/95 backdrop-blur-sm z-30 px-5 py-3 border-b border-slate-100 transition-all space-y-3">
        <div class="relative group">
          <Search class="absolute left-4 top-3.5 text-slate-400 transition-colors group-focus-within:text-blue-500" :size="20" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search courses..." 
            class="w-full bg-white pl-12 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700 font-medium"
          >
        </div>
        
        <div class="flex flex-wrap gap-2 pt-1">
            <button 
                @click="sortMode = 'recent'"
                class="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors border"
                :class="sortMode === 'recent' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
            >
                Recent
            </button>
            <button 
                @click="sortMode = 'alpha'"
                class="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors border"
                :class="sortMode === 'alpha' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
            >
                A-Z
            </button>
            <button 
                @click="sortMode = 'level'"
                class="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-colors border"
                :class="sortMode === 'level' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'"
            >
                Difficulty
            </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 space-y-3 pb-24">
        <div 
          v-for="lesson in filteredLessons" 
          :key="lesson.id" 
          @click="openLesson(lesson.id)"
          class="group bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 active:scale-[0.99] transition-all cursor-pointer flex items-start gap-4 relative overflow-hidden"
        >
          <!-- Level Indicator Color Strip -->
          <div 
            class="absolute top-0 left-0 bottom-0 w-1.5 transition-colors"
            :class="getProficiencyBg(lesson.proficiency || 1)"
          ></div>

          <div class="bg-indigo-50 text-indigo-500 p-3 rounded-xl group-hover:bg-indigo-100 transition-colors ml-1">
            <Book :size="20" />
          </div>
          
          <div class="flex-1 min-w-0 pr-6">
            <h3 class="font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{{ lesson.title }}</h3>
            <p class="text-xs text-slate-400 mt-1 font-medium">
               Revised: <span :class="{'text-amber-500': !lesson.lastRevised, 'text-slate-500': lesson.lastRevised}">{{ formatTime(lesson.lastRevised) }}</span>
            </p>
            <p v-if="lesson.note" class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-100">
              "{{ lesson.note }}"
            </p>
          </div>

          <button 
            @click="deleteLesson(lesson.id, $event)"
            class="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all z-10"
            aria-label="Delete"
          >
            <Trash2 :size="16" />
          </button>
        </div>
        
        <!-- Empty States -->
        <div v-if="filteredLessons.length === 0" class="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div class="bg-slate-100 p-6 rounded-full">
             <Search :size="40" class="text-slate-300" />
          </div>
          <div class="space-y-1">
            <h3 class="font-bold text-slate-700">No matches</h3>
            <p class="text-sm text-slate-400 max-w-xs mx-auto">Try adding a new course.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
