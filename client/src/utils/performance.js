import { useState, useEffect, useCallback, useRef } from 'react';

// Debounce hook for search/input
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll events
export function useThrottle(callback, delay = 100) {
  const lastRun = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
}

// Lazy load images
export function useLazyImage(src) {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageRef, setImageRef] = useState();

  useEffect(() => {
    let observer;
    
    if (imageRef && imageSrc !== src) {
      if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                setImageSrc(src);
                observer.unobserve(imageRef);
              }
            });
          },
          {
            rootMargin: '50px',
          }
        );
        observer.observe(imageRef);
      } else {
        setImageSrc(src);
      }
    }
    
    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef]);

  return [setImageRef, imageSrc];
}

// Measure component render time
export function useRenderTime(componentName) {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`[Performance] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
    };
  });
}

// Virtual scrolling helper (for large lists)
export function useVirtualScroll(items, itemHeight, containerHeight) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight: items.length * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop),
  };
}

// Cache API responses
const cache = new Map();

export function useCachedFetch(key, fetcher, ttl = 60000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    fetcher()
      .then(result => {
        cache.set(key, { data: result, timestamp: Date.now() });
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [key, fetcher, ttl]);

  return { data, loading, error };
}

// Prefetch data on hover
export function usePrefetch(fetcher) {
  const prefetchRef = useRef(null);

  const handleMouseEnter = () => {
    if (!prefetchRef.current) {
      prefetchRef.current = fetcher();
    }
  };

  return { onMouseEnter: handleMouseEnter };
}