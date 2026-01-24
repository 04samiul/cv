/* animations.js - Scroll Animations & Interactive Effects */

(function() {
    'use strict';
    
    /**
     * Animation Controller
     * Manages scroll-triggered animations and interactive UI effects
     */
    const AnimationController = {
        observerOptions: {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        },
        
        observers: {
            scroll: null,
            skills: null
        },
        
        /**
         * Initialize all animation systems
         */
        init: function() {
            this.setupScrollReveal();
            this.setupSkillBars();
            this.setupCurrentYear();
            this.setupSmoothScrolling();
        },
        
        /**
         * Scroll reveal animations for sections
         * Uses Intersection Observer API for performance
         */
        setupScrollReveal: function() {
            const revealElements = document.querySelectorAll(
                '.reveal-fade, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale'
            );
            
            if (revealElements.length === 0) return;
            
            this.observers.scroll = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Unobserve after animation to improve performance
                        this.observers.scroll.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);
            
            revealElements.forEach(el => {
                this.observers.scroll.observe(el);
            });
        },
        
        /**
         * Animated skill progress bars
         * Triggers animation when skills section becomes visible
         */
        setupSkillBars: function() {
            const skillsSection = document.querySelector('.skills-section');
            if (!skillsSection) return;
            
            const skillBars = skillsSection.querySelectorAll('.skill-progress');
            let hasAnimated = false;
            
            this.observers.skills = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasAnimated) {
                        hasAnimated = true;
                        this.animateSkillBars(skillBars);
                        this.observers.skills.unobserve(entry.target);
                    }
                });
            }, this.observerOptions);
            
            this.observers.skills.observe(skillsSection);
        },
        
        /**
         * Animate individual skill progress bars
         * @param {NodeList} skillBars - Collection of skill bar elements
         */
        animateSkillBars: function(skillBars) {
            skillBars.forEach((bar, index) => {
                const progress = bar.getAttribute('data-progress');
                
                setTimeout(() => {
                    bar.style.setProperty('--progress-width', `${progress}%`);
                    bar.classList.add('animated');
                }, index * 100);
            });
        },
        
        /**
         * Update footer year automatically
         */
        setupCurrentYear: function() {
            const yearElement = document.getElementById('currentYear');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        },
        
        /**
         * Smooth scrolling for anchor links
         */
        setupSmoothScrolling: function() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    
                    // Skip empty anchors or just '#'
                    if (!href || href === '#') return;
                    
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        
                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                });
            });
        },
        
        /**
         * Cleanup method for observers
         */
        destroy: function() {
            if (this.observers.scroll) {
                this.observers.scroll.disconnect();
            }
            if (this.observers.skills) {
                this.observers.skills.disconnect();
            }
        }
    };
    
    /**
     * Performance optimization: Use requestIdleCallback if available
     */
    const initWhenIdle = () => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => AnimationController.init(), { timeout: 2000 });
        } else {
            setTimeout(() => AnimationController.init(), 1);
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhenIdle);
    } else {
        initWhenIdle();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => AnimationController.destroy());
})();