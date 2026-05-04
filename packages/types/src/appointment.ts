export type AppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  clinicId: string;
  patientId: string;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  startTime: string;
  endTime: string;
  patientId: string;
  doctorId: string;
  notes?: string;
}

export interface UpdateAppointmentRequest
  extends Partial<CreateAppointmentRequest> {
  status?: AppointmentStatus;
}
