import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../i18n'
import { Radar } from 'react-chartjs-2'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const typeInfo = {
  R: { name: { zh: '实用型', en: 'Realistic' }, color: '#ef4444', emoji: '🔧', desc: { zh: '喜欢实际操作、组装、维修工具和机械', en: 'Likes hands-on work, assembling, repairing tools and machinery' } },
  I: { name: { zh: '研究型', en: 'Investigative' }, color: '#a855f7', emoji: '🔬', desc: { zh: '喜欢研究、思考、分析和解决问题', en: 'Likes researching, thinking, analyzing and solving complex problems' } },
  A: { name: { zh: '艺术型', en: 'Artistic' }, color: '#ec4899', emoji: '🎨', desc: { zh: '喜欢创意、表达、设计和艺术创作', en: 'Likes creativity, expression, design and artistic work' } },
  S: { name: { zh: '社会型', en: 'Social' }, color: '#22c55e', emoji: '🤝', desc: { zh: '喜欢帮助他人、教育、咨询和社会服务', en: 'Likes helping others, education, counseling and social services' } },
  E: { name: { zh: '企业型', en: 'Enterprising' }, color: '#eab308', emoji: '💼', desc: { zh: '喜欢领导、说服、规划和管理', en: 'Likes leadership, persuasion, planning and management' } },
  C: { name: { zh: '事务型', en: 'Conventional' }, color: '#3b82f6', emoji: '📋', desc: { zh: '喜欢规矩、精确、有序的文书和行政工作', en: 'Likes rules, precision, organized clerical and administrative work' } }
}

export default function Result() {
  const { sessionId } = useParams()
  const { t, lang } = useLang()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const pageRef = useRef(null)

  useEffect(() => {
    fetch(`/api/results/${sessionId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setData(data)
        else setError(t('error.notFound'))
      })
      .catch(() => setError(t('error.loadFailed')))
      .finally(() => setLoading(false))
  }, [sessionId, t])

  const downloadPDF = async () => {
    if (!data || !pageRef.current) {
      alert('載入中，請稍候')
      return
    }
    
    setPdfLoading(true)
    try {
      // Wait for Chart.js to finish rendering
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const element = pageRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Ensure chart is rendered in cloned doc
          const chartCanvas = clonedDoc.querySelector('canvas')
          if (chartCanvas) {
            chartCanvas.style.width = '100%'
            chartCanvas.style.height = 'auto'
          }
        }
      })
      
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = pdfWidth / imgWidth
      const scaledHeight = imgHeight * ratio
      
      // If content is taller than one page, scale to fit
      if (scaledHeight > pdfHeight) {
        const fitRatio = pdfHeight / scaledHeight
        const fitWidth = pdfWidth * fitRatio
        const xOffset = (pdfWidth - fitWidth) / 2
        pdf.addImage(imgData, 'PNG', xOffset, 0, fitWidth, pdfHeight)
      } else {
        // Center vertically
        const yOffset = (pdfHeight - scaledHeight) / 2
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, scaledHeight)
      }
      
      pdf.save(`MTEIA-RIASEC-${data.student.name}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF下載失敗: ' + err.message)
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">{t('loading')}</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/" className="text-blue-600 hover:underline">{t('result.backHome')}</Link>
    </div>
  )

  if (!data) return null

  const scores = data.scores
  const types = ['R', 'I', 'A', 'S', 'E', 'C']
  const topType = types.reduce((a, b) => scores[a] > scores[b] ? a : b)
  const typeLabels = types.map(type => t('types.' + type + '.name'))

  const chartData = {
    labels: typeLabels,
    datasets: [{
      label: lang === 'en' ? 'RIASEC Score' : 'RIASEC 分數',
      data: types.map(t => scores[t]?.toFixed(2) || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: types.map(type => typeInfo[type].color)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8" ref={pageRef}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('result.title')}</h1>
          <p className="text-gray-600">{data.student.name}{t('result.intro')}</p>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="max-w-md mx-auto">
            <Radar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Scores Detail */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('result.scores')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {types.map(type => (
              <div key={type} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <span className="text-2xl">{typeInfo[type].emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{typeLabels[types.indexOf(type)]}</span>
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
              <p className="text-blue-200 text-sm">{t('result.topType')}</p>
              <h2 className="text-2xl font-bold">{typeLabels[types.indexOf(topType)]}</h2>
            </div>
          </div>
          <p className="text-blue-100 mb-4">{typeInfo[topType].desc[lang]}</p>
          <p className="text-lg font-semibold">{t('result.recommendedField')}：{data.recommended_field}</p>
        </div>

        {/* Recommended Fields */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t('result.suitableMajors')}</h2>
          <div className="flex flex-wrap gap-3">
            {(t('majors.' + topType) || []).map((field, i) => (
              <span key={i} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-800 mb-2">{t('result.disclaimerTitle')}</h3>
          <p className="text-amber-700 text-sm leading-relaxed">{t('result.disclaimerText')}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={downloadPDF}
            disabled={pdfLoading}
            className="flex-1 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50 text-center"
          >
            {pdfLoading ? '處理中...' : t('result.downloadPDF')}
          </button>
          <Link 
            to="/" 
            className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-center"
          >
            {t('result.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}