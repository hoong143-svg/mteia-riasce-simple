import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './i18n/index'

import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Login from './pages/Login'
import Admin from './pages/Admin'
import AdminQuestions from './pages/AdminQuestions'
import AdminStudents from './pages/AdminStudents'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/result/:sessionId" element={<Result />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={
              <ProtectedRoute><Admin /></ProtectedRoute>
            } />
            <Route path="/admin/questions" element={
              <ProtectedRoute><AdminQuestions /></ProtectedRoute>
            } />
            <Route path="/admin/students" element={
              <ProtectedRoute><AdminStudents /></ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App