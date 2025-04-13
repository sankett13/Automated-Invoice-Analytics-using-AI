import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // typo fixed here

  const login = async () => {

    const res = await fetch('/api/users/login/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'email': email, 'password': password }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log('Login successful:', data);
      setError('');
      navigate('/dashboard'); // typo fixed here
      // onLogin(); // if needed
    } else {
      console.log(email, password);
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input
        className="border p-2 mb-2 w-full"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-full"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-600 text-white px-4 py-2 w-full" onClick={login}>
        Login
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default Login;
