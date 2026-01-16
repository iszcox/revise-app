<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLessonsStore } from '../stores/lessons';
import TopBar from '../components/TopBar.vue';
import { CheckCircle, Clock, Trash2, Edit3, Save, TrendingUp, RotateCw, PenLine, Plus } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = useLessonsStore();

const id = route.params.id as string;
const lesson = computed(() => store.lessons.find(l => l.id === id));

const isEditingTitle = ref(false);
const isEditingNote = ref(false);
const editTitle = ref('');
const editNote = ref('');

onMounted(async () => {
    store.loadLessons();
});

const markRevised = async () => {
    if (!lesson.value) return;
    await store.markAsRevised(id); 
};

// Title Editing
const startEditTitle = () => {
    if (!lesson.value) return;
    editTitle.value = lesson.value.title;
    isEditingTitle.value = true;
};

const saveTitle = async () => {
    if (!editTitle.value.trim()) return;
    await store.updateLesson(id, { title: editTitle.value.trim() });
    isEditingTitle.value = false;
};

// Note Editing
const startEditNote = () => {
    if (!lesson.value) return;
    editNote.value = lesson.value.note;
    isEditingNote.value = true;
};

const saveNote = async () => {
    await store.updateLesson(id, { note: editNote.value });
    isEditingNote.value = false;
};

const confirmDelete = async () => {
  if (confirm('Delete this course?')) {
    await store.deleteLesson(id);
    router.push('/library');
  }
};

const formatDate = (ts: number | null) => {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
  });
};

const getProficiencyLabel = (p: number) => {
    if (p <= 1) return 'Hard';
    if (p === 2) return 'Medium';
    return 'Easy';
};

const getProficiencyClasses = (p: number) => {
    if (p <= 1) return 'border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-200';
    if (p === 2) return 'border-amber-100 bg-amber-50 text-amber-600 hover:border-amber-200';
    return 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:border-emerald-200';
};

const cycleProficiency = async () => {
    if (!lesson.value) return;
    let next = (lesson.value.proficiency || 1) + 1;
    if (next > 3) next = 1;
    await store.updateLesson(id, { proficiency: next });
};
</script>

<template>
  <div class="page-wrapper">
    <TopBar :show-back="!isEditingTitle">
        <template #title>
            <div v-if="isEditingTitle" class="flex-1 min-w-0 pr-2 flex items-center gap-2">
                <input 
                    v-model="editTitle"
                    type="text"
                    class="w-full bg-slate-100 border-none rounded-lg px-3 py-1 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Course Name"
                    autofocus
                    @keyup.enter="saveTitle"
                >
                <button @click="saveTitle" class="p-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"><Save :size="18" /></button>
            </div>
            <div v-else-if="lesson" class="flex items-center gap-2 overflow-hidden">
                <h1 class="font-bold text-lg text-slate-800 truncate">
                    {{ lesson.title }}
                </h1>
                <button @click="startEditTitle" class="text-slate-400 hover:text-blue-500 transition-colors p-1">
                    <PenLine :size="16" />
                </button>
            </div>
        </template>
        <template #actions>
            <button @click="confirmDelete" class="p-2 text-rose-400 hover:bg-rose-50 rounded-full transition-colors">
                <Trash2 :size="20" />
            </button>
        </template>
    </TopBar>

    <div v-if="lesson" class="max-w-md mx-auto p-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
       
       <!-- Status Card -->
       <div class="bg-white rounded-2xl p-6 shadow-lg shadow-blue-100/50 border border-blue-50 text-center relative overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          
          <div class="flex justify-around items-center mb-6">
              <div>
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Revision</span>
                  <div class="text-slate-800 font-bold text-sm flex items-center justify-center gap-1.5">
                     <Clock :size="16" class="text-blue-500" />
                     {{ formatDate(lesson.lastRevised) }}
                  </div>
              </div>
              
              <div class="w-px h-10 bg-slate-100"></div>

              <div>
                  <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Knowledge Level</span>
                  <button 
                    @click="cycleProficiency"
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all active:scale-95 shadow-sm group"
                    :class="getProficiencyClasses(lesson.proficiency || 1)"
                    title="Change knowledge level"
                  >
                     <TrendingUp :size="14" />
                     <span class="text-xs font-bold">{{ getProficiencyLabel(lesson.proficiency || 1) }}</span>
                     <RotateCw :size="12" class="opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
              </div>
          </div>
          
          <button 
             @click="markRevised"
             class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
             <CheckCircle :size="20" class="text-emerald-400" />
             Mark as Revised Now
          </button>
       </div>

       <!-- Note Section -->
       <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center justify-between mb-4">
             <h3 class="font-bold text-slate-800 text-lg">Course Notes</h3>
             <button 
                v-if="!isEditingNote" 
                @click="startEditNote"
                class="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
             >
                <component :is="lesson.note ? Edit3 : Plus" :size="16" /> 
                {{ lesson.note ? 'Edit' : 'Add Note' }}
             </button>
          </div>

          <div v-if="isEditingNote" class="space-y-3">
             <textarea 
               v-model="editNote" 
               class="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-sm"
               placeholder="Write your notes here..."
               autofocus
             ></textarea>
             <div class="flex justify-end gap-2">
                <button @click="isEditingNote = false" class="px-4 py-2 text-slate-500 font-medium text-sm">Cancel</button>
                <button @click="saveNote" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 flex items-center gap-2">
                    <Save :size="16" /> Save
                </button>
             </div>
          </div>

          <div v-else>
             <p v-if="lesson.note" class="text-slate-600 leading-relaxed whitespace-pre-wrap">{{ lesson.note }}</p>
             <p v-else class="text-slate-400 italic text-sm">No notes added for this course.</p>
          </div>
       </div>

    </div>

    <div v-else class="p-10 text-center text-slate-400">
        Lesson not found.
    </div>
  </div>
</template>
