export type AccountType = "PERSONAL" | "BUSINESS";
export type AccountRole = "OWNER" | "ADMIN" | "OPERATOR" | "VIEWER";
export type SubscriptionPlan =
  | "FREE"
  | "PERSONAL_PRO"
  | "BUSINESS"
  | "BUSINESS_PRO";
export type SubscriptionStatus =
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED"
  | "INCOMPLETE";
export type AccountLimitState = "OK" | "OVER_LIMIT";

export type BooleanFeature =
  | "remoteControl"
  | "advancedAi"
  | "voiceControl"
  | "processManagement"
  | "appManagement"
  | "advancedDeviceInfo"
  | "networkInformation"
  | "locationInformation"
  | "deviceHistory"
  | "priorityAi"
  | "teamManagement"
  | "auditLogs"
  | "apiAccess";

export interface PlanEntitlements {
  maxDevices: number;
  remoteControl: boolean;
  advancedAi: boolean;
  voiceControl: boolean;
  processManagement: boolean;
  appManagement: boolean;
  advancedDeviceInfo: boolean;
  networkInformation: boolean;
  locationInformation: boolean;
  deviceHistory: boolean;
  priorityAi: boolean;
  teamManagement: boolean;
  auditLogs: boolean;
  apiAccess: boolean;
}

export interface SubscriptionInfo {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: string;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
}

export interface AccountContext {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  limitState: AccountLimitState;
  userId: string;
  role: AccountRole;
  permissions: string[];
  subscription: SubscriptionInfo;
  entitlements: PlanEntitlements;
  usage: { devices: number };
}

export interface BillingSummary {
  accountType: AccountType;
  accountName: string;
  accountId: string;
  role: AccountRole;
  limitState: AccountLimitState;
  subscription: SubscriptionInfo;
  entitlements: PlanEntitlements;
  usage: { devices: number };
  plans: Array<{
    plan: SubscriptionPlan;
    name: string;
    entitlements: PlanEntitlements;
  }>;
  comparison: Array<{
    key: string;
    label: string;
    values: Record<SubscriptionPlan, string | boolean>;
  }>;
}

export interface DeviceUsage {
  devices: number;
  maxDevices: number;
  limitState: AccountLimitState;
  accountType: AccountType;
  plan: SubscriptionPlan;
  planName: string;
}

export interface CheckoutResult {
  checkoutUrl: string | null;
  sessionId: string;
  appliedImmediately?: boolean;
}

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Free",
  PERSONAL_PRO: "Personal Pro",
  BUSINESS: "Business",
  BUSINESS_PRO: "Business Pro",
};

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  PERSONAL: "Personal",
  BUSINESS: "Business",
};

export const FEATURE_LABELS: Record<BooleanFeature, string> = {
  remoteControl: "Remote control",
  advancedAi: "Advanced AI",
  voiceControl: "Voice control",
  processManagement: "Process management",
  appManagement: "App management",
  advancedDeviceInfo: "Advanced device information",
  networkInformation: "Network information",
  locationInformation: "Location information",
  deviceHistory: "Device history",
  priorityAi: "Priority AI",
  teamManagement: "Team management",
  auditLogs: "Audit logs",
  apiAccess: "API access",
};

export function requiredPlanForFeature(feature: BooleanFeature): SubscriptionPlan {
  const order: SubscriptionPlan[] = [
    "FREE",
    "PERSONAL_PRO",
    "BUSINESS",
    "BUSINESS_PRO",
  ];
  // Client-side mirror of backend plan matrix for upgrade copy.
  const matrix: Record<BooleanFeature, SubscriptionPlan> = {
    remoteControl: "FREE",
    processManagement: "FREE",
    appManagement: "FREE",
    advancedAi: "PERSONAL_PRO",
    voiceControl: "PERSONAL_PRO",
    advancedDeviceInfo: "PERSONAL_PRO",
    networkInformation: "PERSONAL_PRO",
    locationInformation: "PERSONAL_PRO",
    deviceHistory: "PERSONAL_PRO",
    priorityAi: "PERSONAL_PRO",
    teamManagement: "BUSINESS",
    auditLogs: "BUSINESS",
    apiAccess: "BUSINESS_PRO",
  };
  void order;
  return matrix[feature];
}
