import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">MTEIA</h1>
              <p className="text-xs text-gray-500">升學輔導測驗系統</p>
            </div>
          </div>
          <Link 
            to="/login" 
            className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
          >
            輔導員登入
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          探索你的職業興趣
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          透過專業的 RIASEC 職業興趣測驗，了解自己的興趣取向，找到適合的升學方向
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-800">實用型 R</h3>
              <p className="text-sm text-gray-500">喜歡實際操作</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="font-semibold text-gray-800">研究型 I</h3>
              <p className="text-sm text-gray-500">喜歡研究思考</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-800">藝術型 A</h3>
              <p className="text-sm text-gray-500">喜歡創意表達</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-800">社會型 S</h3>
              <p className="text-sm text-gray-500">喜歡幫助他人</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-800">企業型 E</h3>
              <p className="text-sm text-gray-500">喜歡領導影響</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-semibold text-gray-800">事務型 C</h3>
              <p className="text-sm text-gray-500">喜歡規矩精確</p>
            </div>
          </div>

          <Link 
            to="/quiz"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            開始測驗
          </Link>
        </div>

        <div className="text-gray-500 text-sm">
          <p>測驗約需 10-15 分鐘，共 40 題</p>
          <p className="mt-1">基於 Holland 職業興趣理論 (RIASEC)</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-8">
        MTEIA 升學輔導系統 © 2024
      </footer>
    </div>
  )
}