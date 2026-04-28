import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('mteia_token')}` }
    })
      .then(res => res.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
              <h1 className="font-bold text-gray-800">MTEIA 管理後台</h1>
              <p className="text-xs text-gray-500">歡迎，{user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-600 hover:text-red-500">
            登出
          </button>
        </div>
      </header>

      {/* Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 flex gap-6">
          <Link to="/admin" className="py-4 px-2 border-b-2 border-blue-600 text-blue-600 font-medium">
            總覽
          </Link>
          <Link to="/admin/questions" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600">
            題目管理
          </Link>
          <Link to="/admin/students" className="py-4 px-2 border-b-2 border-transparent text-gray-600 hover:text-blue-600">
            學生資料
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">系統總覽</h2>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">學生總數</p>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalStudents || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">已完成測驗</p>
            <p className="text-3xl font-bold text-green-600">{stats?.totalResults || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500 text-sm">題目總數</p>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalQuestions || 0}</p>
          </div>
        </div>

        {/* Field Distribution */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">推薦學群分布</h3>
          {stats?.fieldCounts?.length > 0 ? (
            <div className="space-y-3">
              {stats.fieldCounts.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-gray-600">{item.recommended_field}</span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600"
                      style={{ width: `${(item.count / stats.totalResults) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">尚無資料</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            to="/admin/questions"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-gray-800 mb-2">題目管理</h3>
            <p className="text-gray-500 text-sm">新增、編輯、刪除測驗題目</p>
          </Link>
          <Link 
            to="/admin/students"
            className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-gray-800 mb-2">學生資料</h3>
            <p className="text-gray-500 text-sm">查看學生測驗結果並匯出資料</p>
          </Link>
        </div>
      </main>
    </div>
  )
}