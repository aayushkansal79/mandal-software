import React, { useState } from "react";
import "./Login.css";
import { assets } from "../../assets/assets";

const Login = () => {

    const [loading, setLoading] = useState(false);

  return (
    <div className="login-container">
      <form 
    //   onSubmit={handleSubmit}
       className="text-center p-4 shadow bg-light">
        <img
          src={assets.login_logo}
          alt="Logo"
          width={150}
          className="mb-2"
        />
        <div className="form-group mb-3 text-start">
          <label>Username</label>
          <input
            type="text"
            required
            // value={username}
            // onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="form-control"
          />
        </div>
        <div className="form-group mb-4 text-start">
          <label>Password</label>
          <input
            type="password"
            required
            // value={password}
            // onChange={(e) => setPassword(e.target.value)}
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
