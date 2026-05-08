import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, MapPin, Eye, ShieldCheck, XCircle, Send, Phone } from "lucide-react";
import "./Login.css";

// super_admin
// الإيميل: superadmin@wasalne.com
// يفتح: /admin-dashboard
// يشوف ويعدل كل حاجة

// driver_reviewer
// الإيميل: driverreviewer@wasalne.com
// يفتح: /admin-driver-requests
// يراجع طلبات السائقين فقط

// support_manager
// الإيميل: support@wasalne.com
// يفتح: /admin-support-messages
// يشوف الرسائل والدعم فقط

// pricing_manager
// الإيميل: pricing@wasalne.com
// يفتح: /pricing-settings
// يعدل التسعير والعمولة فقط

// finance_admin
// الإيميل: finance@wasalne.com
// يفتح: /admin-driver-payments
// يراجع تحويلات السائقين فقط

const ADMIN_ROLES = [
  {
    suffix: "superadmin@wasalne.com",
    role: "super_admin",
    name: "Super Admin",
    title: "السوبر أدمن",
    description: "يشوف ويعدل كل حاجة",
    redirectTo: "/admin-dashboard",
  },
  {
    suffix: "driverreviewer@wasalne.com",
    role: "driver_reviewer",
    name: "Driver Reviewer",
    title: "مراجع السائقين",
    description: "يراجع طلبات السائقين فقط",
    redirectTo: "/admin-driver-requests",
  },
  {
    suffix: "support@wasalne.com",
    role: "support_manager",
    name: "Support Manager",
    title: "مسؤول الدعم",
    description: "يشوف الرسائل والدعم فقط",
    redirectTo: "/admin-support-messages",
  },
  {
    suffix: "pricing@wasalne.com",
    role: "pricing_manager",
    name: "Pricing Manager",
    title: "مسؤول التسعير",
    description: "يعدل التسعير والعمولة فقط",
    redirectTo: "/pricing-settings",
  },
  {
    suffix: "finance@wasalne.com",
    role: "finance_admin",
    name: "Finance Admin",
    title: "مسؤول التحويلات",
    description: "يراجع تحويلات السائقين فقط",
    redirectTo: "/admin-driver-payments",
  },
];

const allowedAfterAuthRoutes = [
  "/driver-register",
  "/messages",
  "/rider-dashboard",
  "/driver-dashboard",
  "/rider-dashboard-details",
  "/driver-dashboard-details",
];

function getAdminRole(email) {
  const normalizedEmail = email.trim().toLowerCase();

  return ADMIN_ROLES.find((admin) => normalizedEmail.endsWith(admin.suffix));
}

function getCurrentUser() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function getRegisteredUsers() {
  const savedUsers = localStorage.getItem("wasalne_registered_users");

  if (!savedUsers) {
    return [];
  }

  try {
    const parsedUsers = JSON.parse(savedUsers);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch {
    return [];
  }
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function findRegisteredUserByEmailOrPhone(value) {
  const cleanValue = value.trim().toLowerCase();
  const cleanPhone = normalizePhone(value);
  const registeredUsers = getRegisteredUsers();

  return (
    registeredUsers.find((user) => {
      const userEmail = String(user.email || "").trim().toLowerCase();
      const userPhone = normalizePhone(user.phone);

      return userEmail === cleanValue || (cleanPhone && userPhone === cleanPhone);
    }) || null
  );
}

function findRegisteredUser(email) {
  return findRegisteredUserByEmailOrPhone(email);
}

function getRedirectByRole(role) {
  if (role === "super_admin") {
    return "/admin-dashboard";
  }

  if (role === "driver_reviewer") {
    return "/admin-driver-requests";
  }

  if (role === "support_manager") {
    return "/admin-support-messages";
  }

  if (role === "pricing_manager") {
    return "/pricing-settings";
  }

  if (role === "finance_admin") {
    return "/admin-driver-payments";
  }

  if (role === "driver") {
    return "/driver-dashboard";
  }

  if (role === "rider") {
    return "/rider-dashboard";
  }

  return "/home";
}

function getSafeAfterAuthRedirect(role) {
  const savedRedirect = localStorage.getItem("wasalne_after_auth_redirect");

  if (!savedRedirect) {
    return null;
  }

  const isAllowed = allowedAfterAuthRoutes.some(
    (route) => savedRedirect === route || savedRedirect.startsWith(`${route}?`),
  );

  if (!isAllowed) {
    localStorage.removeItem("wasalne_after_auth_redirect");
    return null;
  }

  if (savedRedirect === "/driver-register") {
    if (role === "rider" || role === "super_admin") {
      return savedRedirect;
    }

    if (role === "driver") {
      return "/driver-dashboard";
    }

    return null;
  }

  if (savedRedirect === "/messages") {
    if (role === "rider" || role === "driver" || role === "super_admin") {
      return savedRedirect;
    }

    return null;
  }

  if (savedRedirect.includes("driver")) {
    if (role === "driver" || role === "super_admin") {
      return savedRedirect;
    }

    return null;
  }

  if (savedRedirect.includes("rider")) {
    if (role === "rider" || role === "super_admin") {
      return savedRedirect;
    }

    return null;
  }

  return savedRedirect;
}

function clearAfterAuthRedirect() {
  localStorage.removeItem("wasalne_after_auth_redirect");
  localStorage.removeItem("wasalne_pending_role");
}

function saveLoginUser(userData) {
  const loginData = {
    ...userData,
    loginAt: new Date().toLocaleString("ar-EG"),
  };

  localStorage.setItem("wasalne_current_user", JSON.stringify(loginData));
  localStorage.setItem("wasalne_user_role", loginData.role);

  return loginData;
}

function navigateAfterLogin(navigate, userData, fallbackPath) {
  const afterAuthRedirect = getSafeAfterAuthRedirect(userData.role);

  clearAfterAuthRedirect();

  navigate(
    afterAuthRedirect || fallbackPath || getRedirectByRole(userData.role),
  );
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPhone, setForgotPhone] = useState("");

  const normalizedEmail = email.trim().toLowerCase();
  const adminRole = getAdminRole(normalizedEmail);
  const isAdminEmail = Boolean(adminRole);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("من فضلك اكتب البريد الإلكتروني");
      return;
    }

    if (!password.trim()) {
      alert("من فضلك اكتب كلمة المرور");
      return;
    }

    localStorage.removeItem("wasalne_admin_preview_driver");
    localStorage.removeItem("wasalne_admin_preview_rider");

    const registeredUser = findRegisteredUser(normalizedEmail);

    if (registeredUser) {
      if (registeredUser.password && registeredUser.password !== password) {
        alert("كلمة المرور غير صحيحة");
        return;
      }

      const loginUser = saveLoginUser(registeredUser);
      navigateAfterLogin(
        navigate,
        loginUser,
        getRedirectByRole(loginUser.role),
      );
      return;
    }

    const currentUser = getCurrentUser();

    if (currentUser?.email === normalizedEmail) {
      if (currentUser.password && currentUser.password !== password) {
        alert("كلمة المرور غير صحيحة");
        return;
      }

      const loginUser = saveLoginUser(currentUser);
      navigateAfterLogin(
        navigate,
        loginUser,
        getRedirectByRole(loginUser.role),
      );
      return;
    }

    if (adminRole) {
      const adminData = {
        email: normalizedEmail,
        role: adminRole.role,
        name: normalizedEmail.split("@")[0] || adminRole.name,
        title: adminRole.title,
        description: adminRole.description,
        password,
        createdAt: new Date().toLocaleString("ar-EG"),
      };

      saveLoginUser(adminData);

      clearAfterAuthRedirect();

      navigate(adminRole.redirectTo);
      return;
    }

    alert("الحساب غير موجود، من فضلك اعمل إنشاء حساب الأول");
    navigate("/register");
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const cleanPhone = normalizePhone(forgotPhone);

    if (!cleanEmail && !cleanPhone) {
      alert("من فضلك اكتب البريد الإلكتروني أو رقم التليفون");
      return;
    }

    if (forgotPhone.trim() && cleanPhone.length !== 11) {
      alert("رقم التليفون لازم يكون 11 رقم");
      return;
    }

    const registeredUser =
      (cleanEmail && findRegisteredUserByEmailOrPhone(cleanEmail)) ||
      (cleanPhone && findRegisteredUserByEmailOrPhone(cleanPhone));

    const currentUser = getCurrentUser();
    const currentUserMatches =
      (cleanEmail && currentUser?.email?.toLowerCase() === cleanEmail) ||
      (cleanPhone && normalizePhone(currentUser?.phone) === cleanPhone);

    const adminAccount = cleanEmail ? getAdminRole(cleanEmail) : null;

    if (!registeredUser && !currentUserMatches && !adminAccount) {
      alert("الإيميل أو رقم التليفون غير مسجل عندنا، اعمل إنشاء حساب الأول");
      return;
    }

    alert(
      "تم تسجيل طلب استعادة كلمة المرور. عند تفعيل الباك إند هيتم إرسال كود أو رابط إعادة التعيين على الإيميل أو رقم التليفون.",
    );

    setShowForgotModal(false);
    setForgotEmail("");
    setForgotPhone("");
  };

  return (
    <section className="auth-page" dir="rtl">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-icon">
            {isAdminEmail ? <ShieldCheck size={34} /> : <MapPin size={34} />}
          </div>

          <h1>Wasalne</h1>

          <p>
            {isAdminEmail
              ? `${adminRole.title} - ${adminRole.description}`
              : "تنقّل بسهولة داخل قريتك"}
          </p>
        </div>

        <div className="auth-header">
          <h2>
            {isAdminEmail ? `تسجيل دخول ${adminRole.title}` : "تسجيل الدخول"}
          </h2>

          <p>
            {isAdminEmail
              ? `سيتم تحويلك مباشرة إلى الصفحة الخاصة بك: ${adminRole.redirectTo}`
              : "ادخل بياناتك للمتابعة إلى حسابك"}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>البريد الإلكتروني</label>

            <div className="input-box">
              <Mail size={20} />

              <input
                type="email"
                placeholder="example@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {isAdminEmail && (
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#0b6ff2",
                  fontWeight: "900",
                  fontSize: "13px",
                  lineHeight: "1.7",
                }}
              >
                تم التعرف على صلاحية: {adminRole.title}، وسيتم تحويلك للصفحة
                المناسبة بعد الدخول.
              </p>
            )}
          </div>

          <div className="input-group">
            <label>كلمة المرور</label>

            <div className="input-box">
              <Lock size={20} />

              <input
                type="password"
                placeholder="ادخل كلمة المرور"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Eye size={20} className="eye-icon" />
            </div>
          </div>

          <div className="auth-options">
            <label>
              <input type="checkbox" />
              تذكرني
            </label>

            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                setForgotEmail(email);
                setForgotPhone("");
                setShowForgotModal(true);
              }}
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <button className="auth-btn" type="submit">
            {isAdminEmail ? `دخول ${adminRole.title}` : "دخول"}
            <ArrowRight size={20} />
          </button>
        </form>

        {showForgotModal && (
          <div className="forgot-modal-overlay">
            <div className="forgot-modal-card">
              <button
                type="button"
                className="forgot-modal-close"
                onClick={() => setShowForgotModal(false)}
              >
                <XCircle size={22} />
              </button>

              <div className="forgot-modal-icon">
                <Lock size={34} />
              </div>

              <span>استعادة كلمة المرور</span>
              <h3>نسيت كلمة المرور؟</h3>
              <p>
                اكتب البريد الإلكتروني أو رقم التليفون في الخانة المناسبة،
                وسيتم تسجيل طلب إعادة تعيين كلمة المرور مؤقتًا لحد ما يتم ربط الباك إند.
              </p>

              <form onSubmit={handleForgotPassword}>
                <div className="forgot-input-box">
                  <Mail size={19} />

                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <div className="forgot-input-box">
                  <Phone size={19} />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength="11"
                    placeholder="01000000000"
                    value={forgotPhone}
                    onChange={(e) =>
                      setForgotPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                    }
                  />
                </div>

                <button type="submit" className="forgot-submit-btn">
                  إرسال طلب الاستعادة
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>
            ليس لديك حساب؟
            <Link to="/register"> إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
