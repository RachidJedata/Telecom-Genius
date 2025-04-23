'use client'

import React from 'react';
import { useRef, useEffect } from 'react';


export default function BackgroundVideo({ setIsLoading }: { setIsLoading: (v: boolean) => void }) {
    const vidRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setIsLoading(false);
        const video = vidRef.current;
        if (video) {
            video.playbackRate = 0.4;
            // Explicitly play the video to handle cases where autoplay may not trigger
            video.play().catch(error => {
                console.error('Video play failed:', error);
            });
        }
    }, [setIsLoading]); // Include setIsLoading in dependencies if it's not stable
    

    return (
        <video
            ref={vidRef}
            src="intro.mp4"               // place intro.mp4 in your /public folder
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover -z-10 bg-opacity-65"
        />
    );
}
