export const messagesData = [
  {
    id: 1,
    driverName: "أحمد سالم",
    driverStatus: "متاح الآن",
    lastMessage: "وعليكم السلام، أيوه متاح الآن.",
    time: "10:31 ص",
    unread: 1,
    online: true,
    messages: [
      {
        id: 1,
        sender: "rider",
        text: "السلام عليكم، أنت متاح؟",
        time: "10:30 ص",
      },
      {
        id: 2,
        sender: "driver",
        text: "وعليكم السلام، أيوه متاح الآن.",
        time: "10:31 ص",
      },
      {
        id: 3,
        sender: "rider",
        text: "محتاج مشوار للشارع الرئيسي.",
        time: "10:31 ص",
      },
      {
        id: 4,
        sender: "driver",
        text: "تمام، أنا قريب منك. ابعتلي المكان.",
        time: "10:32 ص",
      },
    ],
  },
  {
    id: 2,
    driverName: "محمد علي",
    driverStatus: "متاح الآن",
    lastMessage: "هل أنت قريب من السوق؟",
    time: "10:25 ص",
    unread: 0,
    online: true,
    messages: [
      {
        id: 1,
        sender: "driver",
        text: "هل أنت قريب من السوق؟",
        time: "10:25 ص",
      },
    ],
  },
  {
    id: 3,
    driverName: "سعيد الخطيب",
    driverStatus: "مشغول",
    lastMessage: "ممكن مشوار بعد 10 دقائق؟",
    time: "10:18 ص",
    unread: 0,
    online: false,
    messages: [
      {
        id: 1,
        sender: "rider",
        text: "ممكن مشوار بعد 10 دقائق؟",
        time: "10:18 ص",
      },
    ],
  },
];
