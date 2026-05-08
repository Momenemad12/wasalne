import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Users,
  Clock3,
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Phone,
  Car,
  CalendarDays,
  UserCheck,
  RotateCcw,
  Sparkles,
  Layers3,
  SlidersHorizontal,
  Navigation,
  MessageCircle,
  Mail,
  ImagePlus,
  Mic,
  AlertCircle,
  CreditCard,
  Banknote,
  ArrowLeft,
  WalletCards,
  TrendingUp,
  Bell,
  Activity,
  ReceiptText,
  CircleDollarSign,
  LogOut,
  Crown,
  History,
} from "lucide-react";

import { requestsData } from "../../data/requestsData";
import "./AdminDashboard.css";

const demoMessages = [
  {
    id: 1,
    type: "problem",
    typeLabel: "مشكلة",
    name: "أحمد سالم",
    phone: "01011223344",
    message:
      "كان عندي مشكلة في تحديد موقع السائق على الخريطة، الموقع كان بيتأخر في التحديث.",
    image: "map-problem.png",
    hasVoice: true,
    status: "جديدة",
    createdAt: "اليوم - 10:30 ص",
  },
  {
    id: 2,
    type: "suggestion",
    typeLabel: "اقتراح",
    name: "سارة حسن",
    phone: "01055667788",
    message:
      "اقتراح إن يبقى فيه اختيار للمشاوير المتكررة عشان أقدر أطلب نفس المشوار بسرعة.",
    image: "",
    hasVoice: false,
    status: "قيد المراجعة",
    createdAt: "أمس - 8:15 م",
  },
  {
    id: 3,
    type: "question",
    typeLabel: "سؤال",
    name: "محمد علي",
    phone: "01099887766",
    message: "هل ممكن أعرف طريقة حساب سعر المشوار قبل ما أطلب السائق؟",
    image: "",
    hasVoice: false,
    status: "تم الرد",
    createdAt: "منذ يومين",
  },
];

const demoDriverPayments = [
  {
    id: 1,
    driverName: "أحمد سالم",
    driverPhone: "01011223344",
    method: "فودافون كاش",
    amount: 80,
    transactionNumber: "VF-20491",
    proofImage: "payment-proof.png",
    status: "قيد المراجعة",
    date: "اليوم - 11:30 ص",
  },
  {
    id: 2,
    driverName: "سارة حسن",
    driverPhone: "01055667788",
    method: "إنستاباي",
    amount: 120,
    transactionNumber: "IP-88210",
    proofImage: "instapay-proof.jpg",
    status: "تم القبول",
    date: "أمس - 9:15 م",
  },
];

const pricingOverview = {
  appCommission: "15%",
  minimumPayment: "50 ج",
  stopRequestsAt: "100 ج",
  paymentMethods: "فودافون كاش / إنستاباي",
};

function generateActivityId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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

function getStoredMessages() {
  const savedMessages = localStorage.getItem("wasalne_support_messages");

  if (!savedMessages) {
    return demoMessages;
  }

  try {
    const parsedMessages = JSON.parse(savedMessages);
    return parsedMessages.length > 0 ? parsedMessages : demoMessages;
  } catch {
    return demoMessages;
  }
}

function getStoredDriverPayments() {
  const savedPayments = localStorage.getItem("wasalne_driver_payments");

  if (!savedPayments) {
    return demoDriverPayments;
  }

  try {
    const parsedPayments = JSON.parse(savedPayments);
    return parsedPayments.length > 0 ? parsedPayments : demoDriverPayments;
  } catch {
    return demoDriverPayments;
  }
}

function getCurrentAdmin() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return {
      name: "Super Admin",
      email: "superadmin@wasalne.com",
      role: "super_admin",
    };
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    return {
      name: parsedUser.name || "Super Admin",
      email: parsedUser.email || "superadmin@wasalne.com",
      role: parsedUser.role || "super_admin",
    };
  } catch {
    return {
      name: "Super Admin",
      email: "superadmin@wasalne.com",
      role: "super_admin",
    };
  }
}

function getStatusClass(status) {
  if (status === "تمت الموافقة" || status === "تم القبول") return "approved";
  if (status === "مرفوض") return "rejected";
  if (status === "جديدة") return "new";
  if (status === "تم الرد" || status === "مغلقة") return "done";
  return "pending";
}

function getMessageTypeClass(type) {
  if (type === "suggestion") return "suggestion";
  if (type === "question") return "question";
  return "problem";
}

function AdminDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState(getStoredRequests);
  const [messages] = useState(getStoredMessages);
  const [driverPayments] = useState(getStoredDriverPayments);
  const [currentAdmin] = useState(getCurrentAdmin);

  const [statusFilter, setStatusFilter] = useState("الكل");
  const [vehicleFilter, setVehicleFilter] = useState("الكل");
  const [searchTerm, setSearchTerm] = useState("");

  const [activityLog, setActivityLog] = useState(() => [
    {
      id: generateActivityId(),
      title: "تم فتح لوحة تحكم الإدارة",
      text: "تم تسجيل دخول الأدمن إلى مركز المراقبة.",
      time: new Date().toLocaleString("ar-EG"),
      icon: <ShieldCheck size={18} />,
    },
    {
      id: generateActivityId(),
      title: "مراجعة بيانات النظام",
      text: "تم تحميل ملخص الطلبات والرسائل والتحويلات.",
      time: "الآن",
      icon: <Activity size={18} />,
    },
  ]);

  const addActivity = (title, text, icon) => {
    const newActivity = {
      id: generateActivityId(),
      title,
      text,
      time: new Date().toLocaleString("ar-EG"),
      icon,
    };

    setActivityLog((prev) => [newActivity, ...prev].slice(0, 5));
  };

  const updateRequestStatus = (id, status) => {
    const selectedRequest = requests.find((request) => request.id === id);

    const updatedRequests = requests.map((request) =>
      request.id === id ? { ...request, status } : request,
    );

    setRequests(updatedRequests);

    localStorage.setItem(
      "wasalne_driver_requests",
      JSON.stringify(updatedRequests),
    );

    addActivity(
      "تغيير حالة طلب سائق",
      `تم تغيير حالة ${selectedRequest?.name || "سائق"} إلى ${status}.`,
      <UserCheck size={18} />,
    );
  };

  const resetRequests = () => {
    localStorage.removeItem("wasalne_driver_requests");
    setRequests(requestsData || []);

    addActivity(
      "استرجاع بيانات الطلبات",
      "تم استرجاع بيانات طلبات السائقين التجريبية.",
      <RotateCcw size={18} />,
    );
  };

  const handlePreviewRider = () => {
    localStorage.setItem("wasalne_user_role", "admin");

    addActivity(
      "معاينة صفحة الراكب",
      "تم فتح صفحة الراكب بوضع المعاينة من حساب الأدمن.",
      <Navigation size={18} />,
    );
  };

  const handlePreviewDriver = () => {
    localStorage.setItem("wasalne_user_role", "admin");
    localStorage.setItem("wasalne_admin_preview_driver", "true");

    addActivity(
      "معاينة صفحة السائق",
      "تم فتح صفحة السائق بوضع المعاينة من حساب الأدمن.",
      <Car size={18} />,
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");

    navigate("/login");
  };

  const vehicles = useMemo(() => {
    const allVehicles = requests
      .map((request) => request.vehicle)
      .filter(Boolean);

    return ["الكل", ...new Set(allVehicles)];
  }, [requests]);

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
      `;

      const matchesSearch = searchText
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesStatus && matchesVehicle && matchesSearch;
    });
  }, [requests, statusFilter, vehicleFilter, searchTerm]);

  const stats = useMemo(() => {
    const pendingPayments = driverPayments.filter(
      (payment) => payment.status === "قيد المراجعة",
    );

    const pendingPaymentsAmount = pendingPayments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    );

    return {
      total: requests.length,
      pending: requests.filter((request) => request.status === "قيد المراجعة")
        .length,
      approved: requests.filter((request) => request.status === "تمت الموافقة")
        .length,
      rejected: requests.filter((request) => request.status === "مرفوض").length,

      messages: messages.length,
      newMessages: messages.filter((message) => message.status === "جديدة")
        .length,
      reviewingMessages: messages.filter(
        (message) => message.status === "قيد المراجعة",
      ).length,

      driverPayments: driverPayments.length,
      pendingPayments: pendingPayments.length,
      pendingPaymentsAmount,
    };
  }, [requests, messages, driverPayments]);

  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0;
    return Math.round((stats.approved / stats.total) * 100);
  }, [stats]);

  const latestMessages = messages.slice(0, 3);
  const latestPayments = driverPayments.slice(0, 3);

  const alerts = [
    {
      id: 1,
      title: "طلبات سائقين قيد المراجعة",
      value: stats.pending,
      text: "طلبات تحتاج مراجعة مستندات وقرار قبول أو رفض.",
      icon: <Users size={20} />,
      link: "/admin-driver-requests",
      type: "warning",
    },
    {
      id: 2,
      title: "رسائل دعم جديدة",
      value: stats.newMessages,
      text: "رسائل جديدة من المستخدمين تحتاج متابعة.",
      icon: <MessageCircle size={20} />,
      link: "/admin-support-messages",
      type: "info",
    },
    {
      id: 3,
      title: "تحويلات قيد المراجعة",
      value: stats.pendingPayments,
      text: `إجمالي المبالغ المنتظرة: ${stats.pendingPaymentsAmount} ج`,
      icon: <CreditCard size={20} />,
      link: "/admin-driver-payments",
      type: "success",
    },
  ];

  return (
    <main className="admin-page" dir="rtl">
      <div className="admin-glow admin-glow-one"></div>
      <div className="admin-glow admin-glow-two"></div>

      <section className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-top-line">
            <span className="admin-badge">
              <Sparkles size={17} />
              مركز تحكم الإدارة
            </span>

            <div className="admin-role-chip">
              <Crown size={17} />

              <div>
                <strong>Super Admin</strong>
                <span>{currentAdmin.email}</span>
              </div>
            </div>
          </div>

          <h1>لوحة مراقبة متكاملة لمنصة Wasalne</h1>

          <p>
            تابع طلبات السائقين، رسائل الدعم، التحويلات المالية، التسعير،
            والتنبيهات المهمة من مكان واحد، مع صفحات منفصلة لكل قسم للتفاصيل
            والإجراءات.
          </p>

          <div className="admin-hero-mini">
            <div>
              <strong>{stats.total}</strong>
              <span>طلب إجمالي</span>
            </div>

            <div>
              <strong>{completionRate}%</strong>
              <span>نسبة القبول</span>
            </div>

            <div>
              <strong>{stats.newMessages}</strong>
              <span>رسائل جديدة</span>
            </div>

            <div>
              <strong>{stats.pendingPayments}</strong>
              <span>تحويلات للمراجعة</span>
            </div>
          </div>
        </div>

        <div className="admin-command-card">
          <div className="command-card-head">
            <div>
              <span>مركز الإدارة</span>
              <h3>اختصارات التحكم</h3>
            </div>

            <ShieldCheck size={38} />
          </div>

          <div className="command-card-list">
            <Link to="/admin-driver-requests" className="control-shortcut">
              <Layers3 size={18} />
              <span>مراجعة طلبات السائقين</span>
            </Link>

            <Link to="/admin-support-messages" className="control-shortcut">
              <MessageCircle size={18} />
              <span>رسائل الدعم والاقتراحات</span>
            </Link>

            <Link to="/admin-driver-payments" className="control-shortcut">
              <CreditCard size={18} />
              <span>تحويلات السائقين</span>
            </Link>

            <Link to="/pricing-settings" className="control-shortcut">
              <SlidersHorizontal size={18} />
              <span>التحكم في التسعير والإعدادات</span>
            </Link>
          </div>

          <div className="admin-hero-actions">
            <Link
              to="/rider-dashboard?preview=admin"
              className="preview-rider-btn"
              onClick={handlePreviewRider}
            >
              <Navigation size={18} />
              معاينة صفحة الراكب
            </Link>

            <Link
              to="/driver-dashboard?preview=admin"
              className="preview-driver-btn"
              onClick={handlePreviewDriver}
            >
              <Car size={18} />
              معاينة صفحة السائق
            </Link>

            <button className="reset-btn" type="button" onClick={resetRequests}>
              <RotateCcw size={18} />
              استرجاع بيانات الطلبات
            </button>

            <button className="logout-btn" type="button" onClick={handleLogout}>
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </section>

      <section className="admin-stats-grid">
        <div className="admin-stat-card total">
          <div>
            <span>كل الطلبات</span>
            <strong>{stats.total}</strong>
          </div>

          <Users size={34} />
        </div>

        <div className="admin-stat-card pending">
          <div>
            <span>قيد المراجعة</span>
            <strong>{stats.pending}</strong>
          </div>

          <Clock3 size={34} />
        </div>

        <div className="admin-stat-card approved">
          <div>
            <span>تمت الموافقة</span>
            <strong>{stats.approved}</strong>
          </div>

          <CheckCircle2 size={34} />
        </div>

        <div className="admin-stat-card messages">
          <div>
            <span>رسائل الدعم</span>
            <strong>{stats.messages}</strong>
          </div>

          <MessageCircle size={34} />
        </div>

        <div className="admin-stat-card payments">
          <div>
            <span>تحويلات للمراجعة</span>
            <strong>{stats.pendingPayments}</strong>
            <small>{stats.pendingPaymentsAmount} ج</small>
          </div>

          <CreditCard size={34} />
        </div>
      </section>

      <section className="dashboard-alerts-section">
        <div className="section-title">
          <span>تنبيهات مهمة</span>
          <h2>أشياء تحتاج متابعة</h2>
        </div>

        <div className="alerts-grid">
          {alerts.map((alert) => (
            <Link
              to={alert.link}
              className={`alert-card ${alert.type}`}
              key={alert.id}
            >
              <div className="alert-icon">{alert.icon}</div>

              <div>
                <span>{alert.title}</span>
                <strong>{alert.value}</strong>
                <p>{alert.text}</p>
              </div>

              <ArrowLeft size={20} />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-overview-grid">
        <div className="overview-card">
          <div className="overview-head">
            <div>
              <span>طلبات السائقين</span>
              <h2>آخر طلبات الانضمام</h2>
            </div>

            <Link to="/admin-driver-requests">
              عرض الكل
              <ArrowLeft size={17} />
            </Link>
          </div>

          <div className="admin-control-panel compact">
            <div className="admin-search-box">
              <Search size={20} />

              <input
                type="text"
                placeholder="ابحث باسم السائق أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-filter-box">
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

            <div className="admin-filter-box">
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
          </div>

          <div className="mini-list">
            {filteredRequests.slice(0, 3).length > 0 ? (
              filteredRequests.slice(0, 3).map((request) => (
                <div className="mini-request-item" key={request.id}>
                  <div className="mini-item-icon">
                    <UserCheck size={19} />
                  </div>

                  <div className="mini-item-content">
                    <h3>{request.name}</h3>
                    <p>
                      {request.vehicle} - {request.center} - {request.village}
                    </p>

                    <div className="mini-meta">
                      <span>
                        <Phone size={14} />
                        {request.phone}
                      </span>

                      <span>
                        <CalendarDays size={14} />
                        {request.requestDate}
                      </span>
                    </div>
                  </div>

                  <div className="mini-item-actions">
                    <span
                      className={`status-badge ${getStatusClass(
                        request.status,
                      )}`}
                    >
                      {request.status}
                    </span>

                    <Link to={`/driver-request-details?id=${request.id}`}>
                      <Eye size={16} />
                      التفاصيل
                    </Link>

                    <button
                      type="button"
                      className="mini-accept-btn"
                      onClick={() =>
                        updateRequestStatus(request.id, "تمت الموافقة")
                      }
                    >
                      قبول
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-mini-card">
                <Users size={34} />
                <h3>لا توجد طلبات مطابقة</h3>
                <p>جرّب تغيير البحث أو الفلتر.</p>
              </div>
            )}
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-head">
            <div>
              <span>رسائل الدعم</span>
              <h2>آخر رسائل المستخدمين</h2>
            </div>

            <Link to="/admin-support-messages">
              عرض الكل
              <ArrowLeft size={17} />
            </Link>
          </div>

          <div className="mini-list">
            {latestMessages.map((message) => (
              <div className="mini-message-item" key={message.id}>
                <div className="mini-item-icon support">
                  {message.type === "suggestion" ? (
                    <Sparkles size={19} />
                  ) : message.type === "question" ? (
                    <Mail size={19} />
                  ) : (
                    <AlertCircle size={19} />
                  )}
                </div>

                <div className="mini-item-content">
                  <div className="message-line">
                    <h3>{message.name || "مستخدم بدون اسم"}</h3>

                    <span
                      className={`message-type-badge ${getMessageTypeClass(
                        message.type,
                      )}`}
                    >
                      {message.typeLabel || "مشكلة"}
                    </span>
                  </div>

                  <p>{message.message}</p>

                  <div className="mini-meta">
                    <span>
                      <Clock3 size={14} />
                      {message.createdAt}
                    </span>

                    {message.image && (
                      <span>
                        <ImagePlus size={14} />
                        صورة
                      </span>
                    )}

                    {message.hasVoice && (
                      <span>
                        <Mic size={14} />
                        صوت
                      </span>
                    )}
                  </div>
                </div>

                <div className="mini-item-actions">
                  <span
                    className={`status-badge ${getStatusClass(message.status)}`}
                  >
                    {message.status}
                  </span>

                  <Link to={`/support-message-details/${message.id}`}>
                    <Eye size={16} />
                    التفاصيل
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-card">
          <div className="overview-head">
            <div>
              <span>تحويلات السائقين</span>
              <h2>آخر التحويلات</h2>
            </div>

            <Link to="/admin-driver-payments">
              عرض الكل
              <ArrowLeft size={17} />
            </Link>
          </div>

          <div className="payments-summary-box">
            <div>
              <ReceiptText size={22} />
              <span>قيد المراجعة</span>
              <strong>{stats.pendingPayments}</strong>
            </div>

            <div>
              <Banknote size={22} />
              <span>المبلغ المنتظر</span>
              <strong>{stats.pendingPaymentsAmount} ج</strong>
            </div>
          </div>

          <div className="mini-list">
            {latestPayments.map((payment) => (
              <div className="mini-payment-item" key={payment.id}>
                <div className="mini-item-icon payment">
                  <CreditCard size={19} />
                </div>

                <div className="mini-item-content">
                  <h3>{payment.driverName}</h3>
                  <p>
                    {payment.method} - {payment.transactionNumber}
                  </p>

                  <div className="mini-meta">
                    <span>
                      <Phone size={14} />
                      {payment.driverPhone}
                    </span>

                    <span>
                      <Clock3 size={14} />
                      {payment.date}
                    </span>
                  </div>
                </div>

                <div className="mini-item-actions">
                  <strong>{payment.amount} ج</strong>

                  <span
                    className={`status-badge ${getStatusClass(
                      payment.status,
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overview-card pricing-card">
          <div className="overview-head">
            <div>
              <span>التسعير والعمولة</span>
              <h2>إعدادات التشغيل</h2>
            </div>

            <Link to="/pricing-settings">
              تعديل
              <ArrowLeft size={17} />
            </Link>
          </div>

          <div className="pricing-grid">
            <div>
              <CircleDollarSign size={22} />
              <span>عمولة التطبيق</span>
              <strong>{pricingOverview.appCommission}</strong>
            </div>

            <div>
              <WalletCards size={22} />
              <span>أقل مبلغ دفع</span>
              <strong>{pricingOverview.minimumPayment}</strong>
            </div>

            <div>
              <Bell size={22} />
              <span>إيقاف الطلبات عند</span>
              <strong>{pricingOverview.stopRequestsAt}</strong>
            </div>

            <div>
              <Activity size={22} />
              <span>طرق الدفع</span>
              <strong>{pricingOverview.paymentMethods}</strong>
            </div>
          </div>

          <div className="system-health-card">
            <div>
              <TrendingUp size={22} />
              <span>حالة النظام</span>
              <strong>مستقر</strong>
            </div>

            <p>
              الأرقام الحالية مناسبة كبداية: تحذير عند 50 ج، وإيقاف استقبال
              الطلبات عند 100 ج.
            </p>
          </div>
        </div>

        <div className="overview-card activity-log-card">
          <div className="overview-head">
            <div>
              <span>سجل الحركة</span>
              <h2>آخر نشاطات الأدمن</h2>
            </div>

            <div className="activity-head-icon">
              <History size={22} />
            </div>
          </div>

          <div className="activity-log-list">
            {activityLog.map((item) => (
              <div className="activity-log-item" key={item.id}>
                <div className="activity-log-icon">{item.icon}</div>

                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;