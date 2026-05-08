import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Ban,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  FileText,
  Fingerprint,
  IdCard,
  MapPin,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  XCircle,
  Zap,
  Eye,
  Download,
  AlertTriangle,
  Navigation,
  Star,
  Radio,
  LogOut,
  Crown,
} from "lucide-react";

import { requestsData } from "../../data/requestsData";
import "./DriverRequestDetails.css";

const fallbackDriverRequest = {
  id: 1,
  requestCode: "#DR-2049",
  name: "أحمد سالم",
  phone: "01011223344",
  center: "شبين الكوم",
  village: "شبين الكوم",
  city: "شبين الكوم - منوفية",
  vehicle: "توك توك",
  requestDate: "29 أبريل 2026",
  status: "قيد المراجعة",
  rating: "4.9",
  expectedEarnings: 420,
  licenseNumber: "MN-2049-88",
  nationalId: "30204011234567",
  plateNumber: "م ن و 2948",
  vehiclePlate: "م ن و 2948",
  experience: "3 سنوات",
  gender: "male",
  documents: {
    personalPhoto: true,
    idPhoto: true,
    selfieWithId: true,
    vehiclePhoto: true,
    licensePhoto: true,
  },
};

const timeline = [
  {
    id: 1,
    title: "تم إرسال الطلب",
    text: "السائق قام بتسجيل بياناته ورفع المستندات.",
    time: "10:15 ص",
    done: true,
  },
  {
    id: 2,
    title: "فحص البيانات",
    text: "تمت مراجعة رقم الهاتف والمدينة ونوع المركبة.",
    time: "10:25 ص",
    done: true,
  },
  {
    id: 3,
    title: "مراجعة المستندات",
    text: "جاري التأكد من البطاقة والرخصة وصورة السائق.",
    time: "الآن",
    done: false,
  },
];

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

function saveRequests(requests) {
  localStorage.setItem("wasalne_driver_requests", JSON.stringify(requests));
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
  if (status === "تمت الموافقة" || status === "تم القبول") return "accepted";
  if (status === "مرفوض" || status === "تم الرفض") return "rejected";
  return "pending";
}

function buildDocuments(request) {
  return [
    {
      id: 1,
      title: "صورة البطاقة الشخصية",
      type: "بطاقة",
      status: request.documents?.idPhoto ? "واضحة" : "غير مرفوعة",
      isAvailable: Boolean(request.documents?.idPhoto),
      icon: <IdCard size={22} />,
    },
    {
      id: 2,
      title: "رخصة القيادة",
      type: "رخصة",
      status: request.documents?.licensePhoto ? "سارية" : "غير مرفوعة",
      isAvailable: Boolean(request.documents?.licensePhoto),
      icon: <FileText size={22} />,
    },
    {
      id: 3,
      title: "صورة السائق",
      type: "صورة شخصية",
      status: request.documents?.personalPhoto ? "مطابقة" : "غير مرفوعة",
      isAvailable: Boolean(request.documents?.personalPhoto),
      icon: <UserRound size={22} />,
    },
    {
      id: 4,
      title: "سيلفي مع البطاقة",
      type: "تحقق هوية",
      status: request.documents?.selfieWithId ? "مطابقة" : "غير مرفوعة",
      isAvailable: Boolean(request.documents?.selfieWithId),
      icon: <ShieldCheck size={22} />,
    },
    {
      id: 5,
      title: "بيانات المركبة",
      type: "مركبة",
      status: request.documents?.vehiclePhoto ? "تم الفحص" : "غير مرفوعة",
      isAvailable: Boolean(request.documents?.vehiclePhoto),
      icon: <CarFront size={22} />,
    },
  ];
}

function DriverRequestDetails() {
  const navigate = useNavigate();
  const { id: routeRequestId } = useParams();
  const [searchParams] = useSearchParams();

  // يدعم المسار الجديد: /driver-request-details/1
  // ويدعم المسار القديم احتياطيًا: /driver-request-details?id=1
  const requestId = routeRequestId || searchParams.get("id");

  const [requests, setRequests] = useState(getStoredRequests);
  const [currentAdmin] = useState(getCurrentAdmin);
  const [adminNote, setAdminNote] = useState("");

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const selectedRequest = useMemo(() => {
    if (!requestId) {
      return fallbackDriverRequest;
    }

    const foundRequest = requests.find(
      (request) => String(request.id) === String(requestId),
    );

    return foundRequest || fallbackDriverRequest;
  }, [requests, requestId]);

  const [requestStatus, setRequestStatus] = useState(
    selectedRequest.status || "قيد المراجعة",
  );

  const driverRequest = {
    ...fallbackDriverRequest,
    ...selectedRequest,
    city:
      selectedRequest.city ||
      `${selectedRequest.center || "غير محدد"} - ${
        selectedRequest.village || "غير محدد"
      }`,
    vehiclePlate:
      selectedRequest.vehiclePlate ||
      selectedRequest.plateNumber ||
      fallbackDriverRequest.vehiclePlate,
    requestCode:
      selectedRequest.requestCode || `#DR-${selectedRequest.id || 2049}`,
    expectedEarnings: selectedRequest.expectedEarnings || 420,
    licenseNumber:
      selectedRequest.licenseNumber || fallbackDriverRequest.licenseNumber,
    nationalId: selectedRequest.nationalId || fallbackDriverRequest.nationalId,
    experience: selectedRequest.experience || fallbackDriverRequest.experience,
    rating: selectedRequest.rating || fallbackDriverRequest.rating,
  };

  const documents = buildDocuments(driverRequest);

  const updateRequestStatus = (status) => {
    setRequestStatus(status);

    const updatedRequests = requests.map((request) =>
      String(request.id) === String(driverRequest.id)
        ? {
            ...request,
            status,
            adminNote: adminNote.trim(),
            reviewedBy: currentAdmin.email,
            reviewedAt: new Date().toLocaleString("ar-EG"),
          }
        : request,
    );

    setRequests(updatedRequests);
    saveRequests(updatedRequests);
  };

  const acceptDriver = () => {
    updateRequestStatus("تمت الموافقة");
    alert("تم قبول السائق بنجاح");
  };

  const rejectDriver = () => {
    updateRequestStatus("مرفوض");
    alert("تم رفض طلب السائق");
  };

  const saveAdminNote = () => {
    const updatedRequests = requests.map((request) =>
      String(request.id) === String(driverRequest.id)
        ? {
            ...request,
            adminNote: adminNote.trim(),
            noteSavedAt: new Date().toLocaleString("ar-EG"),
          }
        : request,
    );

    setRequests(updatedRequests);
    saveRequests(updatedRequests);

    alert("تم حفظ ملاحظة الإدارة");
  };

  const temporaryBlockDriver = () => {
    updateRequestStatus("مرفوض");
    alert("تم حظر الطلب مؤقتًا");
  };

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");

    navigate("/login");
  };

  return (
    <section className="driver-request-details" dir="rtl">
      <div className="future-grid-bg"></div>
      <div className="request-orb request-orb--one"></div>
      <div className="request-orb request-orb--two"></div>
      <div className="request-orb request-orb--three"></div>

      <div className="request-details-container">
        <header className="request-details-topbar">
          <div className="topbar-title">
            <Link
              to="/admin-driver-requests"
              className="back-btn"
              aria-label="الرجوع لطلبات السائقين"
            >
              <ArrowRight size={20} />
            </Link>

            <div>
              <span className="page-eyebrow">
                <Sparkles size={15} />
                مركز مراجعة السائقين
              </span>

              <h1>تفاصيل طلب السائق</h1>
              <p>راجع بيانات السائق، المستندات، وحالة الطلب قبل الموافقة.</p>
            </div>
          </div>

          <div className="status-control">
            <span className="driver-details-role">
              <Crown size={15} />
              {isSuperAdmin ? "Super Admin" : currentAdmin.title}
            </span>

            <span className={`request-status ${getStatusClass(requestStatus)}`}>
              <Radio size={15} />
              {requestStatus}
            </span>

            <span className="request-id">{driverRequest.requestCode}</span>

            <button
              type="button"
              className="driver-details-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              تسجيل الخروج
            </button>
          </div>
        </header>

        <section className="request-hero">
          <div className="driver-main-card">
            <div className="driver-avatar-box">
              <div className="driver-avatar-glow"></div>

              <div className="driver-avatar">
                <UserRound size={54} />
              </div>

              <span className="verify-badge">
                <ShieldCheck size={16} />
                موثق
              </span>
            </div>

            <div className="driver-hero-info">
              <span className="driver-role">
                <Zap size={15} />
                طلب انضمام جديد
              </span>

              <h2>{driverRequest.name}</h2>

              <p>
                سائق يرغب في الانضمام إلى منصة وصلني، وجاهز لاستقبال الطلبات بعد
                مراجعة الإدارة.
              </p>

              <div className="driver-tags">
                <span>
                  <CarFront size={16} />
                  {driverRequest.vehicle}
                </span>

                <span>
                  <MapPin size={16} />
                  {driverRequest.city}
                </span>

                <span>
                  <Star size={16} />
                  تقييم متوقع {driverRequest.rating}
                </span>
              </div>
            </div>
          </div>

          <div className="decision-card">
            <span className="decision-label">قرار الإدارة</span>

            <h3>هل تريد قبول هذا السائق؟</h3>

            <p>
              بعد القبول سيظهر السائق كمتاح داخل النظام، وبعد الرفض سيتم حفظ
              الطلب في سجل الطلبات المرفوضة.
            </p>

            <div className="decision-actions">
              <button
                type="button"
                className="accept-btn"
                onClick={acceptDriver}
              >
                <CheckCircle2 size={19} />
                قبول السائق
              </button>

              <button
                type="button"
                className="reject-btn"
                onClick={rejectDriver}
              >
                <XCircle size={19} />
                رفض الطلب
              </button>
            </div>

            <div className="decision-warning">
              <AlertTriangle size={18} />
              <span>تأكد من صحة المستندات قبل اتخاذ القرار النهائي.</span>
            </div>
          </div>
        </section>

        <section className="details-grid">
          <div className="details-panel driver-info-panel">
            <div className="panel-head">
              <div>
                <span className="panel-tag">بيانات السائق</span>
                <h3>المعلومات الأساسية</h3>
              </div>

              <div className="panel-icon">
                <Fingerprint size={21} />
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <UserRound size={19} />
                <div>
                  <span>اسم السائق</span>
                  <strong>{driverRequest.name}</strong>
                </div>
              </div>

              <div className="info-item">
                <Phone size={19} />
                <div>
                  <span>رقم الهاتف</span>
                  <strong>{driverRequest.phone}</strong>
                </div>
              </div>

              <div className="info-item">
                <MapPin size={19} />
                <div>
                  <span>المنطقة</span>
                  <strong>{driverRequest.city}</strong>
                </div>
              </div>

              <div className="info-item">
                <CalendarDays size={19} />
                <div>
                  <span>تاريخ الطلب</span>
                  <strong>{driverRequest.requestDate}</strong>
                </div>
              </div>

              <div className="info-item">
                <IdCard size={19} />
                <div>
                  <span>الرقم القومي</span>
                  <strong>{driverRequest.nationalId}</strong>
                </div>
              </div>

              <div className="info-item">
                <FileText size={19} />
                <div>
                  <span>رقم الرخصة</span>
                  <strong>{driverRequest.licenseNumber}</strong>
                </div>
              </div>

              <div className="info-item">
                <CarFront size={19} />
                <div>
                  <span>رقم المركبة</span>
                  <strong>{driverRequest.vehiclePlate}</strong>
                </div>
              </div>

              <div className="info-item">
                <Clock3 size={19} />
                <div>
                  <span>الخبرة</span>
                  <strong>{driverRequest.experience}</strong>
                </div>
              </div>

              <div className="info-item">
                <ShieldCheck size={19} />
                <div>
                  <span>مسؤول المراجعة</span>
                  <strong>{currentAdmin.email}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="details-panel smart-score-panel">
            <div className="panel-head">
              <div>
                <span className="panel-tag">تحليل ذكي</span>
                <h3>مؤشرات القبول</h3>
              </div>

              <div className="panel-icon">
                <BadgeCheck size={21} />
              </div>
            </div>

            <div className="score-circle">
              <div>
                <strong>92%</strong>
                <span>جاهزية</span>
              </div>
            </div>

            <div className="score-list">
              <div>
                <span>اكتمال البيانات</span>
                <strong>98%</strong>
              </div>

              <div>
                <span>وضوح المستندات</span>
                <strong>94%</strong>
              </div>

              <div>
                <span>مطابقة الهوية</span>
                <strong>90%</strong>
              </div>

              <div>
                <span>تقييم المخاطر</span>
                <strong>منخفض</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="documents-section">
          <div className="section-head">
            <div>
              <span className="panel-tag">المستندات</span>
              <h3>مراجعة الملفات المرفوعة</h3>
            </div>

            <span className="docs-count">{documents.length} ملفات</span>
          </div>

          <div className="documents-grid">
            {documents.map((doc) => (
              <article
                className={`document-card ${
                  doc.isAvailable ? "doc-available" : "doc-missing"
                }`}
                key={doc.id}
              >
                <div className="document-icon">{doc.icon}</div>

                <div className="document-content">
                  <h4>{doc.title}</h4>
                  <p>{doc.type}</p>

                  <span className="doc-status">
                    {doc.isAvailable ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <XCircle size={15} />
                    )}
                    {doc.status}
                  </span>
                </div>

                <div className="document-actions">
                  <button type="button">
                    <Eye size={17} />
                  </button>

                  <button type="button">
                    <Download size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bottom-grid">
          <div className="details-panel timeline-panel">
            <div className="panel-head">
              <div>
                <span className="panel-tag">مسار الطلب</span>
                <h3>Timeline</h3>
              </div>

              <div className="panel-icon">
                <Navigation size={21} />
              </div>
            </div>

            <div className="timeline-list">
              {timeline.map((item) => (
                <div className="timeline-item" key={item.id}>
                  <div className={`timeline-dot ${item.done ? "done" : ""}`}>
                    {item.done ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Clock3 size={16} />
                    )}
                  </div>

                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="details-panel admin-note-panel">
            <div className="panel-head">
              <div>
                <span className="panel-tag">ملاحظات الإدارة</span>
                <h3>اكتب ملاحظة</h3>
              </div>

              <div className="panel-icon">
                <MessageSquareText size={21} />
              </div>
            </div>

            <textarea
              placeholder="اكتب سبب القبول أو الرفض أو أي ملاحظة خاصة بالطلب..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            ></textarea>

            <div className="note-actions">
              <button
                type="button"
                className="save-note-btn"
                onClick={saveAdminNote}
              >
                <CheckCircle2 size={18} />
                حفظ الملاحظة
              </button>

              <button
                type="button"
                className="block-driver-btn"
                onClick={temporaryBlockDriver}
              >
                <Ban size={18} />
                حظر مؤقت
              </button>
            </div>

            <div className="mini-summary">
              <div>
                <WalletCards size={18} />
                <span>ربح متوقع يوميًا</span>
                <strong>{driverRequest.expectedEarnings} ج</strong>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>درجة الأمان</span>
                <strong>ممتاز</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default DriverRequestDetails;
