import { useEffect } from "react";

interface PageMetaProps {
    title: string;
    description: string;
}

export function usePageMeta({ title, description }: PageMetaProps) {
    useEffect(() => {
        // Update title
        document.title = title;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement("meta");
            metaDescription.setAttribute("name", "description");
            document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute("content", description);
    }, [title, description]);
}
