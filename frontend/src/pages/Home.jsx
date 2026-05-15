import { Link } from 'react-router-dom'
import { useLang } from '../i18n'

export default function Home() {
  const { t, lang, setLang } = useLang()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MTEIA" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t('home.title')}</h1>
              <p className="text-xs text-gray-500">{t('home.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="zh-TW">繁體</option>
              <option value="en">EN</option>
            </select>
            <Link 
              to="/login" 
              className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
            >
              {t('home.counselorLogin')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {t('home.heroTitle')}
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          {t('home.heroDesc')}
        </p>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-800">{t('types.R.name')}</h3>
              <p className="text-sm text-gray-500">{t('types.R.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="font-semibold text-gray-800">{t('types.I.name')}</h3>
              <p className="text-sm text-gray-500">{t('types.I.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-800">{t('types.A.name')}</h3>
              <p className="text-sm text-gray-500">{t('types.A.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-800">{t('types.S.name')}</h3>
              <p className="text-sm text-gray-500">{t('types.S.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="font-semibold text-gray-800">{t('types.E.name')}</h3>
              <p className="text-sm text-gray-500">{t('types.E.desc')}</p>
            </div>
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-semibold text-gray-800">{t('types.C.name')}</h3>
              <p className="text-sm text-gray-500">{t('types.C.desc')}</p>
            </div>
          </div>

          <Link 
            to="/quiz"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            {t('home.startQuiz')}
          </Link>
        </div>

        <div className="text-gray-500 text-sm">
          <p>{t('home.quizDuration')}</p>
          <p className="mt-1">{t('home.basedOn')}</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-8">
        {t('home.footer')}
      </footer>
    </div>
  )
}