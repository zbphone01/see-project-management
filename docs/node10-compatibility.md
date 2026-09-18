# Node.js 10.24 兼容性验证

验证日期：2026-09-16。

## 环境与范围

- 本机 Windows x64，实际运行 Node.js `v10.24.0`，npm `6.14.11`，pnpm `5.18.10`。
- Node 来自官方 `node-v10.24.0-win-x64.zip`，已比对官方 SHA256 校验值。
- 使用独立解压的 Node 环境测试，没有替换电脑全局 Node `v24.19.0`。日常开发前仍须切换 Node，并使用指定版本 pnpm。
- 检查 `src` 全部 15 个 Vue 文件、6 个 JavaScript 文件、JSON 数据、公共样式、静态资源，以及项目 Node 工具脚本、构建配置和安装后的依赖树。
- 本项目是浏览器端应用，不包含 Node 后端或 SSR。DOM、IndexedDB、localStorage、Object.fromEntries 等在浏览器中运行，不要求 Node 10 提供这些浏览器端功能。

## 兼容性调整

原 Vite 2 最低要求 Node 12.2，参见 [Vite 2 官方文档](https://v2.vitejs.dev/guide/)。现改用 Webpack 4.47.0、vue-loader 15.9.8、webpack-dev-server 3.11.3，并保留 Vue 2.6.14、Ant Design Vue 1.7.8 和 Vue Router 3.6.5。

HTML 入口由构建工具自动注入脚本，`public` 文件完整复制到 `dist`。开发环境使用固定脚本文件名以支持热更新，生产环境使用内容哈希文件名。原 Vite 配置和仅用于新版 pnpm 安装审批的 `pnpm-workspace.yaml` 已移除。

严格安装实际发现并处理的间接依赖问题：

| 依赖 | 问题 | 处理 |
| --- | --- | --- |
| sockjs-client 1.6.1 | 要求 Node >=12 | 固定 1.5.2 |
| source-map 0.7.6 | 要求 Node >=12 | 将 ^0.7.3 范围固定为 0.7.4，不影响旧版 0.6/0.5 分支 |
| @types/minimatch 6 | 通过通配依赖引入要求 Node 18+ 的 minimatch 10 | 固定类型包 5.1.2 |

`.npmrc` 启用严格引擎检查；启动、构建和预览前检查 Node 必须为 10.24.x。pnpm 锁文件已重新生成，格式为 5.2。

## 实测结果

| 检查 | 结果 |
| --- | --- |
| Node 10.24.0 下从空 node_modules 安装 | 通过 |
| 独立目录 `pnpm install --frozen-lockfile --offline` | 通过，复用包缓存但从空依赖目录安装，锁文件未改变 |
| 已安装依赖引擎检查 | 711 个依赖包，0 个 Node 引擎冲突 |
| Node 工具脚本和 Webpack 配置 `node --check` | 3 个文件通过 |
| 所有 Vue 模板编译、JSON 解析 | 通过 |
| 项目目录与独立干净安装目录 `pnpm build` | 均通过，退出码 0 |
| 开发服务 HTTP 验证 | 首页、入口 JavaScript、Logo 返回 200，缺失文件返回 404 |
| 生产预览 HTTP 验证 | 全部 22 个输出文件返回 200，逐文件内容与磁盘一致；缺失文件返回 404 |
| public 静态资源 | 与构建产物逐文件比对一致 |
| 使用系统 Node 24 启动环境检查 | 正确拒绝，退出码 1 |

最终保留 3 条实际需要的依赖覆盖规则；移除一条未被新构建链使用的 node-releases 覆盖规则后，确认锁文件只移除了该元数据条目，没有改变依赖版本，并再次通过冻结锁文件安装。

生产构建存在主包约 2.47 MiB、背景图约 979 KiB 的体积提示。Windows 安装时存在可选 macOS 依赖 fsevents 的提升提示，未阻断安装或构建。

## 人工验收与边界

没有执行浏览器自动化或视觉测试。请在切换到 Node 10.24.x 并安装 pnpm 5.18.10 后，分别运行 `pnpm dev`、`pnpm build`、`pnpm preview`（dev 与 preview 均占用 4173 端口，不同时运行），人工检查：

- 工作台、SEE 工作台、项目列表和报告列表的直接访问、刷新、前进后退与路由跳转。
- 项目/报告详情、项目修改、进展/结项报告填写页的样式、弹窗、富文本、预算明细、审核意见和附件操作。
- 图片背景、Logo、图标和路由懒加载页面正常显示。

实测结论覆盖本机 Windows 上的 Node 10.24.0 安装、编译及 HTTP 服务，不代表已经在实际服务器或其他操作系统上部署验收，也不替代页面交互验收。
