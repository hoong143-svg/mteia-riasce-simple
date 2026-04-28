# RIASEC 職業興趣測驗系統 - MTEIA 版

## 1. 專案概述

**專案名稱**: MTEIA 升學輔導測驗系統  
**類型**: 全端 Web 應用程式 (SaaS)  
**核心功能**: 以 Holland RIASEC 理論為基礎的職業興趣測驗，供升學輔導員管理題目及學生結果

---

## 2. 技術架構

| 層面 | 技術 |
|------|------|
| 前端 | React + Vite + Tailwind CSS |
| 後端 | Node.js + Express |
| 資料庫 | SQLite (better-sqlite3) |
| 認證 | JWT |
| 圖表 | Chart.js + react-chartjs-2 |
| PDF匯出 | jsPDF + jsPDF-autotable |
| CSV匯出 | 原生 Node.js |

---

## 3. 功能模組

### 3.1 輔導員後台

#### 登入系統
- Email + 密碼登入
- JWT token 認證
- 密碼bcrypt加密

#### 題目管理 (CRUD)
- 新增題目（選擇 RIASEC 維度、題目文字）
- 編輯題目
- 刪除題目
- 批量匯入題目 (CSV)

#### 學生管理
- 查看所有學生資料
- 查看個別學生測驗結果
- 刪除學生資料

#### 數據匯出
- 匯出所有學生結果 (CSV)
- 匯出個別報告 (PDF)

### 3.2 學生端

#### 報到/輸入資料
- 姓名
- 學校/輔導室（可選）
- 年級（可選）

#### 進行測驗
- 40題選擇題（每維度約6-7題）
- 5點量表 (非常喜歡 → 非常不喜歡)
- 即時進度顯示

#### 查看結果
- 雷達圖展示六維度分數
- 文字說明各維度含義
- 推薦的大學學群（根據最高維度）

#### 報告下載
- 儲存/列印 PDF 報告

---

## 4. 資料模型

### Users (輔導員)
```
id, email, password_hash, name, created_at
```

### Questions (題目)
```
id, type (R/I/A/S/E/C), question_text, order_num, created_at
```

### Students (學生)
```
id, name, school, grade, session_id, created_at
```

### Results (結果)
```
id, student_id, scores (JSON: {R,I,A,S,E,C}), recommended_field, created_at
```

### Answers (作答紀錄)
```
id, result_id, question_id, score
```

---

## 5. RIASEC 通用題庫 (40題)

### R (實用型) - 7題
### I (研究型) - 7題  
### A (藝術型) - 6題
### S (社會型) - 7題
### E (企業型) - 6題
### C (事務型) - 7題

---

## 6. 興趣類型 → 學群對照

| 維度 | 推薦學群 |
|------|---------|
| R 實用型 | 工程、農業、機械、餐飲 |
| I 研究型 | 數理化、生命科學、資訊 |
| A 藝術型 | 藝術、設計、語文 |
| S 社會型 | 社會心理、教育、醫藥衛生 |
| E 企業型 | 管理、財經、法政 |
| C 事務型 | 行政、圖書資訊、遊憩運動 |

---

## 7. 設計風格

- 配色: 專業教育風格（主色待 MTEIA 提供）
- 響應式設計 (手機/平板/電腦)
- 簡潔清楚的 UI/UX

---

## 8. 部署

- 前端: Vercel / Netlify
- 後端: Railway / Render
- 資料庫: SQLite (放在 /data 目錄)

---

## 9. 時程規劃

1. ✅ 規格確認
2. 架構建立 (2-3天)
3. 題庫系統 + 學生端 (3-4天)
4. 輔導員後台 (3-4天)
5. 匯出功能 (1-2天)
6. 測試 + 部署 (2-3天)

**總計**: 約 11-16 天