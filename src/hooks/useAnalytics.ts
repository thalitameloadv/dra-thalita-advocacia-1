import { useEffect, useRef, useCallback } from 'react';
import { blogAnalyticsService } from '@/services/blogAnalyticsService';

interface AnalyticsOptions {
    trackPageView?: boolean;
    trackEngagement?: boolean;
    trackScrollDepth?: boolean;
    trackTimeOnPage?: boolean;
}

interface UseAnalyticsReturn {
    trackView: (postId: string, additionalData?: Record<string, any>) => void;
    trackEngagement: (postId: string, type: 'like' | 'comment' | 'share' | 'bookmark', data?: any) => void;
    trackEvent: (eventName: string, properties?: Record<string, any>) => void;
    trackScrollDepth: (depth: number) => void;
    startSession: () => string;
    endSession: () => void;
}

export const useAnalytics = (options: AnalyticsOptions = {}): UseAnalyticsReturn => {
    const {
        trackPageView = true,
        trackEngagement = true,
        trackScrollDepth = true,
        trackTimeOnPage = true
    } = options;

    const sessionIdRef = useRef<string>('');
    const startTimeRef = useRef<number>(Date.now());
    const hasTrackedViewRef = useRef<boolean>(false);
    const maxScrollDepthRef = useRef<number>(0);

    // Generate or retrieve session ID
    const getSessionId = useCallback((): string => {
        if (!sessionIdRef.current) {
            sessionIdRef.current = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return sessionIdRef.current;
    }, []);

    // Start analytics session
    const startSession = useCallback((): string => {
        const sessionId = getSessionId();
        startTimeRef.current = Date.now();
        hasTrackedViewRef.current = false;
        maxScrollDepthRef.current = 0;

        // Store session info for later use
        try {
            sessionStorage.setItem('analytics_session_id', sessionId);
            sessionStorage.setItem('analytics_session_start', startTimeRef.current.toString());
        } catch (error) {
            console.warn('Failed to store session info:', error);
        }

        return sessionId;
    }, [getSessionId]);

    // End analytics session
    const endSession = useCallback((): void => {
        const sessionId = getSessionId();
        const duration = Date.now() - startTimeRef.current;

        // Send session end data
        try {
            // In a real implementation, you would send this to your analytics service
            console.log('Session ended:', {
                sessionId,
                duration,
                maxScrollDepth: maxScrollDepthRef.current
            });

            // Clear session storage
            sessionStorage.removeItem('analytics_session_id');
            sessionStorage.removeItem('analytics_session_start');
        } catch (error) {
            console.warn('Failed to end session:', error);
        }
    }, [getSessionId]);

    // Track page view
    const trackView = useCallback((postId: string, additionalData?: Record<string, any>) => {
        if (!trackPageView) return;

        const sessionId = getSessionId();
        
        // Prevent duplicate view tracking for the same session
        const viewKey = `view_${postId}_${sessionId}`;
        if (hasTrackedViewRef.current && sessionStorage.getItem(viewKey)) {
            return;
        }

        try {
            // Track view with analytics service
            blogAnalyticsService.trackView(postId, sessionId);

            // Mark as tracked
            hasTrackedViewRef.current = true;
            sessionStorage.setItem(viewKey, 'true');

            // Log for debugging
            console.log('Page view tracked:', {
                postId,
                sessionId,
                timestamp: new Date().toISOString(),
                ...additionalData
            });
        } catch (error) {
            console.error('Failed to track page view:', error);
        }
    }, [trackPageView, getSessionId]);

    // Track engagement
    const trackEngagement = useCallback((postId: string, type: 'like' | 'comment' | 'share' | 'bookmark', data?: any) => {
        if (!trackEngagement) return;

        const sessionId = getSessionId();

        try {
            blogAnalyticsService.trackEngagement(postId, type, data);

            console.log('Engagement tracked:', {
                postId,
                type,
                sessionId,
                data,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to track engagement:', error);
        }
    }, [trackEngagement, getSessionId]);

    // Track custom events
    const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
        const sessionId = getSessionId();

        try {
            // In a real implementation, you would send this to your analytics service
            console.log('Event tracked:', {
                eventName,
                properties,
                sessionId,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    }, [getSessionId]);

    // Track scroll depth
    const trackScrollDepth = useCallback((depth: number) => {
        if (!trackScrollDepth) return;

        // Only track if this is a new maximum depth
        if (depth > maxScrollDepthRef.current) {
            maxScrollDepthRef.current = depth;

            try {
                console.log('Scroll depth tracked:', {
                    depth,
                    sessionId: getSessionId(),
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Failed to track scroll depth:', error);
            }
        }
    }, [trackScrollDepth, getSessionId]);

    // Auto-track scroll depth
    useEffect(() => {
        if (!trackScrollDepth) return;

        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            
            const scrollPercentage = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
            trackScrollDepth(scrollPercentage);
        };

        // Throttle scroll events
        let timeoutId: NodeJS.Timeout;
        const throttledHandleScroll = () => {
            if (timeoutId) return;
            timeoutId = setTimeout(() => {
                handleScroll();
                timeoutId = null;
            }, 100);
        };

        window.addEventListener('scroll', throttledHandleScroll);
        return () => window.removeEventListener('scroll', throttledHandleScroll);
    }, [trackScrollDepth, trackScrollDepth]);

    // Auto-track time on page
    useEffect(() => {
        if (!trackTimeOnPage) return;

        const handleBeforeUnload = () => {
            const timeOnPage = Date.now() - startTimeRef.current;
            const sessionId = getSessionId();

            try {
                console.log('Time on page tracked:', {
                    timeOnPage,
                    sessionId,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Failed to track time on page:', error);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [trackTimeOnPage, getSessionId]);

    // Initialize session on mount
    useEffect(() => {
        startSession();
        return () => {
            endSession();
        };
    }, [startSession, endSession]);

    return {
        trackView,
        trackEngagement,
        trackEvent,
        trackScrollDepth,
        startSession,
        endSession
    };
};

// Hook for tracking specific blog posts
export const useBlogPostAnalytics = (postId: string, options?: AnalyticsOptions) => {
    const analytics = useAnalytics(options);

    // Auto-track page view when postId changes
    useEffect(() => {
        if (postId) {
            analytics.trackView(postId);
        }
    }, [postId, analytics]);

    return analytics;
};

// Hook for A/B testing
export const useABTest = (testName: string, variants: string[]) => {
    const [selectedVariant, setSelectedVariant] = useState<string>('');

    useEffect(() => {
        // Get or assign variant
        const stored = sessionStorage.getItem(`ab_test_${testName}`);
        if (stored && variants.includes(stored)) {
            setSelectedVariant(stored);
        } else {
            const randomVariant = variants[Math.floor(Math.random() * variants.length)];
            setSelectedVariant(randomVariant);
            sessionStorage.setItem(`ab_test_${testName}`, randomVariant);
        }
    }, [testName, variants]);

    const trackConversion = useCallback((goal: string, value?: number) => {
        try {
            console.log('A/B Test conversion tracked:', {
                testName,
                variant: selectedVariant,
                goal,
                value,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to track A/B test conversion:', error);
        }
    }, [testName, selectedVariant]);

    return {
        variant: selectedVariant,
        trackConversion,
        isVariant: (variant: string) => selectedVariant === variant
    };
};
