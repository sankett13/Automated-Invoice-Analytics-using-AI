import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './Login'
import Dashboard from './Dashboard'
import PrivateRoute from './PrivateRoute';
import InvoiceCharts from './InvoiceCharts';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/api/invoices" element={<InvoiceCharts />} />
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
    </Router>
  )
}

export default App
