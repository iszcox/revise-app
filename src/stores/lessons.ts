import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { get, set } from 'idb-keyval';
import type { Lesson } from '../types';

export const useLessonsStore = defineStore('lessons', () => {
  const lessons = ref<Lesson[]>([]);
  const loading = ref(false);

  async function loadLessons() {
    loading.value = true;
    const storedLessons = await get<Lesson[]>('revise-lessons');
    if (storedLessons) {
        // Migration: Ensure proficiency exists
        lessons.value = storedLessons.map(l => ({
            ...l,
            proficiency: l.proficiency ?? 1
        }));
    }
    loading.value = false;
  }

  async function addLesson(title: string, note: string) {
    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title,
      note,
      createdAt: Date.now(),
      lastRevised: null,
      proficiency: 1
    };
    lessons.value.push(newLesson);
    await persist();
  }

  async function deleteLesson(id: string) {
    lessons.value = lessons.value.filter(l => l.id !== id);
    await persist();
  }

  async function updateLesson(id: string, updates: Partial<Lesson>) {
    const index = lessons.value.findIndex(l => l.id === id);
    if (index !== -1) {
      lessons.value[index] = { ...lessons.value[index]!, ...updates };
      await persist();
    }
  }

  async function markAsRevised(id: string, newProficiency?: number) {
    const updates: Partial<Lesson> = { lastRevised: Date.now() };
    if (newProficiency !== undefined) {
        updates.proficiency = newProficiency;
    }
    await updateLesson(id, updates);
  }

  async function persist() {
    await set('revise-lessons', JSON.parse(JSON.stringify(lessons.value)));
  }

  // Getters
  const sortedByRecent = computed(() => {
    return [...lessons.value].sort((a, b) => {
      const timeA = a.lastRevised ?? 0;
      const timeB = b.lastRevised ?? 0;
      return timeB - timeA;
    });
  });

  const suggestions = computed(() => {
    // Sort by "Weighted Urgency"
    // Formula: urgency = timeSinceLastRevised / proficiencyFactor
    // proficiency: 1 (Hard), 2 (Medium), 4 (Easy)
    // Higher urgency = needs revision sooner
    
    const now = Date.now();

    return [...lessons.value].sort((a, b) => {
       const timeA = a.lastRevised ? (now - a.lastRevised) : Number.MAX_SAFE_INTEGER; // Never revised = max urgency
       const timeB = b.lastRevised ? (now - b.lastRevised) : Number.MAX_SAFE_INTEGER;

       // Define weights. 
       // 1 (Hard) -> denominator 1 (full time impact)
       // 2 (Med)  -> denominator 2 (half time impact)
       // 3 (Easy) -> denominator 4 (quarter time impact)
       // 4 (Mastered) -> denominator 8
       
       const getFactor = (p: number) => {
           if (p <= 1) return 1;
           if (p === 2) return 2;
           if (p === 3) return 4;
           return 8; // p >= 4
       };

       const scoreA = timeA / getFactor(a.proficiency || 1);
       const scoreB = timeB / getFactor(b.proficiency || 1);

       return scoreB - scoreA; // Descending urgency
    });
  });

  return { 
    lessons, 
    loading, 
    loadLessons, 
    addLesson, 
    deleteLesson, 
    updateLesson, 
    markAsRevised, 
    sortedByRecent, 
    suggestions 
  };
});