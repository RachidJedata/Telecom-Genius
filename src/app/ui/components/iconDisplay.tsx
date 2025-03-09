import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface IconDisplayProps extends LucideProps {
    iconName: string;
}

export default function IconDisplay({ iconName, className, ...props }: IconDisplayProps) {
    // console.log(iconName);
    // iconName = 'network';
    const LucideIcon = (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[iconName]
        || LucideIcons.HelpCircle; // Fallback icon

    return <LucideIcon className={className} {...props} />;
}
