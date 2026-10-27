# 项目预算共用 JSON

## 数据入口

示例：`src/mock/project-budget.example.json`（项目 ID 3，仅为接口字段示例，不自动导入或覆盖用户数据）。项目业务 JSON 的 `budget` 是两张预算表的同一份原始数据；`reviewComments` 位于项目顶层。

- 纯数据适配/计算：`src/utils/project-budget-data.js` 的 `normalizeBudget(payload.budget, payload)`、`buildBudgetRows(payload, budget, editable)`。
- 本地接口仓库：`src/utils/project-budget.js` 的 `readBudgetProject(key)`、`readSavedBudget(key)`、`saveProjectBudget(key, project)`、`saveBudgetSheet(...)`、`savePersonnelSheet(...)`。
- 项目编辑保存完整项目 JSON；两张预算表保存时更新相同项目文档的 `budget`。查看与审核通过同一仓库读取，预算表行及合计使用同一计算方法。
- `BudgetPrototype` 在项目详情页通过 `shared-data` 启用共用数据模式；报告和筹款规划等其他使用方保留原有展示协议。
- `ProjectDetail` 的 `tableData` 可传入包含 `budget` 的项目 JSON；显式传入的数据优先于本地仓库。历史快照不读取当前预算，避免历史内容被覆盖。详情其他模块继续使用现有 `basic`、`outputs` 等接口约定。

本地演示的唯一权威预算存储为 `see-project-budget-document-v1:<key>`，内容是 `{ schemaVersion: 1, key, project }`。旧项目草稿中保留的预算是兼容缓存，打开项目编辑时由权威预算覆盖；旧 `see-budget-sheet:<key>` 仅在没有新文档时读取，不再写入。接后端时替换仓库读写为项目接口，不需要另存展示表格。

`key` = `项目ID:项目类型:fresh或existing:filled或default`。普通项目的路由类型 `default` 与 `project` 统一为 `project`；其余类型保持业务代码。`fresh=1` 和 `example=filled` 必须在编辑、查看、审核入口保持一致，不跨场景查找或按名称匹配。文档读取校验 ID 和 key。多页面保存通过 `budget.revision` 拒绝旧版本覆盖；后端应使用事务及乐观锁实现相同约束，本地存储不提供服务端事务保障。

## budget 字段

| 字段 | 约定 |
| --- | --- |
| schemaVersion | 当前为 1；未知版本报错，不静默当空表 |
| revision | 非负整数；本地保存递增；接口采用后端返回的新版本 |
| editStatus | 明细表：`pending`、`editing`、`completed` |
| personnelStatus | 人力表独立状态，同上；人力表保存后为 `completed` |
| updatedAt / personnelUpdatedAt | 保存时间；新增未保存为空字符串 |
| rows | 只保存费用明细，不保存总计行、分组行、添加按钮 |
| personnel | 人员预算记录；稳定 `id`，通过 `memberId` 关联团队 |
| groups | 旧展示 JSON 的产出/活动结构兼容信息；新数据以项目 `outputs` 为准 |
| legacyPersonnel | 旧数据只有人力汇总、没有人员记录时的兼容金额；不得虚构人员。首次保存完整人员预算后清除此兼容金额 |
| metadata | 旧示例表头信息以及执行截止日；项目名称、机构、周期、合作方优先来自项目顶层 |

金额单位为元，JSON 数字，不含千分位、货币符号；录入金额最多 2 位小数。未填写用 `null`，不能用 0 替代；0 是用户明确录入的有效零金额（费用单价、数量仍须大于 0）。展示时才格式化金额和百分比。金额、数量不合法或 ID 重复会报错，不覆盖原数据。

## 明细与关联

`rows[]`：`id`、`kind`（`support` / `activity`）、`name`、`type`、`price`、`quantity`、`unit`（非必填）、`description`（必填）、`quarters`（固定四项）。活动费用必须具有稳定 `outputId`、`activityId`；支撑费用两者为 `null`。丢失关联的明细继续展示为待处理，不删除。旧数据缺少单价/数量时保留原说明和分期，不从文字臆造数字，完成编辑前需要补全。

`personnel[]`：`id`、`memberId`、`name`、`position`、`responsibilities`、`nature`（项目人员 / 行政管理人员）、`monthly`、`months`、`ratio`、`quarters`、`remark`（专职 / 兼职）。姓名、职务、工作内容以 `memberId` 对应的项目 `team` / `organizationMembers` 为准；未找到成员时保留原记录，不按姓名重配。首次初始化使用团队 ID，已保存记录保持原有 ID。

费用与人员均可接收 `adjustment`、`adjustedBudget`、`executed`（数字或 null），供查看与审核展示；当前录入弹窗不新增这些操作。百分比、分组和合计不作为另一份可写数据保存。

## 计算和校验

- 费用明细合计 = 单价 × 数量，须与四期预算和一致。
- 人力成本总额 = 月人力成本 × 承担月份数；不乘人力占比。弹窗完成时须与四期分期和一致。
- 承担月份数为非负整数，不超过执行周期包含的自然月份数：2026-01-20 至 2026-02-05 为 2。
- 预算总额 = 所有费用分期 + 所有人员分期；分组合计不重复累加。旧人力汇总仅在无人员记录时计入一次。
- 人力表保存只检查录入完整性，漏填用 Modal 提示“人力成本未填写无法保存。”；数值规则在人员弹窗完成及明细表完成时检查。
- 修改并保存人力表时保留未保存的其他费用草稿；其版本号和已保存人员数据同步更新。已完成明细表的人力费用改变后，明细表回到编辑中；仅保存人力表不会把待编辑明细表伪装为完成。

审核意见沿用项目顶层对象，建议键 `budget.rows.<稳定费用ID>` / `budget.rows.<ID>.<字段>`、`budget.personnel.<稳定记录ID>` / `budget.personnel.<ID>.<字段>`。意见不放入预算单元格或下标状态；原有和未知合法意见键完整保留。本次统一数据与展示，不新增预算审核意见操作入口。

## 验证与人工验收

技术验证覆盖正常化幂等、旧示例适配、数字/空值、稳定 ID、项目与场景隔离、旧版本拒写、保存回读、意见保留、编辑/查看共用汇总，以及未保存明细跨人力页恢复。

人工检查两张表的空表/已填状态、保存/暂存/完成、刷新和返回、不同类型及新建/示例场景、人员预算与明细合计、项目查看及审核的人力表和预算数据。没有提供真实接口、服务端权限和数据库，不能据此宣称后端联调或线上审核流程通过。
