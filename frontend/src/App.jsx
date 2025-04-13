import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './Login'
import Dashboard from './Dashboard'
import PrivateRoute from './PrivateRoute';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </Router>
  )
}

export default App
