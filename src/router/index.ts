import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/MobileLayout.vue";
import WordDetail from "@/views/WordDetail.vue";
import AboutPage from "@/views/AboutPage.vue";
import HomePage from "@/views/HomePage.vue";
import FavoritesPage from "@/views/FavoritesPage.vue";
import SettingsPage from "@/views/SettingsPage.vue";
import QuizHomePage from "@/views/QuizHomePage.vue";
import QuizPage from "@/views/QuizPage.vue";
import QuizResultsPage from "@/views/QuizResultsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    component: HomePage,
    name: "Home",
  },
  {
    path: "/favorites",
    component: FavoritesPage,
  },
  {
    path: "/settings",
    component: SettingsPage,
  },
  {
    path: "/tabs/",
    component: TabsPage,
    children: [
      {
        path: "",
        redirect: "/home",
      },
    ],
  },
  {
    path: "/word/:wordName",
    name: "WordDetail",
    component: WordDetail,
  },
  {
    path: "/about",
    name: "About",
    component: AboutPage,
  },
  {
    path: "/quiz",
    name: "Quiz Home",
    component: QuizHomePage,
  },
  {
    path: "/quiz/:seed", // The seed is passed as a URL parameter
    component: () => QuizPage,
  },
  {
    path: "/quiz-results/:score/:total",
    component: () => QuizResultsPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
