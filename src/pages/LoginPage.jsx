import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import { useAuth } from "../context/Auth";

import "./LoginPage.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "";

// ---- Themed SweetAlert2 helpers (brand colors, consistent with the rest of the app) ----
const swalSuccess = (title, text) =>
  Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1500,
    showConfirmButton: false,
    customClass: { popup: "swal-vector-popup" },
  });

const swalError = (title, text) =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "var(--accent)",
    customClass: { popup: "swal-vector-popup" },
  });

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
      });

      if (response.data.success) {
        login({
          token: response.data.token,
          role: response.data.role || "user",
          name: response.data.name,
          email,
          userId: response.data.userId,
        });
        await swalSuccess("Welcome", `Hello ${response.data.name}`);
        navigate("/dashboard");
      } else {
        // Covers a 200 response that still reports failure (e.g. wrong
        // credentials returned as { success: false, message: "..." }
        // instead of a non-2xx status).
        await swalError(
          "Login Failed",
          response.data.message || "Unable to login. Please try again."
        );
      }
    } catch (err) {
      await swalError(
        "Login Failed",
        err.response?.data?.message || "Unable to login. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">

      {/* Background Blur Shapes */}

      <div className="bg-circle circle1"></div>
      <div className="bg-circle circle2"></div>
      <div className="bg-circle circle3"></div>

      <div className="login-shell">

        {/* ===========================
            LEFT BRAND PANEL
        ============================ */}

        <section className="login-brand-panel">

          <div className="brand-top">

            <h1>Vector Application</h1>

            <p>
              Production &amp; Sales Control Portal
            </p>

          </div>

        </section>

        {/* ===========================
             LOGIN CARD
        ============================ */}

        <section className="login-card">

          <div className="login-header">

            <h2>welcome !</h2>

          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* EMAIL */}

            <div className="field">

              <label>Email Address</label>

              <div className="input-wrap">

                <Mail
                  size={18}
                  className="input-icon"
                />

                <input
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="field">

              <label>Password</label>

              <div className="input-wrap">

                <Lock
                  size={18}
                  className="input-icon"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* REMEMBER */}

            <div className="login-options">

              <label className="remember">

                <input type="checkbox" />

                <span>

                  Remember Me

                </span>

              </label>

              <Link
                to="/forgot-password"
                className="forgot-link"
              >

                Forgot Password?

              </Link>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >

              {submitting
                ? "Signing In..."
                : "Sign In"}

            </button>

           </form>

        </section>

      </div>

    </main>
  );
}

export default LoginPage;
