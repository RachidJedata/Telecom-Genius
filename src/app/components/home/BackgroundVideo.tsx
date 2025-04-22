'use client'

import React from 'react';
import { useRef, useEffect } from 'react';


export default function BackgroundVideo({ setIsLoading }: { setIsLoading: (v: boolean) => void }) {
    const vidRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setIsLoading(false); // When component mounts, loading is done
        if (vidRef.current) {
            vidRef.current.playbackRate = 0.4;
        }
    }, []);

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
