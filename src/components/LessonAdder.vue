<script setup lang="ts">
import { ref } from 'vue';
import { Plus, StickyNote } from 'lucide-vue-next';
import { useLessonsStore } from '../stores/lessons';

const store = useLessonsStore();
const title = ref('');
const note = ref('');
const isExpanded = ref(false);

const add = async () => {
  if (!title.value.trim()) return;
  await store.addLesson(title.value, note.value);
  title.value = '';
  note.value = '';
  isExpanded.value = false;
};
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 transition-all">
    <div v-if="!isExpanded" @click="isExpanded = true" class="flex items-center gap-3 cursor-text text-slate-400">
       <div class="bg-blue-50 text-blue-500 p-2 rounded-lg">
         <Plus :size="20" />
       </div>
       <span class="font-medium">Add a new lesson...</span>
    </div>

    <div v-else class="space-y-4">
       <div class="flex items-center justify-between">
          <h3 class="font-bold text-slate-700 text-sm uppercase tracking-wide">New Lesson</h3>
          <button @click="isExpanded = false" class="text-slate-400 text-xs font-medium hover:text-slate-600">Cancel</button>
       </div>

       <div class="space-y-3">
         <input 
           v-model="title"
           type="text" 
           placeholder="Course Name (e.g. Cardiology)" 
           class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800"
           autofocus
           @keyup.enter="add"
         >
         
         <div class="relative">
            <StickyNote class="absolute left-3 top-3 text-slate-400" :size="18" />
            <textarea 
               v-model="note"
               placeholder="Add a quick note or key takeaway (optional)..." 
               class="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm text-slate-600"
            ></textarea>
         </div>
       </div>

       <button 
         @click="add"
         :disabled="!title.trim()"
         class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
       >
         Add to Revision List
       </button>
    </div>
  </div>
</template>
