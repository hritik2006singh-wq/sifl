// ImageWithFallback.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string; // optional fallback image URL
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    className = "",
    fallbackSrc,
}) => {
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleError = () => {
        if (fallbackSrc) {
            setCurrentSrc(fallbackSrc);
        } else {
            // hide the image if no fallback provided
            setCurrentSrc("");
        }
    };

    if (!currentSrc) {
        // render nothing when src is empty
        return null;
    }

    return (
        <Image
            src={currentSrc}
            alt={alt}
            className={className}
            onError={handleError}
            fill={false}
        // next/image requires width/height or layout; using layout="responsive" via style
        // We'll let Next.js infer dimensions if possible, otherwise you can set width/height manually.
        />
    );
};
