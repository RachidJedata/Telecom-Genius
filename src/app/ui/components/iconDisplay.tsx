import iconMap from "@/app/utils/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function IconDisplay({ iconName }: { iconName: string }) {
    const icon = iconMap[iconName] || iconMap["networkWired"]; // Default to "coffee" if not found

    return (
        <FontAwesomeIcon className="w-12 h-12 text-primary mb-4" icon={icon} />
    );
}
