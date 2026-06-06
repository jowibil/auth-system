import { Routes, Route } from 'react-router-dom'
import Login_Page from './pages/login'
import Register_Page from './pages/register'
import Landing_Page from './landing'
import Dashboard_Page from './pages/dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing_Page/>} />
      <Route path="/login" element={<Login_Page/>} />
      <Route path="/register" element={<Register_Page />} />
      <Route path="/dashboard" element={<Dashboard_Page/>} />
    </Routes>
  )
}

export default App