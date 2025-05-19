import { createRouter, createWebHistory } from 'vue-router';
import Base from "../components/Base.vue";
import Python from "../components/Python.vue";
import Csharp from "../components/Csharp.vue";




const routes = [
    {
        path: '/',
        name: 'Home',
        component: Base,
    },
    {
        path: '/python',
        name: 'python',
        component: Python,
    },
    {
        path: '/sharp',
        name: 'sharp',
        component: Csharp,
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes
});




export default router;
