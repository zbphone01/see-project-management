# 伙伴端项目管理系统

技术栈：Vue 2.6.14、Ant Design Vue 1.7.8、Vue Router 3.6.5、Webpack 4。

## 本地开发

开发和构建使用 Node.js **10.24.x**（基准实测版本 10.24.0）及 **pnpm 5.18.10**。
使用版本管理器切换 Node 后执行以下命令；Windows nvm 请显式执行 `nvm use 10.24.0`，不要依赖自动读取 `.nvmrc`。

```sh
node --version
npm install -g pnpm@5.18.10
pnpm install --frozen-lockfile
pnpm check:env
pnpm dev
pnpm build
pnpm preview
```

开发地址为 http://127.0.0.1:4173/。
`dev` 和 `preview` 使用同一端口，请分别启动。环境检查会拒绝非 10.24.x 的 Node，安装过程也会检查依赖的 Node 引擎要求。

`pnpm build` 输出 `dist`，其中包含全部路由分包和 `public` 静态资源。生产环境应由 Web 服务器托管 `dist`；`pnpm preview` 仅用于本地验证，并只监听 `127.0.0.1`。
本项目是浏览器端 Vue 应用，没有 Node 后端或 SSR；浏览器端的 DOM、IndexedDB 等 API 不在 Node 中执行。部署服务器使用 Node 10.24 时，需要兼容的是依赖安装、构建与工具脚本。
修改依赖后应在 Node 10.24 下更新并提交 `pnpm-lock.yaml`，不要使用新版 pnpm 重写锁文件。
`package.json` 的 `pnpm.overrides` 固定了 `sockjs-client`、`source-map@^0.7.3` 和 `@types/minimatch`，用于避免间接依赖自动更新到不支持 Node 10 的版本。兼容性实测结果见 [Node 10.24 验证记录](docs/node10-compatibility.md)。

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

## 页面地址与状态

采用 Hash 路由，无需部署服务器配置 history 回退。

| 页面 | 地址 |
| --- | --- |
| 工作台 | `/#/dashboard` |
| 已申请项目 | `/#/projects/applied` |
| 项目详情 | `/#/projects/1` |
| 项目审核 | `/#/projects/6?mode=audit` |

根地址及未知路径转到工作台；无效项目 ID 转到已申请列表，包括详情之间只变更 ID 的导航。

通过 `keep-alive` 保留列表筛选、选择和分页，以及工作台搜索。详情按项目 ID 分别缓存，防止不同项目共用审核表单和附件。审核与查看模式共用同一项目缓存。浏览器前进后退可恢复页面，整页刷新通过地址恢复页面、项目和模式。

筛选、审核意见、附件及对话是内存中的演示状态，刷新后不保留；未新增本地持久化或后端接口。尚无业务页面的菜单保留入口并显示提示。

## 验收重点

- 工作台、列表、详情直接打开和刷新；浏览器前进后退。
- 列表筛选后进入详情并返回，确认筛选、选择与分页状态保留。
- 不同项目审核意见、金额和附件互不串用；意见弹窗确定、删除与遮罩行为。
- 顶栏面包屑、菜单高亮、修改密码弹窗、AI 面板打开与拖动。
- 桌面不同宽度下的侧栏折叠、长标题、横向表格与工作台右栏滚动。

构建会提示主包及背景图体积偏大，现有 Ant Design Vue 依赖仍较大；页面自身已按路由独立加载。

## 环保 NGO 调研数据库

左侧菜单末尾新增“环保NGO调研数据库”，包含组织信息列表、数据分析、用户管理。一级菜单只展开或收起，三个二级入口与透明捐一样仅显示名称提示，不跳转页面。
