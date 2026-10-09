export const CATEGORY_LABEL = {
  GENERAL: "General question",
  PAYMENT: "Payment or enrollment",
  COURSE: "Course content",
  TECHNICAL: "Technical problem",
  ACCOUNT: "Account & sign-in",
  OTHER: "Other",
} as const;

export const PRIORITY_LABEL = { LOW: "Low", NORMAL: "Normal", HIGH: "High" } as const;

export const STATUS_META = {
  OPEN: { label: "Open", variant: "secondary" },
  IN_PROGRESS: { label: "In progress", variant: "outline" },
  RESOLVED: { label: "Resolved", variant: "success" },
  CLOSED: { label: "Closed", variant: "outline" },
} as const;
