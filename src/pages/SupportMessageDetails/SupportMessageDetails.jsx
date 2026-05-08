import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  Phone,
  UserRound,
  CalendarDays,
  ImagePlus,
  Mic,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  Sparkles,
  Reply,
  LogOut,
  Crown,
} from "lucide-react";

import "./SupportMessageDetails.css";

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

function getCurrentAdmin() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return {
      name: "Support Manager",
      email: "support@wasalne.com",
      role: "support_manager",
      title: "مسؤول الدعم",
    };
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    return {
      name: parsedUser.name || "Support Manager",
      email: parsedUser.email || "support@wasalne.com",
      role: parsedUser.role || "support_manager",
      title: parsedUser.title || "مسؤول الدعم",
    };
  } catch {
    return {
      name: "Support Manager",
      email: "support@wasalne.com",
      role: "support_manager",
      title: "مسؤول الدعم",
    };
  }
}

function getStatusClass(status) {
  if (status === "تم الرد") return "answered";
  if (status === "مغلقة") return "closed";
  if (status === "قيد المراجعة") return "reviewing";
  return "new";
}

function SupportMessageDetails() {
  const { id: routeMessageId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // يدعم المسار الجديد: /support-message-details/1
  // ويدعم المسار القديم احتياطيًا: /support-message-details?id=1
  const messageId = routeMessageId || searchParams.get("id");

  const [messages, setMessages] = useState(getStoredMessages);
  const [currentAdmin] = useState(getCurrentAdmin);
  const [adminReply, setAdminReply] = useState("");

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const message = useMemo(() => {
    return messages.find((item) => String(item.id) === String(messageId));
  }, [messages, messageId]);

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");
    localStorage.removeItem("wasalne_after_auth_redirect");
    localStorage.removeItem("wasalne_pending_role");
    localStorage.removeItem("wasalne_admin_preview_rider");
    localStorage.removeItem("wasalne_admin_preview_driver");

    navigate("/login");
  };

  const updateStatus = (status) => {
    const updatedMessages = messages.map((item) =>
      String(item.id) === String(messageId)
        ? {
            ...item,
            status,
            adminReply: adminReply.trim(),
            updatedAt: new Date().toLocaleString("ar-EG"),
          }
        : item,
    );

    setMessages(updatedMessages);

    localStorage.setItem(
      "wasalne_support_messages",
      JSON.stringify(updatedMessages),
    );

    alert(`تم تغيير حالة الرسالة إلى: ${status}`);
  };

  if (!message) {
    return (
      <section className="support-details-page" dir="rtl">
        <div className="support-details-container">
          <div className="not-found-card">
            <MessageCircle size={52} />
            <h1>الرسالة غير موجودة</h1>
            <p>الرسالة التي تحاول فتحها غير موجودة أو تم حذفها.</p>

            <Link to="/admin-support-messages" className="back-admin-btn">
              <ArrowRight size={18} />
              رجوع لرسائل الدعم
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="support-details-page" dir="rtl">
      <div className="support-details-grid-bg"></div>
      <div className="support-orb support-orb-one"></div>
      <div className="support-orb support-orb-two"></div>

      <div className="support-details-container">
        <header className="support-details-topbar">
          <div className="support-title-box">
            <Link to="/admin-support-messages" className="back-btn">
              <ArrowRight size={20} />
            </Link>

            <div>
              <span className="support-eyebrow">
                <Sparkles size={15} />
                مراجعة رسالة مستخدم
              </span>

              <h1>تفاصيل رسالة الدعم</h1>
              <p>راجع محتوى الرسالة، بيانات المستخدم، والمرفقات قبل الرد.</p>
            </div>
          </div>

          <div className="support-details-actions">
            <span className="support-details-role">
              <Crown size={15} />
              {isSuperAdmin ? "Super Admin" : currentAdmin.title}
            </span>

            <span
              className={`message-status-chip ${getStatusClass(message.status)}`}
            >
              <Clock3 size={16} />
              {message.status}
            </span>

            <button
              type="button"
              className="support-details-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              تسجيل الخروج
            </button>
          </div>
        </header>

        <section className="support-details-hero">
          <div className="message-main-card">
            <div className="message-main-head">
              <div className="message-big-icon">
                <MessageCircle size={38} />
              </div>

              <div>
                <span className="message-type">{message.typeLabel}</span>
                <h2>{message.name || "مستخدم بدون اسم"}</h2>
                <p>{message.createdAt}</p>
              </div>
            </div>

            <div className="message-content-box">
              <h3>محتوى الرسالة</h3>
              <p>{message.message}</p>
            </div>

            <div className="attachments-row">
              {message.image ? (
                <div className="attachment-item">
                  <ImagePlus size={18} />
                  <span>صورة مرفقة</span>
                  <strong>{message.image}</strong>
                </div>
              ) : (
                <div className="attachment-item muted">
                  <ImagePlus size={18} />
                  <span>لا توجد صورة مرفقة</span>
                </div>
              )}

              {message.hasVoice ? (
                <div className="attachment-item">
                  <Mic size={18} />
                  <span>تسجيل صوتي مرفق</span>
                  <strong>voice-message.mp3</strong>
                </div>
              ) : (
                <div className="attachment-item muted">
                  <Mic size={18} />
                  <span>لا يوجد تسجيل صوتي</span>
                </div>
              )}
            </div>
          </div>

          <aside className="message-side-card">
            <div className="side-card-head">
              <ShieldCheck size={26} />
              <h3>بيانات التواصل</h3>
            </div>

            <div className="info-list">
              <div>
                <UserRound size={18} />
                <span>الاسم</span>
                <strong>{message.name || "غير محدد"}</strong>
              </div>

              <div>
                <Phone size={18} />
                <span>رقم الهاتف</span>
                <strong>{message.phone || "غير متوفر"}</strong>
              </div>

              <div>
                <Mail size={18} />
                <span>نوع الرسالة</span>
                <strong>{message.typeLabel}</strong>
              </div>

              <div>
                <CalendarDays size={18} />
                <span>وقت الإرسال</span>
                <strong>{message.createdAt}</strong>
              </div>

              <div>
                <ShieldCheck size={18} />
                <span>مسؤول المراجعة</span>
                <strong>{currentAdmin.email}</strong>
              </div>
            </div>
          </aside>
        </section>

        <section className="admin-reply-card">
          <div className="reply-head">
            <div>
              <span>رد الإدارة</span>
              <h3>اكتب رد أو غيّر حالة الرسالة</h3>
            </div>

            <Reply size={24} />
          </div>

          <textarea
            placeholder="اكتب رد الإدارة هنا..."
            value={adminReply}
            onChange={(e) => setAdminReply(e.target.value)}
          />

          <div className="reply-actions">
            <button
              type="button"
              className="review-btn"
              onClick={() => updateStatus("قيد المراجعة")}
            >
              <Clock3 size={18} />
              قيد المراجعة
            </button>

            <button
              type="button"
              className="reply-btn"
              onClick={() => updateStatus("تم الرد")}
            >
              <Reply size={18} />
              تم الرد
            </button>

            <button
              type="button"
              className="close-btn"
              onClick={() => updateStatus("مغلقة")}
            >
              <CheckCircle2 size={18} />
              إغلاق الرسالة
            </button>
          </div>

          {message.adminReply && (
            <div className="saved-reply-box">
              <span>آخر رد محفوظ</span>
              <p>{message.adminReply}</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default SupportMessageDetails;
