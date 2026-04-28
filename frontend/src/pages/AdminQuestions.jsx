import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const typeLabels = { R: '實用型', I: '研究型', A: '藝術型', S: '社會型', E: '企業型', C: '事務型' }
const typeColors = {
  R: 'bg-red-100 text-red-700',
  I: 'bg-purple-100 text-purple-700',
  A: 'bg-pink-100 text-pink-700',
  S: 'bg-green-100 text-green-700',
  E: 'bg-yellow-100 text-yellow-700',
  C: 'bg-blue-100 text-blue-700'
}

export default function AdminQuestions() {
  const { token } = useAuth()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ type: 'R', question_text: '' })
  const [error, setError] = useState('')

  const fetchQuestions = () => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => { setQuestions(data); setLoading(false) })
      .catch(err => { setError('載入失敗'); setLoading(false) })
  }

  useEffect(() => { fetchQuestions() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const url = editingId ? `/api/questions/${editingId}` : '/api/questions'
    const method = editingId ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error(await res.text())
      setShowForm(false)
      setEditingId(null)
      setFormData({ type: 'R', question_text: '' })
      fetchQuestions()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (q) => {
    setEditingId(q.id)
    setFormData({ type: q.type, question_text: q.question_text })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('確定要刪除這題嗎？')) return
    
    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('刪除失敗')
      fetchQuestions()
    } catch (err) {
      setError(err.message)
    }
  }

  const groupedQuestions = questions.reduce((acc, q) => {
    if (!acc[q.type]) acc[q.type] = []
    acc[q.type].push(q)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">題目管理</h1>
            </div>
          </div>
          <Link to="/admin" className="text-gray-600 hover:text-blue-600">← 返回</Link>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <Link to="/admin" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600">
            總覽
          </Link>
          <Link to="/admin/questions" className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium">
            題目管理
          </Link>
          <Link to="/admin/students" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600">
            學生資料
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">題目列表 ({questions.length} 題)</h2>
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setFormData({ type: 'R', question_text: '' }) }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + 新增題目
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h3 className="text-lg font-bold mb-4">{editingId ? '編輯題目' : '新增題目'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">題目類型</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="R">實用型 (R)</option>
                    <option value="I">研究型 (I)</option>
                    <option value="A">藝術型 (A)</option>
                    <option value="S">社會型 (S)</option>
                    <option value="E">企業型 (E)</option>
                    <option value="C">事務型 (C)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">題目文字</label>
                  <textarea
                    value={formData.question_text}
                    onChange={e => setFormData({ ...formData, question_text: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg h-32"
                    placeholder="請輸入題目..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    儲存
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Questions by Type */}
        {loading ? (
          <p className="text-center text-gray-500">載入中...</p>
        ) : (
          <div className="space-y-6">
            {['R', 'I', 'A', 'S', 'E', 'C'].map(type => (
              groupedQuestions[type]?.length > 0 && (
                <div key={type} className="bg-white rounded-xl shadow">
                  <div className="px-6 py-4 border-b flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[type]}`}>
                      {typeLabels[type]}
                    </span>
                    <span className="text-gray-500 text-sm">{groupedQuestions[type].length} 題</span>
                  </div>
                  <div className="divide-y">
                    {groupedQuestions[type].map(q => (
                      <div key={q.id} className="px-6 py-4 flex items-start gap-4">
                        <span className="text-gray-400 text-sm w-8">#{q.order_num}</span>
                        <p className="flex-1 text-gray-700">{q.question_text}</p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(q)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            編輯
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            刪除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  )
}