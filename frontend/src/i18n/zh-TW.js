export default {
  home: {
    title: 'MTEIA',
    subtitle: '升學輔導測驗系統',
    heroTitle: '探索你的職業興趣',
    heroDesc: '透過專業的 RIASEC 職業興趣測驗，了解自己的興趣取向，找到適合的升學方向',
    startQuiz: '開始測驗',
    counselorLogin: '輔導員登入',
    quizDuration: '測驗約需 10-15 分鐘，共 40 題',
    basedOn: '基於 Holland 職業興趣理論 (RIASEC)',
    footer: 'MTEIA 升學輔導系統 © 2026'
  },
  quiz: {
    title: '問卷調查測驗',
    progress: '第 {current} 題，共 {total} 題',
    next: '下一題',
    prev: '上一題',
    submit: '提交測驗',
    submitting: '提交中...',
    name: '姓名',
    school: '學校',
    grade: '年級',
    namePlaceholder: '請輸入姓名',
    schoolPlaceholder: '請輸入學校（選填）',
    gradePlaceholder: '請輸入年級（選填）'
  },
  result: {
    title: '測驗結果',
    intro: '，以下是您的 RIASEC 職業興趣分析',
    scores: '各維度分數',
    topType: '您的優勢維度',
    recommendedField: '推薦學群',
    suitableMajors: '適合的科系建議',
    downloadPDF: '下載 PDF 報告',
    backHome: '返回首頁',
    disclaimerTitle: '重要提醒',
    disclaimerText: '這個測驗反映的是你「現階段」的興趣。興趣會隨著你的學習與生活經驗而不斷演變，請將此結果視為探索世界的起點，而非限制你的標籤。'
  },
  types: {
    R: { name: '實用型', desc: '喜歡實際操作、組裝、維修工具和機械' },
    I: { name: '研究型', desc: '喜歡研究、思考、分析和解決複雜問題' },
    A: { name: '藝術型', desc: '喜歡創意、表達、設計和藝術創作' },
    S: { name: '社會型', desc: '喜歡幫助他人、教育、諮詢和社會服務' },
    E: { name: '企業型', desc: '喜歡領導、說服、規劃和管理' },
    C: { name: '事務型', desc: '喜歡規矩、精確、有序的文書和行政工作' }
  },
  majors: {
    R: ['機械工程學系', '土木工程學系', '農業學系', '餐飲管理學系', '电机工程學系'],
    I: ['資訊工程學系', '數學系', '物理系', '化學系', '生物學系'],
    A: ['美術學系', '設計學系', '音樂學系', '傳播學系', '語文學系'],
    S: ['教育學系', '心理學系', '社會工作學系', '醫藥衛生學系', '公共衛生學系'],
    E: ['企业管理學系', '財經學系', '法律學系', '行政管理學系', '國際貿易學系'],
    C: ['圖書資訊學系', '行政管理學系', '觀光事業學系', '休憩運動學系', '語文學系']
  },
  admin: {
    title: '管理後台',
    logout: '登出',
    stats: '統計',
    questions: '題目管理',
    students: '學生資料'
  },
  login: {
    title: '輔導員登入',
    email: '帳號',
    password: '密碼',
    submit: '登入',
    error: '帳號或密碼錯誤'
  },
  loading: '載入中...',
  error: {
    notFound: '找不到測驗結果',
    loadFailed: '載入失敗'
  }
}