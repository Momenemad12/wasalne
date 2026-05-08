import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Filter,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  RotateCcw,
  ReceiptText,
  UserRound,
  Phone,
  Hash,
  ImagePlus,
  Banknote,
  Sparkles,
  WalletCards,
  AlertTriangle,
  LogOut,
  Crown,
} from "lucide-react";

import "./AdminDriverPayments.css";

const demoPayments = [
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
  {
    id: 3,
    driverName: "محمد علي",
    driverPhone: "01099887766",
    method: "فودافون كاش",
    amount: 50,
    transactionNumber: "VF-66231",
    proofImage: "wrong-transfer.png",
    status: "مرفوض",
    date: "منذ يومين",
  },
];

function getStoredPayments() {
  const savedPayments = localStorage.getItem("wasalne_driver_payments");

  if (!savedPayments) {
    return demoPayments;
  }

  try {
    const parsedPayments = JSON.parse(savedPayments);
    return parsedPayments.length > 0 ? parsedPayments : demoPayments;
  } catch {
    return demoPayments;
  }
}

function getCurrentAdmin() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return {
      name: "Finance Admin",
      email: "finance@wasalne.com",
      role: "finance_admin",
      title: "مسؤول التحويلات",
    };
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    return {
      name: parsedUser.name || "Finance Admin",
      email: parsedUser.email || "finance@wasalne.com",
      role: parsedUser.role || "finance_admin",
      title: parsedUser.title || "مسؤول التحويلات",
    };
  } catch {
    return {
      name: "Finance Admin",
      email: "finance@wasalne.com",
      role: "finance_admin",
      title: "مسؤول التحويلات",
    };
  }
}

function savePayments(payments) {
  localStorage.setItem("wasalne_driver_payments", JSON.stringify(payments));
}

function getStatusClass(status) {
  if (status === "تم القبول") return "accepted";
  if (status === "مرفوض") return "rejected";
  return "pending";
}

function AdminDriverPayments() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState(getStoredPayments);
  const [currentAdmin] = useState(getCurrentAdmin);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [methodFilter, setMethodFilter] = useState("الكل");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const updatePaymentStatus = (id, status) => {
    const updatedPayments = payments.map((payment) =>
      payment.id === id
        ? {
            ...payment,
            status,
            reviewedBy: currentAdmin.email,
            reviewedAt: new Date().toLocaleString("ar-EG"),
          }
        : payment,
    );

    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  const resetPayments = () => {
    localStorage.removeItem("wasalne_driver_payments");
    setPayments(demoPayments);
    setSelectedPayment(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");

    navigate("/login");
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus =
        statusFilter === "الكل" ? true : payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "الكل" ? true : payment.method === methodFilter;

      const searchText = `
        ${payment.driverName || ""}
        ${payment.driverPhone || ""}
        ${payment.method || ""}
        ${payment.transactionNumber || ""}
        ${payment.status || ""}
        ${payment.amount || ""}
      `;

      const matchesSearch = searchText
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      return matchesStatus && matchesMethod && matchesSearch;
    });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const stats = useMemo(() => {
    const totalAmount = payments.reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    );

    const pendingAmount = payments
      .filter((payment) => payment.status === "قيد المراجعة")
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    const acceptedAmount = payments
      .filter((payment) => payment.status === "تم القبول")
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    const rejectedAmount = payments
      .filter((payment) => payment.status === "مرفوض")
      .reduce((total, payment) => total + Number(payment.amount || 0), 0);

    return {
      totalCount: payments.length,
      pendingCount: payments.filter(
        (payment) => payment.status === "قيد المراجعة",
      ).length,
      acceptedCount: payments.filter(
        (payment) => payment.status === "تم القبول",
      ).length,
      rejectedCount: payments.filter((payment) => payment.status === "مرفوض")
        .length,
      totalAmount,
      pendingAmount,
      acceptedAmount,
      rejectedAmount,
    };
  }, [payments]);

  return (
    <main className="admin-payments-page" dir="rtl">
      <div className="payments-grid-bg"></div>
      <div className="payments-orb payments-orb-one"></div>
      <div className="payments-orb payments-orb-two"></div>

      <div className="admin-payments-container">
        <header className="payments-topbar">
          <div className="payments-topbar-actions">
            {isSuperAdmin && (
              <Link to="/admin-dashboard" className="payments-back-btn">
                <ArrowRight size={20} />
                رجوع للوحة الأدمن
              </Link>
            )}

            <button
              type="button"
              className="payments-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              تسجيل الخروج
            </button>
          </div>

          <div className="payments-brand">
            <div className="payments-brand-icon">
              <CreditCard size={28} />
            </div>

            <div>
              <h2>تحويلات السائقين</h2>
              <p>مراجعة مدفوعات عمولة المنصة وإثباتات التحويل</p>
            </div>
          </div>
        </header>

        <section className="payments-hero">
          <div className="payments-hero-content">
            <div className="payments-role-line">
              <span className="payments-badge">
                <Sparkles size={16} />
                Driver Payments Control
              </span>

              <span className="payments-role-chip">
                <Crown size={16} />
                {isSuperAdmin ? "Super Admin" : currentAdmin.title}
              </span>
            </div>

            <h1>مراجعة التحويلات المالية بشكل احترافي</h1>

            <p>
              راجع تحويلات السائقين، تحقق من رقم العملية وصورة إثبات التحويل،
              ثم اقبل أو ارفض العملية حسب بيانات الدفع.
            </p>

            <div className="payments-admin-info">
              <ShieldCheck size={18} />
              <span>
                أنت داخل الآن كـ{" "}
                <strong>{isSuperAdmin ? "Super Admin" : "Finance Admin"}</strong>
              </span>
              <small>{currentAdmin.email}</small>
            </div>

            <div className="payments-hero-actions">
              <button
                type="button"
                className="reset-payments-btn"
                onClick={resetPayments}
              >
                <RotateCcw size={18} />
                استرجاع بيانات التجربة
              </button>

              {isSuperAdmin && (
                <Link to="/pricing-settings" className="pricing-link-btn">
                  <WalletCards size={18} />
                  إعدادات العمولة
                </Link>
              )}
            </div>
          </div>

          <div className="payments-command-card">
            <div className="payments-command-head">
              <div>
                <span>Financial Overview</span>
                <h3>ملخص التحويلات</h3>
              </div>

              <ReceiptText size={38} />
            </div>

            <div className="payments-command-list">
              <div>
                <Banknote size={18} />
                <span>إجمالي المبالغ</span>
                <strong>{stats.totalAmount} ج</strong>
              </div>

              <div>
                <Clock3 size={18} />
                <span>قيد المراجعة</span>
                <strong>{stats.pendingAmount} ج</strong>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>تم قبولها</span>
                <strong>{stats.acceptedAmount} ج</strong>
              </div>

              <div>
                <XCircle size={18} />
                <span>مرفوضة</span>
                <strong>{stats.rejectedAmount} ج</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="payments-stats-grid">
          <div className="payment-stat-card total">
            <div>
              <span>كل العمليات</span>
              <strong>{stats.totalCount}</strong>
            </div>

            <CreditCard size={34} />
          </div>

          <div className="payment-stat-card pending">
            <div>
              <span>قيد المراجعة</span>
              <strong>{stats.pendingCount}</strong>
            </div>

            <Clock3 size={34} />
          </div>

          <div className="payment-stat-card accepted">
            <div>
              <span>تم القبول</span>
              <strong>{stats.acceptedCount}</strong>
            </div>

            <CheckCircle2 size={34} />
          </div>

          <div className="payment-stat-card rejected">
            <div>
              <span>مرفوضة</span>
              <strong>{stats.rejectedCount}</strong>
            </div>

            <XCircle size={34} />
          </div>
        </section>

        <section className="payments-control-panel">
          <div className="payments-search-box">
            <Search size={20} />

            <input
              type="text"
              placeholder="ابحث باسم السائق، الهاتف، رقم العملية، المبلغ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="payments-filter-box">
            <Filter size={20} />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="الكل">كل الحالات</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="تم القبول">تم القبول</option>
              <option value="مرفوض">مرفوض</option>
            </select>
          </div>

          <div className="payments-filter-box">
            <CreditCard size={20} />

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="الكل">كل طرق الدفع</option>
              <option value="فودافون كاش">فودافون كاش</option>
              <option value="إنستاباي">إنستاباي</option>
            </select>
          </div>
        </section>

        <section className="payments-list-section">
          <div className="payments-section-title">
            <span>عمليات السائقين</span>
            <h2>قائمة التحويلات</h2>
          </div>

          <div className="payments-grid">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <article className="payment-card" key={payment.id}>
                  <div className="payment-card-scan"></div>

                  <div className="payment-card-head">
                    <div className="payment-driver-avatar">
                      <UserRound size={22} />
                    </div>

                    <div className="payment-driver-info">
                      <h3>{payment.driverName || "سائق بدون اسم"}</h3>
                      <p>{payment.date || "بدون تاريخ"}</p>
                    </div>

                    <span
                      className={`payment-status ${getStatusClass(
                        payment.status,
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="payment-amount-box">
                    <span>المبلغ المحول</span>
                    <strong>{payment.amount} ج</strong>
                  </div>

                  <div className="payment-info-grid">
                    <div>
                      <Phone size={16} />
                      <span>{payment.driverPhone || "لا يوجد رقم"}</span>
                    </div>

                    <div>
                      {payment.method === "فودافون كاش" ? (
                        <Smartphone size={16} />
                      ) : (
                        <Landmark size={16} />
                      )}
                      <span>{payment.method}</span>
                    </div>

                    <div>
                      <Hash size={16} />
                      <span>
                        {payment.transactionNumber || "بدون رقم عملية"}
                      </span>
                    </div>

                    <div>
                      <ImagePlus size={16} />
                      <span>{payment.proofImage || "لا توجد صورة"}</span>
                    </div>
                  </div>

                  <div className="payment-proof-box">
                    <div className="proof-image-preview">
                      <ImagePlus size={28} />
                      <span>صورة إثبات التحويل</span>
                      <strong>{payment.proofImage || "غير مرفقة"}</strong>
                    </div>
                  </div>

                  <div className="payment-actions">
                    <button
                      type="button"
                      className="view-payment-btn"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye size={17} />
                      التفاصيل
                    </button>

                    <button
                      type="button"
                      className="accept-payment-btn"
                      onClick={() =>
                        updatePaymentStatus(payment.id, "تم القبول")
                      }
                    >
                      <CheckCircle2 size={17} />
                      قبول
                    </button>

                    <button
                      type="button"
                      className="reject-payment-btn"
                      onClick={() => updatePaymentStatus(payment.id, "مرفوض")}
                    >
                      <XCircle size={17} />
                      رفض
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="payments-empty-state">
                <AlertTriangle size={48} />
                <h3>لا توجد تحويلات مطابقة</h3>
                <p>جرّب تغيير البحث أو الفلتر.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <button
              type="button"
              className="payment-modal-close"
              onClick={() => setSelectedPayment(null)}
            >
              <XCircle size={22} />
            </button>

            <div className="payment-modal-head">
              <div className="payment-modal-icon">
                <ReceiptText size={32} />
              </div>

              <div>
                <span>تفاصيل التحويل</span>
                <h2>{selectedPayment.driverName}</h2>
                <p>{selectedPayment.date}</p>
              </div>
            </div>

            <div className="payment-modal-grid">
              <div>
                <UserRound size={18} />
                <span>اسم السائق</span>
                <strong>{selectedPayment.driverName}</strong>
              </div>

              <div>
                <Phone size={18} />
                <span>رقم الهاتف</span>
                <strong>{selectedPayment.driverPhone}</strong>
              </div>

              <div>
                <Banknote size={18} />
                <span>المبلغ</span>
                <strong>{selectedPayment.amount} ج</strong>
              </div>

              <div>
                <CreditCard size={18} />
                <span>طريقة الدفع</span>
                <strong>{selectedPayment.method}</strong>
              </div>

              <div>
                <Hash size={18} />
                <span>رقم العملية</span>
                <strong>{selectedPayment.transactionNumber}</strong>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>الحالة</span>
                <strong>{selectedPayment.status}</strong>
              </div>

              <div>
                <Crown size={18} />
                <span>مسؤول المراجعة</span>
                <strong>{currentAdmin.email}</strong>
              </div>
            </div>

            <div className="payment-modal-proof">
              <h3>صورة إثبات التحويل</h3>

              <div className="modal-proof-placeholder">
                <ImagePlus size={46} />
                <span>اسم الصورة المرفقة</span>
                <strong>{selectedPayment.proofImage || "لا توجد صورة"}</strong>
                <p>
                  حاليًا بنعرض اسم الصورة فقط لأننا شغالين Front-End و
                  localStorage. عند ربط الـ Backend هنقدر نعرض الصورة الحقيقية
                  من Cloudinary أو Firebase Storage.
                </p>
              </div>
            </div>

            <div className="payment-modal-actions">
              <button
                type="button"
                className="accept-payment-btn"
                onClick={() => {
                  updatePaymentStatus(selectedPayment.id, "تم القبول");
                  setSelectedPayment({
                    ...selectedPayment,
                    status: "تم القبول",
                  });
                }}
              >
                <CheckCircle2 size={18} />
                قبول التحويل
              </button>

              <button
                type="button"
                className="reject-payment-btn"
                onClick={() => {
                  updatePaymentStatus(selectedPayment.id, "مرفوض");
                  setSelectedPayment({
                    ...selectedPayment,
                    status: "مرفوض",
                  });
                }}
              >
                <XCircle size={18} />
                رفض التحويل
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDriverPayments;