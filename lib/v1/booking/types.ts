// lib/v1/booking/types.ts

export type BookingProfile = {
  id: string;
  tenantId: string;
  slug: string;
  displayName: string;
  bio: string;
  timezone: string;
  availableDays: number[];       // 0=Sun, 1=Mon, ..., 6=Sat
  hoursStart: string;            // "09:00"
  hoursEnd: string;              // "17:00"
  durationOptions: number[];     // [15, 30, 60]
  defaultDuration: number;
  bufferMinutes: number;
  maxAdvanceDays: number;
  maxBookingsPerDay: number;
  meetingTitleTemplate: string;
  includeMeet: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = {
  slug: string;
  displayName: string;
  bio: string;
  timezone: string;
  availableDays: number[];
  hoursStart: string;
  hoursEnd: string;
  durationOptions: number[];
  defaultDuration: number;
  maxAdvanceDays: number;
  isActive: boolean;
};

export type TimeSlot = {
  start: string;  // "09:00"
  end: string;    // "09:30"
};

export type Booking = {
  id: string;
  tenantId: string;
  profileId: string;
  guestName: string;
  guestEmail: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timezone: string;
  googleEventId: string | null;
  meetLink: string | null;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
};

export type BookingOtp = {
  id: string;
  email: string;
  slug: string;
  code: string;
  expiresAt: string;
  attempts: number;
  verified: boolean;
  ipAddress: string | null;
};

