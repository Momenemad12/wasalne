import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart3,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Home,
  Landmark,
  LogOut,
  MapPinned,
  MessageCircle,
  Phone,
  ReceiptText,
  Route,
  Send,
  Upload,
  WalletCards,
  XCircle,
} from "lucide-react";

import "./DriverDashboardDetails.css";

const COMMISSION_PERCENTAGE = 15;
const MINIMUM_PAYMENT = 50;
const STOP_WORK_AT_COMMISSION = 100;

const PAYMENT_METHODS = [
  {
    id: "vodafone",
    name: "فودافون كاش",
    number: "01021558237",
    note: "حوّل على رقم فودافون كاش، وبعدها ارفع صورة التحويل.",
  },
  {
    id: "instapay",
    name: "InstaPay",
    number: "01022366630",
    note: "حوّل عن طريق InstaPay على الرقم ده، وبعدها ارفع صورة التحويل.",
  },
];

const defaultDriverUser = {
  name: "أحمد سالم",
  phone: "01011223344",
  email: "driver@wasalne.com",
  role: "driver",
  center: "شبين الكوم",
  village: "شبين الكوم",
  vehicle: "توك توك",
};

const initialTrips = [
  {
    id: 1,
    rider: "وليد سمير",
    route: "شبين الكوم → قويسنا",
    from: "شبين الكوم",
    to: "قويسنا",
    amount: 220,
    distance: 22,
    eta: "35 دقيقة",
    status: "مكتملة",
    date: "اليوم - 10:30 ص",
  },
  {
    id: 2,
    rider: "نادية حسام",
    route: "بركة السبع → طنبشا",
    from: "بركة السبع",
    to: "طنبشا",
    amount: 180,
    distance: 18,
    eta: "28 دقيقة",
    status: "مكتملة",
    date: "اليوم - 12:15 م",
  },
  {
    id: 3,
    rider: "رامي أشرف",
    route: "منوف → منشأة سلطان",
    from: "منوف",
    to: "منشأة سلطان",
    amount: 90,
    distance: 9,
    eta: "16 دقيقة",
    status: "قيد التنفيذ",
    date: "الآن",
  },
];

const initialMessages = [
  {
    id: 1,
    riderName: "أحمد سالم",
    phone: "01000000000",
    trip: "منوف → شبين الكوم",
    unread: 2,
    avatar: "أ",
    messages: [
      {
        id: 1,
        sender: "rider",
        text: "السلام عليكم، أنت قريب مني؟",
        time: "10:20 ص",
      },
      {
        id: 2,
        sender: "driver",
        text: "وعليكم السلام، أيوه قريب منك حوالي 5 دقائق.",
        time: "10:21 ص",
      },
    ],
  },
  {
    id: 2,
    riderName: "محمد علي",
    phone: "01011112222",
    trip: "ميت خاقان → المستشفى",
    unread: 0,
    avatar: "م",
    messages: [
      {
        id: 1,
        sender: "rider",
        text: "أنا واقف عند الباب الرئيسي.",
        time: "9:40 ص",
      },
    ],
  },
];

function createId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

function getCurrentUser() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return defaultDriverUser;
  }

  try {
    return {
      ...defaultDriverUser,
      ...JSON.parse(savedUser),
    };
  } catch {
    return defaultDriverUser;
  }
}

function getStoredPayments() {
  const savedPayments = localStorage.getItem("wasalne_driver_payments");

  if (!savedPayments) {
    return [];
  }

  try {
    const parsedPayments = JSON.parse(savedPayments);
    return Array.isArray(parsedPayments) ? parsedPayments : [];
  } catch {
    return [];
  }
}

function savePayments(payments) {
  localStorage.setItem("wasalne_driver_payments", JSON.stringify(payments));
}

function DriverDashboardDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPreviewFromUrl =
    new URLSearchParams(location.search).get("preview") === "admin";

  const isAdminPreview =
    isPreviewFromUrl ||
    localStorage.getItem("wasalne_admin_preview_driver") === "true";

  useEffect(() => {
    if (isPreviewFromUrl) {
      localStorage.setItem("wasalne_admin_preview_driver", "true");
    }
  }, [isPreviewFromUrl]);

  const [driver] = useState(getCurrentUser);
  const [payments, setPayments] = useState(getStoredPayments);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [proofImage, setProofImage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("vodafone");
  const [activeTab, setActiveTab] = useState("summary");
  const [activeChatId, setActiveChatId] = useState(
    initialMessages[0]?.id || null,
  );
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [alert, setAlert] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const completedTrips = initialTrips.filter((trip) => trip.status === "مكتملة");

  const totalEarnings = completedTrips.reduce(
    (total, trip) => total + Number(trip.amount || 0),
    0,
  );

  const totalDistance = initialTrips.reduce(
    (total, trip) => total + Number(trip.distance || 0),
    0,
  );

  const commissionValue = Math.round(
    (totalEarnings * COMMISSION_PERCENTAGE) / 100,
  );

  const acceptedPayments = payments.filter(
    (payment) => payment.status === "تم القبول",
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "قيد المراجعة",
  );

  const paidTotal = acceptedPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const pendingTotal = pendingPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0,
  );

  const dueCommission = Math.max(commissionValue - paidTotal, 0);
  const isBlocked = dueCommission >= STOP_WORK_AT_COMMISSION;

  const selectedPaymentMethod =
    PAYMENT_METHODS.find((method) => method.id === paymentMethod) ||
    PAYMENT_METHODS[0];

  const totalUnread = useMemo(() => {
    return messages.reduce((total, chat) => total + Number(chat.unread || 0), 0);
  }, [messages]);

  const activeChat =
    messages.find((chat) => chat.id === activeChatId) || messages[0] || null;

  const showAlert = ({ type = "success", title, message }) => {
    setAlert({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeAlert = () => {
    setAlert((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const goBackToDriverDashboard = () => {
    if (isAdminPreview) {
      navigate("/driver-dashboard?preview=admin");
      return;
    }

    navigate("/driver-dashboard");
  };

  const goBackToAdminDashboard = () => {
    localStorage.removeItem("wasalne_admin_preview_driver");
    navigate("/admin-dashboard");
  };

  const handleProofUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProofImage(file.name);
  };

  const handlePaymentSubmit = () => {
    const amount = Number(paymentAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      showAlert({
        type: "error",
        title: "المبلغ غير صحيح",
        message: "اكتب مبلغ صحيح أكبر من صفر.",
      });
      return;
    }

    if (amount < MINIMUM_PAYMENT) {
      showAlert({
        type: "error",
        title: "المبلغ قليل",
        message: `أقل مبلغ للدفع هو ${MINIMUM_PAYMENT} جنيه.`,
      });
      return;
    }

    if (!proofImage) {
      showAlert({
        type: "error",
        title: "صورة التحويل مطلوبة",
        message: "ارفع صورة إيصال التحويل قبل إرسال الطلب.",
      });
      return;
    }

    const newPayment = {
      id: createId(),
      amount,
      proofImage,
      method: selectedPaymentMethod.name,
      paymentNumber: selectedPaymentMethod.number,
      status: "قيد المراجعة",
      date: new Date().toLocaleString("ar-EG"),
      driverName: driver.name,
      driverPhone: driver.phone,
    };

    const updatedPayments = [newPayment, ...payments];

    setPayments(updatedPayments);
    savePayments(updatedPayments);
    setPaymentAmount("");
    setProofImage("");

    showAlert({
      type: "success",
      title: "تم إرسال التحويل",
      message: "تم إرسال طلب الدفع للإدارة، وسيتم مراجعته قريبًا.",
    });
  };

  const sendMessage = () => {
    if (!activeChat || !messageText.trim()) {
      return;
    }

    const newMessage = {
      id: createId(),
      sender: "driver",
      text: messageText.trim(),
      time: "الآن",
    };

    setMessages((prev) =>
      prev.map((chat) =>
        chat.id === activeChat.id
          ? {
              ...chat,
              unread: 0,
              messages: [...chat.messages, newMessage],
            }
          : chat,
      ),
    );

    setMessageText("");
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");
    localStorage.removeItem("wasalne_after_auth_redirect");
    localStorage.removeItem("wasalne_pending_role");
    localStorage.removeItem("wasalne_admin_preview_driver");

    navigate("/login");
  };

  return (
    <main className="driver-details-page" dir="rtl">
      <div className="details-grid-bg"></div>
      <div className="details-glow details-glow-one"></div>
      <div className="details-glow details-glow-two"></div>

      {alert.open && (
        <div className="details-alert-overlay">
          <div className={`details-alert-card ${alert.type}`}>
            <button
              type="button"
              className="details-alert-close"
              onClick={closeAlert}
            >
              <XCircle size={22} />
            </button>

            <div className="details-alert-icon">
              {alert.type === "success" ? (
                <CheckCircle2 size={36} />
              ) : (
                <AlertTriangle size={36} />
              )}
            </div>

            <span>Wasalne</span>
            <h3>{alert.title}</h3>
            <p>{alert.message}</p>

            <button
              type="button"
              className="details-alert-action"
              onClick={closeAlert}
            >
              تمام
            </button>
          </div>
        </div>
      )}

      <section className="driver-details-container">
        <header className="details-topbar">
          <div className="details-brand">
            <div className="details-brand-icon">
              <BarChart3 size={28} />
            </div>

            <div>
              <span>
                {isAdminPreview
                  ? "معاينة الأدمن لتفاصيل السائق"
                  : "لوحة تفاصيل السائق"}
              </span>
              <h1>كل تفاصيلك في مكان واحد</h1>
              <p>الأرباح، العمولة، التحويل، الرحلات، والرسائل.</p>
            </div>
          </div>

          <div className="details-top-actions">
            {isAdminPreview && (
              <button
                type="button"
                className="details-back-btn"
                onClick={goBackToAdminDashboard}
              >
                <BarChart3 size={18} />
                رجوع للأدمن
              </button>
            )}

            <button
              type="button"
              className="details-back-btn"
              onClick={goBackToDriverDashboard}
            >
              <ArrowRight size={18} />
              الرئيسية
            </button>

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

        {isAdminPreview && (
          <div className="details-danger-alert">
            <BarChart3 size={24} />

            <div>
              <strong>أنت تشاهد تفاصيل السائق كأدمن</strong>
              <p>
                هذه معاينة إدارية فقط. يمكنك الرجوع إلى لوحة الأدمن من الزر
                بالأعلى.
              </p>
            </div>
          </div>
        )}

        {isBlocked && (
          <div className="details-danger-alert">
            <AlertTriangle size={24} />

            <div>
              <strong>استقبال الطلبات متوقف مؤقتًا</strong>
              <p>
                البرنامج بيوقف استقبال الطلبات لما العمولة توصل{" "}
                {STOP_WORK_AT_COMMISSION} جنيه. العمولة الحالية عليك{" "}
                {dueCommission} جنيه. ادفع جزء منها عشان الشغل يرجع.
              </p>
            </div>
          </div>
        )}

        <section className="driver-profile-summary">
          <div className="profile-main-card">
            <div className="profile-avatar">{driver.name?.charAt(0) || "س"}</div>

            <div>
              <span>السائق</span>
              <h2>{driver.name}</h2>
              <p>
                {driver.vehicle || "توك توك"} - {driver.center || "غير محدد"} -{" "}
                {driver.village || "غير محدد"}
              </p>
            </div>
          </div>

          <a className="profile-call-card" href={`tel:${driver.phone}`}>
            <Phone size={22} />
            <div>
              <span>رقم الهاتف</span>
              <strong>{driver.phone}</strong>
            </div>
          </a>
        </section>

        <section className="details-stats-grid">
          <div className="details-stat-card blue">
            <CircleDollarSign size={26} />
            <span>أرباح اليوم</span>
            <strong>{totalEarnings} ج</strong>
          </div>

          <div className="details-stat-card green">
            <Route size={26} />
            <span>عدد الرحلات</span>
            <strong>{initialTrips.length}</strong>
          </div>

          <div className="details-stat-card purple">
            <MapPinned size={26} />
            <span>المسافة</span>
            <strong>{totalDistance.toFixed(1)} كم</strong>
          </div>

          <div className="details-stat-card orange">
            <WalletCards size={26} />
            <span>العمولة المستحقة</span>
            <strong>{dueCommission} ج</strong>
          </div>
        </section>

        <nav className="details-tabs">
          <button
            type="button"
            className={activeTab === "summary" ? "active" : ""}
            onClick={() => setActiveTab("summary")}
          >
            <BarChart3 size={18} />
            ملخص
          </button>

          <button
            type="button"
            className={activeTab === "payments" ? "active" : ""}
            onClick={() => setActiveTab("payments")}
          >
            <WalletCards size={18} />
            العمولة والدفع
          </button>

          <button
            type="button"
            className={activeTab === "trips" ? "active" : ""}
            onClick={() => setActiveTab("trips")}
          >
            <Route size={18} />
            الرحلات
          </button>

          <button
            type="button"
            className={activeTab === "messages" ? "active" : ""}
            onClick={() => setActiveTab("messages")}
          >
            <MessageCircle size={18} />
            الرسائل {totalUnread > 0 ? `(${totalUnread})` : ""}
          </button>
        </nav>

        {activeTab === "summary" && (
          <section className="details-content-grid">
            <div className="details-card big">
              <div className="details-card-head">
                <div>
                  <span>ملخص الحساب</span>
                  <h2>وضعك الحالي</h2>
                </div>

                <BarChart3 size={26} />
              </div>

              <div className="summary-list">
                <div>
                  <span>إجمالي الأرباح</span>
                  <strong>{totalEarnings} ج</strong>
                </div>

                <div>
                  <span>نسبة العمولة</span>
                  <strong>{COMMISSION_PERCENTAGE}%</strong>
                </div>

                <div>
                  <span>إجمالي العمولة</span>
                  <strong>{commissionValue} ج</strong>
                </div>

                <div>
                  <span>المدفوع المقبول</span>
                  <strong>{paidTotal} ج</strong>
                </div>

                <div>
                  <span>قيد المراجعة</span>
                  <strong>{pendingTotal} ج</strong>
                </div>

                <div className={isBlocked ? "danger" : "safe"}>
                  <span>حالة الطلبات</span>
                  <strong>{isBlocked ? "متوقفة" : "شغالة"}</strong>
                </div>
              </div>
            </div>

            <div className="details-card">
              <div className="details-card-head">
                <div>
                  <span>أقرب إجراء</span>
                  <h2>ادفع العمولة</h2>
                </div>

                <Banknote size={26} />
              </div>

              <p className="details-text">
                لو العمولة وصلت {STOP_WORK_AT_COMMISSION} جنيه، البرنامج بيوقف
                استقبال الطلبات لحد ما تدفع جزء منها. أقل تحويل{" "}
                {MINIMUM_PAYMENT} جنيه.
              </p>

              <button
                type="button"
                className="details-main-btn"
                onClick={() => setActiveTab("payments")}
              >
                <WalletCards size={18} />
                افتح الدفع
              </button>
            </div>
          </section>
        )}

        {activeTab === "payments" && (
          <section className="details-content-grid">
            <div className="details-card big">
              <div className="details-card-head">
                <div>
                  <span>التحويل</span>
                  <h2>ادفع العمولة</h2>
                </div>

                <Landmark size={26} />
              </div>

              <div className="payment-info-box">
                <div>
                  <span>المبلغ المستحق</span>
                  <strong>{dueCommission} ج</strong>
                </div>

                <div>
                  <span>أقل تحويل</span>
                  <strong>{MINIMUM_PAYMENT} ج</strong>
                </div>

                <div>
                  <span>إيقاف الشغل عند</span>
                  <strong>{STOP_WORK_AT_COMMISSION} ج عمولة</strong>
                </div>
              </div>

              <div className="payment-methods-box">
                <h3>اختار طريقة التحويل</h3>

                <div className="payment-methods-grid">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      className={paymentMethod === method.id ? "active" : ""}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <Banknote size={22} />
                      <span>{method.name}</span>
                      <strong>{method.number}</strong>
                    </button>
                  ))}
                </div>

                <div className="selected-payment-note">
                  <Landmark size={22} />
                  <div>
                    <span>التحويل المختار</span>
                    <strong>
                      {selectedPaymentMethod.name}:{" "}
                      {selectedPaymentMethod.number}
                    </strong>
                    <p>{selectedPaymentMethod.note}</p>
                  </div>
                </div>
              </div>

              <div className="payment-form">
                <label>
                  <span>المبلغ المحول</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="مثال: 100"
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                  />
                </label>

                <label className="upload-proof-label">
                  <Upload size={22} />
                  <span>
                    {proofImage
                      ? `تم اختيار: ${proofImage}`
                      : "ارفع صورة التحويل"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofUpload}
                  />
                </label>

                <button
                  type="button"
                  className="details-main-btn"
                  onClick={handlePaymentSubmit}
                >
                  <ReceiptText size={18} />
                  إرسال التحويل للإدارة
                </button>
              </div>
            </div>

            <div className="details-card">
              <div className="details-card-head">
                <div>
                  <span>سجل الدفع</span>
                  <h2>آخر التحويلات</h2>
                </div>

                <ReceiptText size={26} />
              </div>

              <div className="payment-history">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div className="payment-history-item" key={payment.id}>
                      <div>
                        <strong>{payment.amount} ج</strong>
                        <span>{payment.date}</span>
                        <span>
                          {payment.method || "وسيلة الدفع"} -{" "}
                          {payment.paymentNumber || ""}
                        </span>
                      </div>

                      <small
                        className={
                          payment.status === "تم القبول"
                            ? "accepted"
                            : "pending"
                        }
                      >
                        {payment.status}
                      </small>
                    </div>
                  ))
                ) : (
                  <div className="details-empty">
                    <WalletCards size={26} />
                    <h3>لا توجد تحويلات بعد</h3>
                    <p>أول تحويل هتبعته هيظهر هنا.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === "trips" && (
          <section className="details-card trips-card">
            <div className="details-card-head">
              <div>
                <span>الرحلات</span>
                <h2>كل مشاويرك</h2>
              </div>

              <Route size={26} />
            </div>

            <div className="trips-list">
              {initialTrips.map((trip) => (
                <article className="trip-details-item" key={trip.id}>
                  <div className="trip-route-icon">
                    <Route size={22} />
                  </div>

                  <div className="trip-info">
                    <h3>{trip.rider}</h3>
                    <p>{trip.route}</p>

                    <div className="trip-tags">
                      <span>
                        <MapPinned size={15} />
                        {trip.distance} كم
                      </span>

                      <span>
                        <Clock3 size={15} />
                        {trip.eta}
                      </span>

                      <span>{trip.date}</span>
                    </div>
                  </div>

                  <div className="trip-money">
                    <strong>{trip.amount} ج</strong>
                    <span
                      className={
                        trip.status === "مكتملة" ? "complete" : "progress"
                      }
                    >
                      {trip.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "messages" && (
          <section className="messages-layout">
            <aside className="chat-list-panel">
              <div className="details-card-head">
                <div>
                  <span>المحادثات</span>
                  <h2>الركاب</h2>
                </div>

                <Bell size={24} />
              </div>

              <div className="chat-list">
                {messages.map((chat) => (
                  <button
                    type="button"
                    key={chat.id}
                    className={activeChat?.id === chat.id ? "active" : ""}
                    onClick={() => setActiveChatId(chat.id)}
                  >
                    <div className="chat-avatar">{chat.avatar}</div>

                    <div>
                      <strong>{chat.riderName}</strong>
                      <span>{chat.trip}</span>
                    </div>

                    {chat.unread > 0 && <small>{chat.unread}</small>}
                  </button>
                ))}
              </div>
            </aside>

            <section className="chat-panel">
              {activeChat ? (
                <>
                  <div className="chat-header">
                    <div>
                      <span>محادثة</span>
                      <h2>{activeChat.riderName}</h2>
                      <p>{activeChat.trip}</p>
                    </div>

                    <a href={`tel:${activeChat.phone}`}>
                      <Phone size={18} />
                      اتصال
                    </a>
                  </div>

                  <div className="chat-messages">
                    {activeChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={
                          message.sender === "driver"
                            ? "message-bubble mine"
                            : "message-bubble rider"
                        }
                      >
                        <p>{message.text}</p>
                        <span>{message.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="chat-input-row">
                    <input
                      type="text"
                      placeholder="اكتب رسالة بسيطة للراكب..."
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          sendMessage();
                        }
                      }}
                    />

                    <button type="button" onClick={sendMessage}>
                      <Send size={18} />
                      إرسال
                    </button>
                  </div>
                </>
              ) : (
                <div className="details-empty">
                  <MessageCircle size={28} />
                  <h3>لا توجد محادثة</h3>
                  <p>اختار راكب من القائمة.</p>
                </div>
              )}
            </section>
          </section>
        )}
      </section>

      <div className="details-mobile-sticky">
        <button type="button" onClick={goBackToDriverDashboard}>
          <Home size={18} />
          الرئيسية
        </button>

        {isAdminPreview && (
          <button type="button" onClick={goBackToAdminDashboard}>
            <BarChart3 size={18} />
            الأدمن
          </button>
        )}

        <button type="button" onClick={() => setActiveTab("payments")}>
          <WalletCards size={18} />
          الدفع
        </button>
      </div>
    </main>
  );
}

export default DriverDashboardDetails;
