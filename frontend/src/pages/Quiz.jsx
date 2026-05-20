import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n'

const typeLabels = {
  R: '實用型', I: '研究型', A: '藝術型',
  S: '社會型', E: '企業型', C: '事務型'
}

const typeColors = {
  R: 'bg-red-100 text-red-700',
  I: 'bg-purple-100 text-purple-700',
  A: 'bg-pink-100 text-pink-700',
  S: 'bg-green-100 text-green-700',
  E: 'bg-yellow-100 text-yellow-700',
  C: 'bg-blue-100 text-blue-700'
}

const scoreLabels = [
  { value: 5, zh: '非常喜欢', en: 'Strongly Like' },
  { value: 4, zh: '喜欢', en: 'Like' },
  { value: 3, zh: '普通', en: 'Neutral' },
  { value: 2, zh: '不太喜欢', en: 'Dislike' },
  { value: 1, zh: '非常不喜欢', en: 'Strongly Dislike' }
]

const gradeOptions = {
  'zh-CN': ['初一', '初二', '初三', '高一', '高二', '高三', '其他'],
  en: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Other']
}

export default function Quiz() {
  const { t, lang } = useLang()
  const [step, setStep] = useState('info')
  const [formData, setFormData] = useState({ name: '', school: '', grade: '' })
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const getScoreLabel = (score) => {
    const s = scoreLabels.find(x => x.value === score)
    return lang === 'en' ? s.en : s.zh
  }

  const fetchQuestions = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/questions')
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      const data = await res.json()
      if (!data || data.length === 0) {
        throw new Error('No questions received')
      }
      setQuestions(data)
      setStep('quiz')
    } catch (err) {
      console.error('Fetch error:', err)
      setError(`載入題目失敗: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    if (!formData.name.trim()) {
      setError(lang === 'en' ? 'Please enter your name' : '請輸入姓名')
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
    const answersArray = Object.entries(answers).map(([question_id, score]) => {
      const q = questions.find(x => x.id === question_id)
      return {
        question_id,
        score,
        type: q?.type || 'R'
      }
    })

    if (answersArray.length < questions.length) {
      setError(lang === 'en' 
        ? `Please answer all questions (${answersArray.length}/${questions.length})`
        : `請回答所有題目（${answersArray.length}/${questions.length}）`
      )
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
          scores: answersArray,
          lang: lang
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
          <h1 className="text-lg font-semibold text-gray-800">{t('quiz.title')}</h1>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('quiz.title')}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quiz.name')} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('quiz.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quiz.school')}</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('quiz.schoolPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('quiz.grade')}</label>
                <select
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('quiz.gradePlaceholder')}</option>
                  {gradeOptions[lang].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full mt-6 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? t('quiz.submitting') : t('home.startQuiz')}
            </button>
          </div>
        )}

        {step === 'quiz' && currentQ && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${typeColors[currentQ.type]}`}>
                {t('types.' + currentQ.type + '.name')}
              </span>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-8">{lang === 'en' ? currentQ.question_text : currentQ.question_text_zh}</h3>

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
                    <span className="text-gray-700">{getScoreLabel(score)}</span>
                    <span className={`text-lg ${answers[currentQ.id] === score ? 'text-blue-600' : 'text-gray-300'}`}>
                      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
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
                {t('quiz.prev')}
              </button>
              
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? t('quiz.submitting') : t('quiz.submit')}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700"
                >
                  {t('quiz.next')}
                </button>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              {lang === 'en' ? `Answered: ${answeredCount} / ${questions.length}` : `已回答：${answeredCount} / ${questions.length}`}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}