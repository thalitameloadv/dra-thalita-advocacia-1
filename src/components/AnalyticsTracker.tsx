import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBlogPostAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsTrackerProps {
    postId?: string;
    trackEngagement?: boolean;
    trackScrollDepth?: boolean;
    trackTimeOnPage?: boolean;
}

const AnalyticsTracker = ({ 
    postId, 
    trackEngagement = true, 
    trackScrollDepth = true, 
    trackTimeOnPage = true 
}: AnalyticsTrackerProps) => {
    const { slug } = useParams<{ slug: string }>();
    const analytics = useBlogPostAnalytics(postId || '', {
        trackEngagement,
        trackScrollDepth,
        trackTimeOnPage
    });

    // Track engagement events
    useEffect(() => {
        if (!trackEngagement) return;

        // Track like button clicks
        const handleLikeClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const likeButton = target.closest('[data-analytics-like]');
            
            if (likeButton && postId) {
                analytics.trackEngagement(postId, 'like', {
                    element: 'like_button',
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track comment submissions
        const handleCommentSubmit = (event: Event) => {
            const target = event.target as HTMLElement;
            const commentForm = target.closest('[data-analytics-comment]');
            
            if (commentForm && postId) {
                analytics.trackEngagement(postId, 'comment', {
                    element: 'comment_form',
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track share button clicks
        const handleShareClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const shareButton = target.closest('[data-analytics-share]');
            
            if (shareButton && postId) {
                const platform = shareButton.getAttribute('data-platform') || 'unknown';
                analytics.trackEngagement(postId, 'share', {
                    platform,
                    element: 'share_button',
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track bookmark clicks
        const handleBookmarkClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const bookmarkButton = target.closest('[data-analytics-bookmark]');
            
            if (bookmarkButton && postId) {
                analytics.trackEngagement(postId, 'bookmark', {
                    element: 'bookmark_button',
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Add event listeners
        document.addEventListener('click', handleLikeClick);
        document.addEventListener('submit', handleCommentSubmit);
        document.addEventListener('click', handleShareClick);
        document.addEventListener('click', handleBookmarkClick);

        return () => {
            document.removeEventListener('click', handleLikeClick);
            document.removeEventListener('submit', handleCommentSubmit);
            document.removeEventListener('click', handleShareClick);
            document.removeEventListener('click', handleBookmarkClick);
        };
    }, [analytics, postId, trackEngagement]);

    // Track custom events
    useEffect(() => {
        // Track search queries
        const handleSearch = (event: Event) => {
            const target = event.target as HTMLInputElement;
            const searchInput = target.closest('[data-analytics-search]');
            
            if (searchInput && target.value.trim()) {
                analytics.trackEvent('search_performed', {
                    query: target.value.trim(),
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track newsletter signups
        const handleNewsletterSignup = (event: Event) => {
            const target = event.target as HTMLElement;
            const newsletterForm = target.closest('[data-analytics-newsletter]');
            
            if (newsletterForm) {
                analytics.trackEvent('newsletter_signup', {
                    source: 'blog_page',
                    postId: postId || slug,
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track link clicks
        const handleLinkClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const link = target.closest('a[href]');
            
            if (link) {
                const href = link.getAttribute('href');
                const linkText = link.textContent?.trim();
                
                analytics.trackEvent('link_clicked', {
                    href,
                    linkText,
                    postId: postId || slug,
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Add event listeners
        document.addEventListener('input', handleSearch);
        document.addEventListener('submit', handleNewsletterSignup);
        document.addEventListener('click', handleLinkClick);

        return () => {
            document.removeEventListener('input', handleSearch);
            document.removeEventListener('submit', handleNewsletterSignup);
            document.removeEventListener('click', handleLinkClick);
        };
    }, [analytics, postId, slug]);

    // Track page performance
    useEffect(() => {
        // Track page load time
        const trackPageLoad = () => {
            if (window.performance && window.performance.timing) {
                const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                
                analytics.trackEvent('page_load_completed', {
                    loadTime,
                    postId: postId || slug,
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track Core Web Vitals
        const trackWebVitals = () => {
            if ('web-vitals' in window) {
                // This would require the web-vitals library
                // For now, we'll track basic performance metrics
                analytics.trackEvent('web_vitals_measured', {
                    postId: postId || slug,
                    timestamp: new Date().toISOString()
                });
            }
        };

        if (document.readyState === 'complete') {
            trackPageLoad();
            trackWebVitals();
        } else {
            window.addEventListener('load', trackPageLoad);
            window.addEventListener('load', trackWebVitals);
        }

        return () => {
            window.removeEventListener('load', trackPageLoad);
            window.removeEventListener('load', trackWebVitals);
        };
    }, [analytics, postId, slug]);

    // Track user interactions
    useEffect(() => {
        // Track form interactions
        const handleFormInteraction = (event: Event) => {
            const target = event.target as HTMLElement;
            const form = target.closest('form');
            
            if (form) {
                analytics.trackEvent('form_interaction', {
                    formId: form.id || 'unknown',
                    formAction: form.action || 'unknown',
                    postId: postId || slug,
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Track video plays (if any)
        const handleVideoPlay = (event: Event) => {
            const target = event.target as HTMLVideoElement;
            
            analytics.trackEvent('video_play', {
                videoSrc: target.src || 'unknown',
                postId: postId || slug,
                timestamp: new Date().toISOString()
            });
        };

        // Track image clicks
        const handleImageClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const image = target.closest('img');
            
            if (image) {
                analytics.trackEvent('image_clicked', {
                    imageSrc: image.src || 'unknown',
                    imageAlt: image.alt || '',
                    postId: postId || slug,
                    timestamp: new Date().toISOString()
                });
            }
        };

        // Add event listeners
        document.addEventListener('focus', handleFormInteraction);
        document.addEventListener('play', handleVideoPlay);
        document.addEventListener('click', handleImageClick);

        return () => {
            document.removeEventListener('focus', handleFormInteraction);
            document.removeEventListener('play', handleVideoPlay);
            document.removeEventListener('click', handleImageClick);
        };
    }, [analytics, postId, slug]);

    // This component doesn't render anything visible
    return null;
};

export default AnalyticsTracker;
