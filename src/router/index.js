import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/user/LoginView.vue';
import DashboardView from '../views/home/DashboardView.vue';
import ContactView from '../views/home/ContactView.vue';
import TasksView from '../views/home/TasksView.vue';
import OpportunitiesView from '../views/home/OpportunitiesView.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/contact', name: 'Contact', component: ContactView },
  { path: '/tasks', name: 'tasks', component: TasksView },
  { path: '/opportunities', name: 'opportunities', component: OpportunitiesView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

