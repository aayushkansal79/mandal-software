import React, { useContext, useEffect, useState } from "react";
import "./Login.css";
import axios from "axios";
import { assets } from "../../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const Login = ({ url }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  if (user?.type) {
    navigate("/dashboard");
  }
}, [user, location, navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${url}/api/user/login`, {
        username,
        password,
      });

      login(res.data.token);

      toast.success("Logged in successfully!");

      const decodedUser = JSON.parse(atob(res.data.token.split(".")[1]));
      navigate("/dashboard");

      // if (decodedUser.type === "admin") {
      //   navigate("/dashboard");
      // } else if (decodedUser.type === "store") {
      //   navigate("/billing");
      // } else {
      //   toast.error("Unknown user type.");
      // }
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="text-center p-4 shadow bg-light">
        <img src={assets.login_logo} alt="Logo" width={150} className="mb-2" />
        <div className="form-group mb-3 text-start">
          <label>Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="form-control"
          />
        </div>
        <div className="form-group mb-4 text-start">
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="form-control"
          />
        </div>
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
