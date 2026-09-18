import Vue from 'vue'
import VueRouter from 'vue-router'
import { appliedProjects } from '../mock/projects'
import { editableDraftIds } from '../mock/project-drafts'
import recruitmentDetails from '../mock/recruitment-details.json'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'hash',
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue') },
    { path: '/dashboard-see', name: 'dashboard-see', component: () => import('../views/SeeDashboard.vue') },
    { path: '/projects/available', name: 'available-projects', component: () => import('../views/AvailableProjects.vue') },
    { path: '/projects/available/:id', name: 'recruitment-detail', component: () => import('../views/RecruitmentDetail.vue'),
      props: route => ({ recruitmentId: route.params.id })
    },
    { path: '/projects/applied', name: 'applied-projects', component: () => import('../views/AppliedProjects.vue') },
    { path: '/projects/reports', name: 'project-reports', component: () => import('../views/ProjectReports.vue') },
    { path: '/projects/reports/:id', name: 'report-detail', component: () => import('../views/ReportDetail.vue'),
      props: route => ({ reportId: route.params.id, mode: route.query.mode === 'audit' ? 'audit' : 'view' })
    },
    { path: '/projects/:id/report/edit', name: 'report-form', component: () => import('../views/ReportForm.vue'),
      props: route => ({ projectId: route.params.id, type: route.query.type === 'completion' ? 'completion' : 'progress' })
    },
    { path: '/projects/:id/edit', name: 'project-form', component: () => import('../views/ProjectForm.vue') },
    { path: '/projects/:id', name: 'project-detail', component: () => import('../views/ProjectDetail.vue'),
      props: route => ({ projectId: Number(route.params.id), mode: route.query.mode === 'audit' ? 'audit' : 'view' })
    },
    { path: '*', redirect: '/dashboard' }
  ],
  scrollBehavior (to, from, savedPosition) { return savedPosition || { x: 0, y: 0 } }
})

// 全局守卫也覆盖详情页之间仅变更项目 ID 的导航。
router.beforeEach((to, from, next) => {
  if (to.name === 'recruitment-detail' && !Object.prototype.hasOwnProperty.call(recruitmentDetails, to.params.id)) {
    next({ name: 'available-projects', replace: true }); return
  }
  if (to.name === 'project-form' && !editableDraftIds.some(id => String(id) === String(to.params.id))) {
    next({ name: 'dashboard', replace: true }); return
  }
  if (to.name === 'project-detail' && !appliedProjects.some(project => String(project.id) === to.params.id)) {
    next({ name: 'applied-projects', replace: true })
  } else next()
})

export default router
