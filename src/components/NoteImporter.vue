<script setup lang="ts">
import { ref } from 'vue';
import { UploadCloud } from 'lucide-vue-next';
import { useNotesStore } from '../stores/notes';

const store = useNotesStore();
const fileInput = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  isImporting.value = true;
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (!file) continue;
      const text = await file.text();
      const title = file.name.replace(/\.[^/.]+$/, "");
      await store.addNote(title, text);
    }
  } finally {
    isImporting.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};
</script>

<template>
  <div class="p-6 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
    <div class="bg-blue-50 p-4 rounded-full text-blue-600">
      <UploadCloud :size="32" />
    </div>
    <div>
      <h3 class="font-semibold text-slate-900 text-lg">Import Notes</h3>
      <p class="text-sm text-slate-500 mt-1">Select .txt or .md files to add.</p>
    </div>
    <button 
      @click="triggerUpload" 
      :disabled="isImporting"
      class="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-blue-200 shadow-lg hover:bg-blue-700 active:scale-95 transition-all w-full disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {{ isImporting ? 'Importing...' : 'Choose Files' }}
    </button>
    <input 
      type="file" 
      ref="fileInput" 
      multiple 
      accept=".txt,.md" 
      class="hidden" 
      @change="handleFileUpload"
    >
  </div>
</template>
