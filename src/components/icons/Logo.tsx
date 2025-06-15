import { Palmtree } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const Logo = ({ className, iconSize = 32, textSize = "text-2xl" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Palmtree size={iconSize} className="text-primary" />
      <span className={`font-headline font-bold ${textSize} text-primary`}>
        Zanzibar Free Tours
      </span>
    </div>
  );
};

export default Logo;
