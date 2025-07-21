import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/MobileLayout.vue";
import WordDetail from "@/views/WordDetail.vue";
import AboutPage from "@/views/AboutPage.vue";
import HomePage from "@/views/HomePage.vue";
import FavoritesPage from "@/views/FavoritesPage.vue";
import SettingsPage from "@/views/SettingsPage.vue";

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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
