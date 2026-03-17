# InternHub 开发过程记录

本文档按模块与时间顺序记录 InternHub 项目的开发过程，便于复盘与交接。

---

## 一、项目定位与整体架构

- **目标**：实习/校招信息聚合与投递管理平台，采用微服务架构。
- **技术选型**：后端 Go + Gin + GORM + PostgreSQL；前端 React + TypeScript + Vite；服务间通过 HTTP 调用，由 API 网关统一入口。
- **工作区**：使用 `go.work` 管理多模块（api-gateway、auth、user、job、apply、recommend、pkg），根目录一次 `go work sync` 同步依赖。

---

## 二、已有基础（项目初始状态）

- **api-gateway**：注册/登录转发至 auth-service，JWT 校验、`X-User-Id` 注入，jobs/applications 代理至对应服务，/health、/metrics。
- **auth-service**：用户注册、登录、JWT 签发，用户表存于 PostgreSQL（8081）。
- **user-service**：用户扩展资料 GET/PATCH /users/me，依赖网关传入的 `X-User-Id`，数据在 PostgreSQL（8082）。
- **job-service**：职位 CRUD（GET/POST /jobs、GET /jobs/:id），PostgreSQL（8083）。
- **apply-service**：投递 POST /applications、GET /applications/me，防重复投递，PostgreSQL（8084）。
- **pkg/logger**：zap 日志，供各服务使用。

---

## 三、recommend-service 开发

### 3.1 需求与设计

- 提供**岗位推荐**接口：根据当前用户已投递情况，返回未投递职位列表，并可结合 AI（如 ChatGPT API）做排序与推荐理由。
- 设计要点：
  - 推荐服务**无独立数据库**，通过 HTTP 调用 job-service、apply-service、user-service 获取数据。
  - 已投递职位从推荐结果中排除；未配置 OpenAI API Key 时仅按时间倒序返回未投递列表。
  - 配置 `OPENAI_API_KEY` 后，将候选职位与用户上下文（昵称、已投递 ID）发给 OpenAI，解析返回的 `job_ids`、`reasons`、`summary`，组装为带理由的推荐列表。

### 3.2 实现要点

- **config**：读取 `JOB_SERVICE_URL`、`APPLY_SERVICE_URL`、`USER_SERVICE_URL`、`OPENAI_API_KEY`、`OPENAI_BASE_URL`（兼容国内代理）。
- **internal/client**：封装对 job、apply、user 三个上游的 HTTP 调用，解析 JSON 为本地结构体。
- **internal/ai**：调用 OpenAI 兼容接口 `/chat/completions`，构造 system/user 消息，解析模型返回的 JSON（含去除 markdown 代码块、末尾多余反引号等）。
- **internal/service**：编排拉取职位、拉取用户投递、过滤已投递、拉取用户资料（可选）、调用 AI 或降级为按时间排序；返回结构含 `list`、`summary`、`ai_used`。
- **internal/handler**：GET /api/v1/recommendations，从 Header `X-User-Id` 取用户 ID，调用 service，返回 JSON；通过注入 `Recommender` 接口便于单测。
- **网关**：新增对 recommend-service 的代理，推荐接口超时设为 60 秒（因需调用 OpenAI）。

### 3.3 测试与问题修复

- 为 recommend-service 编写单元测试：ai 包（空 Key、模拟 HTTP 返回、异常响应）、handler（mock Recommender）、service（buildFallback/buildResultFromAI、httptest 模拟上游）。
- 问题与修复：
  - 网关转发推荐请求 5 秒超时导致“recommend service unavailable”：网关侧推荐代理超时改为 60 秒。
  - OpenAI 返回 content 末尾多反引号导致 JSON 解析失败：解析前 `TrimRight(content, "`")`。
  - 测试脚本重复使用同一账号导致“投递前后无差异”：改为每次运行使用新邮箱（时间戳），便于观察推荐条数变化。

---

## 四、脚本与自动化

- **scripts/start-all.sh**：在项目根目录一键启动六个后端服务（api-gateway、auth、user、job、apply、recommend），支持从 `.env` 读取环境变量（如 OPENAI_API_KEY），Ctrl+C 时统一结束子进程。
- **scripts/test-example.sh**：完整功能测试示例：健康检查 → 注册（新邮箱）→ 登录 → 创建职位 → 职位列表 → 推荐（未投递）→ 投递 1、2 → 我的投递 → 推荐（已排除 1、2）→ 更新昵称 → 当前用户资料；支持 jq 格式化与无 jq 的 sed 取 token。

---

## 五、前端 web 开发

### 5.1 技术选型与工程化

- **Vite + React 18 + TypeScript**，`react-router-dom` 做路由。
- 通过 Vite 的 `server.proxy` 将 `/api`、`/health` 代理到 `http://localhost:8080`，避免开发阶段 CORS 问题。
- 前端不直连各微服务端口，统一走网关，与生产部署方式一致。

### 5.2 功能模块

- **api.ts**：封装请求基路径、从 localStorage 读写 token、带 Authorization 的 fetch；对外提供 register、login、getMe、patchMe、getJobs、getJob、createApplication、getMyApplications、getRecommendations。
- **类型**：Job、Application、RecommendedItem、RecommendResult、UserProfile、MeResponse 等与后端响应一致。
- **页面**：
  - 职位列表（/jobs）：展示职位，登录用户可点击「投递」；未登录点击投递跳转登录。
  - 我的投递（/applications）：需登录，展示投递记录及状态（待处理/已查看/已通过/已拒绝）。
  - 岗位推荐（/recommendations）：需登录，展示推荐列表，若有 AI 理由则展示 reason 与 summary。
  - 个人资料（/profile）：需登录，修改昵称并保存。
  - 登录（/login）、注册（/register）：表单提交后写 token、跳转或提示错误。
- **布局**：顶部导航（InternHub Logo、职位/我的投递/推荐/资料、登录或退出），主内容区 `container` 最大宽度 880px。

### 5.3 样式与体验

- 全局 CSS 变量：深色背景、卡片背景、边框、主色（紫系）、成功/危险色、圆角、阴影、DM Sans / Fraunces 字体。
- 卡片 hover 边框与背景变化；按钮 hover/active 反馈；输入框 focus 描边与光晕；推荐理由使用左侧竖条+浅色背景区分。
- 投递状态使用 badge 展示；空列表与加载中统一样式。

---

## 六、文档与配置

- **README.md**：项目概述、认证与用户架构、代码完整度表、技术栈、项目结构、环境要求、快速开始（依赖、PostgreSQL、启动服务、启动前端、验证、一键测试）、配置说明（各服务环境变量）；不包含逐步环境安装与 GitHub 提交步骤，保持简洁。
- **.gitignore**：`.env`、`login.json`、`token.txt`、`web/node_modules`、`web/dist` 等，避免敏感信息与构建产物入库。

---

## 七、开发顺序小结

1. 在已有 api-gateway、auth、user、job、apply 基础上，新增 recommend-service（config、client、ai、service、handler、cmd）。
2. 网关增加推荐接口代理与 60 秒超时；README 补充 recommend-service 说明。
3. 为 recommend-service 编写测试（ai、handler、service）。
4. 添加 scripts/start-all.sh、test-example.sh，README 补充脚本说明。
5. 搭建 web 前端（Vite+React+TS），实现 API 封装、路由、各页面与布局。
6. 前端样式美化（CSS 变量、卡片、导航、表单、badge、推荐理由区块）。
7. 文档整理：本文档（开发过程）与面试问答册（见 INTERVIEW_QA.md）。

---

*文档版本：与当前代码状态一致，随项目演进可继续追加章节。*
