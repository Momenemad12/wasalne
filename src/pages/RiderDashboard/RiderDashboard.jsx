import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MapPin,
  Car,
  Bike,
  Truck,
  Bus,
  Star,
  Phone,
  MessageCircle,
  User,
  Filter,
  Sparkles,
  Clock3,
  Navigation,
  Crosshair,
  Route,
  Gauge,
  ExternalLink,
  Flag,
  Calculator,
  ShieldCheck,
  MousePointer2,
  WalletCards,
  Activity,
  History,
  MapPinned,
  Radio,
  XCircle,
  CheckCircle2,
  LogOut,
  BarChart3,
  Bell,
  Gift,
} from "lucide-react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  Circle,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { driversData } from "../../data/driversData";
import {
  getPricingSettings,
  calculatePriceRange,
} from "../../data/pricingData";

import "./RiderDashboard.css";

const logoPath = `${import.meta.env.BASE_URL}logo-wasalne.png`;

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

const centerCoordinates = {
  "شبين الكوم": [30.5526, 31.009],
  منوف: [30.4658, 30.9306],
  أشمون: [30.2974, 30.9764],
  قويسنا: [30.5647, 31.1585],
  الباجور: [30.4317, 31.0364],
  تلا: [30.681, 30.9447],
  "بركة السبع": [30.6353, 31.0829],
  الشهداء: [30.5958, 30.899],
  السادات: [30.3675, 30.5053],
};

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

const defaultRiderUser = {
  name: "راكب وصلني",
  phone: "01000000000",
  email: "rider@wasalne.com",
  role: "rider",
  center: "شبين الكوم",
  village: "شبين الكوم",
  gender: "male",
  password: "123456",
};

const RIDER_URGENCY_MAX_PERCENT = 30;
const DEFAULT_RIDER_REWARD_TRIPS = 2;

const defaultOffersSettings = {
  riderOffer: {
    enabled: true,
    title: "مكافآت وصلني للركاب",
    beforeDiscount: 20,
    afterDiscount: 10,
    description: "اطلب رحلتين واحصل على خصم على الرحلة القادمة.",
    requiredTrips: DEFAULT_RIDER_REWARD_TRIPS,
  },
};

function getOffersSettings() {
  const savedOffers = localStorage.getItem("wasalne_offers_settings");

  if (!savedOffers) {
    return defaultOffersSettings;
  }

  try {
    const parsedOffers = JSON.parse(savedOffers);

    return {
      riderOffer: {
        ...defaultOffersSettings.riderOffer,
        ...parsedOffers.riderOffer,
      },
    };
  } catch {
    return defaultOffersSettings;
  }
}

function getDiscountAmount(beforeDiscount, afterDiscount) {
  const before = Number(beforeDiscount || 0);
  const after = Number(afterDiscount || 0);

  if (before <= 0 || after < 0 || after >= before) {
    return 0;
  }

  return before - after;
}

function getRiderOffersList({
  completedTripsAfterUsedRewards,
  riderRewardRequiredTrips,
  riderRewardDiscountAmount,
  hasAvailableRiderReward,
  isRiderRewardApplied,
}) {
  const safeCompletedTrips = Math.max(
    Number(completedTripsAfterUsedRewards) || 0,
    0,
  );

  return [
    {
      id: "current-reward",
      type: "available",
      badge: hasAvailableRiderReward ? "متاح الآن" : "قريب جدًا",
      title: `خصم ${riderRewardDiscountAmount} جنيه على الرحلة القادمة`,
      description: hasAvailableRiderReward
        ? "الخصم جاهز للاستخدام. فعّله قبل إرسال الطلب وهيتخصم من سعر الرحلة."
        : `كمل ${Math.max(
            riderRewardRequiredTrips - safeCompletedTrips,
            0,
          )} رحلة مكتملة عشان تفتح الخصم.`,
      progress: Math.min(safeCompletedTrips, riderRewardRequiredTrips),
      target: riderRewardRequiredTrips,
      value: `${riderRewardDiscountAmount} ج`,
      active: isRiderRewardApplied,
      canActivate: hasAvailableRiderReward,
      actionText: isRiderRewardApplied
        ? "إلغاء الخصم"
        : hasAvailableRiderReward
          ? "فعّل الخصم"
          : "كمّل رحلة عشان يتفتح",
    },
    {
      id: "three-trips-reward",
      type: "nearby",
      badge: safeCompletedTrips >= 3 ? "جاهز قريبًا" : "عرض قريب",
      title: "خصم 15 جنيه بعد 3 رحلات",
      description:
        safeCompletedTrips >= 3
          ? "وصلت للهدف. العرض جاهز يتفعل من لوحة الأدمن في المرحلة القادمة."
          : `فاضل ${Math.max(3 - safeCompletedTrips, 0)} رحلة عشان توصل للعرض ده.`,
      progress: Math.min(safeCompletedTrips, 3),
      target: 3,
      value: "15 ج",
      active: false,
      canActivate: false,
      actionText: "اعرف التقدم",
    },
    {
      id: "five-trips-reward",
      type: "nearby",
      badge: safeCompletedTrips >= 5 ? "جاهز قريبًا" : "عرض قريب",
      title: "خصم 25 جنيه بعد 5 رحلات",
      description:
        safeCompletedTrips >= 5
          ? "وصلت للهدف. العرض ده ممكن يتربط بنظام مكافآت الأدمن بعدين."
          : `فاضل ${Math.max(5 - safeCompletedTrips, 0)} رحلات عشان توصل للعرض ده.`,
      progress: Math.min(safeCompletedTrips, 5),
      target: 5,
      value: "25 ج",
      active: false,
      canActivate: false,
      actionText: "اعرف التقدم",
    },
  ];
}

function applyDiscountToPriceLabel(priceLabel, discountAmount) {
  const discount = Number(discountAmount || 0);

  if (!priceLabel || discount <= 0) {
    return priceLabel;
  }

  return String(priceLabel).replace(/\d+(\.\d+)?/g, (match) => {
    const price = Number(match);
    const discountedPrice = Math.max(Math.round(price - discount), 0);
    return String(discountedPrice);
  });
}

const initialRiderTrips = [
  {
    id: 1,
    driverName: "أحمد سالم",
    route: "شبين الكوم → قويسنا",
    vehicle: "توك توك",
    amount: 85,
    status: "مكتملة",
    date: "اليوم - 10:20 ص",
  },
  {
    id: 2,
    driverName: "محمد علي",
    route: "منوف → شبين الكوم",
    vehicle: "موتوسيكل",
    amount: 55,
    status: "مكتملة",
    date: "أمس - 8:45 م",
  },
  {
    id: 3,
    driverName: "سارة حسن",
    route: "كفر المصيلحة → بخاتي",
    vehicle: "توك توك",
    amount: 40,
    status: "قيد التنفيذ",
    date: "منذ يومين",
  },
];

function generateId() {
  return Math.floor(Math.random() * 1000000000);
}

function getNowTime() {
  return new Date().getTime();
}

function formatOfferTime(seconds) {
  const safeSeconds = Math.max(Number(seconds) || 0, 0);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const restSeconds = String(safeSeconds % 60).padStart(2, "0");

  return `${minutes}:${restSeconds}`;
}

function extractPriceNumber(value) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const numbers = String(value).match(/\d+(\.\d+)?/g);

  if (!numbers || numbers.length === 0) {
    return 0;
  }

  return Number(numbers[numbers.length - 1]);
}

function getCurrentUser() {
  const savedUser = localStorage.getItem("wasalne_current_user");

  if (!savedUser) return defaultRiderUser;

  try {
    return {
      ...defaultRiderUser,
      ...JSON.parse(savedUser),
    };
  } catch {
    return defaultRiderUser;
  }
}

function getStoredRiderTrips() {
  const savedTrips = localStorage.getItem("wasalne_rider_trips");

  if (!savedTrips) return initialRiderTrips;

  try {
    const parsedTrips = JSON.parse(savedTrips);
    return Array.isArray(parsedTrips) && parsedTrips.length > 0
      ? parsedTrips
      : initialRiderTrips;
  } catch {
    return initialRiderTrips;
  }
}

function getStoredRideRequests() {
  const savedRequests = localStorage.getItem("wasalne_rider_requests");

  if (!savedRequests) return [];

  try {
    const parsedRequests = JSON.parse(savedRequests);
    return Array.isArray(parsedRequests) ? parsedRequests : [];
  } catch {
    return [];
  }
}

function saveRideRequests(requests) {
  localStorage.setItem("wasalne_rider_requests", JSON.stringify(requests));
}

function getUsedRiderRewards() {
  const savedUsedRewards = localStorage.getItem("wasalne_used_rider_rewards");

  if (!savedUsedRewards) {
    return 0;
  }

  const parsedValue = Number(savedUsedRewards);

  return Number.isNaN(parsedValue) ? 0 : parsedValue;
}

function saveUsedRiderRewards(value) {
  localStorage.setItem("wasalne_used_rider_rewards", String(value));
}

function getRequestStatusLabel(request) {
  if (!request) return "لا يوجد طلب";

  switch (request.statusCode) {
    case "pending":
      return "في انتظار قبول السائق";
    case "accepted":
      return "تم قبول الرحلة";
    case "rejected":
      return "تم رفض الطلب";
    case "driver_offer":
      return "السائق اقترح سعر جديد";
    case "cancelled":
      return "تم إلغاء الطلب";
    default:
      return request.status || "قيد المتابعة";
  }
}

function getRequestPriceLabel(request) {
  if (!request) return "--";

  if (request.driverOfferPrice) {
    return `${request.driverOfferPrice} ج`;
  }

  return request.price || request.systemPrice || "--";
}

function getVillagePosition(center, village, type = "pickup") {
  const base = centerCoordinates[center] || centerCoordinates["شبين الكوم"];
  const villages = villagesByCenter[center] || [];
  const index = Math.max(villages.indexOf(village), 0);

  if (!village) return base;

  const direction = type === "destination" ? 1 : -1;
  const latOffset = direction * (0.004 + index * 0.0018);
  const lngOffset = direction * (0.005 + index * 0.0015);

  return [base[0] + latOffset, base[1] + lngOffset];
}

function getDistanceKm(from, to) {
  if (!from || !to) return 0;

  const [lat1, lon1] = from;
  const [lat2, lon2] = to;
  const earthRadius = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function getVehicleMarkerIcon(vehicle) {
  switch (vehicle) {
    case "توك توك":
      return "🛺";
    case "سيارة خاصة":
      return "🚘";
    case "موتوسيكل":
      return "🏍️";
    case "ميكروباص / فان":
      return "🚐";
    case "عربية سوزوكي":
      return "🚙";
    case "عربية نص نقل":
      return "🚚";
    case "تروسيكل":
      return "🛻";
    default:
      return "🚘";
  }
}

function createCustomIcon(
  type,
  isActive = false,
  isOnline = true,
  vehicle = "",
) {
  const iconMap = {
    pickup: "📍",
    destination: "🏁",
    driver: getVehicleMarkerIcon(vehicle),
  };

  return L.divIcon({
    className: "",
    html: `
      <div class="future-marker ${type} ${isActive ? "active" : ""} ${
        isOnline ? "online" : "busy"
      }">
        <div class="marker-pulse"></div>
        <div class="marker-core">${iconMap[type]}</div>
      </div>
    `,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -26],
  });
}

function MapFlyTo({ position, zoom = 13 }) {
  const map = useMap();

  const lat = Array.isArray(position) ? Number(position[0]) : null;
  const lng = Array.isArray(position) ? Number(position[1]) : null;

  useEffect(() => {
    if (
      lat === null ||
      lng === null ||
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return;
    }

    const currentCenter = map.getCenter();
    const samePlace =
      Math.abs(currentCenter.lat - lat) < 0.00015 &&
      Math.abs(currentCenter.lng - lng) < 0.00015;

    if (samePlace && map.getZoom() === zoom) {
      return;
    }

    map.flyTo([lat, lng], zoom, {
      duration: 0.55,
    });
  }, [lat, lng, zoom, map]);

  return null;
}

function MapClickSelector({ selectionMode, onPickLocation }) {
  useMapEvents({
    click(e) {
      if (!selectionMode) return;
      onPickLocation(selectionMode, [e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
}

function getDriverOfferDetailsFromRequest(request, currentTime) {
  if (!request || request.statusCode !== "driver_offer") {
    return null;
  }

  const expiresAt = Number(request.driverOfferExpiresAt || 0);
  const remainingSeconds = Math.max(
    Math.ceil((expiresAt - currentTime) / 1000),
    0,
  );

  const isExpired = expiresAt > 0 && remainingSeconds <= 0;

  return {
    remainingSeconds,
    isExpired,
    oldPrice: extractPriceNumber(
      request.driverOfferOldPrice ||
        request.finalPrice ||
        request.price ||
        request.systemPrice,
    ),
    newPrice: Number(request.driverOfferPrice || 0),
  };
}

function getVehicleIcon(vehicle) {
  switch (vehicle) {
    case "سيارة خاصة":
      return <Car size={18} />;
    case "موتوسيكل":
      return <Bike size={18} />;
    case "ميكروباص / فان":
      return <Bus size={18} />;
    case "عربية نص نقل":
    case "تروسيكل":
      return <Truck size={18} />;
    case "عربية سوزوكي":
      return <Car size={18} />;
    default:
      return <Navigation size={18} />;
  }
}

function RiderDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const previewMode = new URLSearchParams(location.search).get("preview");
  const role = localStorage.getItem("wasalne_user_role");

  const isAdminPreview =
    previewMode === "admin" ||
    localStorage.getItem("wasalne_admin_preview_rider") === "true";

  const isAdmin = role === "super_admin" || isAdminPreview;

  const riderDetailsPath = isAdminPreview
    ? "/rider-dashboard-details?preview=admin"
    : "/rider-dashboard-details";

  const homePath = isAdminPreview ? "/admin-dashboard" : "/home";

  const [riderProfile] = useState(getCurrentUser);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [riderTrips] = useState(getStoredRiderTrips);
  const [rideRequests, setRideRequests] = useState(getStoredRideRequests);
  const [activeRideRequest, setActiveRideRequest] = useState(null);
  const [currentTime, setCurrentTime] = useState(getNowTime);
  const [riderOfferModal, setRiderOfferModal] = useState({
    open: false,
    request: null,
    price: "",
  });
  const [boostedPrice, setBoostedPrice] = useState(null);

  const [pricingSettings] = useState(getPricingSettings());
  const [offersSettings] = useState(getOffersSettings);
  const [usedRiderRewards, setUsedRiderRewards] = useState(getUsedRiderRewards);
  const [useRiderReward, setUseRiderReward] = useState(false);
  const [showRiderOffersModal, setShowRiderOffersModal] = useState(false);
  const [riderOffersView, setRiderOffersView] = useState("available");

  useEffect(() => {
    if (previewMode === "admin") {
      localStorage.setItem("wasalne_admin_preview_rider", "true");
    }
  }, [previewMode]);

  const vehicleTypes = useMemo(() => {
    return Object.keys(pricingSettings);
  }, [pricingSettings]);

  const [pickupCenter, setPickupCenter] = useState(
    riderProfile.center || "شبين الكوم",
  );

  const [pickupVillage, setPickupVillage] = useState(
    riderProfile.village || "",
  );

  const [selectedVehicle, setSelectedVehicle] = useState(
    vehicleTypes[0] || "توك توك",
  );

  const [showOnlineOnly, setShowOnlineOnly] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [tripCalculated, setTripCalculated] = useState(false);

  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [currentPosition, setCurrentPosition] = useState([30.5526, 31.009]);
  const [accuracy, setAccuracy] = useState(700);

  const [selectionMode, setSelectionMode] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [manualPickupPosition, setManualPickupPosition] = useState(null);
  const [manualDestinationPosition, setManualDestinationPosition] =
    useState(null);

  const [pickupLabel, setPickupLabel] = useState("موقعك الحالي");
  const [destinationLabel, setDestinationLabel] = useState(
    "لم يتم تحديد الوجهة بعد",
  );

  const [destinationSearch, setDestinationSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [locationStatus, setLocationStatus] = useState(
    "اكتب المكان اللي رايح له، وبعدها اضغط احسب المشوار.",
  );

  const pickupVillages = villagesByCenter[pickupCenter] || [];

  const pickupPosition = useMemo(() => {
    if (manualPickupPosition) return manualPickupPosition;
    if (useCurrentLocation) return currentPosition;
    return getVillagePosition(pickupCenter, pickupVillage, "pickup");
  }, [
    manualPickupPosition,
    useCurrentLocation,
    currentPosition,
    pickupCenter,
    pickupVillage,
  ]);

  const destinationPosition = useMemo(() => {
    if (manualDestinationPosition) return manualDestinationPosition;
    return null;
  }, [manualDestinationPosition]);

  const tripDistance = useMemo(() => {
    if (!destinationPosition) return 0;

    const distance = getDistanceKm(pickupPosition, destinationPosition);
    return Math.max(distance, 1.2);
  }, [pickupPosition, destinationPosition]);

  const tripEta = tripDistance
    ? Math.max(5, Math.ceil(tripDistance * 4 + 4))
    : 0;

  const priceResult = calculatePriceRange(
    pricingSettings,
    selectedVehicle,
    tripDistance || 1.2,
  );

  const priceRange = priceResult.text;

  const completedTrips = riderTrips.filter((trip) => trip.status === "مكتملة");

  const totalSpent = completedTrips.reduce(
    (total, trip) => total + Number(trip.amount || 0),
    0,
  );

  const riderRewardOffer = offersSettings.riderOffer;

  const riderRewardRequiredTrips = Math.max(
    Number(riderRewardOffer.requiredTrips || DEFAULT_RIDER_REWARD_TRIPS),
    1,
  );

  const riderRewardDiscountAmount = getDiscountAmount(
    riderRewardOffer.beforeDiscount,
    riderRewardOffer.afterDiscount,
  );

  const completedTripsAfterUsedRewards = Math.max(
    completedTrips.length - usedRiderRewards * riderRewardRequiredTrips,
    0,
  );

  const riderRewardProgress = Math.min(
    completedTripsAfterUsedRewards,
    riderRewardRequiredTrips,
  );

  const riderRewardPercent = Math.min(
    Math.round((riderRewardProgress / riderRewardRequiredTrips) * 100),
    100,
  );

  const remainingTripsForReward = Math.max(
    riderRewardRequiredTrips - riderRewardProgress,
    0,
  );

  const hasAvailableRiderReward =
    riderRewardOffer.enabled &&
    riderRewardDiscountAmount > 0 &&
    completedTripsAfterUsedRewards >= riderRewardRequiredTrips;

  const discountedPriceRange = applyDiscountToPriceLabel(
    priceRange,
    riderRewardDiscountAmount,
  );

  const isRiderRewardApplied = hasAvailableRiderReward && useRiderReward;

  const displayedPriceRange = isRiderRewardApplied
    ? discountedPriceRange
    : priceRange;

  const riderAvailableOffers = getRiderOffersList({
    completedTripsAfterUsedRewards,
    riderRewardRequiredTrips,
    riderRewardDiscountAmount,
    hasAvailableRiderReward,
    isRiderRewardApplied,
  });

  const availableOffers = riderAvailableOffers.filter(
    (offer) => offer.type === "available",
  );

  const nearbyOffers = riderAvailableOffers.filter(
    (offer) => offer.type === "nearby",
  );

  const lastRequest = rideRequests[0] || null;

  const visibleActiveRequest =
    activeRideRequest ||
    rideRequests.find(
      (request) =>
        request.statusCode === "pending" ||
        request.statusCode === "accepted" ||
        request.statusCode === "driver_offer",
    ) ||
    null;

  const hasActiveRequest =
    visibleActiveRequest &&
    visibleActiveRequest.statusCode !== "cancelled" &&
    visibleActiveRequest.statusCode !== "rejected";

  const activeDriverOffer = getDriverOfferDetailsFromRequest(
    visibleActiveRequest,
    currentTime,
  );

  const filteredDrivers = useMemo(() => {
    return driversData
      .filter((driver) => {
        const centerMatch = pickupCenter
          ? driver.center === pickupCenter
          : true;
        const vehicleMatch = selectedVehicle
          ? driver.vehicle === selectedVehicle
          : true;
        const onlineMatch = showOnlineOnly ? driver.online : true;

        return centerMatch && vehicleMatch && onlineMatch;
      })
      .map((driver) => {
        const driverDistance = getDistanceKm(pickupPosition, [
          driver.lat,
          driver.lng,
        ]);

        return {
          ...driver,
          distanceNumber: driverDistance,
          distance: `${driverDistance.toFixed(1)} كم`,
          eta: `${Math.max(3, Math.ceil(driverDistance * 3 + 3))} دقائق`,
        };
      })
      .sort((a, b) => a.distanceNumber - b.distanceNumber);
  }, [pickupCenter, selectedVehicle, showOnlineOnly, pickupPosition]);

  const availableDriversCount = filteredDrivers.length;
  const mapFocus =
    selectedDriver?.lat && selectedDriver?.lng
      ? [selectedDriver.lat, selectedDriver.lng]
      : destinationPosition
        ? destinationPosition
        : pickupPosition || centerCoordinates[pickupCenter];

  const tripLine =
    tripCalculated && destinationPosition
      ? [pickupPosition, destinationPosition]
      : [];

  const driverLine =
    selectedDriver?.lat && selectedDriver?.lng
      ? [pickupPosition, [selectedDriver.lat, selectedDriver.lng]]
      : [];

  const playNotificationSound = () => {
    // تم تعطيل صوت الإشعارات مؤقتًا لتجنب أخطاء المتصفح و ESLint
  };

  const scrollToSection = (sectionId) => {
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 120);
  };

  const openMapForSelection = (type = "destination") => {
    setShowMap(true);
    setSelectionMode(type);
    setLocationStatus(
      type === "pickup"
        ? "افتح الخريطة واضغط على مكانك الحالي."
        : "افتح الخريطة واضغط على المكان اللي رايح له.",
    );
    scrollToSection("map-section");
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(getNowTime());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncRideRequests = () => {
      const latestRequests = getStoredRideRequests();
      setRideRequests(latestRequests);

      if (activeRideRequest?.id) {
        const latestActiveRequest = latestRequests.find(
          (request) => request.id === activeRideRequest.id,
        );

        if (latestActiveRequest) {
          setActiveRideRequest(latestActiveRequest);
        }
      }
    };

    syncRideRequests();

    const intervalId = window.setInterval(syncRideRequests, 1500);

    return () => window.clearInterval(intervalId);
  }, [activeRideRequest?.id]);

  const updateRideRequest = (requestId, updates) => {
    const latestRequests = getStoredRideRequests();

    const updatedRequests = latestRequests.map((request) =>
      request.id === requestId
        ? {
            ...request,
            ...updates,
            updatedAt: new Date().toLocaleString("ar-EG"),
          }
        : request,
    );

    setRideRequests(updatedRequests);
    saveRideRequests(updatedRequests);

    const updatedActiveRequest = updatedRequests.find(
      (request) => request.id === requestId,
    );

    if (updatedActiveRequest) {
      setActiveRideRequest(updatedActiveRequest);
    }

    return updatedActiveRequest;
  };

  const getRiderOfferBasePrice = (request) => {
    return extractPriceNumber(
      request?.finalPrice || request?.price || request?.systemPrice || 0,
    );
  };

  const getRiderOfferMaxPrice = (request) => {
    const basePrice = getRiderOfferBasePrice(request);

    if (!basePrice) {
      return 0;
    }

    return Math.ceil(basePrice * (1 + RIDER_URGENCY_MAX_PERCENT / 100));
  };

  const openRiderOfferModal = (request) => {
    if (!request) {
      return;
    }

    if (request.statusCode !== "pending") {
      alert("تقدر تزود السعر فقط والطلب لسه في انتظار السائق.");
      return;
    }

    const basePrice = getRiderOfferBasePrice(request);

    setRiderOfferModal({
      open: true,
      request,
      price: String(basePrice + 5),
    });
  };

  const closeRiderOfferModal = () => {
    setRiderOfferModal({
      open: false,
      request: null,
      price: "",
    });
  };

  const confirmRiderOffer = () => {
    if (!riderOfferModal.request) {
      return;
    }

    const basePrice = getRiderOfferBasePrice(riderOfferModal.request);
    const maxPrice = getRiderOfferMaxPrice(riderOfferModal.request);
    const parsedPrice = Number(riderOfferModal.price);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      alert("اكتب سعر صحيح أكبر من صفر.");
      return;
    }

    if (parsedPrice <= basePrice) {
      alert(`لازم السعر الجديد يكون أعلى من السعر الحالي ${basePrice} ج.`);
      return;
    }

    if (parsedPrice > maxPrice) {
      alert(`أقصى زيادة مسموحة للمشوار ده هي ${maxPrice} ج.`);
      return;
    }

    if (riderOfferModal.request.id === "temp") {
      setBoostedPrice(parsedPrice);
      setLocationStatus(
        `تم تجهيز سعر أعلى ${parsedPrice} ج. اختار السائق واضغط طلب المشوار.`,
      );
      closeRiderOfferModal();
      scrollToSection("drivers-section");
      return;
    }

    updateRideRequest(riderOfferModal.request.id, {
      price: `${parsedPrice} ج`,
      finalPrice: parsedPrice,
      riderOfferPrice: parsedPrice,
      riderOfferOldPrice: basePrice,
      priceStatus: "rider_increased_price",
      statusCode: "pending",
      status: "الراكب زود سعر المشوار لسرعة القبول",
    });

    setLocationStatus(
      `تم رفع سعر المشوار إلى ${parsedPrice} ج. السعر الجديد هيوصل للسائق عشان يقبل أسرع.`,
    );

    closeRiderOfferModal();
  };

  const cancelRideRequest = (requestId) => {
    const confirmCancel = window.confirm("هل تريد إلغاء طلب المشوار؟");

    if (!confirmCancel) return;

    updateRideRequest(requestId, {
      statusCode: "cancelled",
      status: "تم إلغاء الطلب من الراكب",
      priceStatus: "cancelled",
    });

    setActiveRideRequest(null);
    setLocationStatus(
      "تم إلغاء الطلب. تقدر تختار سائق آخر أو تحسب مشوار جديد.",
    );
  };

  const acceptDriverOffer = (request) => {
    const offerDetails = getDriverOfferDetailsFromRequest(request, currentTime);

    if (offerDetails?.isExpired) {
      updateRideRequest(request.id, {
        statusCode: "pending",
        status: "انتهى وقت عرض السعر من السائق",
        priceStatus: "driver_offer_expired",
        driverOfferPrice: null,
      });

      setLocationStatus("انتهى وقت عرض السعر. الطلب رجع للسعر الأصلي.");
      return;
    }

    updateRideRequest(request.id, {
      statusCode: "accepted",
      status: "وافق الراكب على سعر السائق",
      priceStatus: "accepted_by_rider",
      finalPrice: request.driverOfferPrice || request.price,
      price: `${request.driverOfferPrice} ج`,
    });

    setLocationStatus("تم قبول السعر الجديد. السائق في الطريق إليك.");
  };

  const rejectDriverOffer = (request) => {
    updateRideRequest(request.id, {
      statusCode: "pending",
      status: "رفض الراكب سعر السائق والطلب مازال بالسعر الأصلي",
      priceStatus: "driver_offer_rejected",
      driverOfferPrice: null,
      driverOfferExpiresAt: null,
    });

    setLocationStatus(
      "تم رفض السعر الجديد. الطلب لسه موجود بالسعر الأصلي في انتظار رد السائق.",
    );
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");

    if (!confirmLogout) return;

    localStorage.removeItem("wasalne_current_user");
    localStorage.removeItem("wasalne_user_role");
    localStorage.removeItem("wasalne_after_auth_redirect");
    localStorage.removeItem("wasalne_pending_role");
    localStorage.removeItem("wasalne_admin_preview_rider");
    localStorage.removeItem("wasalne_admin_preview_driver");

    alert("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationStatus("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setLocationStatus("جاري تحديث موقعك بدقة عالية...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(pos.coords.accuracy || 400);
        setUseCurrentLocation(true);
        setManualPickupPosition(null);
        setPickupLabel("موقعك الحالي");
        setLocationStatus("تم تحديث موقعك بنجاح");
        setTripCalculated(false);
        setSelectedDriver(null);
      },
      () => {
        const fallback = centerCoordinates[pickupCenter] || [30.5526, 31.009];

        setCurrentPosition(fallback);
        setAccuracy(900);
        setUseCurrentLocation(true);
        setManualPickupPosition(null);
        setPickupLabel("موقع تقريبي حسب المركز");
        setLocationStatus("تم استخدام موقع تقريبي حسب المركز");
        setTripCalculated(false);
        setSelectedDriver(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handlePickLocationFromMap = (type, position) => {
    if (type === "pickup") {
      setManualPickupPosition(position);
      setUseCurrentLocation(false);
      setPickupLabel("تم تحديد مكان الركوب من الخريطة");
      setLocationStatus(
        "تم تحديد مكان الركوب. حدد الوجهة الآن من البحث أو الخريطة.",
      );
    }

    if (type === "destination") {
      setManualDestinationPosition(position);
      setDestinationLabel("تم تحديد الوجهة من الخريطة");
      setDestinationSearch("");
      setLocationStatus(
        "تم تحديد الوجهة بنجاح. اضغط احسب المشوار لعرض السعر والسائقين.",
      );
    }

    setTripCalculated(false);
    setSelectedDriver(null);
    setSelectionMode(null);
    setShowMap(true);
    scrollToSection("trip-section");
  };

  const searchDestinationByName = async () => {
    const cleanSearch = destinationSearch.trim();

    if (!cleanSearch) {
      setLocationStatus("اكتب اسم المكان أولاً");
      return;
    }

    try {
      setSearchLoading(true);
      setLocationStatus("جاري البحث عن الوجهة...");

      const query = encodeURIComponent(`${cleanSearch}, المنوفية, مصر`);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`,
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        setLocationStatus(
          "لم يتم العثور على المكان، جرّب اسم أوضح أو حدده من الخريطة",
        );
        return;
      }

      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);
      const foundName = data[0].display_name || cleanSearch;

      setManualDestinationPosition([lat, lon]);
      setDestinationLabel(foundName);
      setTripCalculated(false);
      setSelectedDriver(null);
      setSelectionMode(null);
      setLocationStatus(
        "تم تحديد الوجهة من البحث بنجاح. اضغط احسب المشوار لعرض السعر والسائقين.",
      );
      scrollToSection("trip-section");
    } catch {
      setLocationStatus("حصل خطأ أثناء البحث، جرّب تحديد الوجهة من الخريطة");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCalculateTrip = () => {
    if (!destinationPosition) {
      setLocationStatus("اكتب اسم الوجهة أو حددها من الخريطة أولاً");
      setSelectionMode("destination");
      return;
    }

    setTripCalculated(true);
    setSelectedDriver(null);
    setLocationStatus(
      availableDriversCount > 0
        ? `تم حساب المشوار. يوجد ${availableDriversCount} سائق متاح. اضغط طلب المشوار الآن.`
        : "تم حساب المشوار، لكن لا يوجد سائق متاح حاليًا. جرّب تغيير نوع المركبة أو عرض الكل.",
    );
    playNotificationSound();
    scrollToSection("drivers-section");
  };

  const resetDestination = () => {
    setManualDestinationPosition(null);
    setDestinationLabel("لم يتم تحديد الوجهة بعد");
    setDestinationSearch("");
    setTripCalculated(false);
    setSelectedDriver(null);
    setSelectionMode("destination");
    setLocationStatus("اكتب اسم الوجهة أو اضغط على الخريطة لتحديدها.");
    scrollToSection("trip-section");
  };

  const openGoogleDirections = (targetPosition) => {
    if (!targetPosition) return;

    const url = `https://www.google.com/maps/dir/?api=1&origin=${pickupPosition[0]},${pickupPosition[1]}&destination=${targetPosition[0]},${targetPosition[1]}&travelmode=driving`;

    window.open(url, "_blank");
  };

  const requestRide = () => {
    if (!destinationPosition || !tripCalculated) {
      alert("احسب المشوار الأول قبل إرسال الطلب");
      return;
    }

    const newRequest = {
      id: generateId(),
      riderName: riderProfile.name,
      riderPhone: riderProfile.phone,
      riderEmail: riderProfile.email,

      driverId: null,
      driverName: "في انتظار سائق",
      driverPhone: "",
      driverCenter: pickupCenter,
      driverVillage: pickupVillage || pickupCenter,
      driverRating: null,

      vehicle: selectedVehicle,
      from: pickupLabel,
      to: destinationLabel,
      pickupPosition,
      destinationPosition,
      systemPrice: priceRange,
      originalPrice: priceRange,
      price: boostedPrice ? `${boostedPrice} ج` : displayedPriceRange,
      finalPrice:
        boostedPrice ||
        (isRiderRewardApplied ? extractPriceNumber(displayedPriceRange) : null),
      riderOfferPrice: boostedPrice || null,
      riderOfferOldPrice: boostedPrice
        ? extractPriceNumber(displayedPriceRange)
        : null,
      riderRewardApplied: isRiderRewardApplied,
      riderRewardTitle: isRiderRewardApplied ? riderRewardOffer.title : null,
      riderRewardDiscount: isRiderRewardApplied ? riderRewardDiscountAmount : 0,
      driverOfferPrice: null,
      priceStatus: boostedPrice
        ? "rider_increased_price"
        : isRiderRewardApplied
          ? "rider_reward_discount"
          : "waiting_driver",
      distance: `${tripDistance.toFixed(1)} كم`,
      eta: `${tripEta} دقيقة`,
      statusCode: "pending",
      status: boostedPrice
        ? "تم إرسال الطلب بسعر أعلى في انتظار سائق"
        : isRiderRewardApplied
          ? "تم إرسال الطلب مع خصم عروض الراكب"
          : "تم إرسال الطلب في انتظار سائق",
      createdAt: new Date().toLocaleString("ar-EG"),
      updatedAt: new Date().toLocaleString("ar-EG"),
    };

    const updatedRequests = [newRequest, ...rideRequests];

    setRideRequests(updatedRequests);
    setActiveRideRequest(newRequest);
    saveRideRequests(updatedRequests);

    if (isRiderRewardApplied) {
      const nextUsedRewards = usedRiderRewards + 1;
      setUsedRiderRewards(nextUsedRewards);
      saveUsedRiderRewards(nextUsedRewards);
      setUseRiderReward(false);
    }

    setSelectedDriver(null);
    playNotificationSound();

    setLocationStatus(
      boostedPrice
        ? `تم إرسال الطلب للسائقين المتاحين بسعر ${boostedPrice} ج. أول سائق يقبل الطلب هيظهر لك هنا.`
        : isRiderRewardApplied
          ? `تم إرسال الطلب مع خصم ${riderRewardDiscountAmount} ج. السعر بعد الخصم ${displayedPriceRange}. أول سائق يقبل الطلب هيظهر لك هنا.`
          : `تم إرسال الطلب للسائقين المتاحين بالسعر المقترح ${displayedPriceRange}. أول سائق يقبل الطلب هيظهر لك هنا.`,
    );

    alert("تم إرسال طلب المشوار للسائقين المتاحين");
    scrollToSection("drivers-section");
  };

  return (
    <main className="rider-page" dir="rtl">
      <div className="rider-bg-glow rider-glow-1"></div>
      <div className="rider-bg-glow rider-glow-2"></div>

      <header className="rider-navbar rider-navbar-v2">
        <Link to={homePath} className="rider-logo rider-logo-v2">
          <div className="rider-logo-box">
            <img src={logoPath} alt="Wasalne Logo" />
          </div>

          <div>
            <h2>Wasalne</h2>
            <p>
              {isAdmin
                ? "معاينة الأدمن لصفحة الراكب"
                : "اطلب رحلتك بسهولة وسرعة"}
            </p>
          </div>
        </Link>

        <nav className="rider-nav-links rider-nav-links-v2">
          <Link to={homePath}>الرئيسية</Link>

          <button
            type="button"
            className="rider-profile-nav-btn"
            onClick={() => setShowProfileModal(true)}
          >
            البروفايل
          </button>

          <button
            type="button"
            className="rider-profile-nav-btn"
            onClick={() => setShowRiderOffersModal(true)}
          >
            عروض الراكب
          </button>

          <Link to={riderDetailsPath}>تفاصيل الحساب</Link>
        </nav>

        <div className="rider-nav-actions rider-nav-actions-v2">
          {isAdmin && (
            <button
              type="button"
              className="admin-return-btn"
              onClick={() => {
                localStorage.removeItem("wasalne_admin_preview_rider");
                navigate("/admin-dashboard");
              }}
            >
              <ShieldCheck size={18} />
              رجوع للأدمن
            </button>
          )}

          <button
            className="rider-mini-profile-btn"
            type="button"
            onClick={() => setShowProfileModal(true)}
          >
            <span>{riderProfile.name?.charAt(0) || "ر"}</span>
            حسابي
          </button>

          <button className="locate-nav-btn" type="button" onClick={locateUser}>
            <Crosshair size={18} />
            موقعي
          </button>

          <button
            className="rider-logout-btn"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            خروج
          </button>
        </div>
      </header>

      {isAdmin && (
        <section className="admin-preview-banner">
          <ShieldCheck size={22} />
          <div>
            <h3>أنت الآن في وضع معاينة الأدمن</h3>
            <p>الصفحة تظهر لك لاختبار تجربة الراكب بشكل مباشر.</p>
          </div>
        </section>
      )}

      {riderOfferModal.open && riderOfferModal.request && (
        <div className="rider-offer-modal-overlay">
          <div className="rider-offer-modal-card">
            <button
              type="button"
              className="rider-offer-modal-close"
              onClick={closeRiderOfferModal}
            >
              <XCircle size={22} />
            </button>

            <div className="rider-offer-modal-icon">
              <WalletCards size={38} />
            </div>

            <span>طلب سعر أعلى</span>
            <h3>زود السعر عشان السائق يقبل أسرع</h3>

            <p>
              السعر الحالي {getRiderOfferBasePrice(riderOfferModal.request)} ج —
              أقصى سعر مسموح {getRiderOfferMaxPrice(riderOfferModal.request)} ج.
            </p>

            <label className="rider-offer-modal-input">
              <span>السعر الجديد بالجنيه</span>
              <input
                type="number"
                min={getRiderOfferBasePrice(riderOfferModal.request) + 1}
                max={getRiderOfferMaxPrice(riderOfferModal.request)}
                value={riderOfferModal.price}
                onChange={(event) =>
                  setRiderOfferModal((prev) => ({
                    ...prev,
                    price: event.target.value,
                  }))
                }
              />
            </label>

            <div className="rider-offer-modal-actions">
              <button type="button" onClick={confirmRiderOffer}>
                <CheckCircle2 size={19} />
                إرسال السعر للسائق
              </button>

              <button type="button" onClick={closeRiderOfferModal}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {activeRideRequest && (
        <section className="rider-active-request-banner">
          <Radio size={22} />

          <div>
            <h3>طلب مشوار نشط</h3>
            <p>
              تم إرسال طلبك إلى {activeRideRequest.driverName} - الحالة الحالية:{" "}
              <strong>{getRequestStatusLabel(activeRideRequest)}</strong>
            </p>
          </div>

          <button type="button" onClick={() => setActiveRideRequest(null)}>
            <XCircle size={18} />
            إخفاء
          </button>
        </section>
      )}

      {showRiderOffersModal && (
        <div className="rider-profile-modal-overlay">
          <div className="rider-profile-modal rider-offers-modal">
            <button
              type="button"
              className="rider-profile-modal-close"
              onClick={() => setShowRiderOffersModal(false)}
            >
              <XCircle size={22} />
            </button>

            <div className="rider-profile-modal-hero">
              <div className="rider-profile-modal-avatar">
                <Gift size={32} />
              </div>

              <div>
                <span>
                  <Gift size={16} />
                  عروض الراكب
                </span>

                <h2>العروض المتاحة والقريبة</h2>
                <p>
                  اختار نوع العروض اللي عاوز تشوفه: المتاحة للاستخدام الآن أو
                  العروض القريبة اللي هتفتح مع الرحلات الجاية.
                </p>
              </div>
            </div>

            <div className="rider-offers-tabs two-tabs">
              <button
                type="button"
                className={riderOffersView === "available" ? "active" : ""}
                onClick={() => setRiderOffersView("available")}
              >
                <Gift size={17} />
                {availableOffers.length} عروض متاحة
              </button>

              <button
                type="button"
                className={riderOffersView === "nearby" ? "active" : ""}
                onClick={() => setRiderOffersView("nearby")}
              >
                <Activity size={17} />
                {nearbyOffers.length} عروض قريبة
              </button>
            </div>

            <div className="rider-offers-list">
              {riderOffersView === "available" && (
                <>
                  <div className="rider-offers-section-title">
                    <Gift size={18} />
                    <h3>العروض المتاحة الآن</h3>
                  </div>

                  {availableOffers.map((offer) => {
                    const progressPercent = Math.min(
                      Math.round((offer.progress / offer.target) * 100),
                      100,
                    );

                    return (
                      <div
                        className={`rider-offer-list-card available ${
                          offer.active ? "active" : ""
                        }`}
                        key={offer.id}
                      >
                        <div className="rider-offer-list-head">
                          <span>{offer.badge}</span>
                          <strong>{offer.value}</strong>
                        </div>

                        <h4>{offer.title}</h4>
                        <p>{offer.description}</p>

                        <div className="rider-offer-mini-progress">
                          <div>
                            <span>التقدم</span>
                            <strong>
                              {offer.progress}/{offer.target}
                            </strong>
                          </div>

                          <div className="rider-offer-track">
                            <span
                              style={{ width: `${progressPercent}%` }}
                            ></span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!offer.canActivate}
                          onClick={() => {
                            if (!offer.canActivate) {
                              setShowRiderOffersModal(false);
                              scrollToSection("trip-section");
                              return;
                            }

                            setUseRiderReward((prev) => !prev);
                            setShowRiderOffersModal(false);
                            scrollToSection("trip-section");
                          }}
                        >
                          <Sparkles size={18} />
                          {offer.actionText}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}

              {riderOffersView === "nearby" && (
                <>
                  <div className="rider-offers-section-title">
                    <Activity size={18} />
                    <h3>العروض القريبة</h3>
                  </div>

                  {nearbyOffers.map((offer) => {
                    const progressPercent = Math.min(
                      Math.round((offer.progress / offer.target) * 100),
                      100,
                    );

                    return (
                      <div
                        className="rider-offer-list-card nearby"
                        key={offer.id}
                      >
                        <div className="rider-offer-list-head">
                          <span>{offer.badge}</span>
                          <strong>{offer.value}</strong>
                        </div>

                        <h4>{offer.title}</h4>
                        <p>{offer.description}</p>

                        <div className="rider-offer-mini-progress">
                          <div>
                            <span>التقدم</span>
                            <strong>
                              {offer.progress}/{offer.target}
                            </strong>
                          </div>

                          <div className="rider-offer-track">
                            <span
                              style={{ width: `${progressPercent}%` }}
                            ></span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowRiderOffersModal(false);
                            scrollToSection("trip-section");
                          }}
                        >
                          <Activity size={18} />
                          {offer.actionText}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {riderRewardOffer.enabled && (
        <section
          className={`rider-offer-banner ${
            isRiderRewardApplied
              ? "reward-applied"
              : hasAvailableRiderReward
                ? "ready"
                : "locked"
          }`}
        >
          <div className="rider-offer-content">
            <div className="rider-offer-top">
              <button
                type="button"
                className="rider-offer-badge"
                onClick={() => setShowRiderOffersModal(true)}
              >
                <Gift size={17} />
                عروض الراكب
              </button>

              <span className="rider-offer-status">
                {isRiderRewardApplied
                  ? "الخصم مفعل"
                  : hasAvailableRiderReward
                    ? "خصم متاح"
                    : "قريب من الخصم"}
              </span>
            </div>

            <h2>
              {isRiderRewardApplied
                ? `تم تفعيل خصم ${riderRewardDiscountAmount} جنيه`
                : hasAvailableRiderReward
                  ? `خصم ${riderRewardDiscountAmount} جنيه جاهز ليك`
                  : `كمّل ${remainingTripsForReward} رحلة وخد خصم ${riderRewardDiscountAmount} جنيه`}
            </h2>

            <p>
              {isRiderRewardApplied
                ? "الخصم هيتطبق على سعر رحلتك القادمة عند إرسال الطلب."
                : hasAvailableRiderReward
                  ? "فعّل الخصم دلوقتي وهيتخصم تلقائيًا من الرحلة القادمة."
                  : `كل ${riderRewardRequiredTrips} رحلات مكتملة تفتحلك خصم مباشر على الرحلة التالية.`}
            </p>

            <div className="rider-offer-progress">
              <div>
                <span>تقدمك في العرض</span>
                <strong>
                  {riderRewardProgress}/{riderRewardRequiredTrips}
                </strong>
              </div>

              <div className="rider-offer-track">
                <span style={{ width: `${riderRewardPercent}%` }}></span>
              </div>
            </div>
          </div>

          <div className="rider-offer-side">
            <span>{isRiderRewardApplied ? "خصم مفعل" : "قيمة الخصم"}</span>
            <strong>{riderRewardDiscountAmount} ج</strong>

            <button
              type="button"
              className={isRiderRewardApplied ? "active" : ""}
              onClick={() => {
                if (hasAvailableRiderReward) {
                  setUseRiderReward((prev) => !prev);
                  scrollToSection("trip-section");
                  return;
                }

                setShowRiderOffersModal(true);
              }}
            >
              <Sparkles size={18} />
              {isRiderRewardApplied
                ? "إلغاء الخصم"
                : hasAvailableRiderReward
                  ? "فعّل الخصم"
                  : "شوف العروض"}
            </button>
          </div>
        </section>
      )}

      <section className="rider-hero rider-hero-v2">
        <div className="rider-hero-content rider-hero-content-v2">
          <span className="rider-badge">
            <Sparkles size={16} />
            طلب مشوار سريع
          </span>

          <h1>
            اطلب مشوارك
            <br />
            بسهولة
          </h1>

          <p>
            اكتب المكان اللي رايح له، احسب السعر، وبعدها اطلب أقرب سائق متاح.
          </p>

          <div className="rider-hero-actions-v2">
            <a href="#trip-section" className="hero-primary-btn">
              ابدأ الطلب
              <Calculator size={18} />
            </a>

            <button
              type="button"
              className="hero-secondary-btn"
              onClick={() => openMapForSelection("destination")}
            >
              افتح الخريطة
              <MousePointer2 size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="trip-builder-section" id="trip-section">
        <div className="rider-section-title">
          <span>ابدأ هنا</span>
          <h2>اطلب مشوارك</h2>
        </div>

        <div className="trip-builder-card">
          <div className="trip-column">
            <div className="trip-column-title pickup-title">
              <MapPin size={22} />
              <h3>أنت فين؟</h3>
            </div>

            <button
              type="button"
              className={`current-location-toggle ${
                useCurrentLocation && !manualPickupPosition ? "active" : ""
              }`}
              onClick={locateUser}
            >
              <Crosshair size={18} />
              استخدم موقعي
            </button>

            <button
              type="button"
              className={`map-pick-btn ${
                selectionMode === "pickup" ? "active" : ""
              }`}
              onClick={() =>
                selectionMode === "pickup"
                  ? setSelectionMode(null)
                  : openMapForSelection("pickup")
              }
            >
              <MousePointer2 size={18} />
              اختار مكانك من الخريطة
            </button>

            <div className="filter-box">
              <label>المركز</label>
              <div className="filter-input">
                <MapPin size={18} />
                <select
                  value={pickupCenter}
                  onChange={(e) => {
                    setPickupCenter(e.target.value);
                    setPickupVillage("");
                    setSelectedDriver(null);
                    setTripCalculated(false);
                  }}
                >
                  {centers.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-box">
              <label>القرية / المنطقة</label>
              <div className="filter-input">
                <MapPin size={18} />
                <select
                  value={pickupVillage}
                  onChange={(e) => {
                    setPickupVillage(e.target.value);
                    setUseCurrentLocation(false);
                    setManualPickupPosition(null);
                    setPickupLabel(e.target.value || pickupCenter);
                    setSelectedDriver(null);
                    setTripCalculated(false);
                  }}
                >
                  <option value="">اختر القرية</option>

                  {pickupVillages.map((village) => (
                    <option key={village} value={village}>
                      {village}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="trip-divider">
            <Route size={28} />
          </div>

          <div className="trip-column">
            <div className="trip-column-title destination-title">
              <Flag size={22} />
              <h3>رايح فين؟</h3>
            </div>

            <div className="destination-search-box">
              <label>المكان اللي رايح له</label>

              <div className="destination-search-row">
                <input
                  type="text"
                  placeholder="مثال: الجامعة، المستشفى، موقف شبين..."
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchDestinationByName();
                  }}
                />

                <button
                  type="button"
                  onClick={searchDestinationByName}
                  disabled={searchLoading}
                >
                  {searchLoading ? "جاري..." : "بحث"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`map-pick-btn destination ${
                selectionMode === "destination" ? "active" : ""
              }`}
              onClick={() =>
                selectionMode === "destination"
                  ? setSelectionMode(null)
                  : openMapForSelection("destination")
              }
            >
              <MousePointer2 size={18} />
              اختار من الخريطة
            </button>

            <div className="destination-selected-box">
              <span>المكان اللي رايح له</span>
              <strong>{destinationLabel}</strong>

              {destinationPosition && (
                <button type="button" onClick={resetDestination}>
                  تغيير الوجهة
                </button>
              )}
            </div>
          </div>

          <div className="trip-options">
            <div className="filter-box">
              <label>نوع المركبة</label>
              <div className="filter-input">
                <Car size={18} />
                <select
                  value={selectedVehicle}
                  onChange={(e) => {
                    setSelectedVehicle(e.target.value);
                    setSelectedDriver(null);
                    setTripCalculated(false);
                  }}
                >
                  {vehicleTypes.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-box filter-toggle-box">
              <label>السواقين</label>
              <button
                type="button"
                className={`online-toggle ${showOnlineOnly ? "active" : ""}`}
                onClick={() => {
                  setShowOnlineOnly(!showOnlineOnly);
                  setSelectedDriver(null);
                }}
              >
                <Filter size={18} />
                {showOnlineOnly ? "السواقين المتاحين" : "عرض كل السواقين"}
              </button>
            </div>

            <button
              className="calculate-trip-btn"
              type="button"
              onClick={handleCalculateTrip}
            >
              <Calculator size={20} />
              احسب السعر واعرض السواقين
            </button>
          </div>
        </div>

        <div className="destination-help-box">
          <Flag size={20} />
          <p>{locationStatus}</p>
        </div>
      </section>

      {showMap && (
        <section className="rider-map-section" id="map-section">
          <div className="rider-section-title map-title-row">
            <div>
              <span>الخريطة</span>
              <h2>اختار المكان من الخريطة</h2>
            </div>

            <div className="map-top-actions">
              <button
                className="map-refresh-btn"
                type="button"
                onClick={locateUser}
              >
                <Crosshair size={18} />
                حدّث موقعي
              </button>

              <button
                className="map-refresh-btn dark"
                type="button"
                onClick={() => openMapForSelection("destination")}
              >
                <MousePointer2 size={18} />
                اختار الوجهة
              </button>
            </div>
          </div>

          {selectionMode && (
            <div className="map-selection-alert">
              <MousePointer2 size={20} />
              <span>
                {selectionMode === "pickup"
                  ? "اضغط على الخريطة لتحديد مكان الركوب"
                  : "اضغط على الخريطة لتحديد الوجهة"}
              </span>
            </div>
          )}

          <div className="map-layout">
            <div className="map-panel">
              <MapContainer
                center={mapFocus}
                zoom={13}
                scrollWheelZoom={true}
                className="rider-map"
              >
                <MapFlyTo position={mapFocus} zoom={selectedDriver ? 15 : 13} />

                <MapClickSelector
                  selectionMode={selectionMode}
                  onPickLocation={handlePickLocationFromMap}
                />

                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                />

                <Circle
                  center={pickupPosition}
                  radius={
                    useCurrentLocation && !manualPickupPosition ? accuracy : 350
                  }
                  pathOptions={{
                    color: "#0b6ff2",
                    fillColor: "#0b6ff2",
                    fillOpacity: 0.08,
                    weight: 1,
                  }}
                />

                <Marker
                  position={pickupPosition}
                  icon={createCustomIcon("pickup", true, true)}
                >
                  <Popup>{pickupLabel} / نقطة البداية</Popup>
                </Marker>

                {destinationPosition && (
                  <Marker
                    position={destinationPosition}
                    icon={createCustomIcon("destination", true, true)}
                  >
                    <Popup>{destinationLabel}</Popup>
                  </Marker>
                )}

                {tripLine.length > 0 && (
                  <Polyline
                    positions={tripLine}
                    pathOptions={{
                      color: "#0b6ff2",
                      weight: 6,
                      opacity: 0.78,
                      dashArray: "12 12",
                    }}
                  />
                )}

                {driverLine.length > 0 && (
                  <Polyline
                    positions={driverLine}
                    pathOptions={{
                      color: "#071f49",
                      weight: 4,
                      opacity: 0.68,
                      dashArray: "8 10",
                    }}
                  />
                )}
              </MapContainer>
            </div>

            <aside className="map-side-card">
              <h3>ملخص المشوار</h3>

              <div className="map-side-list">
                <div>
                  <span>من</span>
                  <strong>
                    {manualPickupPosition
                      ? pickupLabel
                      : useCurrentLocation
                        ? "موقعك الحالي"
                        : pickupVillage || pickupCenter}
                  </strong>
                </div>

                <div>
                  <span>إلى</span>
                  <strong>{destinationLabel}</strong>
                </div>

                <div>
                  <span>المركبة</span>
                  <strong>{selectedVehicle}</strong>
                </div>

                <div>
                  <span>السعر المتوقع</span>
                  <strong>{tripCalculated ? displayedPriceRange : "--"}</strong>
                </div>

                {visibleActiveRequest && (
                  <div>
                    <span>حالة الطلب</span>
                    <strong>
                      {getRequestStatusLabel(visibleActiveRequest)}
                    </strong>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}

      {tripCalculated && (
        <section className="trip-result-grid">
          <div className="trip-result-card">
            <Route size={24} />
            <span>المسافة</span>
            <strong>{tripDistance.toFixed(1)} كم</strong>
          </div>

          <div className="trip-result-card">
            <Clock3 size={24} />
            <span>الوقت المتوقع</span>
            <strong>{tripEta} دقيقة</strong>
          </div>

          <div className="trip-result-card price-card">
            <Gauge size={24} />
            <span>السعر التقريبي</span>
            <strong>
              {boostedPrice ? `${boostedPrice} ج` : displayedPriceRange}
            </strong>

            <small>
              {priceResult.negotiable
                ? "السعر تقديري وقابل للتفاوض حسب الاتفاق مع السائق."
                : "السعر تقديري حسب إعدادات الأدمن."}
            </small>
          </div>
        </section>
      )}

      {tripCalculated && !hasActiveRequest && (
        <section className="quick-rider-price-increase">
          <div>
            <WalletCards size={24} />
            <div>
              <span>مستعجل؟</span>
              <h3>زود السعر قبل إرسال الطلب</h3>
              <p>
                السعر الحالي {displayedPriceRange}. تقدر تزوده بنسبة معقولة عشان
                السائق يقبل أسرع.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const tempRequest = {
                id: "temp",
                price: displayedPriceRange,
                systemPrice: displayedPriceRange,
                statusCode: "pending",
              };

              setRiderOfferModal({
                open: true,
                request: tempRequest,
                price: String(getRiderOfferBasePrice(tempRequest) + 5),
              });
            }}
          >
            <WalletCards size={18} />
            زود السعر
          </button>
        </section>
      )}

      <section
        className="drivers-section request-now-section"
        id="drivers-section"
      >
        <div className="rider-section-title">
          <span>{hasActiveRequest ? "حالة الطلب" : "إرسال الطلب"}</span>
          <h2>
            {hasActiveRequest
              ? getRequestStatusLabel(visibleActiveRequest)
              : tripCalculated
                ? "اطلب مشوارك الآن"
                : "السائق هيظهر بعد ما تطلب"}
          </h2>
        </div>

        {!tripCalculated ? (
          <div className="empty-drivers">
            <h3>اكتب المكان واحسب السعر</h3>
            <p>
              بعد ما تكتب المكان اللي رايح له وتضغط احسب، هيظهر لك زر طلب
              المشوار.
            </p>
          </div>
        ) : hasActiveRequest ? (
          <div className="drivers-grid single-status-grid">
            <div className="driver-card active request-status-card">
              <div className="driver-top">
                <div className="driver-avatar">
                  <User size={24} />
                </div>

                <div className="driver-info">
                  <h3>
                    {visibleActiveRequest?.driverName || "في انتظار سائق"}
                  </h3>
                  <p>
                    {visibleActiveRequest?.statusCode === "accepted"
                      ? "السائق قبل الطلب وهو في الطريق"
                      : "أول سائق يقبل الطلب هيظهر هنا"}
                  </p>
                </div>

                <span className="driver-status online">
                  {getRequestStatusLabel(visibleActiveRequest)}
                </span>
              </div>

              <div className="driver-tags">
                <span className="vehicle-tag">
                  {getVehicleIcon(visibleActiveRequest?.vehicle)}
                  {visibleActiveRequest?.vehicle}
                </span>

                <span className="rating-tag">
                  <Star size={16} />
                  {visibleActiveRequest?.driverRating || "--"}
                </span>
              </div>

              <div className="driver-meta">
                <div>
                  <Route size={16} />
                  <span>{visibleActiveRequest?.distance}</span>
                </div>

                <div>
                  <Clock3 size={16} />
                  <span>{visibleActiveRequest?.eta}</span>
                </div>

                <div>
                  <Gauge size={16} />
                  <span>{getRequestPriceLabel(visibleActiveRequest)}</span>
                </div>
              </div>

              <div className="destination-help-box">
                <Flag size={20} />
                <p>
                  {visibleActiveRequest?.statusCode === "pending" &&
                    "طلبك اتبعت للسائقين المتاحين. أول سائق يقبل الطلب هيظهر لك هنا."}

                  {visibleActiveRequest?.statusCode === "accepted" &&
                    "تم قبول الرحلة. تقدر تتواصل مع السائق أو تفتح اتجاهات المشوار."}

                  {visibleActiveRequest?.statusCode === "driver_offer" &&
                    !activeDriverOffer?.isExpired &&
                    `السائق طلب زيادة السعر إلى ${visibleActiveRequest.driverOfferPrice} ج. اختار قبول أو رفض السعر.`}

                  {visibleActiveRequest?.statusCode === "driver_offer" &&
                    activeDriverOffer?.isExpired &&
                    "انتهى وقت عرض السعر الجديد. تقدر ترفضه أو تنتظر رد السائق بالسعر الأصلي."}
                </p>
              </div>

              {visibleActiveRequest?.statusCode === "driver_offer" && (
                <div
                  className={`rider-offer-box ${
                    activeDriverOffer?.isExpired ? "expired" : "active"
                  }`}
                >
                  <div>
                    <WalletCards size={22} />
                    <span>عرض سعر من السائق</span>
                  </div>

                  <h3>
                    {activeDriverOffer?.isExpired
                      ? "انتهى وقت العرض"
                      : "السائق طلب زيادة السعر"}
                  </h3>

                  <div className="rider-offer-prices">
                    <div>
                      <span>السعر الأصلي</span>
                      <strong>
                        {activeDriverOffer?.oldPrice ||
                          visibleActiveRequest?.price ||
                          visibleActiveRequest?.systemPrice}
                        {activeDriverOffer?.oldPrice ? " ج" : ""}
                      </strong>
                    </div>

                    <div>
                      <span>السعر الجديد</span>
                      <strong>
                        {visibleActiveRequest?.driverOfferPrice} ج
                      </strong>
                    </div>

                    <div>
                      <span>الوقت المتبقي</span>
                      <strong>
                        {activeDriverOffer?.isExpired
                          ? "00:00"
                          : formatOfferTime(
                              activeDriverOffer?.remainingSeconds,
                            )}
                      </strong>
                    </div>
                  </div>

                  <p>
                    القرار لك: تقبل السعر الجديد أو ترفضه. لو رفضت، الطلب يفضل
                    بالسعر الأصلي.
                  </p>
                </div>
              )}

              <div className="driver-actions request-status-actions">
                {visibleActiveRequest?.statusCode === "accepted" &&
                  visibleActiveRequest?.driverPhone && (
                    <a
                      className="call-btn"
                      href={`tel:${visibleActiveRequest.driverPhone}`}
                    >
                      <Phone size={18} />
                      اتصال بالسائق
                    </a>
                  )}

                {visibleActiveRequest?.statusCode === "driver_offer" ? (
                  <button
                    type="button"
                    className="msg-btn"
                    disabled={activeDriverOffer?.isExpired}
                    onClick={() => acceptDriverOffer(visibleActiveRequest)}
                  >
                    <MessageCircle size={18} />
                    {activeDriverOffer?.isExpired
                      ? "انتهى العرض"
                      : "قبول السعر"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="msg-btn"
                    onClick={() =>
                      alert(
                        visibleActiveRequest?.statusCode === "accepted"
                          ? "السائق قبل الرحلة وهو في الطريق إليك."
                          : "طلبك لسه في انتظار أول سائق يقبله.",
                      )
                    }
                  >
                    <MessageCircle size={18} />
                    متابعة الطلب
                  </button>
                )}

                {visibleActiveRequest?.statusCode === "pending" && (
                  <button
                    type="button"
                    className="urgent-price-btn"
                    onClick={() => openRiderOfferModal(visibleActiveRequest)}
                  >
                    <WalletCards size={18} />
                    زود السعر
                  </button>
                )}

                {visibleActiveRequest?.statusCode === "driver_offer" ? (
                  <button
                    type="button"
                    className="map-btn"
                    onClick={() => rejectDriverOffer(visibleActiveRequest)}
                  >
                    <XCircle size={18} />
                    رفض السعر
                  </button>
                ) : (
                  <button
                    type="button"
                    className="map-btn"
                    onClick={() => cancelRideRequest(visibleActiveRequest.id)}
                  >
                    <XCircle size={18} />
                    إلغاء الطلب
                  </button>
                )}
              </div>

              <button
                type="button"
                className="directions-btn"
                disabled={!destinationPosition}
                onClick={() => openGoogleDirections(destinationPosition)}
              >
                فتح اتجاهات المشوار
                <ExternalLink size={17} />
              </button>
            </div>
          </div>
        ) : (
          <div className="request-now-card">
            <div className="request-now-icon">
              <Radio size={42} />
            </div>

            <span>السائقين المتاحين</span>
            <h3>اطلب مشوارك الآن</h3>

            <p>
              مش هتختار السائق بنفسك. عندك الآن {availableDriversCount} سائق
              متاح لنوع المركبة والمنطقة، وأول سائق يقبل الطلب هيظهر لك باسمه
              ورقمه وحالة الطريق.
            </p>

            <div className="request-now-summary">
              <div>
                <span>المركبة</span>
                <strong>{selectedVehicle}</strong>
              </div>

              <div>
                <span>السعر</span>
                <strong>
                  {boostedPrice ? `${boostedPrice} ج` : displayedPriceRange}
                </strong>
              </div>

              <div>
                <span>المسافة</span>
                <strong>{tripDistance.toFixed(1)} كم</strong>
              </div>

              <div>
                <span>الوقت</span>
                <strong>{tripEta} دقيقة</strong>
              </div>

              <div>
                <span>السائقين المتاحين</span>
                <strong>{availableDriversCount}</strong>
              </div>
            </div>

            <button
              type="button"
              className="request-now-btn"
              onClick={requestRide}
            >
              <MessageCircle size={20} />
              طلب المشوار الآن
            </button>
          </div>
        )}
      </section>

      <div className="mobile-quick-action">
        {!tripCalculated ? (
          <button type="button" onClick={handleCalculateTrip}>
            <Calculator size={20} />
            احسب السعر
          </button>
        ) : hasActiveRequest ? (
          <button
            type="button"
            onClick={() => scrollToSection("drivers-section")}
          >
            <Radio size={20} />
            تابع الطلب
          </button>
        ) : (
          <button type="button" onClick={requestRide}>
            <MessageCircle size={20} />
            اطلب أقرب سواق
          </button>
        )}
      </div>

      {showProfileModal && (
        <div className="rider-profile-modal-overlay">
          <div className="rider-profile-modal">
            <button
              type="button"
              className="rider-profile-modal-close"
              onClick={() => setShowProfileModal(false)}
            >
              <XCircle size={22} />
            </button>

            <div className="rider-profile-modal-hero">
              <div className="rider-profile-modal-avatar">
                {riderProfile.name?.charAt(0) || "ر"}
              </div>

              <div>
                <span>
                  <ShieldCheck size={16} />
                  حساب راكب
                </span>

                <h2>{riderProfile.name}</h2>
                <p>{riderProfile.email}</p>

                <div className="rider-profile-modal-tags">
                  <strong>
                    <Phone size={15} />
                    {riderProfile.phone}
                  </strong>

                  <strong>
                    <MapPinned size={15} />
                    {riderProfile.center} - {riderProfile.village}
                  </strong>

                  <strong>
                    <Activity size={15} />
                    {completedTrips.length} رحلة مكتملة
                  </strong>
                </div>
              </div>
            </div>

            <div className="rider-profile-modal-stats">
              <div>
                <WalletCards size={22} />
                <span>إجمالي المصروف</span>
                <strong>{totalSpent} ج</strong>
              </div>

              <div>
                <History size={22} />
                <span>عدد الرحلات</span>
                <strong>{riderTrips.length}</strong>
              </div>

              <div>
                <Bell size={22} />
                <span>آخر طلب</span>
                <strong>{lastRequest ? lastRequest.status : "لا يوجد"}</strong>
              </div>
            </div>

            <div className="rider-profile-modal-footer">
              <Link
                to={riderDetailsPath}
                onClick={() => setShowProfileModal(false)}
              >
                <BarChart3 size={18} />
                فتح صفحة التفاصيل الكاملة
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default RiderDashboard;
