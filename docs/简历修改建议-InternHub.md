# 根据 InternHub 项目修改简历 — 建议稿

以下内容可直接替换或补充到简历中 **InternHub** 项目与 **技能** 部分。项目描述已与当前仓库实现对齐（含推荐服务、前端、脚本与测试）。

---

## 一、项目经历：InternHub（建议替换现有 bullets）

**InternHub** | Go 微服务 · 实习/校招投递管理平台 | 2026.1 - 2026.3

- 基于 **Go + Gin** 参与/实现 **API Gateway** 及 **auth / user / job / apply / recommend** 六个微服务；网关统一 JWT 校验与路由，下游通过 `X-User-Id` 做身份传递
- 设计并实现 **recommend-service**：无独立 DB，经 HTTP 调用 job/apply/user 服务拉取数据，过滤已投递职位；可选对接 **OpenAI API** 做排序与推荐理由，未配置时降级为按时间倒序
- 使用 **GORM + PostgreSQL** 做各业务数据持久化；**Zap** 统一日志、**Prometheus** 暴露网关 /metrics
- 分层架构：**handler → service → repository**，推荐服务内封装 ai/client 包，便于单测与 mock
- 使用 **React 18 + TypeScript + Vite** 搭建前端：职位列表、我的投递、岗位推荐、个人资料、登录/注册；Vite proxy 代理 `/api` 至网关，统一鉴权与接口封装
- 编写 **recommend-service** 单测（ai 解析、handler mock、service 上游 httptest）；**scripts/start-all.sh** 一键启动六服务，**scripts/test-example.sh** 做完整注册→登录→职位→推荐→投递→再推荐的联调验证

---

## 二、若简历篇幅有限（精简版）

**InternHub** | Go 微服务 · 实习/校招投递管理 | 2026.1 - 2026.3

- Go + Gin 实现 API 网关与 auth/user/job/apply/recommend 六微服务；JWT 鉴权、GORM + PostgreSQL、Zap/Prometheus
- 推荐服务：HTTP 聚合 job/apply 数据，排除已投递；可选接入 OpenAI 做排序与推荐理由，降级为按时间排序
- React + TypeScript + Vite 前端（职位/投递/推荐/资料/登录注册）；推荐服务单测 + 一键启动与联调脚本

---

## 三、技能栏建议补充（与项目一致）

若希望与项目技术栈完全一致，可在技能中体现：

- **后端**：Go, Gin, GORM, RESTful API, JWT, **PostgreSQL**（项目实际使用 PostgreSQL，若当前写的是 MySQL 可改为“MySQL / PostgreSQL”或仅写 PostgreSQL）
- **前端**：React, TypeScript, Vite（若投前端/全栈岗可单独列）
- **运维/工具**：Git, Docker, Prometheus, Zap；可加“服务间 HTTP 调用、API 网关”

---

## 四、注意事项

1. **数据库**：README 与开发文档中均为 **PostgreSQL**，若简历写的是 MySQL，建议改为 PostgreSQL 或“关系型数据库（PostgreSQL）”以免面试时不一致。
2. **时间**：项目时间 2026.1 - 2026.3 已按你当前简历保留，可按实际调整。
3. **角色**：若你实际负责的是“推荐服务 + 前端 + 脚本与测试”，可在第一条或最后一条点明“负责推荐服务设计与实现、前端搭建与联调、单测与一键脚本”。

按以上任选**完整版**或**精简版**替换简历中的 InternHub 描述即可；技能栏按岗位侧重选用第三节建议。
