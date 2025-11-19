# 项目审查与改进计划

本文档概述了对 `simple-vue-time-schedule` 的代码审查发现，并提供了将其发布到 `npmjs.com` 的改进路线图。

## 1. 关键配置问题 (必须修复)

这些问题会阻止其他用户安装后正常使用该包。

### 1.1. `package.json` 与 `vite.config.ts` 不匹配
`package.json` 指向的文件与 `vite` 当前生成的文件不一致。

- **当前 `package.json`**:
  ```json
  "main": "dist/index.cjs.js",
  "module": "dist/index.es.js",
  "exports": {
    ".": {
      "import": "./dist/simple-vue-time-schedule.es.js",
      "require": "./dist/simple-vue-time-schedule.cjs.js"
    }
  }
  ```
- **当前 `vite.config.ts` 输出**:
  ```ts
  fileName: (format) => `simple-vue-time-schedule.${format}.js`
  // 生成: simple-vue-time-schedule.es.js, simple-vue-time-schedule.cjs.js
  ```

**修复**: 更新 `package.json` 的 `main` 和 `module` 字段以匹配实际文件名，或者修改 `vite.config.ts` 以匹配 `package.json`。

### 1.2. 依赖管理
- **`vue` 作为 Peer Dependency**: `vue` 目前在 `devDependencies` 中。它也应该在 `peerDependencies` 中，以确保使用宿主项目的 Vue 版本，避免重复打包 Vue。
- **未使用的文件**:
  - `src/dom.js`: 看起来是遗留/未使用的代码。
  - `src/package.json`: 看起来是 `vue-demi` 设置的残留。如果你只针对 Vue 3，应该删除它。

## 2. 代码质量与最佳实践

### 2.1. 国际化 (i18n)
组件目前硬编码了中文字符串。
- **文件**: `src/TimeSchedule.vue`
- **字符串**: "星期一", "00:00 - 12:00", "选择的时间有冲突"。
- **建议**: 将这些移至 props (例如 `textConfig` 或 `locale`)，以便用户可以翻译它们。

### 2.2. 样式与主题
样式是 scoped 的，但是硬编码的。
- **问题**: 用户如果不覆盖深层 CSS，就无法轻松更改蓝色 (`#338aff`) 或红色 (`#f70909`)。
- **建议**: 使用 CSS 变量。
  ```css
  .schedule {
    --schedule-primary-color: #338aff;
    --schedule-error-color: #f70909;
    --schedule-disabled-color: #ddd;
  }
  ```

### 2.3. TypeScript 与类型
- 项目在 `src/index.ts` 中使用了 `any` (`install(app: any)`)。最好使用 `vue` 中的 `App` 类型。
- `tsconfig.app.json` 包含了不存在的 `packages/**/*`。需要清理。

## 3. 代码审查: `TimeSchedule.vue`

### 3.1. 事件监听器
- **当前**:
  ```ts
  document.addEventListener('mouseup', scheduleEnd)
  ```
- **审查**: 这通常没问题，但要确保 `scheduleEnd` 检查拖拽是否始于 *此* 组件实例（看起来是通过 `start_point` 检查的）。
- **改进**: 如果决定添加依赖，可以考虑使用 `@vueuse/core` 的 `useEventListener`，或者保持原样但确保严格的空值检查。

### 3.2. Props
- `modelValue` 默认为 `() => []`。这没问题。
- `dateList` 默认为中文。
- **建议**: 如果希望 "00:00 - 12:00" 表头可定制，建议添加 `prop` 来控制文本或标签。

### 3.3. 性能
- `rafSetShadow` 正确使用了 `requestAnimationFrame` 来避免拖拽时的布局抖动。做得很好。
- `fastest-json-copy` 用于克隆。这对性能有好处。

## 4. 推荐行动计划

1.  **清理**: 删除 `src/dom.js` 和 `src/package.json`。
2.  **配置**: 修复 `package.json` 的导出和依赖。
3.  **重构**:
    - 将硬编码字符串提取到 props。
    - 将颜色转换为 CSS 变量。
4.  **文档**: 添加带有使用示例的 `README.md`（对 npm 至关重要）。
5.  **构建**: 运行 `npm run build` 以验证输出文件是否匹配 `package.json`。

我可以帮你执行这些步骤。你想从哪个开始？
