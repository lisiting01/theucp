# 国际化实现说明

## 概述
已为 The UCP 项目实现完整的中英文国际化支持，用户可以通过点击导航栏的语言切换按钮在中英文之间切换。

## 实现方案

### 1. 轻量级 i18n 系统
- **无第三方依赖**：基于 JSON 文件的简单翻译系统
- **类型安全**：完整的 TypeScript 类型支持
- **自动持久化**：使用 localStorage 记住用户的语言偏好

### 2. 文件结构
```
apps/web/src/
├── lib/i18n/
│   ├── index.ts                 # i18n 核心逻辑
│   └── locales/
│       ├── en.json              # 英文翻译
│       └── zh.json              # 中文翻译
├── contexts/
│   └── locale-context.tsx       # 语言上下文 Provider
└── components/
    └── home-content.tsx         # 首页客户端组件
```

### 3. 主要功能

#### 语言自动检测
- **默认语言**：英文（`en`）
- **自动检测**：首次访问时根据浏览器语言（`navigator.languages`）自动选择
- **检测逻辑**：
  1. 优先使用 localStorage 中保存的用户选择
  2. 如无保存，检测浏览器首选语言
  3. 若浏览器语言包含中文（`zh`），自动切换为中文
  4. 其他语言默认使用英文
- **持久化**：检测结果自动保存到 localStorage

#### 语言切换
- 位置：导航栏右上角，网络状态旁边
- 图标：Languages 图标
- 功能：点击切换中英文，自动保存到 localStorage

#### 字体支持
- 英文：Inter, Rajdhani, JetBrains Mono
- 中文：Noto Sans SC (已添加)

### 4. 使用方法

#### 在组件中使用翻译
```tsx
import { useLocale } from "@/contexts/locale-context";

export function MyComponent() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div>
      <h1>{t.nav.overview}</h1>
      <button onClick={() => setLocale(locale === "zh" ? "en" : "zh")}>
        切换语言
      </button>
    </div>
  );
}
```

#### 添加新的翻译文本
1. 在 `apps/web/src/lib/i18n/locales/zh.json` 添加中文
2. 在 `apps/web/src/lib/i18n/locales/en.json` 添加对应英文
3. 保持两个文件的结构一致

### 5. 已翻译的页面
- ✅ 首页 (Homepage)
- ✅ 导航栏 (Navigation)
- ✅ 页脚 (Footer)

### 6. 待翻译的页面
- ⏳ 讨论区 (Discussions)
- ⏳ 决议中心 (Governance)
- ⏳ 章程页面 (Constitution)
- ⏳ 详情页面 (Detail pages)

## 下一步计划

1. **完善其他页面翻译**
   - 讨论区列表和详情页
   - 决议中心列表和详情页
   - 章程编辑器

2. **优化翻译质量**
   - 审核当前翻译的准确性
   - 统一专业术语翻译

3. **添加更多语言**
   - 可轻松扩展支持更多语言
   - 只需添加新的 JSON 文件

## 技术要点

### Context 模式
使用 React Context API 管理全局语言状态，避免 prop drilling。

### 服务端组件 + 客户端组件
- 服务端组件获取数据
- 客户端组件处理 i18n 和交互

### 类型安全
```typescript
export type Locale = "en" | "zh";
type Translations = typeof zhTranslations;
```

所有翻译键都有完整的类型提示和检查。

## 测试

运行以下命令测试：
```bash
pnpm dev
```

访问 http://localhost:3000，点击导航栏的语言切换按钮测试功能。
