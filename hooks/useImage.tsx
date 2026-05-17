import { useState, useEffect } from 'react';

export function useImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');

  useEffect(() => {
    if (!src) {
      setImage(null);
      setStatus('failed');
      return;
    }

    const img = new Image();
    
    const handleLoad = () => {
      setImage(img);
      setStatus('loaded');
    };

    const handleError = () => {
      setImage(null);
      setStatus('failed');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    
    img.src = src;
    img.crossOrigin = 'Anonymous';

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src]);

  return [image, status] as const;
}