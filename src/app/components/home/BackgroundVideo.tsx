'use client'

import { useRef, useEffect } from 'react';

export default function BackgroundVideo() {
    const vidRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (vidRef.current) {
            vidRef.current.playbackRate = 0.4;
        }
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full object-cover -z-10 bg-opacity-65">
            <video
                ref={vidRef}
                src="/intro.mp4"               // place intro.mp4 in your /public folder
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover -z-10 bg-opacity-65"
            />
        </div>
    );
}
