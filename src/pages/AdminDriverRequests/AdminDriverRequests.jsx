import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  Users,
  Clock3,
  CheckCircle2,
  XCircle,
  Eye,
  Phone,
  MapPin,
  Car,
  CalendarDays,
  BadgeCheck,
  FileText,
  UserCheck,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
  BadgeInfo,
  Bike,
  Truck,
  Navigation,
  LogOut,
  Crown,
} from "lucide-react";

import { requestsData } from "../../data/requestsData";
import "./AdminDriverRequests.css";

function getStoredRequests() {
  const savedRequests = localStorage.getItem("wasalne_driver_requests");

  if (!savedRequests) {
    return requestsData || [];
  }

  try {
    const parsedRequests = JSON.parse(savedRequests);
    return parsedRequests.length > 0 ? parsedRequests : requestsData || [];
  } catch {
    return requestsData || [];
  }
}

function getCurrentAdmin() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return {
      name: "Driver Reviewer",
      email: "driverreviewer@wasalne.com",
      role: "driver_reviewer",
      title: "مراجع السائقين",
    };
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    return {
      name: parsedUser.name || "Driver Reviewer",
      email: parsedUser.email || "driverreviewer@wasalne.com",
      role: parsedUser.role || "driver_reviewer",
      title: parsedUser.title || "مراجع السائقين",
    };
  } catch {
    return {
      name: "Driver Reviewer",
      email: "driverreviewer@wasalne.com",
      role: "driver_reviewer",
      title: "مراجع السائقين",
    };
  }
}

function getStatusClass(status) {
  if (status === "تمت الموافقة") return "approved";
  if (status === "مرفوض") return "rejected";
  return "pending";
}

function getVehicleIcon(vehicle) {
  if (vehicle === "موتوسيكل") return <Bike size={18} />;

  if (vehicle === "نصف نقل" || vehicle === "عربية نص نقل") {
    return <Truck size={18} />;
  }

  return <Car size={18} />;
}

function AdminDriverRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState(getStoredRequests);
  const [currentAdmin] = useState(getCurrentAdmin);

  const [statusFilter, setStatusFilter] = useState("الكل");
  const [vehicleFilter, setVehicleFilter] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const vehicles = useMemo(() => {
    const allVehicles = requests
      .map((request) => request.vehicle)
      .filter(Boolean);

    return ["الكل", ...new Set(allVehicles)];
  }, [requests]);

  const updateRequestStatus = (id, status) => {
    const updatedRequests = requests.map((request) =>
      request.id === id ? { ...request, status } : request,
    );

    setRequests(updatedRequests);

    localStorage.setItem(
      "wasalne_driver_requests",
      JSON.stringify(updatedRequests),
    );
  };

  const resetRequests = () => {
    localStorage.removeItem("wasalne_driver_requests");
    setRequests(requestsData || []);
  };

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");

    navigate("/login");
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "الكل" ? true : request.status === statusFilter;

      const matchesVehicle =
        vehicleFilter === "الكل" ? true : request.vehicle === vehicleFilter;

      const searchText = `
        ${request.name || ""}
        ${request.phone || ""}
        ${request.vehicle || ""}
        ${request.center || ""}
        ${request.village || ""}
        ${request.plateNumber || ""}
        ${request.gender || ""}
        ${request.requestDate || ""}
      `;

      const matchesSearch = searchText
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      return matchesStatus && matchesVehicle && matchesSearch;
    });
  }, [requests, statusFilter, vehicleFilter, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "قيد المراجعة")
        .length,
      approved: requests.filter((request) => request.status === "تمت الموافقة")
        .length,
      rejected: requests.filter((request) => request.status === "مرفوض").length,
    };
  }, [requests]);

  const firstRequestId = filteredRequests[0]?.id || requests[0]?.id;

  return (
    <main className="admin-driver-requests-page" dir="rtl">
      <div className="driver-requests-grid-bg"></div>
      <div className="driver-requests-orb orb-one"></div>
      <div className="driver-requests-orb orb-two"></div>

      <div className="admin-driver-requests-container">
        <header className="driver-requests-topbar">
          <div className="driver-requests-topbar-actions">
            {isSuperAdmin && (
              <Link to="/admin-dashboard" className="driver-requests-back-btn">
                <ArrowRight size={20} />
                رجوع لمركز التحكم
              </Link>
            )}

            <button
              type="button"
              className="driver-requests-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              تسجيل الخروج
            </button>
          </div>

          <div className="driver-requests-brand">
            <div className="driver-requests-brand-icon">
              <ShieldCheck size={30} />
            </div>

            <div>
              <h2>مراجعة طلبات السائقين</h2>
              <p>إدارة طلبات الانضمام وفحص بيانات السائقين قبل القبول</p>
            </div>
          </div>
        </header>

        <section className="driver-requests-hero">
          <div className="driver-requests-hero-content">
            <div className="driver-requests-role-line">
              <span className="driver-requests-badge">
                <Sparkles size={16} />
                Driver Requests Center
              </span>

              <span className="driver-requests-role-chip">
                <Crown size={16} />
                {isSuperAdmin ? "Super Admin" : currentAdmin.title}
              </span>
            </div>

            <h1>كل طلبات السائقين في صفحة واحدة</h1>

            <p>
              راجع كل السائقين المتقدمين، ابحث بالاسم أو رقم الهاتف، فلتر حسب
              الحالة أو نوع المركبة، وافتح صفحة التفاصيل لمراجعة البيانات
              والمستندات كاملة.
            </p>

            <div className="driver-requests-admin-info">
              <ShieldCheck size={18} />
              <span>
                أنت داخل الآن كـ{" "}
                <strong>
                  {isSuperAdmin ? "Super Admin" : "Driver Reviewer"}
                </strong>
              </span>
              <small>{currentAdmin.email}</small>
            </div>

            <div className="driver-requests-actions">
              <button
                type="button"
                className="reset-driver-requests-btn"
                onClick={resetRequests}
              >
                <RotateCcw size={18} />
                استرجاع بيانات الطلبات
              </button>

              {firstRequestId ? (
                <Link
                  to={`/driver-request-details/${firstRequestId}`}
                  className="details-preview-btn"
                >
                  <ClipboardCheck size={18} />
                  معاينة صفحة التفاصيل
                </Link>
              ) : (
                <button
                  type="button"
                  className="details-preview-btn"
                  disabled
                >
                  <ClipboardCheck size={18} />
                  لا توجد طلبات للمعاينة
                </button>
              )}
            </div>
          </div>

          <div className="driver-requests-command-card">
            <div className="driver-requests-command-head">
              <div>
                <span>Requests Overview</span>
                <h3>ملخص الطلبات</h3>
              </div>

              <Users size={40} />
            </div>

            <div className="driver-requests-command-list">
              <div>
                <Users size={18} />
                <span>كل الطلبات</span>
                <strong>{stats.total}</strong>
              </div>

              <div>
                <Clock3 size={18} />
                <span>قيد المراجعة</span>
                <strong>{stats.pending}</strong>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>تمت الموافقة</span>
                <strong>{stats.approved}</strong>
              </div>

              <div>
                <XCircle size={18} />
                <span>مرفوضة</span>
                <strong>{stats.rejected}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="driver-requests-stats-grid">
          <div className="driver-request-stat-card total">
            <div>
              <span>كل الطلبات</span>
              <strong>{stats.total}</strong>
            </div>

            <Users size={34} />
          </div>

          <div className="driver-request-stat-card pending">
            <div>
              <span>قيد المراجعة</span>
              <strong>{stats.pending}</strong>
            </div>

            <Clock3 size={34} />
          </div>

          <div className="driver-request-stat-card approved">
            <div>
              <span>تمت الموافقة</span>
              <strong>{stats.approved}</strong>
            </div>

            <CheckCircle2 size={34} />
          </div>

          <div className="driver-request-stat-card rejected">
            <div>
              <span>مرفوضة</span>
              <strong>{stats.rejected}</strong>
            </div>

            <XCircle size={34} />
          </div>
        </section>

        <section className="driver-requests-control-panel">
          <div className="driver-requests-search-box">
            <Search size={20} />

            <input
              type="text"
              placeholder="ابحث باسم السائق، رقم الهاتف، المركبة، المركز، القرية، رقم اللوحة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="driver-requests-filter-box">
            <Filter size={20} />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="الكل">كل الحالات</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="تمت الموافقة">تمت الموافقة</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>

          <div className="driver-requests-filter-box">
            <Car size={20} />

            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle} value={vehicle}>
                  {vehicle}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="driver-requests-list-section">
          <div className="driver-requests-section-title">
            <span>طلبات الانضمام</span>
            <h2>قائمة السائقين المتقدمين</h2>
          </div>

          <div className="driver-requests-grid">
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <article className="driver-request-card" key={request.id}>
                  <div className="driver-request-card-scan"></div>

                  <div className="driver-request-card-head">
                    <div className="driver-request-avatar">
                      <UserCheck size={24} />
                    </div>

                    <div className="driver-request-info">
                      <h3>{request.name || "سائق بدون اسم"}</h3>
                      <p>
                        {request.vehicle || "بدون مركبة"} -{" "}
                        {request.plateNumber || "بدون لوحة"}
                      </p>
                    </div>

                    <span
                      className={`driver-request-status ${getStatusClass(
                        request.status,
                      )}`}
                    >
                      {request.status || "قيد المراجعة"}
                    </span>
                  </div>

                  <div className="driver-request-main-box">
                    <span>طلب انضمام سائق</span>
                    <strong>{request.name || "غير محدد"}</strong>
                    <p>
                      {request.center || "المركز غير محدد"} -{" "}
                      {request.village || "القرية غير محددة"}
                    </p>
                  </div>

                  <div className="driver-request-info-grid">
                    <div>
                      <Phone size={16} />
                      <span>{request.phone || "لا يوجد رقم"}</span>
                    </div>

                    <div>
                      <MapPin size={16} />
                      <span>
                        {request.center || "غير محدد"} -{" "}
                        {request.village || "غير محدد"}
                      </span>
                    </div>

                    <div>
                      {getVehicleIcon(request.vehicle)}
                      <span>{request.vehicle || "لا توجد مركبة"}</span>
                    </div>

                    <div>
                      <BadgeInfo size={16} />
                      <span>{request.plateNumber || "بدون رقم لوحة"}</span>
                    </div>

                    <div>
                      <CalendarDays size={16} />
                      <span>{request.requestDate || "بدون تاريخ"}</span>
                    </div>

                    <div>
                      <Navigation size={16} />
                      <span>{request.gender || "النوع غير محدد"}</span>
                    </div>
                  </div>

                  <div className="driver-request-documents">
                    <div
                      className={
                        request.documents?.personalPhoto
                          ? "driver-doc-ok"
                          : "driver-doc-miss"
                      }
                    >
                      <FileText size={15} />
                      صورة شخصية
                    </div>

                    <div
                      className={
                        request.documents?.idPhoto
                          ? "driver-doc-ok"
                          : "driver-doc-miss"
                      }
                    >
                      <FileText size={15} />
                      بطاقة
                    </div>

                    <div
                      className={
                        request.documents?.selfieWithId
                          ? "driver-doc-ok"
                          : "driver-doc-miss"
                      }
                    >
                      <FileText size={15} />
                      سيلفي
                    </div>

                    <div
                      className={
                        request.documents?.vehiclePhoto
                          ? "driver-doc-ok"
                          : "driver-doc-miss"
                      }
                    >
                      <FileText size={15} />
                      مركبة
                    </div>

                    <div
                      className={
                        request.documents?.licensePhoto
                          ? "driver-doc-ok"
                          : "driver-doc-miss"
                      }
                    >
                      <FileText size={15} />
                      رخصة
                    </div>
                  </div>

                  <div className="driver-request-actions">
                    <Link
                      to={`/driver-request-details/${request.id}`}
                      className="driver-details-btn"
                    >
                      <Eye size={17} />
                      التفاصيل
                    </Link>

                    <button
                      type="button"
                      className="driver-approve-btn"
                      onClick={() =>
                        updateRequestStatus(request.id, "تمت الموافقة")
                      }
                    >
                      <BadgeCheck size={17} />
                      قبول
                    </button>

                    <button
                      type="button"
                      className="driver-reject-btn"
                      onClick={() => updateRequestStatus(request.id, "مرفوض")}
                    >
                      <XCircle size={17} />
                      رفض
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="driver-requests-empty">
                <ShieldCheck size={52} />
                <h3>لا توجد طلبات مطابقة</h3>
                <p>جرّب تغيير البحث أو الفلتر.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminDriverRequests;