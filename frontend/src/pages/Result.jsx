import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import jsPDF from 'jspdf'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const typeInfo = {
  R: { name: '實用型', color: '#ef4444', emoji: '🔧', desc: '喜歡實際操作、組裝、維修工具和機械' },
  I: { name: '研究型', color: '#a855f7', emoji: '🔬', desc: '喜歡研究、思考、分析和解決複雜問題' },
  A: { name: '藝術型', color: '#ec4899', emoji: '🎨', desc: '喜歡創意、表達、設計和藝術創作' },
  S: { name: '社會型', color: '#22c55e', emoji: '🤝', desc: '喜歡幫助他人、教育、諮詢和社會服務' },
  E: { name: '企業型', color: '#eab308', emoji: '💼', desc: '喜歡領導、說服、規劃和管理' },
  C: { name: '事務型', color: '#3b82f6', emoji: '📋', desc: '喜歡規矩、精確、有序的文書和行政工作' }
}

const fieldRecommendations = {
  R: ['機械工程學系', '土木工程學系', '農業學系', '餐飲管理學系', '电机工程學系'],
  I: ['資訊工程學系', '數學系', '物理系', '化學系', '生物學系'],
  A: ['美術學系', '設計學系', '音樂學系', '傳播學系', '語文學系'],
  S: ['教育學系', '心理學系', '社會工作學系', '醫藥衛生學系', '公共衛生學系'],
  E: ['企业管理學系', '財經學系', '法律學系', '行政管理學系', '國際貿易學系'],
  C: ['圖書資訊學系', '行政管理學系', '觀光事業學系', '休憩運動學系', '語文學系']
}

export default function Result() {
  const { sessionId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/results/${sessionId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setData(data)
        else setError('找不到測驗結果')
      })
      .catch(() => setError('載入失敗'))
      .finally(() => setLoading(false))
  }, [sessionId])

  const downloadPDF = () => {
    if (!data) return
    
    const doc = new jsPDF()
    const scores = data.scores
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(30, 64, 175)
    doc.text('MTEIA 職業興趣測驗報告', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`姓名：${data.student.name}`, 20, 35)
    doc.text(`學校：${data.student.school || '-'}/ ${data.student.grade || '-'}`)
    doc.text(`日期：${new Date(data.created_at).toLocaleDateString('zh-TW')}`)
    
    // Scores
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('各維度分數', 20, 55)
    
    const types = ['R', 'I', 'A', 'S', 'E', 'C']
    let y = 65
    types.forEach(type => {
      const score = scores[type] || 0
      doc.text(`${typeInfo[type].emoji} ${typeInfo[type].name}: ${score.toFixed(2)}`, 25, y)
      y += 8
    })
    
    // Top type
    const topType = types.reduce((a, b) => scores[a] > scores[b] ? a : b)
    doc.setFontSize(14)
    doc.setTextColor(30, 64, 175)
    doc.text(`推薦學群：${data.recommended_field}`, 20, y + 10)
    
    doc.save(`MTEIA-RIASEC-${data.student.name}.pdf`)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">載入中...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/" className="text-blue-600 hover:underline">返回首頁</Link>
    </div>
  )

  if (!data) return null

  const scores = data.scores
  const types = ['R', 'I', 'A', 'S', 'E', 'C']
  const topType = types.reduce((a, b) => scores[a] > scores[b] ? a : b)

  const chartData = {
    labels: types.map(t => typeInfo[t].name),
    datasets: [{
      label: 'RIASEC 分數',
      data: types.map(t => scores[t]?.toFixed(2) || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: types.map(t => typeInfo[t].color)
    }]
  }

  const chartOptions = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 }
      }
    },
    plugins: { legend: { display: false } }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">測驗結果</h1>
          <p className="text-gray-600">{data.student.name}，以下是您的 RIASEC 職業興趣分析</p>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="max-w-md mx-auto">
            <Radar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Scores Detail */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">各維度分數</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {types.map(type => (
              <div key={type} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">{typeInfo[type].emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{typeInfo[type].name}</span>
                    <span className="font-bold" style={{ color: typeInfo[type].color }}>
                      {scores[type]?.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(scores[type] / 5) * 100}%`,
                        backgroundColor: typeInfo[type].color
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white mb-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{typeInfo[topType].emoji}</span>
            <div>
              <p className="text-blue-200 text-sm">您的優勢維度</p>
              <h2 className="text-2xl font-bold">{typeInfo[topType].name}</h2>
            </div>
          </div>
          <p className="text-blue-100 mb-4">{typeInfo[topType].desc}</p>
          <p className="text-lg font-semibold">推薦學群：{data.recommended_field}</p>
        </div>

        {/* Recommended Fields */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">適合的科系建議</h2>
          <div className="flex flex-wrap gap-3">
            {fieldRecommendations[topType].map((field, i) => (
              <span key={i} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadPDF}
            className="flex-1 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-center"
          >
            下載 PDF 報告
          </button>
          <Link 
            to="/" 
            className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-center"
          >
            返回首頁
          </Link>
        </div>
      </div>
    </div>
  )
}