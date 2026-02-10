/**
 * Types pour le coaching en direct
 */

export interface LiveCoachingSession {
  id: string;
  coachId: string;
  coachName: string;
  studentId: string;
  skillId: string;
  skillName: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  startTime: number;
  endTime?: number;
  duration: number; // en minutes
  price: number;
  currency: string;
  videoUrl?: string;
  recordingUrl?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  createdAt: number;
}

export interface CoachProfile {
  id: string;
  userId: string;
  name: string;
  bio: string;
  avatar: string;
  specialties: string[];
  hourlyRate: number;
  availability: DayAvailability[];
  rating: number;
  reviewCount: number;
  totalSessions: number;
  responseTime: number; // en minutes
  verified: boolean;
  certifications: string[];
}

export interface DayAvailability {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // "09:00" format
  endTime: string; // "10:00" format
  available: boolean;
}

export interface CoachingBooking {
  id: string;
  coachId: string;
  studentId: string;
  skillId: string;
  requestedTime: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  message?: string;
  createdAt: number;
  respondedAt?: number;
}

export interface CoachingReview {
  id: string;
  sessionId: string;
  coachId: string;
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  comment: string;
  helpful: number;
  createdAt: number;
}

export interface CoachingPayment {
  id: string;
  sessionId: string;
  coachId: string;
  studentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  timestamp: number;
  receiptUrl?: string;
}

export interface CoachingStats {
  coachId: string;
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  totalStudents: number;
  thisMonthSessions: number;
  thisMonthEarnings: number;
  responseRate: number; // %
  completionRate: number; // %
}

export interface LiveCoachingMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderRole: 'coach' | 'student';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface CoachingResource {
  id: string;
  sessionId: string;
  coachId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'image' | 'video' | 'document';
  uploadedAt: number;
}
