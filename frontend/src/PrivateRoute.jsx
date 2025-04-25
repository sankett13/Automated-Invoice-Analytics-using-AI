import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/users/auth/check", {
          method: "GET",
          credentials: "include",
        });
        setAuth(res.ok);
      } catch (err) {
        console.error("Auth check failed", err);
        setError(true);
        setAuth(false);
      }
    };

    checkAuth();
  }, []);

  // LOADER
  if (auth === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#dff7f6]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#01b8b1] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#484c4d] font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#dff7f6]">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
          <p className="text-red-500 font-semibold mb-2">
            ⚠️ Something went wrong
          </p>
          <p className="text-[#484c4d] mb-4">
            Unable to verify your session. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#01b8b1] hover:bg-[#3B6790] text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // AUTHORIZED
  return auth ? children : <Navigate to="/" />;
};

export default PrivateRoute;
