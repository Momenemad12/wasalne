import { useNavigate } from "react-router-dom";
import {
  Car,
  User,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Clock,
  HelpCircle,
  Mail,
  Navigation,
  CheckCircle,
  Smartphone,
  MapPinned,
  ArrowLeft,
  Bike,
  Bus,
  Truck,
  Package,
  Boxes,
} from "lucide-react";
import "./Home.css";

const logoPath = `${import.meta.env.BASE_URL}logo-wasalne.png`;

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

function getUserRole() {
  const currentUser = getCurrentUser();
  const savedRole = localStorage.getItem("wasalne_user_role");

  return currentUser?.role || savedRole || null;
}

function getHomeByRole(role) {
  if (role === "super_admin") return "/admin-dashboard";
  if (role === "driver_reviewer") return "/admin-driver-requests";
  if (role === "support_manager") return "/admin-support-messages";
  if (role === "pricing_manager") return "/pricing-settings";
  if (role === "finance_admin") return "/admin-driver-payments";
  if (role === "driver") return "/driver-dashboard";
  if (role === "rider") return "/rider-dashboard";

  return "/home";
}

function Home() {
  const navigate = useNavigate();

  const goToHome = () => {
    navigate("/home");
  };

  const goToLogin = () => {
    const role = getUserRole();

    if (role) {
      navigate(getHomeByRole(role));
      return;
    }

    navigate("/login");
  };

  const goToRegisterAsRider = () => {
    const role = getUserRole();

    localStorage.removeItem("wasalne_pending_role");

    if (role) {
      navigate(getHomeByRole(role));
      return;
    }

    navigate("/register");
  };

  const goToRegisterAsDriver = () => {
    const role = getUserRole();

    localStorage.setItem("wasalne_after_auth_redirect", "/driver-register");
    localStorage.setItem("wasalne_pending_role", "driver");

    if (role === "rider" || role === "super_admin") {
      navigate("/driver-register");
      return;
    }

    if (role === "driver") {
      navigate("/driver-dashboard");
      return;
    }

    navigate("/register");
  };

  const goToMessages = () => {
    localStorage.setItem("wasalne_after_auth_redirect", "/messages");
    navigate("/messages");
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const serviceAreas = [
    "شبين الكوم",
    "منوف",
    "أشمون",
    "قويسنا",
    "الباجور",
    "تلا",
    "بركة السبع",
    "الشهداء",
    "السادات",
  ];

  const vehicles = [
    {
      title: "توك توك",
      desc: "مناسب للمشاوير القصيرة داخل القرى والمناطق القريبة.",
      icon: <Bike size={34} />,
    },
    {
      title: "سيارة خاصة",
      desc: "اختيار مريح للمشاوير الأطول والتنقل العائلي.",
      icon: <Car size={34} />,
    },
    {
      title: "موتوسيكل",
      desc: "حل سريع للمشاوير الفردية داخل المركز أو القرية.",
      icon: <Bike size={34} />,
    },
    {
      title: "ميكروباص تيوتا",
      desc: "مناسب للمجموعات والرحلات الجماعية.",
      icon: <Bus size={34} />,
    },
    {
      title: "عربية سوزوكي",
      desc: "مناسبة لنقل الركاب أو الطلبات الخفيفة داخل القرى.",
      icon: <Package size={34} />,
    },
    {
      title: "عربية نص نقل",
      desc: "مناسبة لنقل البضائع والمشاوير اللي محتاجة حمولة.",
      icon: <Truck size={34} />,
    },
    {
      title: "تروسيكل",
      desc: "مناسب لنقل الطلبات والبضائع الخفيفة داخل القرى والمراكز.",
      icon: <Boxes size={34} />,
    },
  ];

  return (
    <main className="home-page" dir="rtl">
      <header className="home-navbar">
        <button type="button" className="home-logo" onClick={goToHome}>
          <div className="home-logo-icon logo-img-box">
            <img src={logoPath} alt="Wasalne Logo" />
          </div>

          <div>
            <h2>Wasalne</h2>
            <p>مواصلات المنوفية بسهولة</p>
          </div>
        </button>

        <nav className="home-nav-links">
          <button type="button" className="active" onClick={goToHome}>
            الرئيسية
          </button>

          <button type="button" onClick={() => scrollToSection("about")}>
            عن الخدمة
          </button>

          <button type="button" onClick={() => scrollToSection("how")}>
            طريقة الاستخدام
          </button>

          <button type="button" onClick={() => scrollToSection("vehicles")}>
            المركبات
          </button>

          <button type="button" onClick={() => scrollToSection("areas")}>
            المناطق
          </button>

          <button type="button" onClick={() => scrollToSection("faq")}>
            الأسئلة
          </button>
        </nav>

        <div className="nav-actions">
          <button type="button" className="login-link" onClick={goToLogin}>
            تسجيل الدخول
          </button>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">
            <MapPin size={18} />
            خدمة محلية داخل محافظة المنوفية
          </span>

          <h1>
            Wasalne
            <br />
            أسهل طريقة للتنقل داخل المنوفية
          </h1>

          <p>
            منصة بسيطة بتجمع الراكب بالسائقين المحليين داخل المراكز والقرى، عشان
            تقدر توصل بسرعة وتختار الوسيلة المناسبة ليك.
          </p>

          <div className="hero-actions">
            <button type="button" className="primary-btn" onClick={goToRegisterAsRider}>
              ابدأ الآن
              <ArrowLeft size={20} />
            </button>

            <button type="button" className="secondary-btn" onClick={goToRegisterAsDriver}>
              انضم كسائق
            </button>
          </div>

          <div className="hero-trust">
            <div>
              <CheckCircle size={18} />
              <span>سهل الاستخدام</span>
            </div>

            <div>
              <ShieldCheck size={18} />
              <span>مراجعة بيانات السائق</span>
            </div>

            <div>
              <Clock size={18} />
              <span>تواصل أسرع</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-top"></div>

            <div className="app-card active-card">
              <div className="mini-icon">
                <MapPinned size={22} />
              </div>
              <div>
                <h4>اختر منطقتك</h4>
                <p>المركز والقرية</p>
              </div>
            </div>

            <div className="app-card">
              <div className="mini-icon">
                <Car size={22} />
              </div>
              <div>
                <h4>اختار المركبة</h4>
                <p>توك توك، سيارة، سوزوكي، تروسيكل</p>
              </div>
            </div>

            <div className="app-card">
              <div className="mini-icon">
                <MessageCircle size={22} />
              </div>
              <div>
                <h4>تواصل بسهولة</h4>
                <p>بعد تسجيل الدخول</p>
              </div>
            </div>

            <button type="button" className="phone-bottom-btn" onClick={goToRegisterAsRider}>
              ابدأ كراكب
            </button>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <strong>9</strong>
          <span>مراكز بالمنوفية</span>
        </div>

        <div className="stat-card">
          <strong>+7</strong>
          <span>أنواع مركبات</span>
        </div>

        <div className="stat-card">
          <strong>24/7</strong>
          <span>واجهة سهلة وسريعة</span>
        </div>
      </section>

      <section className="roles-section">
        <div className="role-card rider-card">
          <div className="role-icon">
            <User size={42} />
          </div>

          <h3>أنا راكب</h3>
          <p>
            بعد تسجيل الدخول هتقدر تختار منطقتك وتشوف السائقين المتاحين وتتواصل
            معاهم.
          </p>

          <button type="button" className="role-btn" onClick={goToRegisterAsRider}>
            تسجيل كراكب
          </button>
        </div>

        <div className="role-card driver-card-home">
          <div className="role-icon">
            <Navigation size={42} />
          </div>

          <h3>أنا سائق</h3>
          <p>اعمل حساب الأول، وبعدها سجل بياناتك وارفع مستنداتك للمراجعة.</p>

          <button type="button" className="role-btn" onClick={goToRegisterAsDriver}>
            تسجيل كسائق
          </button>
        </div>
      </section>

      <section className="features-section" id="about">
        <div className="section-title">
          <span>عن الخدمة</span>
          <h2>ليه Wasalne مناسب للقرى والمراكز؟</h2>
          <p>
            لأن الخدمة مبنية على فكرة بسيطة: الراكب يلاقي سائق قريب منه، والسائق
            يوصل لركاب أكتر داخل منطقته.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <MapPin size={36} />
            <h3>اختيار حسب المنطقة</h3>
            <p>حدد المركز والقرية عشان توصل لسائقين قريبين منك.</p>
          </div>

          <div className="feature-card">
            <MessageCircle size={36} />
            <h3>تواصل مباشر</h3>
            <p>بعد الدخول تقدر تتواصل مع السائق برسالة أو اتصال.</p>
          </div>

          <div className="feature-card">
            <ShieldCheck size={36} />
            <h3>مراجعة السائقين</h3>
            <p>السائق يقدم بياناته ومستنداته قبل ظهوره للمستخدمين.</p>
          </div>

          <div className="feature-card">
            <Smartphone size={36} />
            <h3>واجهة سهلة</h3>
            <p>تصميم بسيط مناسب لأي مستخدم بدون تعقيد.</p>
          </div>
        </div>
      </section>

      <section className="how-section" id="how">
        <div className="section-title">
          <span>طريقة الاستخدام</span>
          <h2>ابدأ في 3 خطوات فقط</h2>
        </div>

        <div className="how-grid">
          <div className="how-card">
            <div className="step-number">01</div>
            <h3>سجّل حسابك</h3>
            <p>اعمل حساب جديد وحدد أنت راكب ولا سائق.</p>
          </div>

          <div className="how-card">
            <div className="step-number">02</div>
            <h3>اختار منطقتك</h3>
            <p>حدد المركز والقرية ونوع المركبة المناسبة.</p>
          </div>

          <div className="how-card">
            <div className="step-number">03</div>
            <h3>تواصل وانطلق</h3>
            <p>شوف المتاحين وتواصل بسهولة من داخل حسابك.</p>
          </div>
        </div>
      </section>

      <section className="vehicles-section" id="vehicles">
        <div className="section-title">
          <span>المركبات</span>
          <h2>وسائل تنقل مناسبة لكل مشوار</h2>
          <p>اختار نوع المركبة حسب احتياجك والمسافة داخل المركز أو القرية.</p>
        </div>

        <div className="vehicles-grid">
          {vehicles.map((item) => (
            <div className="vehicle-card" key={item.title}>
              <div className="vehicle-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="areas-section" id="areas">
        <div className="areas-content">
          <span>مناطق الخدمة</span>
          <h2>نغطي مراكز المنوفية</h2>
          <p>
            كبداية، Wasalne موجهة لمحافظة المنوفية ومراكزها، وبعد التطوير ممكن
            تتوسع لمناطق أكتر.
          </p>
        </div>

        <div className="areas-list">
          {serviceAreas.map((area) => (
            <span key={area}>{area}</span>
          ))}
        </div>
      </section>

      <section className="driver-join-section">
        <div>
          <span>هل أنت سائق؟</span>
          <h2>خلي الركاب يلاقوك بسهولة داخل منطقتك</h2>
          <p>
            اعمل حساب الأول، وبعدها قدم طلبك كسائق وارفع بياناتك ومستنداتك، وبعد
            الموافقة هتقدر تظهر للركاب.
          </p>
        </div>

        <button type="button" className="join-btn" onClick={goToRegisterAsDriver}>
          انضم كسائق
          <ArrowLeft size={20} />
        </button>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-title">
          <span>الأسئلة الشائعة</span>
          <h2>أسئلة ممكن تهمك</h2>
        </div>

        <div className="faq-grid">
          <div className="faq-card">
            <HelpCircle size={28} />
            <h3>هل أقدر أشوف السائقين من الهوم؟</h3>
            <p>
              لا، عشان الخصوصية والتنظيم. لازم تسجل دخول الأول كراكب وتشوف
              السائقين من لوحة الراكب.
            </p>
          </div>

          <div className="faq-card">
            <HelpCircle size={28} />
            <h3>هل السائق يظهر مباشرة؟</h3>
            <p>
              لا، السائق يقدم بياناته ومستنداته، وبعد مراجعة الأدمن يظهر
              للمستخدمين.
            </p>
          </div>

          <div className="faq-card">
            <HelpCircle size={28} />
            <h3>هل لازم السائق يعمل حساب الأول؟</h3>
            <p>
              نعم، لازم السائق يعمل حساب قبل ما يفتح صفحة تسجيل بيانات السائق.
            </p>
          </div>

          <div className="faq-card">
            <HelpCircle size={28} />
            <h3>هل الخدمة للمنوفية فقط؟</h3>
            <p>
              حاليًا نعم، الخدمة موجهة للمنوفية ومراكزها، وممكن تتوسع بعدين.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-content">
          <span>تواصل معنا</span>
          <h2>عندك اقتراح أو مشكلة؟</h2>
          <p>ابعتلنا رسالتك وسنحاول الرد عليك في أسرع وقت.</p>
        </div>

        <button type="button" className="contact-main-btn" onClick={goToMessages}>
          <Mail size={20} />
          إرسال رسالة
        </button>
      </section>

      <footer className="home-footer">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logoPath} alt="Wasalne Logo" />
          </div>

          <div>
            <h3>Wasalne</h3>
            <p>مواصلات المنوفية بسهولة</p>
          </div>
        </div>

        <div className="footer-links">
          <button type="button" onClick={() => scrollToSection("about")}>
            عن الخدمة
          </button>

          <button type="button" onClick={() => scrollToSection("how")}>
            طريقة الاستخدام
          </button>

          <button type="button" onClick={() => scrollToSection("vehicles")}>
            المركبات
          </button>

          <button type="button" onClick={() => scrollToSection("areas")}>
            المناطق
          </button>

          <button type="button" onClick={() => scrollToSection("faq")}>
            الأسئلة
          </button>
        </div>

        <p className="copyright">© 2026 Wasalne - نسخة تصميم مبدئية</p>
      </footer>
    </main>
  );
}

export default Home;