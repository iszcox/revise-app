import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ReviseView from '../views/ReviseView.vue';
import LibraryView from '../views/LibraryView.vue';
import LessonDetailView from '../views/LessonDetailView.vue';

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
      path: '/lesson/:id',
      name: 'lesson-detail',
      component: LessonDetailView,
    }
  ],
});

export default router;