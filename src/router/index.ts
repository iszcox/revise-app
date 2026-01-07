import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ReviseView from '../views/ReviseView.vue';
import LibraryView from '../views/LibraryView.vue';
import NoteDetailView from '../views/NoteDetailView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/revise',
      name: 'revise',
      component: ReviseView,
    },
    {
      path: '/library',
      name: 'library',
      component: LibraryView,
    },
    {
      path: '/note/:id',
      name: 'note-detail',
      component: NoteDetailView,
    }
  ],
});

export default router;