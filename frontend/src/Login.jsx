import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    const res = await fetch("/api/users/login/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log("Login successful:", data);
      setError("");
      navigate("/dashboard");
      // onLogin(); // if needed
    } else {
      setError(data.message || "Login failed");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 transition-colors duration-500 ${
        darkMode ? "bg-[#121212] text-white" : "bg-[#dff7f6] text-[#484c4d]"
      }`}
    >
      <div
        className={`sm:mx-auto sm:w-full sm:max-w-md p-6 rounded-lg shadow-xl transition-all duration-500 ${
          darkMode ? "bg-[#1e1e1e]" : "bg-white"
        }`}
      >
        {/* ✨ Creative Game Box */}
        <div
          className="relative w-full h-64 mb-8 rounded-xl overflow-hidden transition-all duration-500 transform hover:scale-105 shadow-2xl"
          onMouseEnter={() => setDarkMode(true)}
          onMouseLeave={() => setDarkMode(false)}
          style={{
            boxShadow: darkMode
              ? "0 0 20px 5px #01b8b1, 0 0 40px 10px #e6c065"
              : "0 0 12px rgba(0,0,0,0.2)",
            border: darkMode ? "1px solid #01b8b1" : "none",
          }}
        >
          <iframe
            src="https://my.spline.design/kidsplaygroundphysicscopy-JMgSE3TEMYVROEDN2DjpHqj1/"
            frameBorder="0"
            width="100%"
            height="100%"
            className="transition-transform duration-500 hover:scale-110"
          ></iframe>
        </div>

        {/* Login Form */}
        <h2 className="text-3xl font-bold mb-6 text-center">
          Login to Your Account
        </h2>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-[#01b8b1] focus:border-[#01b8b1] transition-all mb-4 text-[#484c4d]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-semibold mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="shadow-md appearance-none border rounded-lg w-full py-3 px-4 leading-tight focus:outline-none focus:ring-2 focus:ring-[#01b8b1] focus:border-[#01b8b1] transition-all mb-4 text-[#484c4d]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-xs italic mb-3">{error}</p>}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="w-full bg-[#01b8b1] hover:bg-[#3B6790] text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B6790] transition-all"
            onClick={login}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;