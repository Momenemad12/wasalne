import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Car,
  Hash,
  UploadCloud,
  BadgeCheck,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image,
  CheckCircle2,
  Users,
  AlertCircle,
  ClipboardCheck,
} from "lucide-react";
import "./DriverRegister.css";

const centers = [
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

const villagesByCenter = {
  "شبين الكوم": ["ميت خاقان", "كفر المصيلحة", "شنوان", "اصطباري", "طنبدى"],
  منوف: ["بلمشط", "الحامول", "فيشا الكبرى", "كفر فيشا", "سدود"],
  أشمون: ["ساقية أبو شعرة", "سمادون", "سبك الأحد", "شما", "جريس"],
  قويسنا: ["ميت برة", "أشمون الرمان", "كفر ميت العبسي", "بجيرم", "مصطاى"],
  الباجور: ["ميت عفيف", "اسطنها", "بي العرب", "سبك الضحاك", "فيشا الصغرى"],
  تلا: ["زرقان", "كفر ربيع", "بتبس", "طبلوها", "طنوب"],
  "بركة السبع": ["روضة", "هلي", "جنزور", "كفر هلال", "أبو مشهور"],
  الشهداء: ["زاوية البقلي", "دنشواي", "سلامون قبلي", "كفر دنشواي", "سرسموس"],
  السادات: ["الخطاطبة", "الطرانة", "الأخماس", "الارتواز", "المنطقة الصناعية"],
};

const vehicles = [
  "توك توك",
  "سيارة خاصة",
  "موتوسيكل",
  "ميكروباص / فان",
  "عربية سوزوكي",
  "عربية نص نقل",
  "تروسيكل",
];

const vehiclesWithoutLicense = ["توك توك", "موتوسيكل", "تروسيكل"];

function isLicenseRequired(vehicle) {
  return !vehiclesWithoutLicense.includes(vehicle);
}

function getStoredDriverRequests() {
  const savedRequests = localStorage.getItem("wasalne_driver_requests");

  if (!savedRequests) {
    return [];
  }

  try {
    const parsedRequests = JSON.parse(savedRequests);
    return Array.isArray(parsedRequests) ? parsedRequests : [];
  } catch {
    return [];
  }
}

function getCurrentUser() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return {};
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    return {};
  }
}

function saveCurrentDriverFromRequest(request) {
  const currentUser = getCurrentUser();

  const updatedUser = {
    ...currentUser,
    name: request.name,
    phone: request.phone,
    role: "driver",
    center: request.center,
    village: request.village,
    vehicle: request.vehicle,
    plateNumber: request.plateNumber,
    driverRequestId: request.id,
    driverRequestStatus: request.status,
    driverDocumentsCompleted: true,
    driverApproved: false,
  };

  localStorage.setItem("wasalne_current_user", JSON.stringify(updatedUser));
  localStorage.setItem("wasalne_user_role", "driver");
  localStorage.setItem("wasalne_driver_request_id", String(request.id));
  localStorage.setItem("wasalne_driver_request_status", request.status);
}

function DriverRegister() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPreviewFromUrl =
    new URLSearchParams(location.search).get("preview") === "admin";

  const isAdminPreview =
    isPreviewFromUrl ||
    localStorage.getItem("wasalne_admin_preview_driver") === "true";

  const driverDashboardPath = isAdminPreview
    ? "/driver-dashboard?preview=admin"
    : "/driver-dashboard";

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "ذكر",
    center: "شبين الكوم",
    village: "",
    vehicle: "توك توك",
    plateNumber: "",
    criminalRecordStatus: "غير محدد",
    workStatus: "متاح للعمل",
    notes: "",
  });

  const [files, setFiles] = useState({
    personalPhoto: null,
    idPhoto: null,
    selfieWithId: null,
    vehiclePhoto: null,
    licensePhoto: null,
  });

  const [success, setSuccess] = useState(false);

  const villages = villagesByCenter[formData.center] || [];
  const licenseRequired = isLicenseRequired(formData.vehicle);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "center" ? { village: "" } : {}),
    }));

    if (name === "vehicle" && !isLicenseRequired(value)) {
      setFiles((prev) => ({
        ...prev,
        licensePhoto: null,
      }));
    }
  };

  const handleFileChange = (e, key) => {
    const file = e.target.files[0];

    if (!file) return;

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const goBackToAdminDashboard = () => {
    localStorage.removeItem("wasalne_admin_preview_driver");
    navigate("/admin-dashboard");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (licenseRequired && !files.licensePhoto) {
      alert("صورة الرخصة إجبارية لهذا النوع من المركبات");
      return;
    }

    const newRequest = {
      id: Date.now(),
      name: formData.fullName,
      phone: formData.phone,
      gender: formData.gender,
      center: formData.center,
      village: formData.village,
      vehicle: formData.vehicle,
      plateNumber: formData.plateNumber,
      criminalRecordStatus: formData.criminalRecordStatus,
      workStatus: formData.workStatus,
      notes: formData.notes,
      requestDate: new Date().toLocaleDateString("ar-EG"),
      status: "قيد المراجعة",
      documents: {
        personalPhoto: Boolean(files.personalPhoto),
        idPhoto: Boolean(files.idPhoto),
        selfieWithId: Boolean(files.selfieWithId),
        vehiclePhoto: Boolean(files.vehiclePhoto),
        licensePhoto: Boolean(files.licensePhoto),
        licenseRequired,
      },
      fileNames: {
        personalPhoto: files.personalPhoto?.name || "",
        idPhoto: files.idPhoto?.name || "",
        selfieWithId: files.selfieWithId?.name || "",
        vehiclePhoto: files.vehiclePhoto?.name || "",
        licensePhoto: files.licensePhoto?.name || "",
      },
    };

    const oldRequests = getStoredDriverRequests();
    const filteredRequests = oldRequests.filter(
      (request) => request.phone !== newRequest.phone,
    );

    localStorage.setItem(
      "wasalne_driver_requests",
      JSON.stringify([newRequest, ...filteredRequests]),
    );

    saveCurrentDriverFromRequest(newRequest);

    setSuccess(true);

    setTimeout(() => {
      navigate(driverDashboardPath);
    }, 2500);
  };

  if (success) {
    return (
      <main className="driver-register-page success-page" dir="rtl">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle2 size={54} />
          </div>

          <h1>تم إرسال طلبك بنجاح</h1>
          <p>
            طلبك دلوقتي قيد المراجعة من الأدمن. هتروح للوحة السائق وتشوف حالة
            الطلب، ومش هتقدر تستقبل طلبات غير بعد الموافقة.
          </p>

          <Link to={driverDashboardPath} className="success-link">
            الرجوع للداش بورد
            <ArrowRight size={18} />
          </Link>

          {isAdminPreview && (
            <button
              type="button"
              className="success-link"
              onClick={goBackToAdminDashboard}
            >
              رجوع للأدمن
              <ShieldCheck size={18} />
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="driver-register-page" dir="rtl">
      <div className="driver-register-glow glow-one"></div>
      <div className="driver-register-glow glow-two"></div>

      <section className="driver-register-hero">
        <div className="driver-register-content">
          <span className="driver-register-badge">
            <ShieldCheck size={17} />
            {isAdminPreview ? "معاينة الأدمن لتسجيل السائق" : "تسجيل السائقين"}
          </span>

          <h1>سجل كسائق في Wasalne</h1>

          <p>
            املأ بياناتك وارفع المستندات المطلوبة. الطلب هيتراجع من الأدمن قبل
            تفعيل حسابك وظهورك للركاب.
          </p>

          {isAdminPreview && (
            <div className="driver-register-actions">
              <button
                type="button"
                className="driver-register-dashboard-link"
                onClick={goBackToAdminDashboard}
              >
                رجوع للأدمن
                <ShieldCheck size={18} />
              </button>
            </div>
          )}

          <div className="driver-register-actions">
            <Link
              to={driverDashboardPath}
              className="driver-register-dashboard-link"
            >
              الرجوع للداش بورد
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="driver-register-steps">
            <div>
              <BadgeCheck size={22} />
              <span>بيانات واضحة</span>
            </div>

            <div>
              <FileText size={22} />
              <span>مراجعة المستندات</span>
            </div>

            <div>
              <Users size={22} />
              <span>ظهور للركاب بعد الموافقة</span>
            </div>
          </div>
        </div>

        <div className="driver-register-side">
          <div className="side-card-main">
            <Car size={42} />
            <h3>ابدأ كابتن Wasalne</h3>
            <p>
              كل بياناتك ومستنداتك هتتراجع قبل التفعيل لحماية الركاب والسائقين.
            </p>
          </div>
        </div>
      </section>

      <section className="driver-register-wrapper">
        <form className="driver-register-card" onSubmit={handleSubmit}>
          <div className="form-title">
            <span>طلب انضمام جديد</span>
            <h2>بيانات السائق والمركبة</h2>
          </div>

          <div className="requirements-note">
            <AlertCircle size={20} />
            <p>
              أول ما تختار نوع المركبة، هتظهرلك المتطلبات المطلوبة. المستندات
              المكتوب عليها <strong>إجباري</strong> لازم تتكمل قبل إرسال الطلب.
            </p>
          </div>

          <div className="form-grid">
            <div className="driver-input-group">
              <label>
                الاسم بالكامل <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <User size={19} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="اكتب اسمك بالكامل"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                رقم الهاتف <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <Phone size={19} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                النوع <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <Users size={19} />
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                نوع المركبة <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <Car size={19} />
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  required
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={`vehicle-requirements-box full-width ${
                licenseRequired ? "license-required" : "license-optional"
              }`}
            >
              <div className="vehicle-requirements-head">
                <div>
                  <span>متطلبات المركبة المختارة</span>
                  <h3>{formData.vehicle}</h3>
                </div>

                <strong>
                  {licenseRequired ? "الرخصة إجبارية" : "الرخصة اختيارية"}
                </strong>
              </div>

              <div className="vehicle-requirements-list">
                <div>
                  <CheckCircle2 size={18} />
                  <p>الصورة الشخصية</p>
                  <b>إجباري</b>
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  <p>صورة البطاقة</p>
                  <b>إجباري</b>
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  <p>سيلفي مع البطاقة</p>
                  <b>إجباري</b>
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  <p>صورة المركبة</p>
                  <b>إجباري</b>
                </div>

                <div>
                  <CheckCircle2 size={18} />
                  <p>صورة الرخصة</p>
                  <b>{licenseRequired ? "إجباري" : "اختياري"}</b>
                </div>
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                المركز <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <MapPin size={19} />
                <select
                  name="center"
                  value={formData.center}
                  onChange={handleChange}
                  required
                >
                  {centers.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                القرية / المنطقة <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <MapPin size={19} />
                <select
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  required
                >
                  <option value="">اختر القرية</option>
                  {villages.map((village) => (
                    <option key={village} value={village}>
                      {village}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                رقم اللوحة / رقم المركبة <small>إجباري</small>
              </label>
              <div className="driver-input-box">
                <Hash size={19} />
                <input
                  type="text"
                  name="plateNumber"
                  placeholder="مثال: م ن ف 1234"
                  value={formData.plateNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="driver-input-group">
              <label>
                حالة الصحيفة الجنائية{" "}
                <small className="optional-label">اختياري</small>
              </label>
              <div className="driver-input-box">
                <ClipboardCheck size={19} />
                <select
                  name="criminalRecordStatus"
                  value={formData.criminalRecordStatus}
                  onChange={handleChange}
                >
                  <option value="غير محدد">غير محدد</option>
                  <option value="تم استخراجها">تم استخراجها</option>
                  <option value="قيد الاستخراج">قيد الاستخراج</option>
                  <option value="لم يتم استخراجها">لم يتم استخراجها</option>
                </select>
              </div>
            </div>

            <div className="driver-input-group full-width">
              <label>
                حالة العمل <small className="optional-label">اختياري</small>
              </label>
              <div className="driver-input-box">
                <ShieldCheck size={19} />
                <select
                  name="workStatus"
                  value={formData.workStatus}
                  onChange={handleChange}
                >
                  <option value="متاح للعمل">متاح للعمل</option>
                  <option value="متاح أوقات محددة">متاح أوقات محددة</option>
                  <option value="غير متاح حاليًا">غير متاح حاليًا</option>
                </select>
              </div>
            </div>

            <div className="driver-input-group full-width">
              <label>
                ملاحظات إضافية <small className="optional-label">اختياري</small>
              </label>
              <div className="driver-textarea-box">
                <textarea
                  name="notes"
                  placeholder="اكتب أي تفاصيل إضافية عن المركبة أو مناطق العمل..."
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="documents-section">
            <div className="documents-title">
              <Image size={22} />
              <div>
                <h3>المستندات المطلوبة</h3>
                <p>
                  ارفع الصور المطلوبة بوضوح. صورة الرخصة تتغير تلقائيًا حسب نوع
                  المركبة المختارة.
                </p>
              </div>
            </div>

            <div className="upload-grid">
              <label
                className={`upload-card required ${
                  files.personalPhoto ? "done" : ""
                }`}
              >
                <UploadCloud size={30} />
                <strong>الصورة الشخصية</strong>
                <small>إجباري</small>
                <span>
                  {files.personalPhoto
                    ? files.personalPhoto.name
                    : "اضغط لرفع الصورة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "personalPhoto")}
                  required
                />
              </label>

              <label
                className={`upload-card required ${files.idPhoto ? "done" : ""}`}
              >
                <UploadCloud size={30} />
                <strong>صورة البطاقة</strong>
                <small>إجباري</small>
                <span>
                  {files.idPhoto ? files.idPhoto.name : "اضغط لرفع البطاقة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "idPhoto")}
                  required
                />
              </label>

              <label
                className={`upload-card required ${
                  files.selfieWithId ? "done" : ""
                }`}
              >
                <UploadCloud size={30} />
                <strong>سيلفي مع البطاقة</strong>
                <small>إجباري</small>
                <span>
                  {files.selfieWithId
                    ? files.selfieWithId.name
                    : "ارفع صورة سيلفي وأنت ماسك البطاقة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "selfieWithId")}
                  required
                />
              </label>

              <label
                className={`upload-card required ${
                  files.vehiclePhoto ? "done" : ""
                }`}
              >
                <UploadCloud size={30} />
                <strong>صورة المركبة</strong>
                <small>إجباري</small>
                <span>
                  {files.vehiclePhoto
                    ? files.vehiclePhoto.name
                    : "ارفع صورة واضحة للمركبة"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "vehiclePhoto")}
                  required
                />
              </label>

              <label
                className={`upload-card ${
                  licenseRequired ? "required" : "optional"
                } ${files.licensePhoto ? "done" : ""}`}
              >
                <UploadCloud size={30} />
                <strong>صورة الرخصة</strong>
                <small>{licenseRequired ? "إجباري" : "اختياري"}</small>

                <span>
                  {files.licensePhoto
                    ? files.licensePhoto.name
                    : licenseRequired
                      ? "صورة الرخصة مطلوبة لهذا النوع"
                      : "اختياري للتوك توك / الموتوسيكل / التروسيكل"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "licensePhoto")}
                  required={licenseRequired}
                />
              </label>
            </div>
          </div>

          <button className="driver-submit-btn" type="submit">
            إرسال الطلب للمراجعة
            <ArrowRight size={20} />
          </button>
        </form>
      </section>
    </main>
  );
}

export default DriverRegister;
