import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Phone,
  Mail,
  MapPinned,
  WalletCards,
  History,
  Bell,
  CheckCircle2,
  Activity,
  Edit3,
  Save,
  Lock,
  KeyRound,
  LogOut,
  ShieldCheck,
  XCircle,
  Route,
  Car,
  Clock3,
} from "lucide-react";

import "./RiderDashboardDetails.css";

const logoPath = `${import.meta.env.BASE_URL}logo-wasalne.png`;

const defaultRiderUser = {
  name: "راكب وصلني",
  phone: "01000000000",
  email: "rider@wasalne.com",
  role: "rider",
  center: "شبين الكوم",
  village: "شبين الكوم",
  gender: "male",
  password: "123456",
};

const initialRiderTrips = [
  {
    id: 1,
    driverName: "أحمد سالم",
    route: "شبين الكوم → قويسنا",
    vehicle: "توك توك",
    amount: 85,
    status: "مكتملة",
    date: "اليوم - 10:20 ص",
  },
  {
    id: 2,
    driverName: "محمد علي",
    route: "منوف → شبين الكوم",
    vehicle: "موتوسيكل",
    amount: 55,
    status: "مكتملة",
    date: "أمس - 8:45 م",
  },
  {
    id: 3,
    driverName: "سارة حسن",
    route: "كفر المصيلحة → بخاتي",
    vehicle: "توك توك",
    amount: 40,
    status: "قيد التنفيذ",
    date: "منذ يومين",
  },
];

function getCurrentUser() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) return defaultRiderUser;

  try {
    return {
      ...defaultRiderUser,
      ...JSON.parse(savedUser),
    };
  } catch {
    return defaultRiderUser;
  }
}

function getRegisteredUsers() {
  const savedUsers = localStorage.getItem("wasalne_registered_users");

  if (!savedUsers) return [];

  try {
    const users = JSON.parse(savedUsers);
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function updateStoredUser(updatedUser) {
  localStorage.setItem("wasalne_current_user", JSON.stringify(updatedUser));
  localStorage.setItem("wasalne_user_role", updatedUser.role || "rider");

  const registeredUsers = getRegisteredUsers();

  if (!updatedUser.email) return;

  const updatedRegisteredUsers = registeredUsers.map((user) =>
    user.email === updatedUser.email ? { ...user, ...updatedUser } : user,
  );

  const exists = updatedRegisteredUsers.some(
    (user) => user.email === updatedUser.email,
  );

  localStorage.setItem(
    "wasalne_registered_users",
    JSON.stringify(
      exists
        ? updatedRegisteredUsers
        : [...updatedRegisteredUsers, updatedUser],
    ),
  );
}

function getStoredRiderTrips() {
  const savedTrips = localStorage.getItem("wasalne_rider_trips");

  if (!savedTrips) return initialRiderTrips;

  try {
    const trips = JSON.parse(savedTrips);
    return Array.isArray(trips) && trips.length > 0 ? trips : initialRiderTrips;
  } catch {
    return initialRiderTrips;
  }
}

function getStoredRideRequests() {
  const savedRequests = localStorage.getItem("wasalne_rider_requests");

  if (!savedRequests) return [];

  try {
    const requests = JSON.parse(savedRequests);
    return Array.isArray(requests) ? requests : [];
  } catch {
    return [];
  }
}

function RiderDashboardDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPreviewFromUrl =
    new URLSearchParams(location.search).get("preview") === "admin";

  const isAdminPreview =
    isPreviewFromUrl ||
    localStorage.getItem("wasalne_admin_preview_rider") === "true";

  const riderDashboardPath = isAdminPreview
    ? "/rider-dashboard?preview=admin"
    : "/rider-dashboard";

  const homePath = isAdminPreview ? "/admin-dashboard" : "/home";

  const [riderProfile, setRiderProfile] = useState(getCurrentUser);
  const [profileForm, setProfileForm] = useState(getCurrentUser);
  const [riderTrips] = useState(getStoredRiderTrips);
  const [rideRequests] = useState(getStoredRideRequests);

  useEffect(() => {
    if (isPreviewFromUrl) {
      localStorage.setItem("wasalne_admin_preview_rider", "true");
    }
  }, [isPreviewFromUrl]);

  const goBackToAdminDashboard = () => {
    localStorage.removeItem("wasalne_admin_preview_rider");
    navigate("/admin-dashboard");
  };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const completedTrips = riderTrips.filter((trip) => trip.status === "مكتملة");

  const totalSpent = completedTrips.reduce(
    (total, trip) => total + Number(trip.amount || 0),
    0,
  );

  const activeTrips = riderTrips.filter((trip) => trip.status !== "مكتملة");
  const lastRequest = rideRequests[0] || null;

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveProfile = () => {
    if (!profileForm.name.trim()) {
      alert("من فضلك اكتب اسم الراكب");
      return;
    }

    if (!profileForm.phone.trim()) {
      alert("من فضلك اكتب رقم الهاتف");
      return;
    }

    const updatedProfile = {
      ...riderProfile,
      ...profileForm,
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      email: profileForm.email?.trim() || riderProfile.email,
      center: profileForm.center?.trim() || "غير محدد",
      village: profileForm.village?.trim() || "غير محدد",
      role: riderProfile.role || "rider",
    };

    setRiderProfile(updatedProfile);
    setProfileForm(updatedProfile);
    updateStoredUser(updatedProfile);

    alert("تم حفظ بيانات البروفايل بنجاح");
  };

  const changePassword = () => {
    if (!passwordForm.currentPassword.trim()) {
      alert("اكتب كلمة المرور الحالية");
      return;
    }

    if (
      riderProfile.password &&
      passwordForm.currentPassword !== riderProfile.password
    ) {
      alert("كلمة المرور الحالية غير صحيحة");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("كلمة المرور الجديدة لازم تكون 6 أحرف على الأقل");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    const updatedProfile = {
      ...riderProfile,
      password: passwordForm.newPassword,
      passwordUpdatedAt: new Date().toLocaleString("ar-EG"),
    };

    setRiderProfile(updatedProfile);
    setProfileForm(updatedProfile);
    updateStoredUser(updatedProfile);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    alert("تم تغيير كلمة المرور بنجاح");
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");

    if (!confirmLogout) return;

    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");
    localStorage.removeItem("wasalne_after_auth_redirect");
    localStorage.removeItem("wasalne_pending_role");
    localStorage.removeItem("wasalne_admin_preview_rider");
    localStorage.removeItem("wasalne_admin_preview_driver");

    alert("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  return (
    <main className="rider-details-page" dir="rtl">
      <div className="details-glow details-glow-1"></div>
      <div className="details-glow details-glow-2"></div>

      <header className="details-navbar">
        <Link to={riderDashboardPath} className="details-logo">
          <div className="details-logo-box">
            <img src={logoPath} alt="Wasalne Logo" />
          </div>

          <div>
            <h2>Wasalne</h2>
            <p>
              {isAdminPreview
                ? "معاينة الأدمن لتفاصيل الراكب"
                : "تفاصيل حساب الراكب"}
            </p>
          </div>
        </Link>

        <nav className="details-nav-links">
          <Link to={homePath}>الرئيسية</Link>
          <Link to={riderDashboardPath}>طلب مشوار</Link>
        </nav>

        <div className="details-nav-actions">
          {isAdminPreview && (
            <button
              type="button"
              className="details-back-btn"
              onClick={goBackToAdminDashboard}
            >
              <ShieldCheck size={18} />
              رجوع للأدمن
            </button>
          )}

          <Link to={riderDashboardPath} className="details-back-btn">
            <ArrowRight size={18} />
            رجوع للداشبورد
          </Link>

          <button
            type="button"
            className="details-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            خروج
          </button>
        </div>
      </header>

      <section className="details-hero">
        <div className="details-avatar">
          {riderProfile.name?.charAt(0) || "ر"}
        </div>

        <div className="details-hero-content">
          <span className="verified-badge">
            <ShieldCheck size={16} />
            {isAdminPreview ? "معاينة أدمن" : "حساب راكب موثق"}
          </span>

          <h1>{riderProfile.name}</h1>
          <p>{riderProfile.email}</p>

          <div className="details-tags">
            <strong>
              <Phone size={15} />
              {riderProfile.phone}
            </strong>

            <strong>
              <MapPinned size={15} />
              {riderProfile.center} - {riderProfile.village}
            </strong>

            <strong>
              <Activity size={15} />
              {completedTrips.length} رحلة مكتملة
            </strong>
          </div>
        </div>
      </section>

      <section className="details-summary-grid">
        <div className="summary-card">
          <WalletCards size={25} />
          <span>إجمالي المصروف</span>
          <strong>{totalSpent} ج</strong>
        </div>

        <div className="summary-card">
          <History size={25} />
          <span>عدد الرحلات</span>
          <strong>{riderTrips.length}</strong>
        </div>

        <div className="summary-card">
          <CheckCircle2 size={25} />
          <span>رحلات مكتملة</span>
          <strong>{completedTrips.length}</strong>
        </div>

        <div className="summary-card">
          <Bell size={25} />
          <span>آخر طلب</span>
          <strong>{lastRequest ? lastRequest.status : "لا يوجد"}</strong>
        </div>
      </section>

      <section className="details-main-grid">
        <div className="details-panel">
          <div className="panel-head">
            <div>
              <span>تعديل الحساب</span>
              <h3>بيانات الراكب</h3>
            </div>
            <Edit3 size={22} />
          </div>

          <div className="details-form">
            <label>
              <span>الاسم</span>
              <input
                type="text"
                value={profileForm.name || ""}
                onChange={(e) => handleProfileChange("name", e.target.value)}
              />
            </label>

            <label>
              <span>رقم الهاتف</span>
              <input
                type="tel"
                value={profileForm.phone || ""}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
              />
            </label>

            <label>
              <span>البريد الإلكتروني</span>
              <input
                type="email"
                value={profileForm.email || ""}
                onChange={(e) => handleProfileChange("email", e.target.value)}
              />
            </label>

            <label>
              <span>المركز</span>
              <input
                type="text"
                value={profileForm.center || ""}
                onChange={(e) => handleProfileChange("center", e.target.value)}
              />
            </label>

            <label>
              <span>القرية</span>
              <input
                type="text"
                value={profileForm.village || ""}
                onChange={(e) => handleProfileChange("village", e.target.value)}
              />
            </label>

            <button type="button" onClick={saveProfile}>
              <Save size={18} />
              حفظ بيانات البروفايل
            </button>
          </div>
        </div>

        <div className="details-panel">
          <div className="panel-head">
            <div>
              <span>الأمان</span>
              <h3>تغيير كلمة المرور</h3>
            </div>
            <KeyRound size={22} />
          </div>

          <div className="details-form">
            <label>
              <span>كلمة المرور الحالية</span>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>كلمة المرور الجديدة</span>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span>تأكيد كلمة المرور الجديدة</span>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
              />
            </label>

            <button
              type="button"
              className="password-btn"
              onClick={changePassword}
            >
              <Lock size={18} />
              تغيير كلمة المرور
            </button>
          </div>
        </div>
      </section>

      <section className="details-history-section">
        <div className="section-title">
          <span>سجل الحساب</span>
          <h2>الرحلات والطلبات</h2>
        </div>

        <div className="details-history-grid">
          <div className="history-card">
            <div className="history-head">
              <Route size={22} />
              <h3>آخر الرحلات</h3>
            </div>

            <div className="history-list">
              {riderTrips.map((trip) => (
                <div className="history-item" key={trip.id}>
                  <div>
                    <strong>{trip.driverName}</strong>
                    <span>{trip.route}</span>
                    <small>
                      <Car size={13} />
                      {trip.vehicle} - {trip.date}
                    </small>
                  </div>

                  <div className="history-side">
                    <b>{trip.amount} ج</b>
                    <em
                      className={
                        trip.status === "مكتملة"
                          ? "history-status complete"
                          : "history-status progress"
                      }
                    >
                      {trip.status}
                    </em>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="history-card">
            <div className="history-head">
              <Bell size={22} />
              <h3>طلبات المشاوير</h3>
            </div>

            <div className="history-list">
              {rideRequests.length > 0 ? (
                rideRequests.map((request) => (
                  <div className="history-item" key={request.id}>
                    <div>
                      <strong>{request.driverName}</strong>
                      <span>
                        {request.from} → {request.to}
                      </span>
                      <small>
                        <Clock3 size={13} />
                        {request.createdAt}
                      </small>
                    </div>

                    <div className="history-side">
                      <b>{request.price}</b>
                      <em className="history-status progress">
                        {request.status}
                      </em>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Mail size={32} />
                  <h4>لا توجد طلبات حتى الآن</h4>
                  <p>بعد إرسال طلب مشوار من الداشبورد سيظهر هنا.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {activeTrips.length > 0 && (
        <section className="active-trips-section">
          <div>
            <Activity size={22} />
            <h3>رحلات قيد التنفيذ</h3>
            <p>عندك {activeTrips.length} رحلة أو طلب لم يكتمل بعد.</p>
          </div>
        </section>
      )}

      <section className="details-danger-zone">
        <div>
          <XCircle size={22} />
          <h3>منطقة الحساب</h3>
          <p>يمكنك تسجيل الخروج من الحساب الحالي والرجوع لصفحة الدخول.</p>
        </div>

        <button type="button" onClick={handleLogout}>
          <LogOut size={18} />
          تسجيل خروج
        </button>
      </section>
    </main>
  );
}

export default RiderDashboardDetails;
