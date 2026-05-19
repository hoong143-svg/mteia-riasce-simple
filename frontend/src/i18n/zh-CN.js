export default {
  home: {
    title: 'MTEIA',
    subtitle: '升学辅导测验系统',
    heroTitle: '探索你的职业兴趣',
    heroDesc: '透过专业的 RIASEC 职业兴趣测验，了解自己的兴趣取向，找到适合的升学方向',
    startQuiz: '开始测验',
    counselorLogin: '辅导员登入',
    quizDuration: '测验约需 10-15 分钟，共 40 题',
    basedOn: '基于 Holland 职业兴趣理论 (RIASEC)',
    footer: 'MTEIA 升学辅导系统 © 2026'
  },
  quiz: {
    title: '问卷调查测验',
    progress: '第 {current} 题，共 {total} 题',
    next: '下一题',
    prev: '上一题',
    submit: '提交测验',
    submitting: '提交中...',
    name: '姓名',
    school: '学校',
    grade: '年级',
    namePlaceholder: '请输入姓名',
    schoolPlaceholder: '请输入学校（选填）',
    gradePlaceholder: '请输入年级（选填）'
  },
  result: {
    title: '测验结果',
    intro: '，以下是您的 RIASEC 职业兴趣分析',
    scores: '各维度分数',
    topType: '您的优势维度',
    recommendedField: '推荐学群',
    suitableMajors: '适合的科系建议',
    downloadPDF: '下载 PDF 报告',
    backHome: '返回首页',
    disclaimerTitle: '重要提醒',
    disclaimerText: '这个测验反映的是你「现阶段」的兴趣。兴趣会随着你的学习与生活经验而不断演变，请将此结果视为探索世界的起点，而非限制你的标签。'
  },
  types: {
    R: { name: '实用型', desc: '喜欢实际操作、组装、维修工具和机械' },
    I: { name: '研究型', desc: '喜欢研究、思考、分析和解决复杂问题' },
    A: { name: '艺术型', desc: '喜欢创意、表达、设计和艺术创作' },
    S: { name: '社会型', desc: '喜欢帮助他人、教育、咨询和社会服务' },
    E: { name: '企业型', desc: '喜欢领导、说服、规划和管理' },
    C: { name: '事务型', desc: '喜欢规矩、精确、有序的文书和行政工作' }
  },
  majors: {
    R: ['机械工程学系', '土木工程学系', '农学系', '餐饮管理学系', '电机工程学系'],
    I: ['资讯工程学系', '数学系', '物理系', '化学系', '生物学系'],
    A: ['美术学系', '设计学系', '音乐学系', '传播学系', '语文学系'],
    S: ['教育学系', '心理学系', '社会工作学系', '医药卫生学系', '公共卫生学系'],
    E: ['企业管理学系', '财经学系', '法学系', '行政管理学系', '国际贸易学系'],
    C: ['图书资讯学系', '行政管理学系', '观光事业学系', '休憩运动学系', '语文学系']
  },
  admin: {
    title: '管理后台',
    logout: '登出',
    stats: '统计',
    questions: '题目管理',
    students: '学生资料'
  },
  login: {
    title: '辅导员登入',
    email: '帐号',
    password: '密码',
    submit: '登入',
    error: '帐号或密码错误'
  },
  loading: '载入中...',
  error: {
    notFound: '找不到测验结果',
    loadFailed: '载入失败'
  }
}