import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Save,
  RotateCcw,
  Gauge,
  Wallet,
  Route,
  ToggleRight,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Calculator,
  TrendingUp,
  CheckCircle2,
  Percent,
  Banknote,
  CircleDollarSign,
  Power,
  LogOut,
  Crown,
  Gift,
  UserRound,
} from "lucide-react";

import {
  defaultPricing,
  getPricingSettings,
  savePricingSettings,
  resetPricingSettings,
} from "../../data/pricingData";

import "./PricingSettings.css";

const defaultCommissionSettings = {
  enabled: true,
  percentage: 10,
  exampleTripPrice: 100,
};

const defaultOffersSettings = {
  driverOffer: {
    enabled: true,
    title: "عرض السائق السريع",
    beforeDiscount: 20,
    afterDiscount: 10,
    description: "ظهور أقوى للسائق وأولوية أفضل في استقبال الطلبات.",
  },
  riderOffer: {
    enabled: true,
    title: "عرض الراكب اليومي",
    beforeDiscount: 20,
    afterDiscount: 10,
    requiredTrips: 2,
    description: "خصم للراكب على أول مشوار أو أولوية في الطلب.",
    nearbyOffers: [
      {
        id: 1,
        enabled: true,
        title: "خصم 15 جنيه بعد 3 رحلات",
        discountValue: 15,
        requiredTrips: 3,
        description: "كمل 3 رحلات مكتملة وافتح خصم 15 جنيه على الرحلة التالية.",
      },
      {
        id: 2,
        enabled: true,
        title: "خصم 25 جنيه بعد 5 رحلات",
        discountValue: 25,
        requiredTrips: 5,
        description: "كمل 5 رحلات مكتملة وافتح خصم أقوى للرحلات الطويلة.",
      },
    ],
  },
};

function getCommissionSettings() {
  const savedCommission = localStorage.getItem("wasalne_commission_settings");

  if (!savedCommission) {
    return defaultCommissionSettings;
  }

  try {
    const parsedCommission = JSON.parse(savedCommission);

    return {
      ...defaultCommissionSettings,
      ...parsedCommission,
    };
  } catch {
    return defaultCommissionSettings;
  }
}

function saveCommissionSettings(settings) {
  localStorage.setItem("wasalne_commission_settings", JSON.stringify(settings));
}

function resetCommissionSettings() {
  localStorage.removeItem("wasalne_commission_settings");
}

function getOffersSettings() {
  const savedOffers = localStorage.getItem("wasalne_offers_settings");

  if (!savedOffers) {
    return defaultOffersSettings;
  }

  try {
    const parsedOffers = JSON.parse(savedOffers);

    return {
      driverOffer: {
        ...defaultOffersSettings.driverOffer,
        ...parsedOffers.driverOffer,
      },
      riderOffer: {
        ...defaultOffersSettings.riderOffer,
        ...parsedOffers.riderOffer,
        nearbyOffers:
          Array.isArray(parsedOffers.riderOffer?.nearbyOffers) &&
          parsedOffers.riderOffer.nearbyOffers.length > 0
            ? parsedOffers.riderOffer.nearbyOffers
            : defaultOffersSettings.riderOffer.nearbyOffers,
      },
    };
  } catch {
    return defaultOffersSettings;
  }
}

function saveOffersSettings(settings) {
  localStorage.setItem("wasalne_offers_settings", JSON.stringify(settings));
}

function resetOffersSettings() {
  localStorage.removeItem("wasalne_offers_settings");
}

function getDiscountValue(beforeDiscount, afterDiscount) {
  const before = Number(beforeDiscount || 0);
  const after = Number(afterDiscount || 0);

  if (before <= 0 || after < 0 || after >= before) {
    return 0;
  }

  return Math.round(((before - after) / before) * 100);
}

function getCurrentAdmin() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) {
    return {
      name: "Pricing Manager",
      email: "pricing@wasalne.com",
      role: "pricing_manager",
      title: "مسؤول التسعير",
    };
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    return {
      name: parsedUser.name || "Pricing Manager",
      email: parsedUser.email || "pricing@wasalne.com",
      role: parsedUser.role || "pricing_manager",
      title: parsedUser.title || "مسؤول التسعير",
    };
  } catch {
    return {
      name: "Pricing Manager",
      email: "pricing@wasalne.com",
      role: "pricing_manager",
      title: "مسؤول التسعير",
    };
  }
}

function PricingSettings() {
  const navigate = useNavigate();

  const [pricing, setPricing] = useState(getPricingSettings);
  const [commission, setCommission] = useState(getCommissionSettings);
  const [offersSettings, setOffersSettings] = useState(getOffersSettings);
  const [currentAdmin] = useState(getCurrentAdmin);
  const [savedMessage, setSavedMessage] = useState("");

  const isSuperAdmin = currentAdmin.role === "super_admin";

  const adminBackPath = isSuperAdmin ? "/admin-dashboard" : "/pricing-settings";

  const pricingStats = useMemo(() => {
    const vehicles = Object.keys(pricing);

    const negotiableCount = Object.values(pricing).filter(
      (item) => item.negotiable,
    ).length;

    const averageKmPrice =
      vehicles.length > 0
        ? Math.round(
            Object.values(pricing).reduce(
              (total, item) => total + Number(item.pricePerKm || 0),
              0,
            ) / vehicles.length,
          )
        : 0;

    return {
      vehiclesCount: vehicles.length,
      negotiableCount,
      averageKmPrice,
    };
  }, [pricing]);

  const commissionPreview = useMemo(() => {
    const tripPrice = Number(commission.exampleTripPrice || 0);
    const commissionPercent = Number(commission.percentage || 0);

    const commissionValue = commission.enabled
      ? Math.round((tripPrice * commissionPercent) / 100)
      : 0;

    const driverNetProfit = tripPrice - commissionValue;

    return {
      tripPrice,
      commissionValue,
      driverNetProfit,
    };
  }, [commission]);

  const offersPreview = useMemo(() => {
    return {
      driverDiscount: getDiscountValue(
        offersSettings.driverOffer.beforeDiscount,
        offersSettings.driverOffer.afterDiscount,
      ),
      riderDiscount: getDiscountValue(
        offersSettings.riderOffer.beforeDiscount,
        offersSettings.riderOffer.afterDiscount,
      ),
    };
  }, [offersSettings]);

  const updateVehiclePricing = (vehicle, field, value) => {
    setPricing((prev) => ({
      ...prev,
      [vehicle]: {
        ...prev[vehicle],
        [field]:
          field === "negotiable"
            ? value
            : Number(value) < 0
              ? 0
              : Number(value),
      },
    }));

    setSavedMessage("");
  };

  const updateCommissionSettings = (field, value) => {
    setCommission((prev) => ({
      ...prev,
      [field]:
        field === "enabled" ? value : Number(value) < 0 ? 0 : Number(value),
    }));

    setSavedMessage("");
  };

  const updateOfferSettings = (offerType, field, value) => {
    setOffersSettings((prev) => ({
      ...prev,
      [offerType]: {
        ...prev[offerType],
        [field]:
          field === "enabled" || field === "title" || field === "description"
            ? value
            : Number(value) < 0
              ? 0
              : Number(value),
      },
    }));

    setSavedMessage("");
  };

  const updateRiderNearbyOffer = (offerId, field, value) => {
    setOffersSettings((prev) => ({
      ...prev,
      riderOffer: {
        ...prev.riderOffer,
        nearbyOffers: prev.riderOffer.nearbyOffers.map((offer) =>
          offer.id === offerId
            ? {
                ...offer,
                [field]:
                  field === "enabled" ||
                  field === "title" ||
                  field === "description"
                    ? value
                    : Number(value) < 0
                      ? 0
                      : Number(value),
              }
            : offer,
        ),
      },
    }));

    setSavedMessage("");
  };

  const handleSave = () => {
    savePricingSettings(pricing);
    saveCommissionSettings(commission);
    saveOffersSettings(offersSettings);
    setSavedMessage("تم حفظ التسعيرة والعمولة والعروض بنجاح");
  };

  const handleReset = () => {
    resetPricingSettings();
    resetCommissionSettings();
    resetOffersSettings();

    setPricing(defaultPricing);
    setCommission(defaultCommissionSettings);
    setOffersSettings(defaultOffersSettings);
    setSavedMessage("تم رجوع التسعيرة والعمولة والعروض للإعدادات الافتراضية");
  };

  const handlePreviewAsAdmin = () => {
    localStorage.setItem("wasalne_current_user", JSON.stringify(currentAdmin));
    localStorage.setItem("wasalne_user_role", currentAdmin.role);
    localStorage.setItem("wasalne_admin_preview_rider", "true");
  };

  const goBackToAdminDashboard = () => {
    localStorage.removeItem("wasalne_admin_preview_rider");
    localStorage.removeItem("wasalne_admin_preview_driver");
    navigate("/admin-dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");
    localStorage.removeItem("wasalne_after_auth_redirect");
    localStorage.removeItem("wasalne_pending_role");
    localStorage.removeItem("wasalne_admin_preview_rider");
    localStorage.removeItem("wasalne_admin_preview_driver");

    navigate("/login");
  };

  return (
    <main className="pricing-page" dir="rtl">
      <div className="pricing-glow pricing-glow-1"></div>
      <div className="pricing-glow pricing-glow-2"></div>

      <header className="pricing-navbar">
        <div className="pricing-nav-actions">
          {isSuperAdmin && (
            <button
              type="button"
              className="back-link admin-back"
              onClick={goBackToAdminDashboard}
            >
              <ShieldCheck size={18} />
              رجوع للأدمن
            </button>
          )}

          {!isSuperAdmin && (
            <Link to={adminBackPath} className="back-link admin-back">
              <ShieldCheck size={18} />
              إعدادات التسعير
            </Link>
          )}

          <Link
            to="/rider-dashboard?preview=admin"
            className="back-link rider-preview-link"
            onClick={handlePreviewAsAdmin}
          >
            <ArrowLeft size={18} />
            معاينة تأثير التسعيرة
          </Link>

          <button
            type="button"
            className="back-link pricing-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </div>

        <div className="pricing-brand">
          <div className="pricing-brand-icon">
            <Settings size={28} />
          </div>

          <div>
            <h2>إعدادات التسعير</h2>
            <p>تحكم كامل في الأسعار وعمولة المنصة والعروض</p>
          </div>
        </div>
      </header>

      <section className="pricing-hero">
        <div className="pricing-hero-content">
          <div className="pricing-role-line">
            <span className="pricing-badge">
              <Sparkles size={17} />
              Pricing Control Center
            </span>

            <span className="pricing-role-chip">
              <Crown size={16} />
              {isSuperAdmin ? "Super Admin" : currentAdmin.title}
            </span>
          </div>

          <h1>ظبط أسعار وعروض Wasalne من لوحة واحدة</h1>

          <p>
            من هنا تقدر تتحكم في فتح المشوار، سعر الكيلو، الحد الأدنى، قابلية
            التفاوض، عمولة المنصة، وعروض السائقين والركاب.
          </p>

          <div className="pricing-admin-info">
            <ShieldCheck size={18} />
            <span>
              أنت داخل الآن كـ{" "}
              <strong>
                {isSuperAdmin ? "Super Admin" : "Pricing Manager"}
              </strong>
            </span>
            <small>{currentAdmin.email}</small>
          </div>

          <div className="pricing-actions">
            <button
              type="button"
              className="save-pricing-btn"
              onClick={handleSave}
            >
              <Save size={19} />
              حفظ التسعيرة
            </button>

            <button
              type="button"
              className="reset-pricing-btn"
              onClick={handleReset}
            >
              <RotateCcw size={19} />
              رجوع للافتراضي
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                className="go-admin-btn"
                onClick={goBackToAdminDashboard}
              >
                لوحة الأدمن
                <ArrowLeft size={18} />
              </button>
            )}
          </div>

          {savedMessage && (
            <div className="saved-message">
              <CheckCircle2 size={18} />
              {savedMessage}
            </div>
          )}
        </div>

        <div className="pricing-command-card">
          <div className="pricing-command-head">
            <div>
              <span>Live Pricing</span>
              <h3>ملخص التسعير</h3>
            </div>

            <Calculator size={38} />
          </div>

          <div className="pricing-command-list">
            <div>
              <Car size={18} />
              <span>عدد المركبات</span>
              <strong>{pricingStats.vehiclesCount}</strong>
            </div>

            <div>
              <ToggleRight size={18} />
              <span>قابل للتفاوض</span>
              <strong>{pricingStats.negotiableCount}</strong>
            </div>

            <div>
              <TrendingUp size={18} />
              <span>متوسط سعر الكيلو</span>
              <strong>{pricingStats.averageKmPrice} ج</strong>
            </div>

            <div>
              <Percent size={18} />
              <span>عمولة المنصة</span>
              <strong>
                {commission.enabled ? `${commission.percentage}%` : "متوقفة"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="commission-section">
        <div className="commission-card">
          <div className="commission-header">
            <div className="commission-title">
              <div className="commission-icon">
                <CircleDollarSign size={30} />
              </div>

              <div>
                <span>إعدادات عامة</span>
                <h2>عمولة المنصة</h2>
                <p>
                  العمولة هي نسبة يتم خصمها من قيمة المشوار لصالح المنصة، وصافي
                  الربح يذهب للسائق.
                </p>
              </div>
            </div>

            <button
              type="button"
              className={`commission-toggle ${
                commission.enabled ? "active" : ""
              }`}
              onClick={() =>
                updateCommissionSettings("enabled", !commission.enabled)
              }
            >
              <Power size={18} />
              {commission.enabled ? "العمولة مفعلة" : "العمولة متوقفة"}
            </button>
          </div>

          <div className="commission-grid">
            <div className="commission-input-box">
              <label>
                <span>
                  <Percent size={17} />
                  نسبة عمولة المنصة
                </span>

                <input
                  type="number"
                  value={commission.percentage}
                  onChange={(e) =>
                    updateCommissionSettings("percentage", e.target.value)
                  }
                  disabled={!commission.enabled}
                />
              </label>

              <small>مثال: 10 تعني أن المنصة تخصم 10% من قيمة المشوار.</small>
            </div>

            <div className="commission-input-box">
              <label>
                <span>
                  <Banknote size={17} />
                  مثال قيمة المشوار
                </span>

                <input
                  type="number"
                  value={commission.exampleTripPrice}
                  onChange={(e) =>
                    updateCommissionSettings("exampleTripPrice", e.target.value)
                  }
                />
              </label>

              <small>اكتب أي قيمة لتجربة حساب العمولة وصافي ربح السائق.</small>
            </div>

            <div className="commission-preview-card">
              <span>إجمالي المشوار</span>
              <strong>{commissionPreview.tripPrice} ج</strong>
            </div>

            <div className="commission-preview-card">
              <span>قيمة العمولة</span>
              <strong>{commissionPreview.commissionValue} ج</strong>
            </div>

            <div className="commission-preview-card driver-profit">
              <span>صافي ربح السائق</span>
              <strong>{commissionPreview.driverNetProfit} ج</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="offers-settings-section">
        <div className="offers-settings-head">
          <span>
            <Gift size={18} />
            Offers Control
          </span>

          <h2>إدارة عروض وصلني</h2>

          <p>
            من هنا تقدر تعدل عرض السائق وعرض الراكب، وتحدد السعر قبل الخصم وبعد
            الخصم، وتشغل أو توقف كل عرض.
          </p>
        </div>

        <div className="offers-settings-grid">
          <div className="offer-control-card">
            <div className="offer-control-header">
              <div className="offer-control-icon">
                <Car size={28} />
              </div>

              <div>
                <span>Driver Offer</span>
                <h3>تعديل عروض السائق</h3>
                <p>العرض اللي هيظهر في لوحة السائق.</p>
              </div>
            </div>

            <button
              type="button"
              className={`offer-status-toggle ${
                offersSettings.driverOffer.enabled ? "active" : ""
              }`}
              onClick={() =>
                updateOfferSettings(
                  "driverOffer",
                  "enabled",
                  !offersSettings.driverOffer.enabled,
                )
              }
            >
              <Power size={17} />
              {offersSettings.driverOffer.enabled
                ? "العرض مفعل"
                : "العرض متوقف"}
            </button>

            <div className="offer-control-inputs">
              <label>
                <span>
                  <Sparkles size={17} />
                  اسم العرض
                </span>

                <input
                  type="text"
                  value={offersSettings.driverOffer.title}
                  onChange={(e) =>
                    updateOfferSettings("driverOffer", "title", e.target.value)
                  }
                />
              </label>

              <label>
                <span>
                  <Banknote size={17} />
                  قبل الخصم
                </span>

                <input
                  type="number"
                  value={offersSettings.driverOffer.beforeDiscount}
                  onChange={(e) =>
                    updateOfferSettings(
                      "driverOffer",
                      "beforeDiscount",
                      e.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  <CircleDollarSign size={17} />
                  بعد الخصم
                </span>

                <input
                  type="number"
                  value={offersSettings.driverOffer.afterDiscount}
                  onChange={(e) =>
                    updateOfferSettings(
                      "driverOffer",
                      "afterDiscount",
                      e.target.value,
                    )
                  }
                />
              </label>

              <label className="full">
                <span>
                  <Settings size={17} />
                  وصف العرض
                </span>

                <input
                  type="text"
                  value={offersSettings.driverOffer.description}
                  onChange={(e) =>
                    updateOfferSettings(
                      "driverOffer",
                      "description",
                      e.target.value,
                    )
                  }
                />
              </label>
            </div>

            <div className="offer-control-preview">
              <div>
                <span>قبل الخصم</span>
                <strong>{offersSettings.driverOffer.beforeDiscount} ج</strong>
              </div>

              <div>
                <span>بعد الخصم</span>
                <strong>{offersSettings.driverOffer.afterDiscount} ج</strong>
              </div>

              <div>
                <span>نسبة الخصم</span>
                <strong>{offersPreview.driverDiscount}%</strong>
              </div>
            </div>
          </div>

          <div className="offer-control-card">
            <div className="offer-control-header">
              <div className="offer-control-icon rider">
                <UserRound size={28} />
              </div>

              <div>
                <span>Rider Offer</span>
                <h3>تعديل عروض الراكب</h3>
                <p>العرض اللي هيظهر للراكب بعدين.</p>
              </div>
            </div>

            <button
              type="button"
              className={`offer-status-toggle ${
                offersSettings.riderOffer.enabled ? "active" : ""
              }`}
              onClick={() =>
                updateOfferSettings(
                  "riderOffer",
                  "enabled",
                  !offersSettings.riderOffer.enabled,
                )
              }
            >
              <Power size={17} />
              {offersSettings.riderOffer.enabled
                ? "العرض مفعل"
                : "العرض متوقف"}
            </button>

            <div className="offer-control-inputs">
              <label>
                <span>
                  <Sparkles size={17} />
                  اسم العرض
                </span>

                <input
                  type="text"
                  value={offersSettings.riderOffer.title}
                  onChange={(e) =>
                    updateOfferSettings("riderOffer", "title", e.target.value)
                  }
                />
              </label>

              <label>
                <span>
                  <Banknote size={17} />
                  قبل الخصم
                </span>

                <input
                  type="number"
                  value={offersSettings.riderOffer.beforeDiscount}
                  onChange={(e) =>
                    updateOfferSettings(
                      "riderOffer",
                      "beforeDiscount",
                      e.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  <CircleDollarSign size={17} />
                  بعد الخصم
                </span>

                <input
                  type="number"
                  value={offersSettings.riderOffer.afterDiscount}
                  onChange={(e) =>
                    updateOfferSettings(
                      "riderOffer",
                      "afterDiscount",
                      e.target.value,
                    )
                  }
                />
              </label>

              <label>
                <span>
                  <Route size={17} />
                  عدد الرحلات المطلوبة
                </span>

                <input
                  type="number"
                  value={offersSettings.riderOffer.requiredTrips}
                  onChange={(e) =>
                    updateOfferSettings(
                      "riderOffer",
                      "requiredTrips",
                      e.target.value,
                    )
                  }
                />
              </label>

              <label className="full">
                <span>
                  <Settings size={17} />
                  وصف العرض
                </span>

                <input
                  type="text"
                  value={offersSettings.riderOffer.description}
                  onChange={(e) =>
                    updateOfferSettings(
                      "riderOffer",
                      "description",
                      e.target.value,
                    )
                  }
                />
              </label>

              <div className="full rider-nearby-offers-editor">
                <div className="nearby-editor-title">
                  <Gift size={18} />
                  <div>
                    <h4>العروض القريبة للراكب</h4>
                    <p>اكتب العروض اللي هتظهر في Popup العروض القريبة.</p>
                  </div>
                </div>

                {offersSettings.riderOffer.nearbyOffers.map((offer, index) => (
                  <div className="nearby-offer-edit-card" key={offer.id}>
                    <div className="nearby-offer-edit-head">
                      <strong>عرض قريب #{index + 1}</strong>

                      <button
                        type="button"
                        className={`offer-status-toggle small ${
                          offer.enabled ? "active" : ""
                        }`}
                        onClick={() =>
                          updateRiderNearbyOffer(
                            offer.id,
                            "enabled",
                            !offer.enabled,
                          )
                        }
                      >
                        <Power size={15} />
                        {offer.enabled ? "مفعل" : "متوقف"}
                      </button>
                    </div>

                    <label className="full">
                      <span>
                        <Sparkles size={16} />
                        اسم العرض القريب
                      </span>

                      <input
                        type="text"
                        value={offer.title}
                        onChange={(e) =>
                          updateRiderNearbyOffer(
                            offer.id,
                            "title",
                            e.target.value,
                          )
                        }
                      />
                    </label>

                    <div className="nearby-offer-row">
                      <label>
                        <span>
                          <Banknote size={16} />
                          قيمة الخصم
                        </span>

                        <input
                          type="number"
                          value={offer.discountValue}
                          onChange={(e) =>
                            updateRiderNearbyOffer(
                              offer.id,
                              "discountValue",
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label>
                        <span>
                          <Route size={16} />
                          بعد كام رحلة
                        </span>

                        <input
                          type="number"
                          value={offer.requiredTrips}
                          onChange={(e) =>
                            updateRiderNearbyOffer(
                              offer.id,
                              "requiredTrips",
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </div>

                    <label className="full">
                      <span>
                        <Settings size={16} />
                        وصف العرض القريب
                      </span>

                      <input
                        type="text"
                        value={offer.description}
                        onChange={(e) =>
                          updateRiderNearbyOffer(
                            offer.id,
                            "description",
                            e.target.value,
                          )
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="offer-control-preview">
              <div>
                <span>قبل الخصم</span>
                <strong>{offersSettings.riderOffer.beforeDiscount} ج</strong>
              </div>

              <div>
                <span>بعد الخصم</span>
                <strong>{offersSettings.riderOffer.afterDiscount} ج</strong>
              </div>

              <div>
                <span>نسبة الخصم</span>
                <strong>{offersPreview.riderDiscount}%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-grid">
        {Object.entries(pricing).map(([vehicle, values]) => (
          <div className="pricing-card" key={vehicle}>
            <div className="pricing-card-header">
              <div className="vehicle-icon-box">
                <Car size={26} />
              </div>

              <div>
                <h3>{vehicle}</h3>
                <p>
                  {values.negotiable
                    ? "السعر قابل للتفاوض"
                    : "السعر غير قابل للتفاوض"}
                </p>
              </div>
            </div>

            <div className="pricing-preview">
              <div>
                <span>فتح المشوار</span>
                <strong>{values.baseFare} ج</strong>
              </div>

              <div>
                <span>سعر الكيلو</span>
                <strong>{values.pricePerKm} ج</strong>
              </div>

              <div>
                <span>الحد الأدنى</span>
                <strong>{values.minimumFare} ج</strong>
              </div>
            </div>

            <div className="pricing-inputs">
              <label>
                <span>
                  <Wallet size={17} />
                  فتح المشوار
                </span>

                <input
                  type="number"
                  value={values.baseFare}
                  onChange={(e) =>
                    updateVehiclePricing(vehicle, "baseFare", e.target.value)
                  }
                />
              </label>

              <label>
                <span>
                  <Route size={17} />
                  سعر الكيلو
                </span>

                <input
                  type="number"
                  value={values.pricePerKm}
                  onChange={(e) =>
                    updateVehiclePricing(vehicle, "pricePerKm", e.target.value)
                  }
                />
              </label>

              <label>
                <span>
                  <Gauge size={17} />
                  الحد الأدنى
                </span>

                <input
                  type="number"
                  value={values.minimumFare}
                  onChange={(e) =>
                    updateVehiclePricing(vehicle, "minimumFare", e.target.value)
                  }
                />
              </label>
            </div>

            <button
              type="button"
              className={`negotiation-btn ${values.negotiable ? "active" : ""}`}
              onClick={() =>
                updateVehiclePricing(vehicle, "negotiable", !values.negotiable)
              }
            >
              <ToggleRight size={19} />
              {values.negotiable ? "قابل للتفاوض" : "غير قابل للتفاوض"}
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}

export default PricingSettings;