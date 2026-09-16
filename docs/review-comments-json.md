# 修改申请审核意见 JSON

在项目表单数据 `draft` 中传入 `reviewComments` 对象。值为纯文本字符串，非空时自动显示淡红背景，点击对应标题或表格单元格，在上方气泡查看意见，只有关闭按钮。缺失、null、非字符串和空白字符串均不标记。文本按文字渲染，不解析 HTML。

```json
{
  "reviewComments": {
    "targets": "请补充目标板块对应的成果指标。",
    "name": "请明确项目名称。",
    "overview": "请补充受益范围。",
    "areas.revision-area-1.province": "请核实实施省份。",
    "team.revision-team-1.responsibilities": "请补充职责分工。",
    "outputs.revision-output-1": "请明确产出验收标准。",
    "activities.revision-activity-1": "请补充活动安排。",
    "risks.revision-risk-1.response": "请完善应对措施。"
  }
}
```

支持的普通字段：name、targets、organization、thirdParties、rural、aid、beneficiaries、publicBenefit、total、requested、matching、leader、phone、overview、background、goal。

表格使用 `集合名.记录ID.字段名`，集合包括 areas、team、stakeholders、risks、monitoring；字段名与各集合记录的字段一致。产出使用 `outputs.产出ID`，活动使用 `activities.活动ID`。必须传真实稳定 ID，不使用行号；活动 ID 应在项目内唯一。

接口加载完整表单数据后赋值给 draft；只更新意见时使用 `this.$set(this.draft, 'reviewComments', response.reviewComments || {})`，保证 Vue 2 响应式更新。传空对象可清除全部标记。已有本地草稿兼容默认值，并随存为草稿保存。

当前未接入后端接口。审核页自身的编辑意见数据尚未映射到本协议，后端对接时需要按以上键名返回。新增字段需在模板上绑定 `reviewClass(key)` 和 `ReviewCommentLabel`。

人工验收：传入多字段意见，检查对应位置变红并能点击查看；替换为空对象检查恢复；确认调整表格顺序不会改变意见对应关系。
