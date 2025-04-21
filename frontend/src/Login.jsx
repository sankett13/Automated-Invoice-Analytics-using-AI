import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      navigate('/dashboard');
      // onLogin(); // if needed
    } else {
      console.log(email, password);
      setError(data.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white shadow-md rounded-lg px-4 py-8 sm:px-10">
          <div className="relative w-full h-64 mb-6 rounded-md overflow-hidden">
            <iframe
              src='https://my.spline.design/kidsplaygroundphysicscopy-JMgSE3TEMYVROEDN2DjpHqj1/'
              frameBorder='0'
              width='100%'
              height='100%'
            ></iframe>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Login
          </h2>
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
              onClick={login}
            >
              Login
            </button>
          </div>
          {/* Optional: Add "Forgot Password" link */}
          {/* <div className="mt-4 text-center">
            <a href="#" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Forgot Password?
            </a>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;