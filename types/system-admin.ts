export interface CoachListItem {
  userId: string;
  email: string;
  name: string;
  lastName: string;
  hasActiveMembership: boolean;
  membershipEndDate: string | null;
  planId: string | null;
  planName: string | null;
  menteesCount: number;
}

export interface CoachDetail {
  userId: string;
  email: string;
  name: string;
  lastName: string;
  createdAt: string | null;
  hasActiveMembership: boolean;
  membershipStartDate: string | null;
  membershipEndDate: string | null;
  planId: string | null;
  planName: string | null;
  dailyMealPlansCount: number;
  maxDailyMealPlans: number | null;
  maxMentees: number | null;
  menteesCount: number;
}

export interface MenteeBasicInfo {
  userId: string;
  email: string;
  name: string;
  lastName: string;
  createdAt: string | null;
}

export interface Plan {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  monthlyPrice: number | null;
  anualPrice: number | null;
  monthlyPriceUrl: string | null;
  anualPriceUrl: string | null;
  maxDailyMealPlans: number | null;
  maxMentees: number | null;
  contactButton: boolean;
  graphics: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

export interface AssignMembershipRequest {
  planId: string;
  durationMonths: number;
}

export interface UpdateCoachPasswordRequest {
  newPassword: string;
}
