import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
} from "lucide-react";

import "./LoginPage.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "";

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password Mismatch",
        text: "Passwords do not match.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, {
        name,
        email,
        password,
      });

      if (response.data.success) {
        await Swal.fire({
          icon: "success",
          title: "Account Created",
          text: "You can now sign in.",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "var(--danger)"
        });

        navigate("/login");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text:
          err.response?.data?.message ||
          "Unable to create account. Please try again.",

       confirmButtonColor: "var(--danger)"
      });
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
             SIGNUP CARD
        ============================ */}

        <section className="login-card">

          <div className="login-header">

            <h2>create account !</h2>

          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="field">

              <label>Full Name</label>

              <div className="input-wrap">

                <User
                  size={18}
                  className="input-icon"
                />

                <input
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />

              </div>

            </div>

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
                  autoComplete="new-password"
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

            {/* CONFIRM PASSWORD */}

            <div className="field">

              <label>Confirm Password</label>

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
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                />

              </div>

            </div>

            {/* BUTTON */}

            <button
              type="submit"
              className="login-button"
              disabled={submitting}
            >

              {submitting
                ? "Creating Account..."
                : "Sign Up"}

            </button>

            <div className="register-text">

              Already have an account?

              <Link to="/login">

                Sign In

              </Link>

            </div>

          </form>

        </section>

      </div>

    </main>
  );
}

export default SignupPage;
