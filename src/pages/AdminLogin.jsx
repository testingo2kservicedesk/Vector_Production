import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { ShieldCheck, ShieldPlus, Mail, Lock, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/Auth";

import "./AdminLogin.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const swalSuccess = (title, text) =>
  Swal.fire({
    icon: "success",
    title,
    text,
    timer: 1500,
    showConfirmButton: false,
    customClass: { popup: "swal-admin-popup" },
  });

const swalError = (title, text) =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "var(--accent)",
    customClass: { popup: "swal-admin-popup" },
  });

// Single file covering both:
//   - normal admin/coadmin sign-in
//   - one-time "create the first admin" setup, which self-disables the
//     instant an admin account exists (checked via /admin/bootstrap-status)
function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // "login" | "setup" | "register"  which form is currently showing.
  const [mode, setMode] = useState("login");
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [setupForm, setSetupForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    axios
      .get(`${API_BASE_URL}/admin/bootstrap-status`)
      .then((res) => {
        if (cancelled) return;
        const required = !!res.data?.setup_required;
        setSetupRequired(required);
        // If no admin exists yet, default straight into setup mode.
        if (required) setMode("setup");
      })
      .catch(() => {
        if (!cancelled) setSetupRequired(false);
      })
      .finally(() => {
        if (!cancelled) setCheckingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetupField = (field) => (e) =>
    setSetupForm((f) => ({ ...f, [field]: e.target.value }));

  const updateRegisterField = (field) => (e) =>
    setRegisterForm((f) => ({ ...f, [field]: e.target.value }));

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        email,
        password,
      });

      if (response.data.success) {
        login({
          token: response.data.token,
          role: response.data.role,
          name: response.data.name,
          email,
          userId: response.data.userId,
        });
        await swalSuccess("Welcome back", `Signed in as ${response.data.name}`);
        navigate("/dashboard");
      } else {
        await swalError(
          "Access Denied",
          response.data.message || "Unable to sign in. Please try again."
        );
      }
    } catch (err) {
      await swalError(
        "Access Denied",
        err.response?.data?.message || "Unable to sign in. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();

    if (setupForm.password !== setupForm.confirmPassword) {
      await swalError("Passwords don't match", "Please make sure both passwords are identical.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/bootstrap`, setupForm);

      if (response.data.success) {
        login({
          token: response.data.token,
          role: response.data.role,
          name: response.data.name,
          email: setupForm.email,
          userId: response.data.userId,
        });
        await swalSuccess("Admin account created", `Welcome, ${response.data.name}`);
        navigate("/dashboard");
      } else {
        // Most common case: someone else finished setup in the meantime.
        await swalError("Setup unavailable", response.data.message);
        setSetupRequired(false);
        setMode("login");
      }
    } catch (err) {
      await swalError(
        "Setup unavailable",
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      if (err.response?.status === 403) {
        setSetupRequired(false);
        setMode("login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      await swalError("Passwords don't match", "Please make sure both passwords are identical.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/register`, registerForm);

      if (response.data.success) {
        login({
          token: response.data.token,
          role: response.data.role,
          name: response.data.name,
          email: registerForm.email,
          userId: response.data.userId,
        });
        await swalSuccess("Admin registered", `Welcome, ${response.data.name}`);
        navigate("/dashboard");
      } else {
        await swalError("Registration failed", response.data.message);
      }
    } catch (err) {
      await swalError(
        "Registration failed",
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isSetupMode = mode === "setup";
  const isRegisterMode = mode === "register";

  return (
    <main className="admin-login-page">
      <div className="admin-bg-grid" />
      <div className="admin-bg-glow glow1" />
      <div className="admin-bg-glow glow2" />

      <section className="admin-login-card">
        <div className="admin-login-badge">
          {isSetupMode || isRegisterMode ? <ShieldPlus size={22} /> : <ShieldCheck size={22} />}
        </div>

        <div className="admin-login-header">
          <h1>{isSetupMode ? "First-Time Setup" : isRegisterMode ? "Register Admin" : "Admin Console"}</h1>
          <p>
            {isSetupMode
              ? "Create the initial Admin account"
              : isRegisterMode
              ? "Register a new Admin account"
              : "Vector "}
          </p>
        </div>

        {isSetupMode ? (
          <form className="admin-login-form" onSubmit={handleSetupSubmit}>
            <div className="admin-field">
              <label>Full Name</label>
              <div className="admin-input-wrap">
                <UserIcon size={17} className="admin-input-icon" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={setupForm.name}
                  onChange={updateSetupField("name")}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Admin Email</label>
              <div className="admin-input-wrap">
                <Mail size={17} className="admin-input-icon" />
                <input
                  type="email"
                  placeholder="admin@vectorindustries.com"
                  autoComplete="email"
                  value={setupForm.email}
                  onChange={updateSetupField("email")}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Password</label>
              <div className="admin-input-wrap">
                <Lock size={17} className="admin-input-icon" />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={setupForm.password}
                  onChange={updateSetupField("password")}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Confirm Password</label>
              <div className="admin-input-wrap">
                <Lock size={17} className="admin-input-icon" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={setupForm.confirmPassword}
                  onChange={updateSetupField("confirmPassword")}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button type="submit" className="admin-login-button" disabled={submitting}>
              {submitting ? "Creating..." : "Create Admin Account"}
            </button>

            <p className="admin-login-footnote">
              This only works once \u2014 it locks itself the moment an Admin
              account exists.
              <br />
              <button
                type="button"
                className="admin-inline-link"
                onClick={() => setMode("login")}
              >
                Already have an admin account? Sign in
              </button>
            </p>
          </form>
        ) : isRegisterMode ? (
          <form className="admin-login-form" onSubmit={handleRegisterSubmit}>
            <div className="admin-field">
              <label>Full Name</label>
              <div className="admin-input-wrap">
                <UserIcon size={17} className="admin-input-icon" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={registerForm.name}
                  onChange={updateRegisterField("name")}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Admin Email</label>
              <div className="admin-input-wrap">
                <Mail size={17} className="admin-input-icon" />
                <input
                  type="email"
                  placeholder="admin@vectorindustries.com"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={updateRegisterField("email")}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Password</label>
              <div className="admin-input-wrap">
                <Lock size={17} className="admin-input-icon" />
                <input
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={updateRegisterField("password")}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Confirm Password</label>
              <div className="admin-input-wrap">
                <Lock size={17} className="admin-input-icon" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={registerForm.confirmPassword}
                  onChange={updateRegisterField("confirmPassword")}
                  minLength={8}
                  required
                />
              </div>
            </div>

            <button type="submit" className="admin-login-button" disabled={submitting}>
              {submitting ? "Registering..." : "Register Admin Account"}
            </button>

            <p className="admin-login-footnote">
              <button
                type="button"
                className="admin-inline-link"
                onClick={() => setMode("login")}
              >
                Already have an admin account? Sign in
              </button>
            </p>
          </form>
        ) : (
          <form className="admin-login-form" onSubmit={handleLoginSubmit}>
            <div className="admin-field">
              <label>Admin Email</label>
              <div className="admin-input-wrap">
                <Mail size={17} className="admin-input-icon" />
                <input
                  type="email"
                  placeholder="admin@vectorindustries.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Password</label>
              <div className="admin-input-wrap">
                <Lock size={17} className="admin-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-button" disabled={submitting}>
              {submitting ? "Verifying..." : "Sign In to Console"}
            </button>

            {!checkingStatus && setupRequired ? (
              <p className="admin-login-footnote">
                No admin account exists yet.
                <br />
                <button
                  type="button"
                  className="admin-inline-link"
                  onClick={() => setMode("setup")}
                >
                  Create the first Admin account
                </button>
              </p>
            ) : (
              <>
                <p className="admin-login-footnote">
                  Access limited to Admin and Co-Admin accounts only.
                  <br />
                  <button
                    type="button"
                    className="admin-inline-link"
                    onClick={() => setMode("register")}
                  >
                    Register Here
                  </button>
                </p>
              </>
            )}
          </form>
        )}
      </section>
    </main>
  );
}

export default AdminLoginPage;
