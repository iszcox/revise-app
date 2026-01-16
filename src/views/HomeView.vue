<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLessonsStore } from '../stores/lessons';
import LessonAdder from '../components/LessonAdder.vue';
import TopBar from '../components/TopBar.vue';
import { Clock, AlertCircle, ChevronRight } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const store = useLessonsStore();
const router = useRouter();

onMounted(() => {
  store.loadLessons();
});

const suggestions = computed(() => store.suggestions.slice(0, 3));
const hasSuggestions = computed(() => suggestions.value.length > 0);

const formatTime = (ts: number | null) => {
  if (!ts) return 'Never revised';
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const openLesson = (id: string) => {
  router.push(`/lesson/${id}`);
};
</script>

<template>
  <div class="page-wrapper pb-24">
    <TopBar title="Dashboard" />

    <div class="p-5 space-y-8 max-w-md mx-auto animate-in fade-in duration-500">
      
      <!-- Welcome -->
      <section>
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Time to Revise?</h2>
        <p class="text-slate-500 font-medium">Add new courses or review old ones.</p>
      </section>

      <!-- Add New -->
      <section>
        <LessonAdder />
      </section>

      <!-- Suggestions -->
      <section v-if="hasSuggestions">
         <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <AlertCircle :size="18" class="text-amber-500" />
              Needs Revision
            </h3>
            <router-link to="/revise" class="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md">Start Session</router-link>
         </div>

         <div class="space-y-3">
            <div 
              v-for="lesson in suggestions" 
              :key="lesson.id"
              @click="openLesson(lesson.id)"
              class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.99] transition-all cursor-pointer hover:border-blue-200"
            >
               <div>
                  <h4 class="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{{ lesson.title }}</h4>
                  <div class="flex items-center gap-1 text-xs text-slate-400 mt-1">
                     <Clock :size="12" />
                     <span>Last: {{ formatTime(lesson.lastRevised) }}</span>
                  </div>
               </div>
               <ChevronRight :size="18" class="text-slate-300" />
            </div>
         </div>
      </section>

      <!-- Empty State -->
      <section v-else class="text-center py-10 opacity-60">
        <p class="text-sm text-slate-400">No lessons added yet.</p>
      </section>

    </div>
  </div>
</template>
