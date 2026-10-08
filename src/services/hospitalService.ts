import { apiRequest } from "./api";

export interface HospitalOffer {
  notification_id: string;
  organ_id: string;
  match_id: string;
  recipient_id: string;
  hospital_id: string;
  rank: number;
  notification_type: string;
  status: string;
  response: string | null;
  sent_at: string | null;
  responded_at: string | null;
  organ_type: string | null;
  organ_blood_group: string | null;
  recipient_blood_group: string | null;
  recipient_urgency: string | null;
  can_respond: boolean;
}

export interface HospitalNotificationsResponse {
  success: boolean;
  hospital_id: string;
  hospital_name: string;
  offer_count: number;
  offers: HospitalOffer[];
}

export async function getHospitalNotifications(
  hospitalId: string
): Promise<HospitalNotificationsResponse> {
  return apiRequest(
    `/api/ml/notifications/hospital/${hospitalId}`
  );
}

export async function respondToHospitalOffer(
  notificationId: string,
  response: "ACCEPT" | "REJECT"
) {
  return apiRequest(
    `/api/ml/notification/${notificationId}/respond`,
    {
      method: "POST",
      body: JSON.stringify({
        response,
      }),
    }
  );
}