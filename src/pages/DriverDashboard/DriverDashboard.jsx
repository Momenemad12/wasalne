import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Bike,
  CarFront,
  CheckCircle2,
  Circle,
  CircleDollarSign,
  Clock3,
  Edit3,
  KeyRound,
  Lock,
  LogOut,
  MapPinned,
  MessageCircle,
  Phone,
  Route,
  Save,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRound,
  Volume2,
  VolumeX,
  WalletCards,
  XCircle,
  Gift,
  Crown,
  Wallet,
  CreditCard,
  Send,
} from "lucide-react";

import "./DriverDashboard.css";

const COMMISSION_PERCENTAGE = 15;
const STOP_REQUESTS_AT_COMMISSION = 100;
const NEGOTIATION_DURATION_SECONDS = 120;
const NEGOTIATION_MAX_PERCENT = 30;

const VODAFONE_CASH_NUMBER = "01021558237";
const INSTAPAY_ACCOUNT = "01022366630";

const createId = () => Date.now() + Math.floor(Math.random() * 10000);
const getNowTime = () => new Date().getTime();

const driverOffers = [
  {
    id: "driver_boost",
    title: "عرض السائق السريع",
    price: 10,
    oldPrice: 20,
    badge: "عرض اليوم",
    icon: <Gift size={28} />,
    features: [
      "ظهور أقوى في قائمة السائقين",
      "أولوية في استقبال بعض الطلبات",
      "تفعيل بعد مراجعة الإدارة",
    ],
  },
  {
    id: "driver_plus",
    title: "Wasalne Driver Plus",
    price: 30,
    oldPrice: 50,
    badge: "اشتراك مميز",
    icon: <Crown size={28} />,
    features: [
      "مميزات للسائق لمدة شهر",
      "أولوية أعلى في فرص الطلبات",
      "متابعة ودعم أسرع من الإدارة",
    ],
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
  password: "123456",
};

const initialRequests = [
  {
    id: 1,
    riderName: "أحمد سالم",
    riderPhone: "01000000000",
    from: "منوف - شارع الجلاء",
    to: "شبين الكوم - ميدان المحطة",
    distance: 12.4,
    eta: "25 دقيقة",
    price: 85,
    time: "الآن",
    vehicle: "توك توك",
    priority: "عاجل",
  },
  {
    id: 2,
    riderName: "محمد علي",
    riderPhone: "01011112222",
    from: "ميت خاقان",
    to: "شبين الكوم - المستشفى",
    distance: 7.8,
    eta: "16 دقيقة",
    price: 55,
    time: "منذ 3 دقائق",
    vehicle: "توك توك",
    priority: "عادي",
  },
  {
    id: 3,
    riderName: "سارة حسن",
    riderPhone: "01033334444",
    from: "كفر المصيلحة",
    to: "بخاتي",
    distance: 5.3,
    eta: "11 دقيقة",
    price: 40,
    time: "منذ 6 دقائق",
    vehicle: "موتوسيكل",
    priority: "سريع",
  },
];

const initialTrips = [
  {
    id: 1,
    rider: "وليد سمير",
    route: "شبين الكوم → قويسنا",
    amount: 220,
    status: "مكتملة",
  },
  {
    id: 2,
    rider: "نادية حسام",
    route: "بركة السبع → طنبشا",
    amount: 180,
    status: "مكتملة",
  },
  {
    id: 3,
    rider: "رامي أشرف",
    route: "منوف → منشأة سلطان",
    amount: 90,
    status: "قيد التنفيذ",
  },
];

const initialChats = [
  {
    id: 1,
    riderName: "أحمد سالم",
    phone: "01000000000",
    unread: 2,
    avatar: "أ",
    trip: "منوف → شبين الكوم",
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
];

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

function getRegisteredUsers() {
  const savedUsers = localStorage.getItem("wasalne_registered_users");

  if (!savedUsers) {
    return [];
  }

  try {
    const parsedUsers = JSON.parse(savedUsers);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch {
    return [];
  }
}

function updateStoredUser(updatedUser) {
  localStorage.setItem("wasalne_current_user", JSON.stringify(updatedUser));
  localStorage.setItem("wasalne_user_role", updatedUser.role || "driver");

  if (!updatedUser.email) {
    return;
  }

  const users = getRegisteredUsers();
  const updatedUsers = users.map((user) =>
    user.email === updatedUser.email ? { ...user, ...updatedUser } : user,
  );

  const exists = updatedUsers.some((user) => user.email === updatedUser.email);

  localStorage.setItem(
    "wasalne_registered_users",
    JSON.stringify(exists ? updatedUsers : [...updatedUsers, updatedUser]),
  );
}

function getStoredDriverPayments() {
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

function saveDriverOfferPayment(payment) {
  const payments = getStoredDriverPayments();
  const updatedPayments = [payment, ...payments];

  localStorage.setItem(
    "wasalne_driver_payments",
    JSON.stringify(updatedPayments),
  );

  return updatedPayments;
}

function getStoredRiderRequestsForDriver() {
  const savedRequests = localStorage.getItem("wasalne_rider_requests");

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

function saveRiderRequestsFromDriver(requests) {
  localStorage.setItem("wasalne_rider_requests", JSON.stringify(requests));
}

function normalizeRiderRequestForDriverDashboard(request) {
  return {
    id: request.id,
    riderName: request.riderName || "راكب",
    riderPhone: request.riderPhone || "01000000000",
    riderEmail: request.riderEmail || "",
    vehicle: request.vehicle || "توك توك",
    from: request.from || "موقع الراكب",
    to: request.to || "لم يتم تحديد الوجهة",
    pickupPosition: request.pickupPosition || null,
    destinationPosition: request.destinationPosition || null,
    price:
      request.finalPrice ||
      request.riderOfferPrice ||
      request.driverOfferPrice ||
      request.price ||
      request.systemPrice ||
      "--",
    systemPrice: request.systemPrice || request.price || "--",
    distance: request.distance || "--",
    eta: request.eta || "--",
    statusCode: request.statusCode || "pending",
    status: request.status || "قيد انتظار رد السائق",
    createdAt: request.createdAt || new Date().toLocaleString("ar-EG"),
    source: "rider",
  };
}

function getRequestsForDriverDashboard() {
  const riderRequests = getStoredRiderRequestsForDriver()
    .filter(
      (request) =>
        request.statusCode === "pending" ||
        request.statusCode === "driver_offer",
    )
    .map(normalizeRiderRequestForDriverDashboard);

  const mergedRequests = [...riderRequests, ...initialRequests];
  const uniqueRequests = [];

  mergedRequests.forEach((request) => {
    const exists = uniqueRequests.some(
      (item) => String(item.id) === String(request.id),
    );

    if (!exists) {
      uniqueRequests.push(request);
    }
  });

  return uniqueRequests;
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

function updateRiderRequestStatusFromDriver(requestId, updates) {
  const riderRequests = getStoredRiderRequestsForDriver();

  if (riderRequests.length === 0) {
    return;
  }

  const updatedRequests = riderRequests.map((request) =>
    String(request.id) === String(requestId)
      ? {
          ...request,
          ...updates,
          updatedAt: new Date().toLocaleString("ar-EG"),
        }
      : request,
  );

  saveRiderRequestsFromDriver(updatedRequests);
}

function updateRiderRequestWithDriverOffer(driverProfile, request, offeredPrice) {
  const riderRequests = getStoredRiderRequestsForDriver();

  if (riderRequests.length === 0) {
    return;
  }

  const updatedRequests = riderRequests.map((riderRequest) => {
    const sameId = String(riderRequest.id) === String(request.id);
    const sameRider =
      riderRequest.riderPhone &&
      request.riderPhone &&
      riderRequest.riderPhone === request.riderPhone;
    const sameDriver =
      !riderRequest.driverName ||
      !driverProfile.name ||
      riderRequest.driverName === driverProfile.name;

    if ((sameId || sameRider) && sameDriver) {
      return {
        ...riderRequest,
        statusCode: "driver_offer",
        status: "السائق اقترح سعر جديد",
        priceStatus: "driver_offer_pending",
        driverOfferPrice: offeredPrice,
        driverOfferOldPrice:
          riderRequest.finalPrice ||
          riderRequest.price ||
          riderRequest.systemPrice ||
          request.price,
        driverOfferExpiresAt:
          getNowTime() + NEGOTIATION_DURATION_SECONDS * 1000,
        driverOfferBy: driverProfile.name || "السائق",
        updatedAt: new Date().toLocaleString("ar-EG"),
      };
    }

    return riderRequest;
  });

  saveRiderRequestsFromDriver(updatedRequests);
}

function getVehicleIcon(vehicle) {
  if (vehicle === "موتوسيكل") {
    return <Bike size={18} />;
  }

  if (vehicle === "نصف نقل" || vehicle === "عربية نص نقل") {
    return <Truck size={18} />;
  }

  return <CarFront size={18} />;
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

function isAcceptedStatus(status) {
  return status === "تمت الموافقة" || status === "تم القبول";
}

function isRejectedStatus(status) {
  return status === "مرفوض" || status === "تم الرفض";
}

function getDriverReviewState(driver) {
  const requests = getStoredDriverRequests();
  const savedRequestId = localStorage.getItem("wasalne_driver_request_id");

  const matchedRequest =
    requests.find((request) => String(request.id) === String(savedRequestId)) ||
    requests.find((request) => request.phone && request.phone === driver.phone) ||
    requests.find((request) => request.name && request.name === driver.name) ||
    null;

  if (!matchedRequest) {
    return {
      request: null,
      status: "لم يتم إرسال البيانات",
      state: "missing",
      canWork: false,
      title: "كمل بياناتك الأول",
      message:
        "لازم ترفع بياناتك وصورك المطلوبة، وبعد موافقة الإدارة تقدر تستقبل طلبات.",
    };
  }

  if (isAcceptedStatus(matchedRequest.status)) {
    return {
      request: matchedRequest,
      status: matchedRequest.status,
      state: "accepted",
      canWork: true,
      title: "تم تفعيل حسابك",
      message: "حسابك مقبول، تقدر تشتغل وتستقبل طلبات.",
    };
  }

  if (isRejectedStatus(matchedRequest.status)) {
    return {
      request: matchedRequest,
      status: matchedRequest.status,
      state: "rejected",
      canWork: false,
      title: "طلبك مرفوض",
      message:
        matchedRequest.adminNote ||
        "طلبك اترفض من الإدارة. راجع بياناتك وارفعها مرة تانية.",
    };
  }

  return {
    request: matchedRequest,
    status: matchedRequest.status || "قيد المراجعة",
    state: "pending",
    canWork: false,
    title: "طلبك قيد المراجعة",
    message:
      "الإدارة بتراجع بياناتك ومستنداتك. لما يتم القبول هتقدر تستقبل طلبات.",
  };
}

function updateCurrentUserWithAcceptedRequest(driver, request) {
  if (!request) {
    return;
  }

  const updatedDriver = {
    ...driver,
    name: request.name || driver.name,
    phone: request.phone || driver.phone,
    center: request.center || driver.center,
    village: request.village || driver.village,
    vehicle: request.vehicle || driver.vehicle,
    plateNumber: request.plateNumber || driver.plateNumber,
    role: "driver",
    driverRequestId: request.id,
    driverRequestStatus: request.status,
    driverDocumentsCompleted: true,
    driverApproved: true,
  };

  localStorage.setItem("wasalne_current_user", JSON.stringify(updatedDriver));
  localStorage.setItem("wasalne_user_role", "driver");
  localStorage.setItem("wasalne_driver_request_id", String(request.id));
  localStorage.setItem("wasalne_driver_request_status", request.status);
}

function DriverDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminPreview =
    searchParams.get("preview") === "admin" ||
    localStorage.getItem("wasalne_admin_preview_driver") === "true";

  const [driverProfile, setDriverProfile] = useState(getCurrentUser);
  const [profileForm, setProfileForm] = useState(getCurrentUser);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState("view");

  const [customAlert, setCustomAlert] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const [negotiationModal, setNegotiationModal] = useState({
    open: false,
    request: null,
    price: "",
  });

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    request: null,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [notificationSoundEnabled, setNotificationSoundEnabled] =
    useState(true);
  const [requests, setRequests] = useState(getRequestsForDriverDashboard);
  const [negotiations, setNegotiations] = useState({});
  const [currentTime, setCurrentTime] = useState(getNowTime);
  const [activeTrip, setActiveTrip] = useState(null);
  const [tripStage, setTripStage] = useState("accepted");
  const [chats, setChats] = useState(initialChats);
  const [commissionPayments, setCommissionPayments] =
    useState(getStoredDriverPayments);

  const [driverOffersModalOpen, setDriverOffersModalOpen] = useState(false);
  const [selectedDriverOffer, setSelectedDriverOffer] =
    useState("driver_boost");
  const [driverOfferPaymentMethod, setDriverOfferPaymentMethod] =
    useState("vodafone");
  const [driverOfferTransaction, setDriverOfferTransaction] = useState("");

  const driverReview = useMemo(
    () => getDriverReviewState(driverProfile),
    [driverProfile],
  );

  const isDriverApproved = driverReview.canWork || isAdminPreview;
  const realDriverApprovalStatus = driverReview.canWork;

  useEffect(() => {
    if (realDriverApprovalStatus && driverReview.request) {
      updateCurrentUserWithAcceptedRequest(driverProfile, driverReview.request);
    }
  }, [realDriverApprovalStatus, driverReview.request, driverProfile]);

  const completedTrips = initialTrips.filter(
    (trip) => trip.status === "مكتملة",
  );

  const totalEarnings = completedTrips.reduce(
    (acc, trip) => acc + Number(trip.amount || 0),
    0,
  );

  const commissionValue = Math.round(
    (totalEarnings * COMMISSION_PERCENTAGE) / 100,
  );

  const paidCommissionTotal = commissionPayments
    .filter((payment) => payment.status === "تم القبول")
    .reduce((acc, payment) => acc + Number(payment.amount || 0), 0);

  const dueCommission = Math.max(commissionValue - paidCommissionTotal, 0);
  const isDriverBlocked = dueCommission >= STOP_REQUESTS_AT_COMMISSION;
  const canReceiveRequests =
    (isDriverApproved || isAdminPreview) && !isDriverBlocked;
  const displayedOnlineStatus = isOnline && canReceiveRequests;
  const pendingRequestsCount = displayedOnlineStatus ? requests.length : 0;

  const selectedDriverOfferData =
    driverOffers.find((offer) => offer.id === selectedDriverOffer) ||
    driverOffers[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getNowTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncDriverRequestsFromRiderStorage = () => {
      if (activeTrip) {
        return;
      }

      setRequests(getRequestsForDriverDashboard());
    };

    syncDriverRequestsFromRiderStorage();

    const interval = window.setInterval(syncDriverRequestsFromRiderStorage, 1500);

    return () => window.clearInterval(interval);
  }, [activeTrip]);

  const totalUnread = useMemo(() => {
    return chats.reduce((acc, chat) => acc + Number(chat.unread || 0), 0);
  }, [chats]);

  const activeChat = chats.length > 0 ? chats[0] : null;
  const lastMessage =
    activeChat && activeChat.messages && activeChat.messages.length > 0
      ? activeChat.messages[activeChat.messages.length - 1].text
      : "لا توجد رسائل بعد";

  const getNegotiationStatus = (requestId) => {
    const negotiation = negotiations[requestId];

    if (!negotiation) {
      return null;
    }

    const remainingMs = negotiation.expiresAt - currentTime;

    if (remainingMs <= 0 && negotiation.status === "pending") {
      return {
        ...negotiation,
        status: "expired",
        remainingSeconds: 0,
      };
    }

    return {
      ...negotiation,
      remainingSeconds: Math.max(Math.ceil(remainingMs / 1000), 0),
    };
  };

  const formatNegotiationTime = (seconds) => {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const restSeconds = String(safeSeconds % 60).padStart(2, "0");

    return `${minutes}:${restSeconds}`;
  };

  const getRequestBasePrice = (request) => {
    return extractPriceNumber(request?.price || request?.systemPrice || 0);
  };

  const getMaxNegotiationPrice = (request) => {
    const basePrice = getRequestBasePrice(request);

    if (!basePrice) {
      return 0;
    }

    return Math.ceil(basePrice * (1 + NEGOTIATION_MAX_PERCENT / 100));
  };

  const showCustomAlert = ({ type = "success", title, message }) => {
    setCustomAlert({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeCustomAlert = () => {
    setCustomAlert((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const openDriverOffersModal = () => {
    setDriverOffersModalOpen(true);
  };

  const closeDriverOffersModal = () => {
    setDriverOffersModalOpen(false);
    setSelectedDriverOffer("driver_boost");
    setDriverOfferPaymentMethod("vodafone");
    setDriverOfferTransaction("");
  };

  const submitDriverOfferSubscription = () => {
    if (!driverOfferTransaction.trim()) {
      showCustomAlert({
        type: "error",
        title: "رقم العملية مطلوب",
        message: "بعد التحويل اكتب رقم العملية أو رقم الهاتف المحول منه.",
      });
      return;
    }

    const newPayment = {
      id: Date.now() + Math.floor(Math.random() * 10000),

      paymentType: "driver_offer_subscription",
      paymentTitle: "عروض وصلني للسائق",
      offerId: selectedDriverOfferData.id,
      offerTitle: selectedDriverOfferData.title,

      driverName: driverProfile.name || "سائق",
      driverPhone: driverProfile.phone || "غير محدد",
      driverEmail: driverProfile.email || "غير محدد",
      driverRole: driverProfile.role || "driver",

      method:
        driverOfferPaymentMethod === "vodafone" ? "فودافون كاش" : "إنستاباي",
      amount: selectedDriverOfferData.price,
      oldAmount: selectedDriverOfferData.oldPrice,
      transactionNumber: driverOfferTransaction.trim(),
      paymentNumber:
        driverOfferPaymentMethod === "vodafone"
          ? VODAFONE_CASH_NUMBER
          : INSTAPAY_ACCOUNT,

      proofImage: "تم إدخال رقم العملية فقط",
      status: "قيد المراجعة",
      date: new Date().toLocaleString("ar-EG"),
      adminNote: "",
    };

    const updatedPayments = saveDriverOfferPayment(newPayment);
    setCommissionPayments(updatedPayments);

    closeDriverOffersModal();

    showCustomAlert({
      type: "success",
      title: "تم إرسال طلب العرض للأدمن",
      message:
        "طلب عروض وصلني اتبعت لصفحة المدفوعات عند الأدمن، وبعد القبول هيتفعل العرض.",
    });
  };

  const openProfileModal = (tab = "view") => {
    setProfileForm(driverProfile);
    setProfileModalTab(tab);
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setProfileModalTab("view");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getDirectionsUrl = (request) => {
    const from = encodeURIComponent(request.from);
    const to = encodeURIComponent(request.to);

    return `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}`;
  };

  const saveProfile = () => {
    if (!profileForm.name || !profileForm.name.trim()) {
      showCustomAlert({
        type: "error",
        title: "بيانات ناقصة",
        message: "من فضلك اكتب اسم السائق.",
      });
      return;
    }

    if (!profileForm.phone || !profileForm.phone.trim()) {
      showCustomAlert({
        type: "error",
        title: "بيانات ناقصة",
        message: "من فضلك اكتب رقم الهاتف.",
      });
      return;
    }

    const updatedProfile = {
      ...driverProfile,
      ...profileForm,
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      center: profileForm.center ? profileForm.center.trim() : "غير محدد",
      village: profileForm.village ? profileForm.village.trim() : "غير محدد",
      vehicle: profileForm.vehicle ? profileForm.vehicle.trim() : "توك توك",
      role: "driver",
      updatedAt: new Date().toLocaleString("ar-EG"),
    };

    setDriverProfile(updatedProfile);
    setProfileForm(updatedProfile);
    updateStoredUser(updatedProfile);
    setProfileModalTab("view");

    showCustomAlert({
      type: "success",
      title: "تم حفظ البيانات",
      message: "تم تحديث بيانات حسابك بنجاح.",
    });
  };

  const changePassword = () => {
    if (!passwordForm.currentPassword.trim()) {
      showCustomAlert({
        type: "error",
        title: "كلمة المرور الحالية مطلوبة",
        message: "اكتب كلمة المرور الحالية أولًا.",
      });
      return;
    }

    if (
      driverProfile.password &&
      passwordForm.currentPassword !== driverProfile.password
    ) {
      showCustomAlert({
        type: "error",
        title: "كلمة المرور غير صحيحة",
        message: "كلمة المرور الحالية التي أدخلتها غير صحيحة.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showCustomAlert({
        type: "error",
        title: "كلمة المرور ضعيفة",
        message: "كلمة المرور الجديدة لازم تكون 6 أحرف على الأقل.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showCustomAlert({
        type: "error",
        title: "كلمة المرور غير متطابقة",
        message: "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
      });
      return;
    }

    const updatedProfile = {
      ...driverProfile,
      password: passwordForm.newPassword,
      passwordUpdatedAt: new Date().toLocaleString("ar-EG"),
    };

    setDriverProfile(updatedProfile);
    setProfileForm(updatedProfile);
    updateStoredUser(updatedProfile);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setProfileModalTab("view");

    showCustomAlert({
      type: "success",
      title: "تم تغيير كلمة المرور",
      message: "تم تغيير كلمة المرور بنجاح.",
    });
  };

  const handleOnlineToggle = () => {
    if (!isDriverApproved && !isAdminPreview) {
      showCustomAlert({
        type: "error",
        title: "حسابك غير مفعل",
        message: "لازم تبعت بياناتك ويتم قبولك من الإدارة قبل استقبال الطلبات.",
      });
      return;
    }

    if (isDriverBlocked) {
      showCustomAlert({
        type: "error",
        title: "استقبال الطلبات متوقف",
        message:
          "لازم تدخل صفحة التفاصيل وتدفع العمولة المستحقة لتشغيل الطلبات.",
      });
      return;
    }

    setIsOnline((prev) => !prev);
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

  const returnToAdminDashboard = () => {
    localStorage.removeItem("wasalne_admin_preview_driver");
    navigate("/admin-dashboard");
  };

  const getTripStageLabel = () => {
    if (tripStage === "started") {
      return "في الطريق للراكب";
    }

    if (tripStage === "arrived") {
      return "وصلت للراكب";
    }

    return "تم قبول المشوار";
  };

  const updateTripStage = (stage) => {
    setTripStage(stage);

    if (stage === "started") {
      showCustomAlert({
        type: "success",
        title: "تم تحديث الحالة",
        message: "تم تسجيل أنك بدأت الطريق للراكب.",
      });
    }

    if (stage === "arrived") {
      showCustomAlert({
        type: "success",
        title: "تم تحديث الحالة",
        message: "تم تسجيل أنك وصلت للراكب.",
      });
    }
  };

  const finishActiveTrip = () => {
    setActiveTrip(null);
    setTripStage("accepted");

    showCustomAlert({
      type: "success",
      title: "تم إنهاء المشوار",
      message: "تم إنهاء المشوار بنجاح، تقدر تستقبل طلبات جديدة الآن.",
    });
  };

  const openConfirmModal = (type, request) => {
    if (!isDriverApproved && !isAdminPreview) {
      showCustomAlert({
        type: "error",
        title: "غير مسموح",
        message: "لا يمكنك قبول أو رفض مشاوير قبل موافقة الإدارة على بياناتك.",
      });
      return;
    }

    if (!displayedOnlineStatus) {
      showCustomAlert({
        type: "error",
        title: "أنت غير متاح",
        message: "شغل استقبال الطلبات الأول عشان تقدر تقبل أو ترفض المشاوير.",
      });
      return;
    }

    setConfirmModal({
      open: true,
      type,
      request,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      type: "",
      request: null,
    });
  };

  const confirmRequestAction = () => {
    if (!confirmModal.request) {
      return;
    }

    if (confirmModal.type === "accept") {
      acceptRequest(confirmModal.request.id);
    }

    if (confirmModal.type === "reject") {
      rejectRequest(confirmModal.request.id);
    }

    closeConfirmModal();
  };

  const acceptRequest = (requestId) => {
    if (!displayedOnlineStatus) {
      showCustomAlert({
        type: "error",
        title: "استقبال الطلبات مقفول",
        message:
          "لا يمكنك قبول مشوار وأنت غير متاح. شغل استقبال الطلبات أولًا.",
      });
      return;
    }

    if (isDriverBlocked) {
      showCustomAlert({
        type: "error",
        title: "لا يمكنك قبول مشاوير",
        message: "ادفع العمولة المستحقة الأول من صفحة التفاصيل.",
      });
      return;
    }

    const request = requests.find((item) => item.id === requestId);

    if (!request) {
      return;
    }

    updateRiderRequestStatusFromDriver(requestId, {
      statusCode: "accepted",
      status: "تم قبول المشوار من السائق",
      priceStatus: "accepted_by_driver",
      finalPrice:
        request.riderOfferPrice || request.price || request.systemPrice,
    });

    setActiveTrip(request);
    setTripStage("accepted");
    setNegotiations((prev) => {
      const updated = { ...prev };
      delete updated[requestId];
      return updated;
    });
    setRequests((prev) => prev.filter((item) => item.id !== requestId));

    const newChat = {
      id: createId(),
      riderName: request.riderName,
      phone: request.riderPhone || "01000000000",
      unread: 0,
      avatar: request.riderName.charAt(0),
      trip: `${request.from} → ${request.to}`,
      messages: [
        {
          id: createId(),
          sender: "driver",
          text: `تم قبول المشوار، أنا في الطريق إليك. مدة المشوار تقريبًا ${request.eta}.`,
          time: "الآن",
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);

    showCustomAlert({
      type: "success",
      title: "تم قبول المشوار",
      message: `تم قبول مشوار ${request.riderName}. مدة المشوار تقريبًا ${request.eta}.`,
    });
  };

  const rejectRequest = (requestId) => {
    if (!displayedOnlineStatus) {
      showCustomAlert({
        type: "error",
        title: "استقبال الطلبات مقفول",
        message: "لا يمكنك رفض أو التعامل مع مشوار وأنت غير متاح.",
      });
      return;
    }

    setNegotiations((prev) => {
      const updated = { ...prev };
      delete updated[requestId];
      return updated;
    });
    setRequests((prev) => prev.filter((item) => item.id !== requestId));

    showCustomAlert({
      type: "success",
      title: "تم رفض الطلب",
      message: "تم حذف الطلب من القائمة.",
    });
  };

  const negotiateRequest = (requestId) => {
    if (!isDriverApproved && !isAdminPreview) {
      showCustomAlert({
        type: "error",
        title: "التفاوض غير متاح",
        message: "لا يمكنك التفاوض قبل إرسال بياناتك وموافقة الإدارة.",
      });
      return;
    }

    if (!displayedOnlineStatus) {
      showCustomAlert({
        type: "error",
        title: "أنت غير متاح",
        message: "شغل استقبال الطلبات الأول عشان تقدر تعمل سعر آخر.",
      });
      return;
    }

    if (isDriverBlocked) {
      showCustomAlert({
        type: "error",
        title: "التفاوض متوقف",
        message: "ادفع العمولة المستحقة الأول من صفحة التفاصيل.",
      });
      return;
    }

    const request = requests.find((item) => item.id === requestId);

    if (!request) {
      return;
    }

    const currentNegotiation = getNegotiationStatus(requestId);

    if (currentNegotiation?.status === "pending") {
      showCustomAlert({
        type: "error",
        title: "فيه تفاوض شغال",
        message: "استنى رد الراكب أو انتهاء الدقيقتين قبل إرسال سعر جديد.",
      });
      return;
    }

    setNegotiationModal({
      open: true,
      request,
      price: String(request.price),
    });
  };

  const closeNegotiationModal = () => {
    setNegotiationModal({
      open: false,
      request: null,
      price: "",
    });
  };

  const confirmNegotiation = () => {
    const parsedPrice = Number(negotiationModal.price);

    if (!negotiationModal.request) {
      return;
    }

    const basePrice = getRequestBasePrice(negotiationModal.request);
    const maxPrice = getMaxNegotiationPrice(negotiationModal.request);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      showCustomAlert({
        type: "error",
        title: "سعر غير صحيح",
        message: "اكتب سعر صحيح أكبر من صفر.",
      });
      return;
    }

    if (parsedPrice <= basePrice) {
      showCustomAlert({
        type: "error",
        title: "السعر لازم يكون أعلى",
        message: `التفاوض هنا لزيادة السعر فقط. السعر الحالي ${basePrice} ج، اكتب سعر أعلى منه.`,
      });
      return;
    }

    if (parsedPrice > maxPrice) {
      showCustomAlert({
        type: "error",
        title: "السعر عالي جدًا",
        message: `أقصى سعر للتفاوض في المشوار ده هو ${maxPrice} ج. خلي السعر في المعقول.`,
      });
      return;
    }

    setNegotiations((prev) => ({
      ...prev,
      [negotiationModal.request.id]: {
        status: "pending",
        offeredPrice: parsedPrice,
        oldPrice: basePrice,
        expiresAt: getNowTime() + NEGOTIATION_DURATION_SECONDS * 1000,
      },
    }));

    updateRiderRequestWithDriverOffer(
      driverProfile,
      negotiationModal.request,
      parsedPrice,
    );

    showCustomAlert({
      type: "success",
      title: "تم إرسال التفاوض للراكب",
      message: `تم إرسال سعر ${parsedPrice} ج للراكب. أمام الراكب دقيقتين للقبول أو الرفض.`,
    });

    closeNegotiationModal();
  };

  if (!isDriverApproved) {
    return (
      <section className="driver-dashboard driver-dashboard-simple" dir="rtl">
        <div className="future-grid-bg"></div>
        <div className="driver-dashboard__orb driver-dashboard__orb--one"></div>
        <div className="driver-dashboard__orb driver-dashboard__orb--two"></div>

        {customAlert.open && (
          <div className="future-alert-overlay">
            <div className={`future-alert-card ${customAlert.type}`}>
              <button
                type="button"
                className="future-alert-close"
                onClick={closeCustomAlert}
              >
                <XCircle size={22} />
              </button>

              <div className="future-alert-icon">
                {customAlert.type === "success" ? (
                  <CheckCircle2 size={36} />
                ) : (
                  <AlertTriangle size={36} />
                )}
              </div>

              <span className="future-alert-label">Wasalne</span>
              <h3>{customAlert.title}</h3>
              <p>{customAlert.message}</p>

              <button
                type="button"
                className="future-alert-action"
                onClick={closeCustomAlert}
              >
                تمام
              </button>
            </div>
          </div>
        )}

        <div className="driver-dashboard__container">
          <header className="driver-topbar simple-driver-topbar">
            <div className="driver-brand">
              <div className="driver-brand__icon">
                <CarFront size={28} />
              </div>

              <div>
                <span className="driver-brand__eyebrow">وصلني للسائق</span>
                <h1>لوحة السائق</h1>
                <p>التشغيل متاح فقط بعد رفع البيانات وموافقة الإدارة.</p>
              </div>
            </div>

            <div className="driver-topbar__actions simple-driver-actions">
              {isAdminPreview && (
                <button
                  type="button"
                  className="admin-preview-return-btn"
                  onClick={returnToAdminDashboard}
                >
                  <BarChart3 size={18} />
                  رجوع للأدمن
                </button>
              )}

              <button
                type="button"
                className="driver-top-details-btn"
                onClick={() => navigate("/driver-register")}
              >
                <UserRound size={18} />
                {driverReview.state === "missing"
                  ? "إرسال البيانات"
                  : "تعديل البيانات"}
              </button>

              <button
                type="button"
                className="driver-logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={17} />
                خروج
              </button>
            </div>
          </header>

          {isAdminPreview && (
            <div className="admin-preview-driver-banner">
              <ShieldCheck size={22} />
              <div>
                <strong>أنت تشاهد صفحة السائق كأدمن</strong>
                <p>
                  هذه معاينة فقط من لوحة الإدارة، ويمكنك الرجوع للأدمن من الزر
                  بالأعلى.
                </p>
              </div>
            </div>
          )}

          <section className={`driver-approval-gate ${driverReview.state}`}>
            <div className="approval-gate-icon">
              {driverReview.state === "pending" ? (
                <Clock3 size={48} />
              ) : driverReview.state === "rejected" ? (
                <XCircle size={48} />
              ) : (
                <AlertTriangle size={48} />
              )}
            </div>

            <span className="approval-gate-label">حالة حساب السائق</span>
            <h2>{driverReview.title}</h2>
            <p>{driverReview.message}</p>

            <div className="approval-status-card">
              <div>
                <span>حالة الطلب</span>
                <strong>{driverReview.status}</strong>
              </div>

              <div>
                <span>اسم السائق</span>
                <strong>
                  {driverReview.request?.name ||
                    driverProfile.name ||
                    "غير محدد"}
                </strong>
              </div>

              <div>
                <span>رقم الهاتف</span>
                <strong>
                  {driverReview.request?.phone ||
                    driverProfile.phone ||
                    "غير محدد"}
                </strong>
              </div>

              <div>
                <span>المركبة</span>
                <strong>
                  {driverReview.request?.vehicle ||
                    driverProfile.vehicle ||
                    "غير محدد"}
                </strong>
              </div>
            </div>

            <div className="approval-actions approval-actions-single">
              {driverReview.state === "pending" ? (
                <button
                  type="button"
                  className="approval-main-btn"
                  onClick={() => window.location.reload()}
                >
                  <Clock3 size={18} />
                  تحديث حالة الطلب
                </button>
              ) : (
                <button
                  type="button"
                  className="approval-main-btn"
                  onClick={() => navigate("/driver-register")}
                >
                  <UserRound size={18} />
                  {driverReview.state === "rejected"
                    ? "تعديل وإعادة إرسال البيانات"
                    : "إرسال بيانات السائق"}
                </button>
              )}
            </div>

            <div className="approval-rules">
              <h3>ليه الحساب متوقف؟</h3>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  لازم ترفع صورة شخصية، بطاقة، سيلفي مع البطاقة، وصورة المركبة.
                </span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>الإدارة لازم توافق على طلبك قبل ظهورك للركاب.</span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  بعد الموافقة فقط تقدر تبقى متاح، تقبل مشاوير، أو تعمل تفاوض.
                </span>
              </div>
            </div>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="driver-dashboard driver-dashboard-simple" dir="rtl">
      <div className="future-grid-bg"></div>
      <div className="driver-dashboard__orb driver-dashboard__orb--one"></div>
      <div className="driver-dashboard__orb driver-dashboard__orb--two"></div>

      {customAlert.open && (
        <div className="future-alert-overlay">
          <div className={`future-alert-card ${customAlert.type}`}>
            <button
              type="button"
              className="future-alert-close"
              onClick={closeCustomAlert}
            >
              <XCircle size={22} />
            </button>

            <div className="future-alert-icon">
              {customAlert.type === "success" ? (
                <CheckCircle2 size={36} />
              ) : (
                <AlertTriangle size={36} />
              )}
            </div>

            <span className="future-alert-label">Wasalne</span>
            <h3>{customAlert.title}</h3>
            <p>{customAlert.message}</p>

            <button
              type="button"
              className="future-alert-action"
              onClick={closeCustomAlert}
            >
              تمام
            </button>
          </div>
        </div>
      )}

      {driverOffersModalOpen && (
        <div className="driver-offers-overlay">
          <div className="driver-offers-modal">
            <button
              type="button"
              className="driver-offers-close"
              onClick={closeDriverOffersModal}
            >
              <XCircle size={22} />
            </button>

            <div className="driver-offers-head">
              <div className="driver-offers-icon">
                <Sparkles size={36} />
              </div>

              <span>عروض وصلني</span>
              <h3>اختار عرض السائق المناسب</h3>
              <p>
                اختار العرض، حوّل المبلغ، واكتب رقم العملية. الطلب هيتبعت
                للأدمن للمراجعة والتفعيل.
              </p>
            </div>

            <div className="driver-offers-grid">
              {driverOffers.map((offer) => (
                <button
                  type="button"
                  key={offer.id}
                  className={`driver-offer-card ${
                    selectedDriverOffer === offer.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedDriverOffer(offer.id)}
                >
                  <div className="driver-offer-card-top">
                    <div className="driver-offer-card-icon">{offer.icon}</div>
                    <span>{offer.badge}</span>
                  </div>

                  <h4>{offer.title}</h4>

                  <div className="driver-offer-price">
                    <strong>{offer.price} ج</strong>
                    <del>{offer.oldPrice} ج</del>
                  </div>

                  <ul>
                    {offer.features.map((feature) => (
                      <li key={feature}>
                        <CheckCircle2 size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="driver-offer-payment-box">
              <h4>طريقة الدفع</h4>

              <div className="driver-offer-payment-methods">
                <button
                  type="button"
                  className={
                    driverOfferPaymentMethod === "vodafone" ? "active" : ""
                  }
                  onClick={() => setDriverOfferPaymentMethod("vodafone")}
                >
                  <Wallet size={21} />
                  فودافون كاش
                </button>

                <button
                  type="button"
                  className={
                    driverOfferPaymentMethod === "instapay" ? "active" : ""
                  }
                  onClick={() => setDriverOfferPaymentMethod("instapay")}
                >
                  <CreditCard size={21} />
                  InstaPay
                </button>
              </div>

              <div className="driver-offer-transfer-card">
                <span>حوّل مبلغ</span>
                <strong>{selectedDriverOfferData.price} جنيه</strong>
                <p>
                  {driverOfferPaymentMethod === "vodafone"
                    ? `على رقم فودافون كاش: ${VODAFONE_CASH_NUMBER}`
                    : `على رقم InstaPay: ${INSTAPAY_ACCOUNT}`}
                </p>
              </div>

              <label className="driver-offer-input-label">
                <span>رقم العملية أو رقم الهاتف المحول منه</span>
                <input
                  type="text"
                  value={driverOfferTransaction}
                  onChange={(event) =>
                    setDriverOfferTransaction(event.target.value)
                  }
                  placeholder="مثال: VF-20491 أو 010xxxxxxxx"
                />
              </label>
            </div>

            <div className="driver-offers-actions">
              <button
                type="button"
                className="driver-offer-submit"
                onClick={submitDriverOfferSubscription}
              >
                <Send size={18} />
                إرسال للأدمن
              </button>

              <button
                type="button"
                className="driver-offer-cancel"
                onClick={closeDriverOffersModal}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {negotiationModal.open && negotiationModal.request && (
        <div className="negotiation-modal-overlay">
          <div className="negotiation-modal-card">
            <button
              type="button"
              className="negotiation-close"
              onClick={closeNegotiationModal}
            >
              <XCircle size={22} />
            </button>

            <div className="negotiation-icon">
              <BadgeDollarSign size={38} />
            </div>

            <span className="negotiation-label">تفاوض على السعر</span>
            <h3>اكتب السعر المناسب للمشوار</h3>

            <p className="negotiation-limit-note">
              السعر الحالي {getRequestBasePrice(negotiationModal.request)} ج —
              التفاوض للزيادة فقط — أقصى سعر{" "}
              {getMaxNegotiationPrice(negotiationModal.request)} ج
            </p>

            <div className="negotiation-trip-summary">
              <div>
                <span>الراكب</span>
                <strong>{negotiationModal.request.riderName}</strong>
              </div>

              <div>
                <span>المسافة</span>
                <strong>{negotiationModal.request.distance} كم</strong>
              </div>

              <div>
                <span>وقت المشوار</span>
                <strong>{negotiationModal.request.eta}</strong>
              </div>
            </div>

            <label className="negotiation-price-input">
              <span>السعر الجديد بالجنيه</span>
              <input
                type="number"
                min={getRequestBasePrice(negotiationModal.request) + 1}
                max={getMaxNegotiationPrice(negotiationModal.request)}
                value={negotiationModal.price}
                onChange={(e) =>
                  setNegotiationModal((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
              />
            </label>

            <div className="negotiation-actions">
              <button
                type="button"
                className="negotiation-confirm"
                onClick={confirmNegotiation}
              >
                <CheckCircle2 size={20} />
                إرسال السعر
              </button>

              <button
                type="button"
                className="negotiation-cancel"
                onClick={closeNegotiationModal}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.open && confirmModal.request && (
        <div className="confirm-trip-overlay">
          <div
            className={`confirm-trip-card ${
              confirmModal.type === "accept" ? "accept" : "reject"
            }`}
          >
            <button
              type="button"
              className="confirm-trip-close"
              onClick={closeConfirmModal}
            >
              <XCircle size={22} />
            </button>

            <div className="confirm-trip-icon">
              {confirmModal.type === "accept" ? (
                <CheckCircle2 size={40} />
              ) : (
                <XCircle size={40} />
              )}
            </div>

            <span className="confirm-trip-label">
              {confirmModal.type === "accept" ? "تأكيد القبول" : "تأكيد الرفض"}
            </span>

            <h3>
              {confirmModal.type === "accept"
                ? "هل تريد قبول المشوار؟"
                : "هل تريد رفض الطلب؟"}
            </h3>

            <div className="confirm-trip-summary">
              <div>
                <span>الراكب</span>
                <strong>{confirmModal.request.riderName}</strong>
              </div>

              <div>
                <span>السعر</span>
                <strong>{confirmModal.request.price} ج</strong>
              </div>

              <div>
                <span>وقت المشوار</span>
                <strong>{confirmModal.request.eta}</strong>
              </div>

              <div>
                <span>المسافة</span>
                <strong>{confirmModal.request.distance} كم</strong>
              </div>
            </div>

            <div className="confirm-trip-route">
              <div>
                <MapPinned size={18} />
                <span>من</span>
                <strong>{confirmModal.request.from}</strong>
              </div>

              <div>
                <Route size={18} />
                <span>إلى</span>
                <strong>{confirmModal.request.to}</strong>
              </div>
            </div>

            <div className="confirm-trip-actions">
              <button
                type="button"
                className={
                  confirmModal.type === "accept"
                    ? "confirm-final-btn accept"
                    : "confirm-final-btn reject"
                }
                onClick={confirmRequestAction}
              >
                {confirmModal.type === "accept" ? (
                  <>
                    <CheckCircle2 size={21} />
                    تأكيد القبول
                  </>
                ) : (
                  <>
                    <XCircle size={21} />
                    رفض الطلب
                  </>
                )}
              </button>

              <button
                type="button"
                className="confirm-back-btn"
                onClick={closeConfirmModal}
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}

      {profileModalOpen && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-card simple-profile-modal">
            <button
              type="button"
              className="profile-modal-close"
              onClick={closeProfileModal}
            >
              <XCircle size={24} />
            </button>

            <div className="profile-modal-header">
              <div className="profile-modal-avatar">
                {driverProfile.name ? driverProfile.name.charAt(0) : "س"}
              </div>

              <div>
                <span>حساب السائق</span>
                <h2>بيانات حسابك</h2>
                <p>تقدر تعرض بياناتك، تعدلها، أو تغير كلمة المرور.</p>
              </div>
            </div>

            <div className="profile-modal-tabs">
              <button
                type="button"
                className={profileModalTab === "view" ? "active" : ""}
                onClick={() => setProfileModalTab("view")}
              >
                <UserRound size={18} />
                بياناتي
              </button>

              <button
                type="button"
                className={profileModalTab === "edit" ? "active" : ""}
                onClick={() => setProfileModalTab("edit")}
              >
                <Edit3 size={18} />
                تعديل
              </button>

              <button
                type="button"
                className={profileModalTab === "security" ? "active" : ""}
                onClick={() => setProfileModalTab("security")}
              >
                <KeyRound size={18} />
                الأمان
              </button>
            </div>

            {profileModalTab === "view" && (
              <div className="profile-modal-content">
                <div className="profile-info-grid">
                  <div>
                    <UserRound size={20} />
                    <span>الاسم</span>
                    <strong>{driverProfile.name}</strong>
                  </div>

                  <div>
                    <Phone size={20} />
                    <span>الهاتف</span>
                    <strong>{driverProfile.phone}</strong>
                  </div>

                  <div>
                    <MapPinned size={20} />
                    <span>المكان</span>
                    <strong>
                      {driverProfile.center || "غير محدد"} -{" "}
                      {driverProfile.village || "غير محدد"}
                    </strong>
                  </div>

                  <div>
                    <CarFront size={20} />
                    <span>المركبة</span>
                    <strong>{driverProfile.vehicle || "غير محدد"}</strong>
                  </div>
                </div>

                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="profile-modal-main-btn"
                    onClick={() => setProfileModalTab("edit")}
                  >
                    <Edit3 size={18} />
                    تعديل البيانات
                  </button>

                  <button
                    type="button"
                    className="profile-modal-secondary-btn"
                    onClick={() => setProfileModalTab("security")}
                  >
                    <Lock size={18} />
                    تغيير كلمة المرور
                  </button>
                </div>
              </div>
            )}

            {profileModalTab === "edit" && (
              <div className="profile-modal-form">
                <label>
                  <span>اسم السائق</span>
                  <input
                    type="text"
                    value={profileForm.name || ""}
                    onChange={(e) =>
                      handleProfileChange("name", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>رقم الهاتف</span>
                  <input
                    type="tel"
                    value={profileForm.phone || ""}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>المركز</span>
                  <input
                    type="text"
                    value={profileForm.center || ""}
                    onChange={(e) =>
                      handleProfileChange("center", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>القرية</span>
                  <input
                    type="text"
                    value={profileForm.village || ""}
                    onChange={(e) =>
                      handleProfileChange("village", e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>نوع المركبة</span>
                  <input
                    type="text"
                    value={profileForm.vehicle || ""}
                    onChange={(e) =>
                      handleProfileChange("vehicle", e.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="profile-modal-main-btn full"
                  onClick={saveProfile}
                >
                  <Save size={18} />
                  حفظ التعديلات
                </button>
              </div>
            )}

            {profileModalTab === "security" && (
              <div className="profile-modal-form">
                <label>
                  <span>كلمة المرور الحالية</span>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>كلمة المرور الجديدة</span>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  <span>تأكيد كلمة المرور</span>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </label>

                <button
                  type="button"
                  className="profile-modal-main-btn full dark"
                  onClick={changePassword}
                >
                  <Lock size={18} />
                  تغيير كلمة المرور
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="driver-dashboard__container">
        <header className="driver-topbar simple-driver-topbar">
          <div className="driver-brand">
            <div className="driver-brand__icon">
              <CarFront size={28} />
            </div>

            <div>
              <span className="driver-brand__eyebrow">وصلني للسائق</span>
              <h1>الرئيسية</h1>
              <p>طلباتك هنا. قبول، رفض، سعر آخر، وطريق المشوار بضغطة واحدة.</p>
            </div>
          </div>

          <div className="driver-topbar__actions simple-driver-actions">
            {isAdminPreview && (
              <button
                type="button"
                className="admin-preview-return-btn"
                onClick={returnToAdminDashboard}
              >
                <BarChart3 size={18} />
                رجوع للأدمن
              </button>
            )}

            <button
              type="button"
              className={`driver-status-btn ${
                displayedOnlineStatus ? "online" : "offline"
              }`}
              onClick={handleOnlineToggle}
            >
              <Circle size={12} fill="currentColor" />
              {isDriverBlocked
                ? "متوقف للدفع"
                : displayedOnlineStatus
                  ? "متاح"
                  : "غير متاح"}
            </button>

            <button
              type="button"
              className="driver-top-details-btn"
              onClick={() => navigate("/driver-dashboard-details")}
            >
              <BarChart3 size={18} />
              كل التفاصيل
            </button>

            <button
              type="button"
              className="driver-profile-chip"
              onClick={() => openProfileModal("view")}
            >
              <div className="driver-profile-chip__avatar">
                {driverProfile.name ? driverProfile.name.charAt(0) : "س"}
              </div>

              <div>
                <strong>{driverProfile.name}</strong>
                <span>{driverProfile.vehicle || "سائق"}</span>
              </div>
            </button>

            <button
              type="button"
              className="driver-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              خروج
            </button>
          </div>
        </header>

        {isAdminPreview && (
          <div className="admin-preview-driver-banner">
            <ShieldCheck size={22} />
            <div>
              <strong>أنت تشاهد صفحة السائق كأدمن</strong>
              <p>
                هذه معاينة فقط من لوحة الإدارة، ويمكنك الرجوع للأدمن من الزر
                بالأعلى.
              </p>
            </div>
          </div>
        )}

        {isDriverBlocked && (
          <div className="driver-commission-alert danger">
            <XCircle size={22} />

            <div>
              <strong>استقبال الطلبات متوقف</strong>
              <p>
                العمولة الحالية {dueCommission} ج. ادخل صفحة التفاصيل عشان تدفع
                العمولة وتتابع حالة الدفع.
              </p>
            </div>

            <button
              type="button"
              className="simple-details-btn"
              onClick={() => navigate("/driver-dashboard-details")}
            >
              فتح التفاصيل
            </button>
          </div>
        )}

        <section className="simple-driver-hero">
          <div className="simple-driver-status-card">
            <span className="driver-badge">
              <Sparkles size={16} />
              حالة الشغل
            </span>

            <h2>
              {displayedOnlineStatus
                ? "أنت متاح لاستقبال الطلبات"
                : "أنت غير متاح الآن"}
            </h2>

            <p>
              خلي الزرار على متاح عشان توصلك طلبات. لما يوصلك طلب هتلاقي السعر،
              الوقت، الطريق، وأزرار قبول أو رفض.
            </p>

            <button
              type="button"
              className={`simple-online-toggle ${
                displayedOnlineStatus ? "online" : "offline"
              }`}
              onClick={handleOnlineToggle}
            >
              <Circle size={14} fill="currentColor" />
              {displayedOnlineStatus
                ? "إيقاف استقبال الطلبات"
                : "تشغيل استقبال الطلبات"}
            </button>
          </div>

          <div className="simple-driver-summary">
            <div>
              <Bell size={22} />
              <span>طلبات جديدة</span>
              <strong>{pendingRequestsCount}</strong>
            </div>

            <div>
              <CircleDollarSign size={22} />
              <span>أرباح اليوم</span>
              <strong>{totalEarnings} ج</strong>
            </div>

            <div>
              <WalletCards size={22} />
              <span>العمولة</span>
              <strong>{dueCommission} ج</strong>
            </div>

            <div>
              <MessageCircle size={22} />
              <span>رسائل</span>
              <strong>{totalUnread}</strong>
            </div>
          </div>
        </section>

        <section className="driver-panel driver-offers-banner">
          <div className="driver-offers-banner-content">
            <span>
              <Gift size={18} />
              عروض وصلني
            </span>

            <h3>زود فرصك في استقبال الطلبات</h3>

            <p>
              اشترك في عروض وصلني للسائقين، واطلب تفعيل مميزات إضافية بعد
              مراجعة الإدارة.
            </p>
          </div>

          <div className="driver-offers-banner-price">
            <span>عرض اليوم</span>
            <strong>10 ج فقط</strong>

            <button type="button" onClick={openDriverOffersModal}>
              اشترك الآن
              <Sparkles size={18} />
            </button>
          </div>
        </section>

        {activeTrip && (
          <section className="driver-panel active-trip-panel">
            <div className="panel-head">
              <div>
                <span className="panel-tag">المشوار الحالي</span>
                <h3>أنت في مشوار الآن</h3>
              </div>

              <div className="active-trip-status">{getTripStageLabel()}</div>
            </div>

            <div className="active-trip-card">
              <div className="active-trip-main">
                <div className="request-user__avatar">
                  <UserRound size={20} />
                </div>

                <div>
                  <span>الراكب</span>
                  <h4>{activeTrip.riderName}</h4>
                  <p>
                    {activeTrip.from} → {activeTrip.to}
                  </p>
                </div>
              </div>

              <div className="active-trip-info-grid">
                <div>
                  <BadgeDollarSign size={18} />
                  <span>السعر</span>
                  <strong>{activeTrip.price} ج</strong>
                </div>

                <div>
                  <Route size={18} />
                  <span>المسافة</span>
                  <strong>{activeTrip.distance} كم</strong>
                </div>

                <div>
                  <Clock3 size={18} />
                  <span>وقت المشوار</span>
                  <strong>{activeTrip.eta}</strong>
                </div>
              </div>

              <div className="active-trip-route">
                <div>
                  <MapPinned size={18} />
                  <span>من</span>
                  <strong>{activeTrip.from}</strong>
                </div>

                <div>
                  <Route size={18} />
                  <span>إلى</span>
                  <strong>{activeTrip.to}</strong>
                </div>
              </div>

              <div className="active-trip-primary-actions">
                <a
                  href={getDirectionsUrl(activeTrip)}
                  target="_blank"
                  rel="noreferrer"
                  className="location-route-btn"
                >
                  <MapPinned size={18} />
                  افتح الطريق
                </a>

                <a
                  href={`tel:${activeTrip.riderPhone || "01000000000"}`}
                  className="location-call-btn"
                >
                  <Phone size={18} />
                  اتصل بالراكب
                </a>
              </div>

              <div className="active-trip-stage-actions">
                <button
                  type="button"
                  className={tripStage === "started" ? "active" : ""}
                  onClick={() => updateTripStage("started")}
                >
                  بدأت الطريق
                </button>

                <button
                  type="button"
                  className={tripStage === "arrived" ? "active" : ""}
                  onClick={() => updateTripStage("arrived")}
                >
                  وصلت للراكب
                </button>

                <button
                  type="button"
                  className="finish"
                  onClick={finishActiveTrip}
                >
                  المشوار خلص
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="driver-panel simple-requests-panel">
          <div className="panel-head">
            <div>
              <span className="panel-tag">الأهم الآن</span>
              <h3>طلبات المشاوير</h3>
            </div>

            <div className="panel-counter">{pendingRequestsCount}</div>
          </div>

          <div className="request-list simple-request-list">
            {activeTrip ? (
              <div className="empty-state">
                <Route size={30} />
                <h4>خلص المشوار الحالي الأول</h4>
                <p>
                  عندك مشوار شغال الآن. بعد ما تضغط "المشوار خلص" تقدر تستقبل
                  طلبات جديدة.
                </p>
              </div>
            ) : isDriverBlocked ? (
              <div className="empty-state blocked">
                <AlertTriangle size={30} />
                <h4>ادفع العمولة الأول</h4>
                <p>بعد الدفع ومراجعة الإدارة، الطلبات هتشتغل تاني تلقائيًا.</p>

                <button
                  type="button"
                  className="simple-main-btn"
                  onClick={() => navigate("/driver-dashboard-details")}
                >
                  <WalletCards size={18} />
                  دفع العمولة
                </button>
              </div>
            ) : !displayedOnlineStatus ? (
              <div className="empty-state offline-state">
                <Circle size={30} />
                <h4>أنت غير متاح الآن</h4>
                <p>
                  شغل استقبال الطلبات من الزرار فوق عشان تظهرلك المشاوير وتقدر
                  تقبل أو ترفض أو تعمل سعر آخر.
                </p>

                <button
                  type="button"
                  className="simple-main-btn"
                  onClick={handleOnlineToggle}
                >
                  <Circle size={18} fill="currentColor" />
                  تشغيل استقبال الطلبات
                </button>
              </div>
            ) : requests.length > 0 ? (
              requests.slice(0, 3).map((request) => {
                const negotiation = getNegotiationStatus(request.id);
                const isNegotiating = negotiation?.status === "pending";
                const maxNegotiationPrice = getMaxNegotiationPrice(request);

                return (
                  <article
                    className="request-card simple-request-card"
                    key={request.id}
                  >
                    <div className="request-card__top">
                      <div className="request-user">
                        <div className="request-user__avatar">
                          <UserRound size={18} />
                        </div>

                        <div>
                          <h4>{request.riderName}</h4>
                          <span>{request.time}</span>
                        </div>
                      </div>

                      <div className="request-price">
                        <BadgeDollarSign size={18} />
                        <strong>{request.price} ج</strong>
                      </div>
                    </div>

                    <div className="simple-route-box">
                      <div>
                        <MapPinned size={16} />
                        <span>من</span>
                        <strong>{request.from}</strong>
                      </div>

                      <div>
                        <Route size={16} />
                        <span>إلى</span>
                        <strong>{request.to}</strong>
                      </div>
                    </div>

                    <div className="meta-row">
                      <span className="meta-badge">
                        {getVehicleIcon(request.vehicle)}
                        {request.vehicle}
                      </span>

                      <span className="meta-badge">
                        <Route size={16} />
                        {request.distance} كم
                      </span>

                      <span className="meta-badge green">
                        <Clock3 size={16} />
                        {request.eta}
                      </span>

                      <span className="meta-badge purple">
                        <Sparkles size={16} />
                        {request.priority}
                      </span>
                    </div>

                    <div className="simple-location-actions request-safe-actions">
                      <a
                        href={getDirectionsUrl(request)}
                        target="_blank"
                        rel="noreferrer"
                        className="location-route-btn"
                      >
                        <MapPinned size={18} />
                        شوف الطريق
                      </a>
                    </div>

                    <div className="request-no-call-note">
                      <Phone size={16} />
                      رقم الراكب والاتصال يظهروا بعد قبول المشوار فقط.
                    </div>

                    {request.priceStatus === "rider_increased_price" && (
                      <div className="request-rider-price-box">
                        <WalletCards size={18} />
                        <div>
                          <strong>الراكب زود السعر</strong>
                          <p>
                            السعر الجديد {request.price} بدل السعر الأصلي{" "}
                            {request.riderOfferOldPrice || request.systemPrice}
                          </p>
                        </div>
                      </div>
                    )}

                    {negotiation && (
                      <div
                        className={`request-negotiation-box ${
                          negotiation.status === "expired"
                            ? "expired"
                            : "pending"
                        }`}
                      >
                        <div>
                          <BadgeDollarSign size={18} />
                          <strong>
                            {negotiation.status === "expired"
                              ? "لم يقبل الراكب التفاوض"
                              : "تم إرسال تفاوض للراكب"}
                          </strong>
                        </div>

                        <p>
                          {negotiation.status === "expired"
                            ? "انتهى وقت التفاوض. تقدر تقبل المشوار بالسعر الحالي أو ترسل تفاوض جديد."
                            : `السعر المقترح ${negotiation.offeredPrice} ج - الوقت المتبقي ${formatNegotiationTime(
                                negotiation.remainingSeconds,
                              )}`}
                        </p>

                        <small>
                          التفاوض للزيادة فقط — الحد الأقصى{" "}
                          {maxNegotiationPrice} ج
                        </small>
                      </div>
                    )}

                    <div className="request-actions simple-request-actions">
                      <button
                        type="button"
                        className="action-btn accept"
                        onClick={() => openConfirmModal("accept", request)}
                        disabled={
                          isDriverBlocked ||
                          Boolean(activeTrip) ||
                          !displayedOnlineStatus
                        }
                      >
                        <CheckCircle2 size={20} />
                        قبول
                      </button>

                      <button
                        type="button"
                        className="action-btn reject"
                        onClick={() => openConfirmModal("reject", request)}
                      >
                        <XCircle size={20} />
                        رفض
                      </button>

                      <button
                        type="button"
                        className="action-btn negotiate"
                        onClick={() => negotiateRequest(request.id)}
                        disabled={
                          isDriverBlocked ||
                          Boolean(activeTrip) ||
                          isNegotiating ||
                          !displayedOnlineStatus
                        }
                      >
                        <BadgeDollarSign size={20} />
                        {isNegotiating ? "منتظر الراكب" : "سعر آخر"}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <Bell size={30} />
                <h4>لا توجد طلبات الآن</h4>
                <p>أول ما يوصلك طلب جديد هيظهر هنا مباشرة.</p>
              </div>
            )}
          </div>
        </section>

        <section className="simple-driver-actions-grid">
          <button
            type="button"
            className="simple-action-card"
            onClick={() => navigate("/driver-dashboard-details")}
          >
            <WalletCards size={26} />
            <strong>التفاصيل والأرباح</strong>
            <span>الرحلات، العمولة، الدفع، وكل الرسائل</span>
          </button>

          <button
            type="button"
            className="simple-action-card driver-offers-action-card"
            onClick={openDriverOffersModal}
          >
            <Gift size={26} />
            <strong>عروض وصلني</strong>
            <span>اشترك في عروض السائقين وابعث الدفع للأدمن</span>
          </button>

          <button
            type="button"
            className="simple-action-card"
            onClick={() => openProfileModal("view")}
          >
            <UserRound size={26} />
            <strong>بياناتي</strong>
            <span>تعديل الحساب وكلمة المرور</span>
          </button>

          <button
            type="button"
            className="simple-action-card"
            onClick={() => setNotificationSoundEnabled((prev) => !prev)}
          >
            {notificationSoundEnabled ? (
              <Volume2 size={26} />
            ) : (
              <VolumeX size={26} />
            )}
            <strong>
              {notificationSoundEnabled ? "الصوت شغال" : "الصوت مقفول"}
            </strong>
            <span>تشغيل أو إيقاف صوت الطلبات</span>
          </button>
        </section>

        <section className="driver-panel simple-messages-home">
          <div className="panel-head">
            <div>
              <span className="panel-tag">الرسائل</span>
              <h3>رسائل الراكب</h3>
            </div>

            <div className="messages-alert">
              <MessageCircle size={17} />
              {totalUnread}
            </div>
          </div>

          {activeChat ? (
            <div className="simple-message-card">
              <div className="chat-box__user">
                <div className="chat-box__avatar">
                  {activeChat.avatar || "ر"}
                  <span></span>
                </div>

                <div>
                  <h4>{activeChat.riderName}</h4>
                  <span>{activeChat.trip}</span>
                </div>
              </div>

              <p>{lastMessage}</p>

              <div className="simple-message-actions">
                {activeTrip && (
                  <a className="simple-call-btn" href={`tel:${activeChat.phone}`}>
                    <Phone size={18} />
                    اتصال
                  </a>
                )}

                <button
                  type="button"
                  className="simple-main-btn"
                  onClick={() => navigate("/driver-dashboard-details")}
                >
                  <MessageCircle size={18} />
                  فتح المحادثة
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <MessageCircle size={28} />
              <h4>لا توجد رسائل الآن</h4>
              <p>بعد قبول أي مشوار، الرسائل بينك وبين الراكب هتظهر هنا.</p>
            </div>
          )}
        </section>

        <section className="driver-panel simple-home-note">
          <div className="panel-head">
            <div>
              <span className="panel-tag">اختصار</span>
              <h3>كل التفاصيل في صفحة واحدة</h3>
            </div>
          </div>

          <p>
            الأرباح، العمولة، الدفع، كل الرحلات، وكل الرسائل موجودين في صفحة
            التفاصيل عشان الرئيسية تفضل سهلة وسريعة.
          </p>

          <button
            type="button"
            className="simple-full-details-btn"
            onClick={() => navigate("/driver-dashboard-details")}
          >
            <BarChart3 size={18} />
            افتح كل التفاصيل
          </button>
        </section>
      </div>

      <div className="driver-mobile-sticky">
        <button
          type="button"
          className={displayedOnlineStatus ? "online" : "offline"}
          onClick={handleOnlineToggle}
        >
          <Circle size={14} fill="currentColor" />
          {displayedOnlineStatus ? "متاح" : "غير متاح"}
        </button>

        <button type="button" onClick={() => navigate("/driver-dashboard-details")}>
          <BarChart3 size={18} />
          التفاصيل
        </button>
      </div>
    </section>
  );
}

export default DriverDashboard;