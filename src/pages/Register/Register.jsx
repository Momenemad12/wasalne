import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  MapPin,
  Car,
  Users,
  Mars,
  Venus,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import "./Register.css";

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

const menofiaLocations = {
  "شبين الكوم": [
    "شبين الكوم",
    "مليج",
    "البتانون",
    "بخاتي",
    "شبرا",
    "باص",
    "الماي",
    "شنوان",
    "إصطباري",
    "المصيلحة",
  ],

  منوف: [
    "منوف",
    "سرس الليان",
    "زاوية رزين",
    "برهيم",
    "فيشا الكبرى",
    "طملاي",
    "سدود",
    "الحامول",
    "بره العجوز",
    "كفر السنابسة",
  ],

  أشمون: [
    "أشمون",
    "شما",
    "سبك الأحد",
    "سمادون",
    "سنتريس",
    "الفرعونيه",
    "كفر الفرعونيه",
    "شنشور",
    "دروة",
    "رملة الأنجب",
    "ساقية أبو شعرة",
    "طليا",
    "البرانية",
    "جريس",
    "شطانوف",
    "قورص",
  ],

  قويسنا: [
    "قويسنا",
    "ميت برة",
    "بجيرم",
    "مصطاي",
    "أم خنان",
    "كفر ميت العبسي",
    "عرب الرمل",
    "شمنديل",
    "إبنهس",
    "طوخ طنبشا",
  ],

  الباجور: [
    "الباجور",
    "اسطنها",
    "مشيرف",
    "ميت عفيف",
    "بهناي",
    "كفر الخضرة",
    "قلتى الكبرى",
    "بي العرب",
    "تلوانة",
    "كفر الباجور",
    "فيشا الصغرى",
    "جروان",
    "مناوهلة",
    "سبك الضحاك",
    "الكتاميه",
  ],

  تلا: [
    "تلا",
    "طبلوها",
    "زرقان",
    "كفر السكرية",
    "صفط جدام",
    "بابل",
    "كفر العرب",
    "كفر ربيع",
    "كفر الشرفا",
    "ميت أبو الكوم",
  ],

  "بركة السبع": [
    "بركة السبع",
    "طوخ طنبشا",
    "جنزور",
    "هورهين",
    "كفر هلال",
    "شنتنا الحجر",
    "ميت فارس",
    "الروضة",
    "أبو مشهور",
  ],

  الشهداء: [
    "الشهداء",
    "زاوية البقلي",
    "دراجيل",
    "ساحل الجوابر",
    "دنشواي",
    "زاوية الناعورة",
    "كفر عشما",
  ],

  السادات: ["السادات", "الخطاطبة", "كفر داود"],
};

function getAdminRole(email) {
  const normalizedEmail = email.trim().toLowerCase();

  return ADMIN_ROLES.find((admin) => normalizedEmail.endsWith(admin.suffix));
}

function normalizePhone(phoneNumber) {
  return String(phoneNumber || "").replace(/\D/g, "");
}

function isValidEgyptPhone(phoneNumber) {
  const cleanPhone = normalizePhone(phoneNumber);

  return cleanPhone.length === 11 && cleanPhone.startsWith("01");
}

function isValidPasswordLength(passwordValue) {
  return passwordValue.length >= 6 && passwordValue.length <= 10;
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

function saveRegisteredUser(userData) {
  const registeredUsers = getRegisteredUsers();

  const filteredUsers = registeredUsers.filter(
    (user) => user.email !== userData.email,
  );

  const updatedUsers = [...filteredUsers, userData];

  localStorage.setItem(
    "wasalne_registered_users",
    JSON.stringify(updatedUsers),
  );
}

function prepareRedirectAfterLogin(role) {
  const savedRedirect = localStorage.getItem("wasalne_after_auth_redirect");

  if (savedRedirect === "/messages") {
    localStorage.setItem("wasalne_after_auth_redirect", "/messages");
    return;
  }

  if (role === "driver") {
    localStorage.setItem("wasalne_after_auth_redirect", "/driver-register");
    localStorage.setItem("wasalne_pending_role", "driver");
    return;
  }

  localStorage.removeItem("wasalne_after_auth_redirect");
  localStorage.removeItem("wasalne_pending_role");
}

function Register() {
  const navigate = useNavigate();

  const pendingRole = localStorage.getItem("wasalne_pending_role");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [center, setCenter] = useState("");
  const [village, setVillage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedAccountRole, setSelectedAccountRole] = useState(
    pendingRole === "driver" ? "driver" : "rider",
  );

  const centers = Object.keys(menofiaLocations);

  const normalizedEmail = email.trim().toLowerCase();
  const adminRole = getAdminRole(normalizedEmail);
  const isAdminEmail = Boolean(adminRole);

  const handleCenterChange = (e) => {
    setCenter(e.target.value);
    setVillage("");
  };

  const goToLoginAfterRegister = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");
    localStorage.removeItem("wasalne_admin_preview_driver");
    localStorage.removeItem("wasalne_admin_preview_rider");

    navigate("/login");
  };

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setEmail("");
    setGender("");
    setCenter("");
    setVillage("");
    setPassword("");
    setConfirmPassword("");
    setSelectedAccountRole(pendingRole === "driver" ? "driver" : "rider");
  };

  const validateBasicData = () => {
    if (!fullName.trim()) {
      alert("من فضلك اكتب الاسم بالكامل");
      return false;
    }

    if (!phone.trim()) {
      alert("من فضلك اكتب رقم الهاتف");
      return false;
    }

    if (!isValidEgyptPhone(phone)) {
      alert("رقم الهاتف لازم يبدأ بـ 01 ويكون 11 رقم بالظبط");
      return false;
    }

    if (!email.trim()) {
      alert("من فضلك اكتب البريد الإلكتروني");
      return false;
    }

    if (!isValidPasswordLength(password)) {
      alert("كلمة المرور لازم تكون من 6 إلى 10 حروف أو أرقام");
      return false;
    }

    if (password !== confirmPassword) {
      alert("كلمة المرور وتأكيد كلمة المرور غير متطابقين");
      return false;
    }

    return true;
  };

  const validateNormalUserData = () => {
    if (!gender) {
      alert("من فضلك اختار النوع: رجل أو امرأة");
      return false;
    }

    if (!center) {
      alert("من فضلك اختار المركز");
      return false;
    }

    if (!village) {
      alert("من فضلك اختار القرية");
      return false;
    }

    return true;
  };

  const saveNormalUser = (role) => {
    const userData = {
      name: fullName.trim(),
      phone: normalizePhone(phone),
      email: normalizedEmail,
      gender,
      center,
      village,
      role,
      password,
      createdAt: new Date().toLocaleString("ar-EG"),
    };

    saveRegisteredUser(userData);
    prepareRedirectAfterLogin(role);

    alert(
      role === "driver"
        ? "تم إنشاء حساب السائق بنجاح، سجل دخولك الآن"
        : "تم إنشاء حساب الراكب بنجاح، سجل دخولك الآن",
    );

    resetForm();
    goToLoginAfterRegister();
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (!validateBasicData()) {
      return;
    }

    if (adminRole) {
      const adminData = {
        name: fullName.trim() || adminRole.name,
        phone: normalizePhone(phone),
        email: normalizedEmail,
        role: adminRole.role,
        title: adminRole.title,
        description: adminRole.description,
        redirectTo: adminRole.redirectTo,
        password,
        createdAt: new Date().toLocaleString("ar-EG"),
      };

      saveRegisteredUser(adminData);

      alert(`تم إنشاء حساب ${adminRole.title} بنجاح، سجل دخولك الآن`);
      resetForm();
      goToLoginAfterRegister();
      return;
    }

    if (!validateNormalUserData()) {
      return;
    }

    if (pendingRole === "driver") {
      saveNormalUser("driver");
      return;
    }

    setShowRoleModal(true);
  };

  const confirmSelectedRole = () => {
    saveNormalUser(selectedAccountRole);
    setShowRoleModal(false);
  };

  return (
    <section className="register-page" dir="rtl">
      <div className="register-card">
        <div className="register-brand">
          <div className="register-icon">
            {isAdminEmail ? <ShieldCheck size={36} /> : <MapPin size={36} />}
          </div>

          <h1>Wasalne</h1>

          <p>
            {isAdminEmail
              ? `${adminRole.title} - ${adminRole.description}`
              : "أنشئ حسابك وابدأ التنقل بسهولة"}
          </p>
        </div>

        <div className="register-header">
          <h2>
            {isAdminEmail ? `إنشاء حساب ${adminRole.title}` : "إنشاء حساب جديد"}
          </h2>

          <p>
            {isAdminEmail
              ? `بعد التسجيل ستنتقل لتسجيل الدخول، ثم يتم تحويلك إلى: ${adminRole.redirectTo}`
              : pendingRole === "driver"
                ? "أنت الآن تنشئ حساب سائق، وبعد التسجيل ستذهب لتسجيل الدخول."
                : "اكتب بياناتك الأساسية للمتابعة"}
          </p>
        </div>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="form-row">
            <div className="input-group">
              <label>الاسم بالكامل</label>

              <div className="input-box">
                <User size={20} />

                <input
                  type="text"
                  placeholder="اكتب اسمك"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>رقم الهاتف</label>

              <div className="input-box">
                <Phone size={20} />

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength="11"
                  placeholder="01xxxxxxxxx"
                  required
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                />
              </div>
            </div>
          </div>

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
                تم التعرف على صلاحية: {adminRole.title}. بعد التسجيل ستسجل
                الدخول كـ {adminRole.role}.
              </p>
            )}
          </div>

          {!isAdminEmail && (
            <>
              <div className="input-group">
                <label>المحافظة</label>

                <div className="input-box">
                  <MapPin size={20} />
                  <input type="text" value="المنوفية" readOnly />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>المركز</label>

                  <div className="input-box select-box">
                    <MapPin size={20} />

                    <select
                      value={center}
                      onChange={handleCenterChange}
                      required={!isAdminEmail}
                    >
                      <option value="">اختر المركز</option>

                      {centers.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>القرية</label>

                  <div className="input-box select-box">
                    <MapPin size={20} />

                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      required={!isAdminEmail}
                      disabled={!center}
                    >
                      <option value="">
                        {center ? "اختر القرية" : "اختر المركز أولًا"}
                      </option>

                      {center &&
                        menofiaLocations[center].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label>النوع</label>

                <div className="gender-options">
                  <button
                    type="button"
                    className={`gender-option ${
                      gender === "male" ? "active" : ""
                    }`}
                    onClick={() => setGender("male")}
                  >
                    <Mars size={22} />
                    <span>رجل</span>
                  </button>

                  <button
                    type="button"
                    className={`gender-option ${
                      gender === "female" ? "active" : ""
                    }`}
                    onClick={() => setGender("female")}
                  >
                    <Venus size={22} />
                    <span>امرأة</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label>كلمة المرور</label>

            <div className="input-box">
              <Lock size={20} />

              <input
                type="password"
                placeholder="من 6 إلى 10 حروف أو أرقام"
                required
                minLength="6"
                maxLength="10"
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 10))}
              />
            </div>
          </div>

          <div className="input-group">
            <label>تأكيد كلمة المرور</label>

            <div className="input-box">
              <Lock size={20} />

              <input
                type="password"
                placeholder="أعد كتابة كلمة المرور"
                required
                minLength="6"
                maxLength="10"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value.slice(0, 10))
                }
              />
            </div>

            <small className="input-hint">
              أعد كتابة نفس كلمة المرور من 6 إلى 10 حروف أو أرقام
            </small>
          </div>

          {!isAdminEmail ? (
            <div className="role-box">
              <div className="role-title">
                <Users size={22} />
                <span>
                  {pendingRole === "driver"
                    ? "سيتم إنشاء حسابك كسائق مباشرة"
                    : "بعد الضغط على إنشاء الحساب هتختار نوع حسابك"}
                </span>
              </div>

              <div className="role-items">
                <div className="role-item">
                  <User size={24} />
                  <strong>راكب</strong>
                  <p>تشوف السائقين المتاحين وتتواصل معاهم</p>
                </div>

                <div className="role-item">
                  <Car size={24} />
                  <strong>سائق</strong>
                  <p>تسجل حالتك وتستقبل رسائل الركاب</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="role-box">
              <div className="role-title">
                <ShieldCheck size={22} />
                <span>صلاحيات الإدارة</span>
              </div>

              <div className="role-items">
                <div className="role-item">
                  <ShieldCheck size={24} />
                  <strong>{adminRole.title}</strong>
                  <p>{adminRole.description}</p>
                </div>
              </div>
            </div>
          )}

          <button className="register-btn" type="submit">
            {isAdminEmail ? `إنشاء حساب ${adminRole.title}` : "إنشاء الحساب"}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="register-footer">
          <p>
            لديك حساب بالفعل؟
            <Link to="/login"> تسجيل الدخول</Link>
          </p>
        </div>
      </div>

      {showRoleModal && (
        <div className="account-role-modal-overlay">
          <div className="account-role-modal">
            <button
              type="button"
              className="account-role-close"
              onClick={() => setShowRoleModal(false)}
            >
              <X size={21} />
            </button>

            <div className="account-role-modal-head">
              <div className="account-role-icon">
                <Sparkles size={32} />
              </div>

              <span>اختيار نوع الحساب</span>

              <h2>هتستخدم وصلني كإيه؟</h2>

              <p>
                اختار نوع حسابك بدقة، عشان نفتحلك الصفحة المناسبة بعد تسجيل
                الدخول.
              </p>
            </div>

            <div className="account-role-options">
              <button
                type="button"
                className={`account-role-option ${
                  selectedAccountRole === "rider" ? "active" : ""
                }`}
                onClick={() => setSelectedAccountRole("rider")}
              >
                <div className="account-role-option-icon rider">
                  <User size={32} />
                </div>

                <div>
                  <strong>راكب</strong>
                  <p>
                    أطلب مشوار، شوف السائقين الأقرب ليك، واتواصل معاهم بسهولة.
                  </p>
                </div>

                <span className="account-role-check">
                  <CheckCircle2 size={22} />
                </span>
              </button>

              <button
                type="button"
                className={`account-role-option ${
                  selectedAccountRole === "driver" ? "active" : ""
                }`}
                onClick={() => setSelectedAccountRole("driver")}
              >
                <div className="account-role-option-icon driver">
                  <Car size={32} />
                </div>

                <div>
                  <strong>سائق</strong>
                  <p>استقبل طلبات الركاب، تابع أرباحك، وادفع عمولة المنصة.</p>
                </div>

                <span className="account-role-check">
                  <CheckCircle2 size={22} />
                </span>
              </button>
            </div>

            <div className="account-role-summary">
              <ShieldCheck size={18} />
              <span>
                سيتم إنشاء حسابك كـ{" "}
                <strong>
                  {selectedAccountRole === "driver" ? "سائق" : "راكب"}
                </strong>
              </span>
            </div>

            <div className="account-role-actions">
              <button
                type="button"
                className="account-role-confirm"
                onClick={confirmSelectedRole}
              >
                تأكيد وإنشاء الحساب
                <ArrowRight size={19} />
              </button>

              <button
                type="button"
                className="account-role-cancel"
                onClick={() => setShowRoleModal(false)}
              >
                رجوع للتعديل
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Register;
