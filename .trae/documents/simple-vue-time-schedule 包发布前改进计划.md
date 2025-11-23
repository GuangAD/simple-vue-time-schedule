## 核心问题与改进目标

* 规范 npm 包导出与类型：增加 `types` 导出，校正 `package.json` 字段，确保 ESM/CJS/UMD 三端兼容。

* 禁止与禁用时段重叠的最终输出：在交互结束时清理重叠并保证 `update:modelValue` 不包含禁用区域。

* 交互逻辑增强：让网格选择支持响应式行列数变化，避免 `labels` 修改后交互维度不一致。

* 测试覆盖完善：补齐拖拽交互与边缘情况（整天、跨天、重叠切换）的用例，提升可靠性。

* 可访问性与可用性：增加键盘操作与 ARIA 属性，改善无鼠标场景与读屏体验。

## 代码修复与重构

* `src/TimeSchedule.vue`

  * 在 `handleSelectEnd` 结束时，根据 `canOverlapDisabled` 清理重叠位并再计算 `toStringArray()`，确保输出不含禁用片段（参考 212-216 行）。

  * 将 `useGridSelection` 的 `rows/cols` 改为接收 `Ref<number>`（或 `MaybeRef<number>`），避免 `labels` 改变后交互仍按旧维度（参考 218-224 行）。

  * 将 `min-width: 700px` 改为可配置（CSS 变量或 `prop`），提升响应式能力（302-308 行）。

* `src/composables/useGridSelection.ts`

  * 允许 `rows/cols` 为 `Ref`；在 `getBoundingClientRect()` 计算时读取最新值。

  * 增加键盘交互 API（如 `handleKeyDown`），支持方向键扩展选择、空格切换。

* `src/composables/useTimeBitmask.ts`

  * 提供“清理禁用位”的工具方法（如 `maskOutDisabled(day)`），复用于 `handleSelectEnd` 与 `watch(canOverlapDisabled)`。

* `src/utils.ts`

  * 去除 `console.error`（第 13-16 行）或改为受控 `debug` 模式；增加健壮输入校验的单元测试。

## 包装与发布

* `package.json`

  * 增加 `types: "dist/index.d.ts"` 并通过 `vite-plugin-dts` 生成声明文件；为 `exports` 增加类型子路径导出（`types` 字段或 `"types": "./dist/index.d.ts"`）。

  * 保留 `exports` 为主导，考虑移除冗余 `main/module` 或与之保持一致；确认样式子路径 `./style` 正确。

  * 校验 `peerDependencies.vue` 版本范围，避免过窄导致安装冲突。

* 构建

  * 维持库模式输出 `es/cjs/umd` 与独立 CSS；确认 `external: ['vue']` 与 UMD `globals` 无误。

## 测试增强

* 组件交互

  * 使用 `@vue/test-utils` 与 `jsdom` 模拟拖拽：合成 `mousedown/mousemove/mouseup` 到 `.schedule-grid`，覆盖添加与取消选择、跨行跨列选择。

  * 增加“结束时清理禁用”的断言：当 `canOverlapDisabled=false` 时，最终 `update:modelValue` 不包含禁用区。

* 工具方法

  * `utils` 与 `useTimeBitmask` 增加边界测试：整天（`00:00~24:00`）、空数据、乱序与重叠输入归并。

* 快照与视觉

  * 选择态与错误态 class 快照，避免 CSS 回归（选中、禁用、错误三态）。

## 可访问性与可用性

* 为网格添加 `role="grid"`、单元格 `role="gridcell"` 与 `aria-selected`；checkbox 对应 `aria-checked`。

* 提供键盘导航与选择：方向键移动、Shift 扩选、空格切换；为只读模式禁用交互焦点。

* 文案与国际化：将默认中文文案抽为 `textConfig` 并提供英文默认；错误消息可选对象携带码值。

## 文档与示例

* 在 `README` 补充：安装、用法（双端）、类型与事件、主题配置、CSS 引入、互斥规则示例。

* playground 增加键盘演示与禁用清理切换示例，方便验证。

## 交付与验证

* 完成改动后跑 `pnpm build && pnpm test`，本地验证 ESM/CJS/UMD 产物与类型文件存在。

* 使用示例项目实际引入包，验证 `v-model`、禁用覆盖与拖拽交互在真实 DOM 下正常。

