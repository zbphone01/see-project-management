---
name: partner-workbench-ui
description: Design and implement style-focused partner-side frontend pages with Vue 2.6 and Ant Design Vue 1.7.8, preserving every product function, title, and module from supplied prototypes while matching the current partner workbench. Use for new partner pages, dashboard modules, UI restyling, and layout adjustments; do not use for backend-only work.
---

# Partner Workbench UI

Create polished frontend demonstrations that look and behave like the existing partner workbench. Treat visual completeness and consistency as the primary deliverable; do not infer backend integration unless the request includes it.

Before designing or editing a page:

1. Read the repository-root `AGENTS.md` and follow it as the authoritative project policy.
2. Read [references/design-system.md](references/design-system.md) for the current workbench's visual rules.
3. Inspect the current implementation when it may have changed since the reference was written. Prefer established components and styles over creating a parallel visual language.

## Preserve the Prototype

- Inventory every function, heading, module, field, status, and action in the supplied prototype before implementation.
- Preserve all product content. Do not delete, merge, hide, rename, or downgrade a prototype item merely to simplify the layout.
- Remove prototype-only presentation aids from the finished page: dimensions, rulers, guide lines, component specimen galleries, button or status enumerations, explanatory annotations, and placeholder footnotes.
- Treat ambiguity conservatively. Keep the corresponding function and call it out for human confirmation instead of removing it.
- Use Canva first for genuinely new UI design as required by `AGENTS.md`. Small changes to an established page can follow the existing system directly.

## Implement the Frontend

- Use Vue 2.6 Options API and Ant Design Vue 1.7.x-compatible components, props, events, and slots.
- Focus on credible visual states using representative display data. A control may use a lightweight local demonstration interaction when no backend behavior is requested, but never present fabricated connectivity as production functionality.
- Reuse the shell, spacing rhythm, card treatment, semantic status colors, type hierarchy, overflow behavior, and responsive rules documented in the design-system reference.
- Whenever a project status is displayed, use the exact project-status label groups, colors, geometry, and ambiguity rule in the design-system reference. Do not substitute Ant Design preset tag colors or visually similar values.
- Extend styles by semantic role. Do not choose unrelated colors or unique component geometry merely to make a new module look different.
- Keep exceptional visual treatments, such as the purple AI assistant styling, scoped to their feature; they are not general page colors.

## Modal Dismissal

- 本项目后续新增或修改模态弹窗时，默认禁止点击弹窗外部或遮罩关闭，以免误操作丢失输入内容。
- Ant Design Vue 1.7.x 的 `a-modal` 必须显式设置 `:mask-closable="false"`；命令式 Modal 使用 `maskClosable: false`，自定义模态弹窗遵循相同交互。
- 此规则仅约束外部点击关闭，不改变关闭图标、Esc 键及确定、取消、删除等按钮各自的既定行为；如用户明确要求例外，以用户要求为准。
- 人工验收时，输入内容后点击遮罩，确认弹窗保持打开且内容保留，再检查原有关闭入口和按钮。

## Finish and Hand Off

- Remove all prototype annotations and design-system specimen content from the product UI.
- Do not add or run automated tests for a pure UI or layout task. Perform manual visual and interaction review instead.
- In the handoff, list the pages, important states, long-content cases, and interactions that a person should verify.
- If the change also affects business logic, APIs, permissions, data processing, or build configuration, follow the broader validation rule in `AGENTS.md`.

## Package on Explicit Request

Apply this section only when the user explicitly says “打包文件”. Do not create an archive as part of an ordinary UI task.

- Produce a complete frontend source archive that another developer can open and continue implementing business logic. Never substitute a `dist`-only deployment archive or a collection of screenshots.
- Include every page and component source, shared styles, required static assets, application entry files, `package.json`, the dependency lockfile, build configuration, and the repository's developer and agent guidance.
- Exclude `node_modules`, `dist`, caches, logs, version-control metadata, previous archives, the package-output tree, and secret-bearing environment files. Include only sanitized environment examples when needed.
- Put each archive in its own repository-root `packages/<package-name>/` directory. Choose a descriptive, collision-resistant source-package name; do not overwrite an earlier delivery.
- Inspect the completed archive before handoff. Confirm that it opens and contains `package.json`, the lockfile, all of `src`, required `public` assets, and build configuration, then return the exact archive path to the user.
