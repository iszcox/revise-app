<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const props = defineProps<{
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
}>();

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
    :class="[
      props.transparent ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50'
    ]"
  >
    <div class="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <button 
          v-if="showBack" 
          @click="goBack"
          class="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors active:scale-95"
          aria-label="Go back"
        >
          <ChevronLeft :size="24" />
        </button>
        
        <slot name="title">
          <h1 
            v-if="title" 
            class="font-bold text-lg text-slate-800 truncate"
          >
            {{ title }}
          </h1>
        </slot>
      </div>
      
      <div class="flex items-center gap-2">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
  <!-- Spacer to prevent content from hiding behind fixed header -->
  <div v-if="!transparent" class="h-14"></div>
</template>
