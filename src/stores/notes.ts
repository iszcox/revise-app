import { defineStore } from 'pinia';
import { ref } from 'vue';
import { get, set } from 'idb-keyval';
import type { Note } from '../types';

export interface Highlight {
  id: string;
  noteId: string;
  text: string;
  color: string;
  range?: { start: number; end: number }; // Optional for now
}

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([]);
  const highlights = ref<Highlight[]>([]);
  const loading = ref(false);

  async function loadNotes() {
    loading.value = true;
    const [storedNotes, storedHighlights] = await Promise.all([
      get<Note[]>('revise-notes'),
      get<Highlight[]>('revise-highlights')
    ]);
    
    if (storedNotes) notes.value = storedNotes;
    if (storedHighlights) highlights.value = storedHighlights;
    
    loading.value = false;
  }

  async function addNote(title: string, content: string) {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      importedAt: Date.now(),
    };
    notes.value.push(newNote);
    await persist();
  }

  async function deleteNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id);
    highlights.value = highlights.value.filter(h => h.noteId !== id);
    await persist();
  }

  async function addHighlight(noteId: string, text: string, color: string) {
    const newHighlight: Highlight = {
      id: crypto.randomUUID(),
      noteId,
      text,
      color
    };
    highlights.value.push(newHighlight);
    await persist();
  }

  async function removeHighlight(id: string) {
    highlights.value = highlights.value.filter(h => h.id !== id);
    await persist();
  }

  async function persist() {
    await Promise.all([
        set('revise-notes', JSON.parse(JSON.stringify(notes.value))),
        set('revise-highlights', JSON.parse(JSON.stringify(highlights.value)))
    ]);
  }

  return { notes, highlights, loading, loadNotes, addNote, deleteNote, addHighlight, removeHighlight };
});