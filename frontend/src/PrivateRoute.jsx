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

        if (res.ok) {
          setAuth(true);
        } else {
          setAuth(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setError(true);
        setAuth(false);
      }
    };

    checkAuth();
  }, []);

  if (auth === null) return <div>Checking authentication...</div>;

  if (error) return <div>Error checking authentication. Try again later.</div>;

  return auth ? children : <Navigate to="/" />;
};

export default PrivateRoute;
