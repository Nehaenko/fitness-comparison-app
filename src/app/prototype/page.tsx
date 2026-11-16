import type {Metadata} from "next";

import PrototypeApp from "@/components/prototype/prototypeApp";

export const metadata: Metadata = {
    title: "Forma prototype",
    description: "Explore Forma using private, browser-only prototype data.",
};

export default function PrototypePage() {
    return <PrototypeApp/>;
}
