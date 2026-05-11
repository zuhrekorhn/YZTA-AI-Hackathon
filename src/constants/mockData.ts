export const DASHBOARD_STATS = {
  newOrders: 17,
  yesterdayOrders: 14,
  shipped: 12,
  waitingOrders: 5,
  stockWarnings: 3,
  messages: 8,
  autoReplied: 6
};

export const RECENT_ORDERS = [
  { id: "#1847", customer: "Ayşe Yılmaz", product: "Süzme Bal (850g)", status: "Kargoda", statusColor: "success" },
  { id: "#1846", customer: "Mehmet Demir", product: "Kuru İncir (1kg)", status: "Hazırlanıyor", statusColor: "warning" },
  { id: "#1845", customer: "Fatma Çelik", product: "Zeytinyağı (5L)", status: "Gecikiyor", statusColor: "danger" },
  { id: "#1844", customer: "Ali Kaya", product: "Domates Kurusu (500g)", status: "Teslim edildi", statusColor: "gray" },
];

export const STOCK_STATUS = [
  { name: "Domates", quantity: "12 kg", level: 15, threshold: 50 },
  { name: "Bal", quantity: "45 kg", level: 60, threshold: 30 },
  { name: "Zeytinyağı", quantity: "22 L", level: 40, threshold: 20 },
  { name: "Kuru İncir", quantity: "8 kg", level: 20, threshold: 15 },
];

export const INVENTORY_ITEMS = [
  { id: 1, name: "Süzme Bal (850g)", stock: 45, threshold: 10, unit: "adet" },
  { id: 2, name: "Kuru İncir (1kg)", stock: 8, threshold: 15, unit: "paket" },
  { id: 3, name: "Domates Salçası", stock: 12, threshold: 20, unit: "kavanoz" },
  { id: 4, name: "Soğuk Sıkım Zeytinyağı (5L)", stock: 22, threshold: 5, unit: "teneke" },
];

export const SHIPMENTS = [
  { id: "#1847", customer: "Ayşe Yılmaz", company: "Yurtiçi", trackNo: "YT123456789", date: "Bugün", status: "Yolda" },
  { id: "#1845", customer: "Fatma Çelik", company: "MNG", trackNo: "MNG987654321", date: "Dün", status: "Gecikiyor", delayed: true },
  { id: "#1842", customer: "Hüseyin Ak", company: "Aras", trackNo: "AR556677889", date: "Yarın", status: "Hazırlanıyor" },
];

export const CHATS = [
  { id: 1, name: "Ayşe Yılmaz", lastMsg: "Kargom ne zaman gelir?", time: "10:45", unread: 1, initials: "AY" },
  { id: 2, name: "Mehmet Demir", lastMsg: "Ürünler harika, teşekkürler!", time: "Dün", unread: 0, initials: "MD" },
  { id: 3, name: "Zeynep Aksu", lastMsg: "Siparişimi iptal etmek istiyorum.", time: "Pzt", unread: 0, initials: "ZA" },
];

export const MESSAGES = [
  { id: 1, sender: "customer", text: "Merhaba, #1847 nolu siparişim nerede?", time: "10:42" },
  { id: 2, sender: "ai", text: "Merhaba Ayşe Hanım! #1847 nolu siparişiniz bugün Yurtiçi Kargo'ya teslim edildi. Takip numaranız: YT123456789.", time: "10:43", tool: "sipariş DB sorgulandı" },
  { id: 3, sender: "customer", text: "Teşekkürler, çok hızlısınız!", time: "10:44" },
  { id: 4, sender: "ai", text: "Rica ederiz! Harika bir gün dileriz. 😊", time: "10:45", tool: "otomatik yanıt" },
];
