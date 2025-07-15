import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { httpFile } from "../config.js"; // your Axios instance
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: "", phone: "", country_code: "", password: "" });
  const [error, setError] = useState("");

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    return /mobile|android|iphone|ipad|phone/i.test(ua) ? "mobile" : "desktop";
  };

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const togglePasswordVisiblity = () => {
    setShowPassword(v => !v);
  };

  const handleApiError = (err) => {
    const status = err.response?.status;
    const msg = err.response?.data?.message;
    if (status === 400) {
      toast.error(msg || "Missing required fields");
      setError(msg || "Please fill in all required fields.");
    } else if (status === 401) {
      toast.error("Credentials don’t match");
      setError("Email/phone or password is incorrect.");
    } else if (status === 404) {
      toast.error("User not found");
      setError("No account found with those details.");
    } else if (status === 500) {
      toast.error("Server error—try again later");
      setError("Something went wrong on our end.");
    } else {
      toast.error("An unknown error occurred");
      setError("Please try again.");
    }
  };

  const login = async () => {
    // require either email or phone + password
    if ((!data.email && !data.phone) || !data.password) {
      toast.error("Please enter email (or phone) and password");
      setError("Email (or phone) and password are required.");
      return;
    }

    // if using phone, require country_code
    if (data.phone && !data.country_code) {
      toast.error("Country code is required with phone login");
      setError("Please select your country code.");
      return;
    }

    const deviceType = getDeviceType();
    const deviceToken = localStorage.getItem("deviceToken") || "default_token";

    const payload = {
      deviceType,
      deviceToken,
      password: data.password,
      // only include whichever the user filled
      ...(data.email ? { email: data.email } : {}),
      ...(data.phone ? { phone: data.phone, country_code: data.country_code } : {}),
    };

    try {
      const res = await httpFile.post("login", payload);

      console.log(res,"resssssss")
      // your API returns status 201 on success
      if (res.status === 201 && res.data?.data?.token) {
        const user = res.data.data;
        localStorage.setItem("adminProfile", JSON.stringify(user));
        localStorage.setItem("token", user.token);
        // store type if you need it for role checks
        localStorage.setItem("Role", String(user.type || 1));

        toast.success("Login successful");
        navigate("/admin");
      } else {
        // unexpected 2xx response
        toast.error("Login failed");
        setError("Unexpected response; please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      handleApiError(err);
    }
  };

  // Redirect if already logged in as type=1
  useEffect(() => {
    try {
      const profile = JSON.parse(localStorage.getItem("adminProfile"));
      if (profile?.type === 1) {
        navigate("/admin");
      }
    } catch {
      localStorage.removeItem("adminProfile");
    }
  }, [navigate]);

  return (
    <section style={{ backgroundColor: '#f4f6f9', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        backgroundColor: '#fff', padding: '30px', borderRadius: '15px',
        boxShadow: '0px 5px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '28px', color: '#333' }}>All WebGen</h2>

        {/* Email or Phone */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }}
          />
          {/* <span style={{ display: 'block', textAlign: 'center', margin: '10px 0', color: '#888' }}>— OR —</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              name="country_code"
              type="text"
              placeholder="+91"
              value={data.country_code}
              onChange={handleChange}
              style={{ width: '25%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
            <input
              name="phone"
              type="tel"
              placeholder="1234567890"
              value={data.phone}
              onChange={handleChange}
              style={{ width: '75%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </div> */}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Password</label>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '5px' }}
          />
          <i
            onClick={togglePasswordVisiblity}
            className={showPassword ? "fa fa-eye" : "fa fa-eye-slash"}
            style={{ position: 'absolute', top: '38px', right: '10px', cursor: 'pointer', color: '#4c6ef5' }}
          />
        </div>

        {error && <div style={{ color: '#e74c3c', marginBottom: '20px' }}>{error}</div>}

        <button
          onClick={login}
          style={{
            width: '100%', padding: '12px', backgroundColor: '#4c6ef5',
            color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}
        >
          Login
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#777' }}>
          © 2024–{new Date().getFullYear()} All WebGen, Inc.
        </div>
      </div>
    </section>
  );
};

export default Login;
