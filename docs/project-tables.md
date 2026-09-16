# 详情与审核页表格数据

示例数据：`src/mock/project-tables.json`。查看详情和审核共用 `ProjectDetail.vue`，通过 `tableData` prop 接收相同结构的 JSON。默认值为示例数据的独立副本；接入接口后应按当前 `projectId` 获取数据再传入，不能将一个项目的响应复用于其他项目。当前没有新增网络请求或保存接口。

## 字段

所有行的 `id` 为唯一且稳定的字符串，序号由显示顺序生成。数组可以为空，但请保留各顶层字段；文本使用普通字符串，不传 HTML。

| 数组 | 行字段 |
| --- | --- |
| `areas` | `id`、`province` 省、`city` 市、`district` 行政区 |
| `team` | `id`、`name`、`position` 职位、`responsibilities` 工作内容 |
| `stakeholders` | `id`、`party` 相关方、`interest` 利益内容、`impact` 影响（积极/消极）、`management` 管理内容 |
| `risks` | `id`、`likelihood` 可能性、`description` 风险内容、`response` 应对措施、`affectedActivities` 影响目标或活动 |
| `monitoring` | `id`、`purpose` 目的、`method` 方法 |

`budget` 为对象，通过 `budget` prop 传给预算组件：

- `organization`、`period`、`partners`、`executionCutoff`：预算表头数据。
- `tabs`、`columns`、`widths`：现有页签、15 列标题及列宽配置，通常由前端保留。
- `rows`：预算行数组。
- 行字段 `kind` 为 `total`（合计）、`group`（分组）、`activity`（活动）或 `detail`（明细），决定合并单元格布局。
- `code`、`name`、`detail`、`type`：预算编号、科目、明细、费用类型。明细中的换行使用 JSON 的 `\n`。
- `quarters`：按第一至第四期排列的四个金额，使用十进制字符串，例如 `["100.00", "200.00", "0.00", "100.00"]`。
- `total`：预算合计金额字符串，直接展示接口值，不在前端推算。
- `adjustment`、`adjustmentRatio`、`adjustmentDetail`、`adjustedBudget`、`executed`、`executionRatio`：调整与执行数据，`null` 显示 `/`，零值正常显示。

原示例合计与分期金额存在不一致，本次原样保留，后端接入时应提供已校验的金额。其余四个预算页签保持原有空状态，没有虚构数据结构或计算规则。

本次数据化范围为现有表格。基本信息、产出活动卡片、富文本和附件不属于此次表格行改造。区域第一行的审核演示交互维持现状，实际逐行审核意见接口需要以行 `id` 关联；查看模式不显示审核背景、提示或编辑弹窗。
