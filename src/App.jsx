import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { MecanicosPage } from './pages/MecanicosPage'
import { ServicosPage } from './pages/ServicosPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/mecanicos" element={<MecanicosPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/" element={<Navigate to="/mecanicos" replace />} />
          </Route>
          <Route path="*" element={<Navigate to="/mecanicos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
