export type UserRole = "admin" | "operator" | "pilgrim";

export type PilgrimStatus =
  | "new"
  | "docs_pending"
  | "docs_complete"
  | "payment_pending"
  | "payment_partial"
  | "ready"
  | "departed";

export type DocumentType =
  | "passport"
  | "medical_certificate"
  | "photo"
  | "questionnaire"
  | "vaccination";

export type DepartureCity = "Almaty" | "Astana" | "Shymkent" | "Turkestan" | "Aktau";

export type GroupStatus = "forming" | "full" | "departed" | "completed";

export type PaymentMethod = "kaspi" | "halyk" | "cash" | "transfer";

export type PaymentStatus = "pending" | "partial" | "paid";

export type NotificationChannel = "whatsapp" | "sms" | "email" | "in_app";

export type NotificationType =
  | "reminder_docs"
  | "reminder_payment"
  | "reminder_flight"
  | "welcome"
  | "checklist";

export type NotificationStatus = "queued" | "sent" | "failed";

export type ChecklistCategory =
  | "documents"
  | "health"
  | "clothing"
  | "finance"
  | "spiritual";

export interface Operator {
  id: string;
  userId: string;
  companyName: string;
  licenseNumber: string;
  licenseExpiry: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  phone: string;
  address: string;
  description: string;
  createdAt: string;
}

export interface PilgrimProfile {
  id: string;
  userId: string;
  operatorId: string;
  fullName: string;
  iin: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  status: PilgrimStatus;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  pilgrimId: string;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface GroupRecord {
  id: string;
  operatorId: string;
  name: string;
  flightDate: string;
  returnDate: string;
  hotelMecca: string;
  hotelMedina: string;
  quotaTotal: number;
  quotaFilled: number;
  guideName: string;
  guidePhone: string;
  departureCity: DepartureCity;
  status: GroupStatus;
  createdAt: string;
  priceFrom: number;
}

export interface PilgrimGroupRecord {
  pilgrimId: string;
  groupId: string;
  joinedAt: string;
}

export interface PaymentRecord {
  id: string;
  pilgrimId: string;
  operatorId: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  installmentPlan: boolean;
  installmentMonths: number | null;
  status: PaymentStatus;
  contractUrl: string | null;
  qrCode: string | null;
  contractGeneratedAt: string | null;
  createdAt: string;
}

export interface OperatorReview {
  id: string;
  operatorId: string;
  pilgrimId: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  pilgrimId: string;
  operatorId: string;
  channel: NotificationChannel;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  scheduledAt: string;
  sentAt: string | null;
}

export interface ChecklistItem {
  id: string;
  pilgrimId: string;
  itemName: string;
  category: ChecklistCategory;
  isChecked: boolean;
}

export interface PilgrimReadiness {
  pilgrimId: string;
  docsCount: number;
  isPaymentComplete: boolean;
  isInGroup: boolean;
  readinessPercent: number;
  isReady: boolean;
}

export interface TimelineEvent {
  id: string;
  pilgrimId: string;
  title: string;
  detail: string;
  timestamp: string;
}
