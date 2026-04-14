# 📚 Unread 项目开发备忘录 (Project Memo)

**最后更新时间**：2026-04-12
**当前状态**：后端已从 Firebase 成功迁移至 Supabase。

---

## 🛠 已完成工作 (Finished)
1.  **后端迁移**：
    -   数据库：Firestore -> PostgreSQL (`books` 表已建)。
    -   认证：Firebase Auth -> Supabase Auth (已开匿名登录)。
2.  **代码重构**：
    -   `useStore.ts` 现已支持 Supabase 实时同步。
    -   `App.tsx` 和 `Home.tsx` 已切换至 Supabase 认证流。
3.  **部署验证**：
    -   Vercel 环境变量已配置。
    -   本地 Build 测试已通过。
    -   Git 已推送至 GitHub，数据已能成功同步到 Supabase 指标。

---

## 🔑 核心环境配置 (Environment)
-   **Supabase URL**: `https://lwguzoyiixaivambyqqy.supabase.co`
-   **Supabase Anon Key**: `sb_publishable_ZpJYRZNFlKRHusCDqf9Q_A_Xp99SmZb`
-   **存储位置**: `.env` 文件。

---

## 🚀 待办事项 (Next Steps)
-   [ ] **解决国内访问限制**：目前的 `vercel.app` 域名和 `google books` API 在国内无法直接访问。
-   [ ] **方案 A (API)**：编写 Supabase Edge Function 代理搜索请求，绕过 Google 封锁。
-   [ ] **方案 B (域名)**：协助用户将网页部署到 Cloudflare Pages 或绑定自定义域名。

---

## 💡 如何使用此文件恢复记忆
如果在新的对话中我表现得“失忆”了，请直接把这个文件的内容发给我，或让我读取它。我将瞬间恢复所有开发上下文。
