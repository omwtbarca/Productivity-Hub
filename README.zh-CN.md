# 🌿 Productivity Hub · 中文说明

> **🌐 Language:** [English](README.md) · **中文(本页)**

> Ezra 的个人生产力工作台 · 北欧自然风 · 100% 本地隐私

一个为博士生(尤其是实验室科研工作流)设计的单页生产力工具,集成了 Pomodoro 番茄钟、任务管理、习惯打卡、闪卡 SRS、白噪音、笔记、论文阅读队列等模块。

**纯静态,无后端,无追踪,无登录。** 全部数据存在你自己浏览器的 localStorage 里。

---

## 📋 目录

- [快速上手](#-快速上手)
- [部署到 GitHub Pages](#-部署到-github-pages)
- [文件结构](#-文件结构)
- [功能模块详解](#-功能模块详解)
- [数据 & 隐私](#-数据--隐私)
- [快捷操作](#-快捷操作)
- [响应式 & 浏览器支持](#-响应式--浏览器支持)
- [自定义指南](#-自定义指南)
- [常见问题](#-常见问题)
- [技术栈](#-技术栈)

---

## 🚀 快速上手

1. **打开页面** — 进入 `https://<你的用户名>.github.io/Productivity-Hub/`
2. **第一次打开**:所有模块预填了示例数据(实验室任务、习惯、闪卡等),可以直接体验
3. **开始用** — 勾任务、点习惯格子、按 Start 启动番茄钟,所有改动自动存到本地
4. **建议第一步** — 点右上角圆柱图标(💾)→ Export backup,把基线数据存一份,以后好恢复

---

## 🌐 部署到 GitHub Pages

### 首次部署

把以下所有文件 push 到你的 GitHub 仓库根目录:

```
index.html
styles.css
favicon.svg
icons.jsx
shell.jsx
cards.jsx
cards-learn.jsx
app.jsx
sounds.js
storage.js
README.md
```

然后:

1. 进入仓库 → **Settings** → **Pages**
2. **Source** 选 `Deploy from a branch`
3. **Branch** 选 `main`(或 `master`),Folder 选 `/ (root)`
4. 点 **Save**,等 1–2 分钟,会生成 `https://<用户名>.github.io/<仓库名>/` 网址

### 更新

每次改完文件,`git push` 一下,GitHub Pages 会在几分钟内自动重建。

> **注意:** 文件名要严格匹配大小写。`index.html` 必须全小写,否则 GitHub Pages 找不到入口。

---

## 📁 文件结构

```
.
├── index.html              # 入口文件 + 字体/脚本加载
├── styles.css              # 全部样式(含响应式断点 + 暗色模式)
├── favicon.svg             # 网站图标
│
├── icons.jsx               # Lucide 风格 SVG 图标库
├── shell.jsx               # Sidebar + Topbar(导航 + 天气 + 语言切换)
├── cards.jsx               # Pomodoro / Countdown / Tasks / Habits / Stats / Notes
├── cards-learn.jsx         # Flashcards / Sounds / Papers
├── app.jsx                 # React 根组件 + 状态管理 + Data 菜单
│
├── sounds.js               # Web Audio 程序生成白噪音(无音频文件依赖)
├── storage.js              # localStorage 封装 + 时间助手 + useStorage hook
│
└── README.md               # 这个文件
```

**单一职责原则:**
- `cards.jsx` — 时间 / 任务 / 习惯 / 统计 / 笔记(核心生产力)
- `cards-learn.jsx` — 学习相关(闪卡 / 音乐 / 论文)
- `storage.js` — 所有数据持久化逻辑
- `sounds.js` — 所有音频合成

---

## 🧩 功能模块详解

### 🍅 Pomodoro · Deep Work

经典番茄钟,工作 25 分钟 / 短休 5 分钟 / 每 4 轮后长休 15 分钟。

**操作:**
- **Start / Pause** — 启停计时
- **Skip** — 跳过当前阶段(直接进入下一阶段)
- **+5 min** — 当前计时延长 5 分钟
- **Reset ↺** — 完全重置当天会话

**特性:**
- 进度环实时旋转
- 工作完成自动切换到休息模式
- 第 4 轮完成自动变为长休息
- 每完成一个工作番茄,**今日计数自动 +1**(Stats 卡的柱状图会立即反映)
- 4 段进度条显示本轮 session 进度

---

### ⏰ Upcoming · Countdown

实时倒计时到下一个事件(论文截稿、qualifying exam、组会等)。

**显示逻辑:**
- 自动按时间排序,选择最近的事件作为主倒计时
- 显示 Days / Hours / Min / Sec,**每秒刷新**
- 下方列出后续 3 个事件,显示 "in N d / today / tomorrow"
- 过期超过 7 天的事件会自动隐藏

**自定义事件:** 见 [自定义指南 → 事件](#自定义事件)

---

### ✅ Tasks

按项目组分类的任务列表(默认:Lab work / Writing / Personal · Spanish)。

**功能:**
- **点击复选框 / 任务文字** — 切换完成状态
- **过滤标签** — All / Today / Upcoming / Overdue
- **优先级标签** — P1 (高,橙红) / P2 (中,沙色) / P3 (低,绿)
- **截止日期** — 显示 "Today / Tomorrow / in N d / Overdue Nd",**实时计算**
- 拖拽手柄(预留 UI,目前未启用排序)

**任务状态会持久化** — 刷新页面不丢。

---

### 🌱 Habits · last 7 days

7 天滚动热力图,每个习惯可以打卡。

**操作:**
- **点击格子** — 在三个状态间循环:
  - 空 (未做)
  - 半完成 (浅绿)
  - 完成 (深绿)
- 最右一格永远是**今天**,有黑色描边高亮
- 标签字母会**根据真实日期动态变化**(比如今天是星期一,字母就是 `T W T F S S M`)

**连击计数(🔥):**
- 从今天往回数,连续打卡的天数(2 = 完成或 1 = 半完成都算)
- 中断一天就归零
- 显示在习惯名右侧

---

### 📊 Focus · last 7 days

Pomodoro 历史柱状图。

**显示:**
- **真实数据!** — 读取你过去 7 天每天完成的番茄数
- 今天(最右柱)初始为 0,跑一个番茄就涨 1
- 目标 4 番茄/天(柱子高度按 max(8, 实际峰值) 缩放)
- 三个统计单元:
  - **This week** — 本周总番茄数
  - **Total focus time** — 折算成小时:分钟
  - **Days hit target** — 达标天数百分比

切到 **All time** 标签可以看历史总数。

---

### 📚 Flashcards · SRS

间隔重复闪卡系统,内置 3 个卡组:

| 卡组 | 内容 | 卡片数 |
|---|---|---|
| 🇪🇸 Spanish · A2 vocab | 西语 A2 词汇 (aprovechar, alcanzar...) | 6 |
| 🇪🇸 Subjuntivo phrases | 西语虚拟式短语 (Ojalá que..., Aunque sea...) | 3 |
| 🔋 Battery terminology | 锂电池术语 (Coulombic efficiency, SEI, Dendrite) | 3 |

**操作流程:**
1. 看到正面 → 思考答案
2. **点卡片** 或按 **Reveal →** 翻到背面
3. 评估自己的掌握度,点对应按钮:
   - **Again** (<1m) — 立即重做
   - **Hard** (6m) — 6 分钟后再练
   - **Good** (1d) — 1 天后
   - **Easy** (4d) — 4 天后
4. 自动跳到下一张

**底部卡组列表** — 点击切换不同卡组,当前卡组高亮。

**Reset today** — 把今天的复习计数清零,适合"重练一次"。

---

### 🌊 Ambient · focus mix

**完全程序生成的白噪音**(不依赖任何音频文件,GitHub Pages 上 100% 可用)。

6 种音景:

| 音景 | 实现原理 |
|---|---|
| Ocean waves | 棕噪音 + 低通滤波 + LFO 调制 (5.5s 周期的"潮汐") |
| Rain · leaves | 粉噪音 + 高通滤波 + 短促水滴正弦音 |
| Café · soft | 粉噪音 + 带通滤波 (人声频段) + 偶发杯盘碰撞声 |
| Fireplace | 棕噪音 + 低通 + 高频爆裂噪音 (噼啪) |
| Forest dawn | 粉噪音 + 低通 + 偶发鸟鸣短音 |
| Brown noise | 纯棕噪音 (1/f² 谱),最白的"白噪音" |

**操作:**
- **点击音景磁贴** — 切换播放/停止
- **音量滑块** — 0-100%
- **Play / Pause** — 暂停当前音景

> ⚠️ **浏览器策略:** 第一次播放需要用户交互(点一下页面),Chrome / Safari 默认禁止自动播放。

---

### 📝 Recent notes

笔记卡片网格(Markdown 风格,4 个示例笔记)。

- 标题 + 摘要 (3 行截断) + 标签 + 更新时间
- 悬停有上浮 + 阴影动画
- 时间是"X 天前 / X 周前"**实时计算**

> 目前是只读展示。编辑功能可以后续加(写在 next steps 里)。

---

### 🌿 Paper queue

待读论文队列(默认 4 篇关于锂金属负极的文献)。

**操作:**
- **点击论文** — 阅读进度 +10%(0% → 10% → 20% → ... → 100%)
- 显示期刊 + 添加时间 ("2 d ago" 等动态显示)
- 进度条只在 > 0 时显示
- 进度持久化

---

### ☀️ 天气小组件(顶栏)

**Open-Meteo API** 实时拉取**西安市长安区**(34.16°N, 108.93°E)天气:
- 当前温度
- 天气状况(Clear / Overcast / Light rain / Snow...)
- 自动支持中英文 + 西班牙语翻译

**完全免费 + 无 API key + 隐私友好**(Open-Meteo 不需要注册不需要 token,只发一个匿名 GET 请求)。

如果离线 / API 故障,会显示 "Weather unavailable",不影响其他功能。

---

## 🔐 数据 & 隐私

### 数据存哪里?

**只在你这个浏览器的 localStorage 里。**

打开浏览器开发者工具(F12)→ Application → Local Storage → 你的域名,可以看到所有以 `phub.` 开头的键:

| Key | 内容 |
|---|---|
| `phub.settings` | 语言、暗色模式偏好 |
| `phub.tasks` | 任务组 + 所有任务 |
| `phub.habits` | 习惯定义 + 按日期 key 的打卡 |
| `phub.pomodoro` | `daily: { "2026-05-19": 4, ... }` |
| `phub.flashcards` | 每日 SRS 复习次数 |
| `phub.papers` | 论文 + 阅读进度 + 添加时间 |
| `phub.events` | 倒计时事件 |
| `phub.notes` | 笔记 |

### 谁能看到?

- ✅ 你自己(在这个浏览器、这台设备上)
- ❌ GitHub 后台
- ❌ 我(Claude)
- ❌ Open-Meteo (它只知道有人请求了西安天气,匿名 IP)
- ❌ 其他人 / 任何第三方服务

### 数据何时会丢?

- 清空浏览器缓存 / cookies
- 切换无痕模式
- 换浏览器(Chrome 的数据不会在 Safari 里)
- 换电脑
- 浏览器存储满了被自动清理(极少发生,limit ~5–10MB)

### 备份与恢复

**导出备份:**
1. 点右上角圆柱图标 💾 (或侧栏底部的同样图标)
2. **Export backup (.json)** → 自动下载 `productivity-hub-backup-2026-05-19.json`
3. 存到 OneDrive / Google Drive / 邮件给自己 / 移动硬盘

**导入备份:**
1. 同一菜单 → **Import backup**
2. 选择之前导出的 JSON 文件
3. 页面自动刷新,数据恢复

**完全清空:**
- **Reset all data** — 二次确认后清空所有 `phub.*` 键
- 用前**强烈建议先 Export**!

### 跨设备同步?

**不支持。** 因为这是纯静态托管,没有云端账号系统。如果要跨设备用:
- 手动 Export → Import(适合换电脑、不频繁同步)
- 或者用 Syncthing / iCloud / OneDrive 同步浏览器配置文件目录(高级用法)

如果需要真正的实时同步,需要接 Firebase / Supabase 等后端,但那就不是 100% 隐私了。

---

## ⌨️ 快捷操作

| 键 / 动作 | 效果 |
|---|---|
| `Esc` | 关闭抽屉 / 关闭 Data 菜单 |
| 点击外部背景 | 关闭抽屉 / 关闭 Data 菜单 |
| 点击侧栏导航项(手机) | 切换页面并自动关闭抽屉 |
| 点击卡片(论文) | 进度 +10% |
| 点击习惯格子 | 循环 状态 (0 → 1 → 2 → 0) |
| 点击任务文字 | 切换完成 |

后续可能添加的快捷键(暂未实现):空格启停 Pomodoro、`N` 新任务、`/` 聚焦搜索。

---

## 📱 响应式 & 浏览器支持

### 响应式断点

| 视口 | 布局 |
|---|---|
| **≥ 1025px** | 桌面:240px 侧栏 + 12 列卡片网格 |
| **721–1024px** | 平板:汉堡菜单 + 卡片 2 列布局 |
| **421–720px** | 手机:单列堆叠,Pomodoro 环居中 |
| **≤ 420px** | 窄手机:更紧凑,语言切换隐藏到 Data 菜单 |

### 浏览器要求

- **Chrome / Edge / Safari / Firefox** 现代版本(最近 2-3 年)
- 必需:`localStorage`、Web Audio API、CSS Grid、ES6+
- 不支持 IE11

---

## 🛠 自定义指南

### 改用户名 / 角色

`shell.jsx` 文件,找到 `sidebar-foot` 部分:

```jsx
<div className="avatar">EZ</div>            // 改头像两个字母
<div className="user-name">Ezra</div>       // 名字
<div className="user-role">PhD · Li-metal anode</div>  // 角色
```

### 改天气位置

`shell.jsx` 顶部常量:

```js
const XIAN_LAT = 34.16;
const XIAN_LON = 108.93;
```

改成你想要的城市坐标(Google "<城市名> latitude longitude" 可查)。

### 自定义事件

清空 localStorage 后重新加载会按 `cards.jsx` 里 `PHub.seeds.events` 重新种子。

或者直接打开 DevTools Console:

```js
PHub.Storage.set("events", [
  { id: "e1", title: { en: "My event", es: "Mi evento" }, dateTime: "2026-06-15T14:00:00", venue: "Lab A" }
]);
location.reload();
```

### 自定义任务种子

同上,改 `PHub.seeds.tasks()` 的返回值,或者直接在 Console:

```js
const t = PHub.Storage.get("tasks");
t.items.push({ id: "tNew", groupId: "lab", text: { en: "New task", es: "Nueva tarea" }, priority: "high", dueISO: PHub.Time.daysFromNow(2), done: false });
PHub.Storage.set("tasks", t);
location.reload();
```

### 添加闪卡卡组

`cards-learn.jsx` 里 `DECKS` 对象添加新键:

```js
DECKS.myDeck = {
  icon: "🇫🇷",
  name: { en: "French · A1", es: "Francés · A1" },
  accent: "var(--rust)",
  cards: [
    { word: "bonjour", phon: "/bɔ̃.ʒuʁ/", tag: { en: "greeting", es: "saludo" }, back: { en: "hello", es: "hola" }, example: { en: "Bonjour!", es: "Bonjour!" } },
    // ...
  ],
};
```

### 改主题色

`styles.css` 顶部 `:root` 块,替换:

```css
--sage: #7a9b86;        /* 主强调色 */
--sage-deep: #5e7d6a;
--sand: #c8a87a;        /* 次要强调色 */
--rust: #b06b50;
```

---

## ❓ 常见问题

**Q: 我刷新页面数据没了?**
A: 检查是否在无痕 / 隐私模式。无痕模式下 localStorage 会话结束就清空。改用普通窗口。

**Q: 天气加载不出来?**
A:
- 检查网络
- Open-Meteo 偶尔会短暂故障(几分钟内自愈)
- 国内访问目前正常,但极端网络情况下可能慢
- 不影响其他功能

**Q: 白噪音没声音?**
A:
- 浏览器默认禁止自动播放,需要先**点击页面**任意位置激活音频上下文
- 检查音量滑块是不是拉到 0
- 检查系统音量
- Safari 可能需要在地址栏左侧允许声音

**Q: 番茄钟跑着切换标签页会卡住吗?**
A: 不会。`setInterval` 在后台会被浏览器限速(到 1Hz),但计时精度保留。回到标签页时会准确显示当前剩余时间。

**Q: Pomodoro 完成的番茄数在哪里看?**
A:
- 卡片副标题:"Session N of 4 · X completed today"
- Stats 卡的今日柱子
- 跨标签页 / 重新打开都还在

**Q: 我想完全清除数据从头开始?**
A: Data 菜单 → **Reset all data** → 确认。一秒钟搞定。

**Q: 切换语言后任务/笔记看不到内容?**
A: 自带的种子数据都有 EN + ES 双语,理论上不会缺失。如果你手动加了任务但只填了英文,西语模式下会显示 `undefined`。手动补全即可。

**Q: 可以在手机上用吗?**
A: 完全可以。访问同样的 URL,响应式版会自动适配。汉堡菜单 → 侧栏导航。

**Q: 数据怎么备份到云端?**
A: 这是隐私优先设计,刻意没做云同步。手动 Export JSON → 存到你信任的云盘即可。

---

## 🧪 技术栈

- **HTML / CSS / 原生 JS** — 零构建步骤
- **React 18** (UMD CDN) — UI 组件
- **Babel Standalone** — 浏览器内 JSX 转译
- **Geist + Geist Mono** (Google Fonts) — 字体
- **Open-Meteo** — 天气 API (免费 / 免 key / 支持 CORS)
- **Web Audio API** — 程序生成白噪音
- **localStorage** — 数据持久化

> 设计原则:**零依赖、零后端、零追踪**。所有 CDN 都是 unpkg + jsdelivr,只为字体和 React 运行时。

---

## 📜 许可

个人使用,自由修改。

---

🌿 *Build something you'll actually use.*  — Ezra's research desk, 2026
