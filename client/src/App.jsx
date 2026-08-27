import { Navigate, Route, Routes } from 'react-router-dom'
import Analyze from './pages/Analyze'
import Results from './pages/Results'
import MyAnalyses from './pages/MyAnalyses'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return <Routes>
    <Route path="/" element={<Navigate to="/analyze" replace />} />
    <Route path="/analyze" element={<Analyze />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/results/:id" element={<Results />} />
      <Route path="/my-analyses" element={<MyAnalyses />} />
    </Route>
    <Route path="/results" element={<Navigate to="/analyze" replace />} />
  </Routes>
}

export default App
