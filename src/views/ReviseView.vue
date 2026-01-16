<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useLessonsStore } from '../stores/lessons';
import TopBar from '../components/TopBar.vue';
import { SkipForward, Clock, BookOpen, AlertCircle, TrendingUp, ThumbsUp, CheckCircle } from 'lucide-vue-next';
import type { Lesson } from '../types';

const store = useLessonsStore();
const currentLesson = ref<Lesson | null>(null);
const selectedRating = ref<number>(1); // Default to 1 or current proficiency

const queue = computed(() => store.suggestions);

const loadNext = () => {
    if (store.lessons.length === 0) {
        currentLesson.value = null;
        return;
    }
    // Pick the top one from the weighted queue
    const next = queue.value[0];
    if (next) {
        currentLesson.value = next;
        selectedRating.value = next.proficiency || 1;
    }
};

const selectRating = (rating: number) => {
    selectedRating.value = rating;
};

const completeRevision = async () => {
    if (!currentLesson.value) return;
    await store.markAsRevised(currentLesson.value.id, selectedRating.value);
    loadNext();
};

const skip = () => {
    if (queue.value.length <= 1) return;
    const candidates = queue.value.slice(1, 4);
    const random = candidates[Math.floor(Math.random() * candidates.length)];
    if (random) {
        currentLesson.value = random;
        selectedRating.value = random.proficiency || 1;
    }
};

onMounted(async () => {
    await store.loadLessons();
    loadNext();
});

const formatDate = (ts: number | null) => {
    if (!ts) return 'Never';
    const days = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
};

// Helper for UI current proficiency
const getProficiencyLabel = (p: number) => {
    if (p <= 1) return { text: 'Hard', color: 'text-rose-500', bg: 'bg-rose-50' };
    if (p === 2) return { text: 'Medium', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { text: 'Easy', color: 'text-emerald-500', bg: 'bg-emerald-50' };
};
</script>

<template>
  <div class="page-wrapper h-screen flex flex-col">
    <TopBar title="Focus Mode" />

    <div class="flex-1 flex flex-col p-6 pb-24 max-w-md mx-auto w-full justify-center">
        
        <div v-if="currentLesson" class="bg-white rounded-3xl shadow-xl shadow-blue-200/50 border border-blue-50 p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500">
             <!-- Background Decoration -->
             <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl"></div>
             <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl"></div>

             <div class="relative z-10 w-full flex flex-col items-center">
                 <div class="bg-blue-100 text-blue-600 p-4 rounded-2xl mb-4 shadow-inner">
                    <BookOpen :size="32" />
                 </div>
                 
                 <h2 class="text-2xl font-bold text-slate-800 mb-2 leading-tight">{{ currentLesson.title }}</h2>
                 
                 <div class="flex items-center gap-3 mb-8">
                     <span class="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-500 flex items-center gap-1">
                        <Clock :size="12" />
                        {{ formatDate(currentLesson.lastRevised) }}
                     </span>
                     <span 
                        class="text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"
                        :class="[getProficiencyLabel(currentLesson.proficiency || 1).bg, getProficiencyLabel(currentLesson.proficiency || 1).color]"
                     >
                        <TrendingUp :size="12" />
                        {{ getProficiencyLabel(currentLesson.proficiency || 1).text }}
                     </span>
                 </div>

                 <div v-if="currentLesson.note" class="bg-slate-50 p-4 rounded-xl border border-slate-100 w-full mb-8 text-left max-h-48 overflow-y-auto custom-scrollbar">
                    <span class="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">Notes</span>
                    <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{{ currentLesson.note }}</p>
                 </div>
                 <div v-else class="mb-8 p-4 text-slate-400 italic text-sm">
                    No notes for this course.
                 </div>

                 <div class="w-full">
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Rate your knowledge</p>
                    <div class="grid grid-cols-3 gap-3 mb-6">
                        <button 
                            @click="selectRating(1)"
                            class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
                            :class="selectedRating === 1 ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-md scale-105' : 'border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-400'"
                        >
                            <AlertCircle :size="24" class="mb-1" />
                            <span class="text-xs font-bold">Hard</span>
                        </button>
                        
                        <button 
                            @click="selectRating(2)"
                            class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
                            :class="selectedRating === 2 ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-md scale-105' : 'border-slate-100 text-slate-400 hover:border-amber-200 hover:text-amber-400'"
                        >
                            <TrendingUp :size="24" class="mb-1" />
                            <span class="text-xs font-bold">Okay</span>
                        </button>

                        <button 
                            @click="selectRating(3)"
                            class="flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all"
                            :class="selectedRating === 3 ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-md scale-105' : 'border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-400'"
                        >
                            <ThumbsUp :size="24" class="mb-1" />
                            <span class="text-xs font-bold">Easy</span>
                        </button>
                    </div>

                    <button 
                         @click="completeRevision"
                         class="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3"
                    >
                        <CheckCircle :size="20" class="text-emerald-400" />
                        Mark Revised & Next
                    </button>

                    <button 
                        @click="skip"
                        class="text-slate-400 font-medium py-2 rounded-xl hover:text-slate-600 transition-colors flex items-center justify-center gap-2 text-xs"
                    >
                        <SkipForward :size="14" />
                        Skip for now
                    </button>
                 </div>
             </div>
        </div>

        <div v-else-if="store.lessons.length === 0" class="text-center text-slate-400">
            <p>No lessons to revise.</p>
        </div>
        
        <div v-else class="text-center">
            <h3 class="font-bold text-slate-800 text-xl">All caught up!</h3>
            <p class="text-slate-500 mt-2">Great job revising your list.</p>
        </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
</style>
