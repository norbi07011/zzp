declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export const CheckCircle: FC<IconProps>;
  export const ArrowRight: FC<IconProps>;
  export const Sparkles: FC<IconProps>;
  export const Calendar: FC<IconProps>;
  export const MapPin: FC<IconProps>;
  export const AlertTriangle: FC<IconProps>;
  
  // Add other icons as needed
  const LucideReact: {
    CheckCircle: FC<IconProps>;
    ArrowRight: FC<IconProps>;
    Sparkles: FC<IconProps>;
    Calendar: FC<IconProps>;
    MapPin: FC<IconProps>;
    AlertTriangle: FC<IconProps>;
  };
  
  export default LucideReact;
}