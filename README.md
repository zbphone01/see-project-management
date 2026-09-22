# 项目管理系统前端

技术栈：Vue 2.6.14、Ant Design Vue 1.7.8、Vue Router 3.6.5、Webpack 4。

## 源码结构

- `src/App.vue`：组装公共布局、缓存路由页面和全局 AI 面板。
- `src/layouts/PartnerLayout.vue`：菜单、顶栏、面包屑及内容插槽。
- `src/views/Dashboard.vue`：工作台及搜索、右栏滚动联动。
- `src/views/AppliedProjects.vue`：已申请项目、筛选、分页、选择和操作导航。
- `src/views/ProjectDetail.vue`：项目详情、审核表单及审核意见。
- `src/components/BudgetPrototype.vue`：预算表。
- `src/components/ChangePasswordModal.vue`：修改密码弹窗与校验。
- `src/components/AiAssistant.vue`：AI 面板、拖动与对话演示。
- `src/mock/projects.js`：列表、详情和路由校验共用的演示项目数据。
- `src/router/index.js`：路由定义、按需加载和无效项目地址处理。
- `src/styles/common.css`：保留原顺序的现有样式，包含公共规则、页面规则及响应式覆盖，避免拆分改变样式优先级。

各页面使用 Vue 2 Options API，页面逻辑由页面自身管理。工作台通过 `open-ai` 事件通知入口打开 AI 面板；详情通过路由 props 接收项目 ID 和模式。后续添加页面时，在 `views` 创建组件，并在路由表和布局导航中登记。
