import { faNetworkWired, faSignal, faLaptop, faBook, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Define iconMap with an index signature
const iconMap: { [key: string]: IconDefinition } = {
    networkWired: faNetworkWired,
    signal: faSignal,
    laptop: faLaptop,
    book: faBookOpen,
};

export default iconMap;
