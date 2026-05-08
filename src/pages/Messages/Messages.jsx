import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CloudUpload,
  Headphones,
  Home,
  ImagePlus,
  Mail,
  MessageCircle,
  Mic,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";

import "./Messages.css";

const messageTypes = [
  {
    id: "suggestion",
    title: "اقتراح",
    text: "عندك فكرة تطور بيها الخدمة؟ ابعتها لنا.",
    icon: <Sparkles size={22} />,
  },
  {
    id: "problem",
    title: "مشكلة",
    text: "واجهتك مشكلة في رحلة أو في استخدام الموقع؟",
    icon: <ShieldCheck size={22} />,
  },
  {
    id: "question",
    title: "سؤال",
    text: "عايز تسأل عن الخدمة أو طريقة الاستخدام؟",
    icon: <MessageCircle size={22} />,
  },
];

function getMessageTypeLabel(type) {
  if (type === "suggestion") return "اقتراح";
  if (type === "question") return "سؤال";
  return "مشكلة";
}

function getStoredSupportMessages() {
  const savedMessages = localStorage.getItem("wasalne_support_messages");

  if (!savedMessages) {
    return [];
  }

  try {
    const parsedMessages = JSON.parse(savedMessages);

    return Array.isArray(parsedMessages) ? parsedMessages : [];
  } catch {
    return [];
  }
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

function getBackPathByRole(role) {
  if (role === "super_admin") {
    return "/admin-dashboard";
  }

  if (role === "driver") {
    return "/driver-dashboard";
  }

  if (role === "rider") {
    return "/rider-dashboard";
  }

  return "/home";
}

function Messages() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const backPath = getBackPathByRole(currentUser?.role);

  const [messageType, setMessageType] = useState("problem");
  const [messageText, setMessageText] = useState("");
  const [userName, setUserName] = useState(currentUser?.name || "");
  const [userPhone, setUserPhone] = useState(currentUser?.phone || "");
  const [selectedImage, setSelectedImage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedImage(file.name);
  };

  const handleSendMessage = (event) => {
    event.preventDefault();

    if (!messageText.trim()) {
      alert("اكتب رسالتك الأول قبل الإرسال");
      return;
    }

    const newMessage = {
      id: Date.now(),
      type: messageType,
      typeLabel: getMessageTypeLabel(messageType),
      name: userName.trim() || currentUser?.name || "مستخدم بدون اسم",
      phone: userPhone.trim() || currentUser?.phone || "لا يوجد رقم",
      email: currentUser?.email || "",
      role: currentUser?.role || "guest",
      message: messageText.trim(),
      image: selectedImage,
      hasVoice: isRecording,
      status: "جديدة",
      createdAt: new Date().toLocaleString("ar-EG"),
    };

    const oldMessages = getStoredSupportMessages();
    const updatedMessages = [newMessage, ...oldMessages];

    localStorage.setItem(
      "wasalne_support_messages",
      JSON.stringify(updatedMessages),
    );

    setIsSent(true);
    setMessageText("");
    setSelectedImage("");
    setIsRecording(false);

    setTimeout(() => {
      setIsSent(false);
    }, 3500);
  };

  return (
    <section className="messages-page" dir="rtl">
      <div className="messages-grid-bg"></div>
      <div className="messages-orb messages-orb-one"></div>
      <div className="messages-orb messages-orb-two"></div>
      <div className="messages-orb messages-orb-three"></div>

      <div className="messages-container">
        <header className="messages-topbar">
          <div className="messages-title-box">
            <Link to={backPath} className="messages-back-btn">
              <ArrowRight size={20} />
            </Link>

            <div>
              <span className="messages-eyebrow">
                <Sparkles size={15} />
                مركز التواصل الذكي
              </span>

              <h1>إرسال رسالة للدعم</h1>

              <p>
                ابعت اقتراح، مشكلة، صورة، أو رسالة صوتية وسيتم مراجعتها من فريق
                وصلني.
              </p>
            </div>
          </div>

          <div className="messages-status">
            <span>
              <Zap size={16} />
              رد سريع
            </span>

            <span>
              <ShieldCheck size={16} />
              بياناتك آمنة
            </span>
          </div>
        </header>

        <section className="messages-hero">
          <div className="messages-hero-content">
            <span className="hero-chip">
              <Bot size={17} />
              مساعد وصلني الذكي
            </span>

            <h2>عندك اقتراح أو مشكلة؟ ابعتها بطريقة أسهل من أي وقت</h2>

            <p>
              تقدر تكتب رسالة، ترفق صورة توضح المشكلة، أو تستخدم تسجيل صوتي
              لمساعدة الدعم يفهم طلبك بسرعة.
            </p>

            <div className="support-features">
              <div>
                <CheckCircle2 size={18} />
                <span>متابعة من الإدارة</span>
              </div>

              <div>
                <Headphones size={18} />
                <span>دعم سريع</span>
              </div>

              <div>
                <CloudUpload size={18} />
                <span>إرفاق صورة</span>
              </div>
            </div>
          </div>

          <div className="messages-ai-card">
            <div className="ai-icon">
              <MessageCircle size={34} />
            </div>

            <h3>نظام تحليل الرسائل</h3>

            <p>
              في النسخة الحقيقية سيتم إرسال الرسالة للـ Backend، ويتم تصنيفها
              تلقائيًا حسب نوعها وأولويتها.
            </p>

            <div className="ai-lines">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </section>

        <main className="messages-main-grid">
          <form className="message-form-panel" onSubmit={handleSendMessage}>
            <div className="panel-head">
              <div>
                <span className="panel-tag">اكتب رسالتك</span>
                <h3>تفاصيل الرسالة</h3>
              </div>

              <div className="panel-icon">
                <Send size={20} />
              </div>
            </div>

            <div className="message-types-grid">
              {messageTypes.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  className={`message-type-card ${
                    messageType === type.id ? "active" : ""
                  }`}
                  onClick={() => setMessageType(type.id)}
                >
                  <div className="message-type-icon">{type.icon}</div>

                  <div>
                    <h4>{type.title}</h4>
                    <p>{type.text}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="form-row">
              <label>
                <span>اسمك</span>

                <div className="input-box">
                  <UserRound size={18} />

                  <input
                    type="text"
                    placeholder="اكتب اسمك"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </label>

              <label>
                <span>رقم الهاتف</span>

                <div className="input-box">
                  <Phone size={18} />

                  <input
                    type="text"
                    placeholder="اكتب رقمك للتواصل"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <label className="message-textarea-label">
              <span>رسالتك</span>

              <textarea
                placeholder="اكتب هنا تفاصيل المشكلة أو الاقتراح..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              ></textarea>
            </label>

            <div className="attachment-grid">
              <label className="upload-card">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <div className="upload-icon">
                  <ImagePlus size={24} />
                </div>

                <div>
                  <h4>إرفاق صورة</h4>

                  <p>
                    {selectedImage
                      ? `تم اختيار: ${selectedImage}`
                      : "صورة للمشكلة أو Screenshot"}
                  </p>
                </div>
              </label>

              <button
                type="button"
                className={`voice-card ${isRecording ? "recording" : ""}`}
                onClick={() => setIsRecording((prev) => !prev)}
              >
                <div className="voice-icon">
                  <Mic size={24} />
                </div>

                <div>
                  <h4>{isRecording ? "جاري التسجيل..." : "تسجيل صوت"}</h4>

                  <p>
                    {isRecording
                      ? "اضغط لإيقاف التسجيل"
                      : "سجل شرح سريع للمشكلة"}
                  </p>
                </div>
              </button>
            </div>

            {isSent && (
              <div className="success-message">
                <CheckCircle2 size={20} />
                تم إرسال رسالتك بنجاح، وستظهر داخل صفحة رسائل الدعم.
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="send-message-btn">
                <Send size={19} />
                إرسال الرسالة
              </button>

              <Link to={backPath} className="home-link-btn">
                <Home size={19} />
                رجوع
              </Link>
            </div>
          </form>

          <aside className="messages-side-panel">
            <div className="side-card emergency-card">
              <div className="side-icon">
                <Headphones size={24} />
              </div>

              <h3>الدعم السريع</h3>

              <p>
                لو المشكلة متعلقة برحلة حالية، اكتب كل التفاصيل: المكان، اسم
                السائق أو الراكب، ووقت حدوث المشكلة.
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-item">
                <div>
                  <Phone size={19} />
                </div>

                <span>الدعم الهاتفي</span>
                <strong>01000000000</strong>
              </div>

              <div className="contact-item">
                <div>
                  <Mail size={19} />
                </div>

                <span>البريد الإلكتروني</span>
                <strong>support@wasalne.com</strong>
              </div>

              <div className="contact-item">
                <div>
                  <MessageCircle size={19} />
                </div>

                <span>متوسط الرد</span>
                <strong>خلال 24 ساعة</strong>
              </div>
            </div>

            <div className="tips-card">
              <span>نصيحة</span>

              <p>
                كلما كتبت تفاصيل أكتر وأرفقت صورة للمشكلة، كلما كان الرد أسرع
                وأسهل.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </section>
  );
}

export default Messages;
