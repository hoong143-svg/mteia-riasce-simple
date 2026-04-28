import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Quiz() {
  const [step, setStep] = useState('info') // info -> quiz -> done
  const [formData, setFormData] = useState({ name: '', school: '', grade: '' })
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/questions')
      const data = await res.json()
      setQuestions(data)
      setStep('quiz')
    } catch (err) {
      setError('載入題目失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    if (!formData.name.trim()) {
      setError('請輸入姓名')
      return
    }
    setError('')
    fetchQuestions()
  }

  const handleAnswer = (questionId, score) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const answersArray = Object.entries(answers).map(([question_id, score]) => ({
      question_id,
      score
    }))

    if (answersArray.length < questions.length) {
      setError(`請回答所有題目（${answersArray.length}/${questions.length}）`)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          school: formData.school,
          grade: formData.grade,
          scores: answersArray
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '提交失敗')
      
      navigate(`/result/${data.session_id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const currentQ = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const answeredCount = Object.keys(answers).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">RIASEC 職業興趣測驗</h1>
          <span className="text-sm text-gray-500">{currentIndex + 1} / {questions.length || '...'}</span>
        </div>
        {step === 'quiz' && questions.length > 0 && (
          <div className="h-1 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {step === 'info' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">基本資料</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="請輸入姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">學校/輔導室</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="選填"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年級</label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">選填</option>
                  <option value="國一">國一</option>
                  <option value="國二">國二</option>
                  <option value="國三">國三</option>
                  <option value="高一">高一</option>
                  <option value="高二">高二</option>
                  <option value="高三">高三</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full mt-6 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '載入中...' : '開始測驗'}
            </button>
          </div>
        )}

        {step === 'quiz' && currentQ && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium
                ${currentQ.type === 'R' ? 'bg-red-100 text-red-700' :
                  currentQ.type === 'I' ? 'bg-purple-100 text-purple-700' :
                  currentQ.type === 'A' ? 'bg-pink-100 text-pink-700' :
                  currentQ.type === 'S' ? 'bg-green-100 text-green-700' :
                  currentQ.type === 'E' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                {currentQ.type === 'R' && '實用型'}
                {currentQ.type === 'I' && '研究型'}
                {currentQ.type === 'A' && '藝術型'}
                {currentQ.type === 'S' && '社會型'}
                {currentQ.type === 'E' && '企業型'}
                {currentQ.type === 'C' && '事務型'}
              </span>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-8">{currentQ.question_text}</h3>

            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(score => (
                <button
                  key={score}
                  onClick={() => handleAnswer(currentQ.id, score)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition
                    ${answers[currentQ.id] === score 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      {score === 5 && '非常喜歡'}
                      {score === 4 && '喜歡'}
                      {score === 3 && '普通'}
                      {score === 2 && '不太喜歡'}
                      {score === 1 && '非常不喜歡'}
                    </span>
                    <span className={`text-lg ${answers[currentQ.id] === score ? 'text-blue-600' : 'text-gray-300'}`}>
                      {score === 5 && '★★★★★'}
                      {score === 4 && '★★★★☆'}
                      {score === 3 && '★★★☆☆'}
                      {score === 2 && '★★☆☆☆'}
                      {score === 1 && '★☆☆☆☆'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
              >
                上一題
              </button>
              
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? '提交中...' : '完成測驗'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                >
                  下一題
                </button>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              已回答：{answeredCount} / {questions.length}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}