import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  Search,
  Filter,
  Clock3,
  CheckCircle2,
  Eye,
  Phone,
  ImagePlus,
  Mic,
  Mail,
  Sparkles,
  AlertCircle,
  Bot,
  Reply,
  RotateCcw,
  ShieldCheck,
  HelpCircle,
  FileText,
  Headphones,
  Inbox,
  LogOut,
  Crown,
} from "lucide-react";

import "./AdminSupportMessages.css";

const demoMessages = [
  {
    id: 1,
    type: "problem",
    typeLabel: "مشكلة",
    name: "أحمد سالم",
    phone: "01011223344",
    message:
      "كان عندي مشكلة في تحديد موقع السائق على الخريطة، الموقع كان بيتأخر في التحديث ومش بيظهر بدقة.",
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

function saveMessages(messages) {
  localStorage.setItem("wasalne_support_messages", JSON.stringify(messages));
}

function getMessageTypeClass(type) {
  if (type === "suggestion") return "suggestion";
  if (type === "question") return "question";
  return "problem";
}

function getMessageStatusClass(status) {
  if (status === "تم الرد") return "answered";
  if (status === "مغلقة") return "closed";
  if (status === "قيد المراجعة") return "reviewing";
  return "new";
}

function getMessageIcon(type) {
  if (type === "suggestion") return <Sparkles size={23} />;
  if (type === "question") return <HelpCircle size={23} />;
  return <AlertCircle size={23} />;
}

function AdminSupportMessages() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState(getStoredMessages);
  const [currentAdmin] = useState(getCurrentAdmin);

  const [messageFilter, setMessageFilter] = useState("الكل");
  const [typeFilter, setTypeFilter] = useState("الكل");
  const [messageSearch, setMessageSearch] = useState("");

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const updateMessageStatus = (id, status) => {
    const updatedMessages = messages.map((message) =>
      message.id === id ? { ...message, status } : message,
    );

    setMessages(updatedMessages);
    saveMessages(updatedMessages);
  };

  const resetMessages = () => {
    localStorage.removeItem("wasalne_support_messages");
    setMessages(demoMessages);
  };

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");

    navigate("/login");
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesStatus =
        messageFilter === "الكل" ? true : message.status === messageFilter;

      const matchesType =
        typeFilter === "الكل" ? true : message.typeLabel === typeFilter;

      const searchText = `
        ${message.name || ""}
        ${message.phone || ""}
        ${message.message || ""}
        ${message.typeLabel || ""}
        ${message.status || ""}
        ${message.createdAt || ""}
      `;

      const matchesSearch = searchText
        .toLowerCase()
        .includes(messageSearch.trim().toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [messages, messageFilter, typeFilter, messageSearch]);

  const stats = useMemo(() => {
    return {
      total: messages.length,
      newMessages: messages.filter((message) => message.status === "جديدة")
        .length,
      reviewing: messages.filter(
        (message) => message.status === "قيد المراجعة",
      ).length,
      answered: messages.filter((message) => message.status === "تم الرد")
        .length,
      closed: messages.filter((message) => message.status === "مغلقة").length,
      withImages: messages.filter((message) => message.image).length,
      withVoice: messages.filter((message) => message.hasVoice).length,
    };
  }, [messages]);

  return (
    <main className="admin-support-page" dir="rtl">
      <div className="support-grid-bg"></div>
      <div className="support-orb support-orb-one"></div>
      <div className="support-orb support-orb-two"></div>

      <div className="admin-support-container">
        <header className="support-topbar">
          <div className="support-topbar-actions">
            {isSuperAdmin && (
              <Link to="/admin-dashboard" className="support-back-btn">
                <ArrowRight size={20} />
                رجوع لمركز التحكم
              </Link>
            )}

            <button
              type="button"
              className="support-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              تسجيل الخروج
            </button>
          </div>

          <div className="support-brand">
            <div className="support-brand-icon">
              <Headphones size={30} />
            </div>

            <div>
              <h2>رسائل الدعم والاقتراحات</h2>
              <p>مراجعة كل رسائل المستخدمين والرد عليها من مكان واحد</p>
            </div>
          </div>
        </header>

        <section className="support-hero">
          <div className="support-hero-content">
            <div className="support-role-line">
              <span className="support-badge">
                <Sparkles size={16} />
                Support Control Center
              </span>

              <span className="support-role-chip">
                <Crown size={16} />
                {isSuperAdmin ? "Super Admin" : currentAdmin.title}
              </span>
            </div>

            <h1>كل رسائل المستخدمين في لوحة واحدة</h1>

            <p>
              راجع المشاكل، الاقتراحات، والأسئلة. افتح تفاصيل كل رسالة، تابع
              الصور والتسجيلات، وغيّر حالة الرسالة بسهولة.
            </p>

            <div className="support-admin-info">
              <ShieldCheck size={18} />
              <span>
                أنت داخل الآن كـ{" "}
                <strong>{isSuperAdmin ? "Super Admin" : "Support Manager"}</strong>
              </span>
              <small>{currentAdmin.email}</small>
            </div>

            <div className="support-hero-actions">
              <button
                type="button"
                className="reset-support-btn"
                onClick={resetMessages}
              >
                <RotateCcw size={18} />
                استرجاع رسائل التجربة
              </button>

              <Link to="/messages" className="preview-messages-btn">
                <Inbox size={18} />
                معاينة صفحة إرسال الرسائل
              </Link>
            </div>
          </div>

          <div className="support-command-card">
            <div className="support-command-head">
              <div>
                <span>Messages Overview</span>
                <h3>ملخص الرسائل</h3>
              </div>

              <MessageCircle size={40} />
            </div>

            <div className="support-command-list">
              <div>
                <MessageCircle size={18} />
                <span>كل الرسائل</span>
                <strong>{stats.total}</strong>
              </div>

              <div>
                <Mail size={18} />
                <span>رسائل جديدة</span>
                <strong>{stats.newMessages}</strong>
              </div>

              <div>
                <Clock3 size={18} />
                <span>قيد المراجعة</span>
                <strong>{stats.reviewing}</strong>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>تم الرد</span>
                <strong>{stats.answered}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="support-stats-grid">
          <div className="support-stat-card total">
            <div>
              <span>كل الرسائل</span>
              <strong>{stats.total}</strong>
            </div>

            <MessageCircle size={34} />
          </div>

          <div className="support-stat-card new">
            <div>
              <span>جديدة</span>
              <strong>{stats.newMessages}</strong>
            </div>

            <Mail size={34} />
          </div>

          <div className="support-stat-card reviewing">
            <div>
              <span>قيد المراجعة</span>
              <strong>{stats.reviewing}</strong>
            </div>

            <Clock3 size={34} />
          </div>

          <div className="support-stat-card answered">
            <div>
              <span>تم الرد</span>
              <strong>{stats.answered}</strong>
            </div>

            <Reply size={34} />
          </div>

          <div className="support-stat-card media">
            <div>
              <span>مرفقات</span>
              <strong>{stats.withImages + stats.withVoice}</strong>
            </div>

            <ImagePlus size={34} />
          </div>
        </section>

        <section className="support-control-panel">
          <div className="support-search-box">
            <Search size={20} />

            <input
              type="text"
              placeholder="ابحث بالاسم، الهاتف، محتوى الرسالة، النوع، الحالة..."
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
            />
          </div>

          <div className="support-filter-box">
            <Filter size={20} />

            <select
              value={messageFilter}
              onChange={(e) => setMessageFilter(e.target.value)}
            >
              <option value="الكل">كل الحالات</option>
              <option value="جديدة">جديدة</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="تم الرد">تم الرد</option>
              <option value="مغلقة">مغلقة</option>
            </select>
          </div>

          <div className="support-filter-box">
            <FileText size={20} />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="الكل">كل الأنواع</option>
              <option value="مشكلة">مشكلة</option>
              <option value="اقتراح">اقتراح</option>
              <option value="سؤال">سؤال</option>
            </select>
          </div>
        </section>

        <section className="support-list-section">
          <div className="support-section-title">
            <span>رسائل المستخدمين</span>
            <h2>قائمة الرسائل</h2>
          </div>

          <div className="support-messages-grid-full">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((message) => (
                <article className="admin-support-card" key={message.id}>
                  <div className="admin-support-card-scan"></div>

                  <div className="admin-support-card-head">
                    <div className="admin-support-icon">
                      {getMessageIcon(message.type)}
                    </div>

                    <div className="admin-support-user">
                      <h3>{message.name || "مستخدم بدون اسم"}</h3>
                      <p>{message.createdAt || "بدون تاريخ"}</p>
                    </div>

                    <span
                      className={`admin-support-type ${getMessageTypeClass(
                        message.type,
                      )}`}
                    >
                      {message.typeLabel || "مشكلة"}
                    </span>
                  </div>

                  <div className="admin-support-main-box">
                    <span>محتوى الرسالة</span>
                    <p>{message.message}</p>
                  </div>

                  <div className="admin-support-info-grid">
                    <div>
                      <Phone size={16} />
                      <span>{message.phone || "لا يوجد رقم"}</span>
                    </div>

                    <div>
                      <ShieldCheck size={16} />
                      <span>{message.status || "جديدة"}</span>
                    </div>

                    <div>
                      <ImagePlus size={16} />
                      <span>
                        {message.image ? "يوجد صورة" : "لا توجد صورة"}
                      </span>
                    </div>

                    <div>
                      <Mic size={16} />
                      <span>
                        {message.hasVoice ? "يوجد تسجيل صوتي" : "لا يوجد صوت"}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`admin-support-status ${getMessageStatusClass(
                      message.status,
                    )}`}
                  >
                    <Bot size={16} />
                    <span>{message.status || "جديدة"}</span>
                  </div>

                  <div className="admin-support-actions">
                    <Link
                      to={`/support-message-details/${message.id}`}
                      className="support-details-btn"
                      onClick={() =>
                        updateMessageStatus(message.id, "قيد المراجعة")
                      }
                    >
                      <Eye size={17} />
                      التفاصيل
                    </Link>

                    <button
                      type="button"
                      className="support-reply-btn"
                      onClick={() => updateMessageStatus(message.id, "تم الرد")}
                    >
                      <Reply size={17} />
                      تم الرد
                    </button>

                    <button
                      type="button"
                      className="support-close-btn"
                      onClick={() => updateMessageStatus(message.id, "مغلقة")}
                    >
                      <CheckCircle2 size={17} />
                      إغلاق
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="support-empty-state">
                <MessageCircle size={52} />
                <h3>لا توجد رسائل مطابقة</h3>
                <p>جرّب تغيير البحث أو الفلتر.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminSupportMessages;