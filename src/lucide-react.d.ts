// Type declarations for lucide-react icon imports
// This file allows importing icons directly from their paths

declare module "lucide-react/dist/esm/icons/*" {
  import { LucideIcon } from "lucide-react";
  const icon: LucideIcon;
  export default icon;
}

// Allow named exports (fix for TypeScript errors)
declare module "lucide-react" {
  export const Crown: any;
  export const User: any;
  export const CreditCard: any;
  export const TrendingUp: any;
  export const TrendingDown: any;
  export const DollarSign: any;
  export const XCircle: any;
  export const AlertCircle: any;
  export const RefreshCw: any;
  export const Award: any;
  export const FileText: any;
  export const Loader: any;
  export const Briefcase: any;
  export const Link: any;
  export const Calendar: any;
  export const CheckCircle: any;
  // Add more as needed...
}
