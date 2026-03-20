/* =========================================
   Sizzurp Soda Lab — Main JavaScript
   ========================================= */

(function () {
    'use strict';

    /* ----- Mobile Navigation ----- */
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    let overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openNav() {
        navToggle.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        const firstLink = navMenu.querySelector('.nav__link');
        if (firstLink) firstLink.focus();
    }

    function closeNav() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', function () {
        const isOpen = this.getAttribute('aria-expanded') === 'true';
        isOpen ? closeNav() : openNav();
    });

    overlay.addEventListener('click', closeNav);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
            closeNav();
            navToggle.focus();
        }
    });

    navMenu.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) closeNav();
        });
    });

    var desktopMq = window.matchMedia('(min-width: 769px)');
    function closeNavIfDesktop() {
        if (desktopMq.matches && navMenu.classList.contains('open')) {
            closeNav();
        }
    }
    if (desktopMq.addEventListener) {
        desktopMq.addEventListener('change', closeNavIfDesktop);
    } else {
        desktopMq.addListener(closeNavIfDesktop);
    }

    /* ----- Sticky Header ----- */
    const header = document.querySelector('.site-header');

    function handleScroll() {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* ----- Smooth Scroll for Anchor Links ----- */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const headerHeight = header.offsetHeight;
            const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    });

    /* ----- Menu Tab System ----- */
    const tabs = document.querySelectorAll('.menu__tab');
    const panels = document.querySelectorAll('.menu__panel');

    function revealCardsInPanel(panel) {
        var cards = panel.querySelectorAll('.drink-card');
        cards.forEach(function (card, i) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            setTimeout(function () {
                card.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 60 * i);
        });
    }

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) {
                t.classList.remove('menu__tab--active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });

            panels.forEach(function (p) {
                p.classList.remove('menu__panel--active');
                p.setAttribute('hidden', '');
            });

            this.classList.add('menu__tab--active');
            this.setAttribute('aria-selected', 'true');
            this.removeAttribute('tabindex');

            var panel = document.getElementById(this.getAttribute('aria-controls'));
            if (panel) {
                panel.classList.add('menu__panel--active');
                panel.removeAttribute('hidden');
                revealCardsInPanel(panel);
            }
        });

        tab.addEventListener('keydown', function (e) {
            var tabArray = Array.from(tabs);
            var index = tabArray.indexOf(this);
            var newIndex;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = (index + 1) % tabArray.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = (index - 1 + tabArray.length) % tabArray.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                newIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                newIndex = tabArray.length - 1;
            }

            if (newIndex !== undefined) {
                tabArray[newIndex].click();
                tabArray[newIndex].focus();
            }
        });
    });

    /* ----- Hero: video only on mobile; image on tablet/desktop; static if reduced motion ----- */
    (function initHeroVideo() {
        var wrap = document.querySelector('.hero__bg');
        var vid = document.querySelector('.hero__bg-video');
        if (!wrap || !vid) return;

        var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
        var mobileMq = window.matchMedia('(max-width: 767px)');

        function apply() {
            var reduce = reduceMq.matches;
            var isMobile = mobileMq.matches;

            if (reduce) {
                wrap.classList.add('hero__bg--static');
                vid.removeAttribute('autoplay');
                vid.preload = 'none';
                if (typeof vid.pause === 'function') vid.pause();
                return;
            }

            wrap.classList.remove('hero__bg--static');

            if (isMobile) {
                vid.preload = 'metadata';
                vid.setAttribute('autoplay', '');
                if (typeof vid.play === 'function') {
                    var playTry = vid.play();
                    if (playTry && typeof playTry.catch === 'function') {
                        playTry.catch(function () {});
                    }
                }
            } else {
                vid.removeAttribute('autoplay');
                vid.preload = 'none';
                if (typeof vid.pause === 'function') vid.pause();
            }

            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        }

        apply();

        if (reduceMq.addEventListener) {
            reduceMq.addEventListener('change', apply);
            mobileMq.addEventListener('change', apply);
        } else {
            reduceMq.addListener(apply);
            mobileMq.addListener(apply);
        }
    })();

    /* ----- Scroll Reveal (Intersection Observer) ----- */
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        var animatedElements = document.querySelectorAll('[data-animate]');

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        document.querySelectorAll('[data-animate]').forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    /* ----- GSAP Parallax & Enhanced Animations ----- */
    function initGSAP() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        /* Hero parallax: video on mobile, image on tablet/desktop (skip if reduced-motion static) */
        var heroWrap = document.querySelector('.hero__bg');

        ScrollTrigger.matchMedia({
            '(min-width: 768px)': function () {
                var img = document.querySelector('.hero__bg-img');
                if (!img || !heroWrap || heroWrap.classList.contains('hero__bg--static')) return;
                gsap.to(img, {
                    yPercent: 25,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            },
            '(max-width: 767px)': function () {
                var v = document.querySelector('.hero__bg-video');
                if (!v || !heroWrap || heroWrap.classList.contains('hero__bg--static')) return;
                gsap.to(v, {
                    yPercent: 25,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.hero',
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1
                    }
                });
            }
        });

        /* Parallax break image */
        var parallaxImg = document.querySelector('.parallax-break__img');
        if (parallaxImg) {
            gsap.to(parallaxImg, {
                yPercent: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.parallax-break',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }

        /* Gallery horizontal auto-scroll */
        var galleryTrack = document.querySelector('.gallery__track');
        if (galleryTrack) {
            var scrollDistance = galleryTrack.scrollWidth - window.innerWidth;
            gsap.to(galleryTrack, {
                x: -Math.min(scrollDistance, galleryTrack.scrollWidth * 0.35),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.gallery',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1
                }
            });
        }

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGSAP);
    } else {
        initGSAP();
    }

    /* ----- Choose Your Dose: scroll-in (no GSAP — avoids stuck invisible cards + fills cups) ----- */
    var sizesSection = document.querySelector('#sizes');
    if (sizesSection) {
        function activateSizes() {
            sizesSection.classList.add('sizes--inview');
        }

        if (prefersReducedMotion) {
            activateSizes();
        } else {
            var sizesIo = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        activateSizes();
                        sizesIo.unobserve(sizesSection);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px 10% 0px'
            });
            sizesIo.observe(sizesSection);
        }
    }

    /* ----- Floating Bubbles Canvas ----- */
    var canvas = document.getElementById('bubbles');
    if (canvas && !prefersReducedMotion) {
        var ctx = canvas.getContext('2d');
        var bubblesArr = [];
        var animFrame;
        var MAX_BUBBLES = 55;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createBubble() {
            var isBig = Math.random() < 0.2;
            return {
                x: Math.random() * canvas.width,
                y: canvas.height + Math.random() * 200,
                r: isBig ? (Math.random() * 8 + 5) : (Math.random() * 4 + 1.5),
                speed: isBig ? (Math.random() * 0.3 + 0.15) : (Math.random() * 0.7 + 0.3),
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.025 + 0.008,
                wobbleAmp: Math.random() * 0.8 + 0.3,
                opacity: isBig ? (Math.random() * 0.15 + 0.06) : (Math.random() * 0.5 + 0.15),
                hue: Math.random() < 0.5 ? '142, 80, 159' : '192, 148, 196'
            };
        }

        function init() {
            resize();
            bubblesArr = [];
            for (var i = 0; i < MAX_BUBBLES; i++) {
                var b = createBubble();
                b.y = Math.random() * canvas.height;
                bubblesArr.push(b);
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < bubblesArr.length; i++) {
                var b = bubblesArr[i];
                b.y -= b.speed;
                b.wobble += b.wobbleSpeed;
                b.x += Math.sin(b.wobble) * b.wobbleAmp;

                if (b.y < -30) {
                    bubblesArr[i] = createBubble();
                    continue;
                }

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

                if (b.r > 5) {
                    var grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
                    grad.addColorStop(0, 'rgba(' + b.hue + ', ' + (b.opacity * 1.5) + ')');
                    grad.addColorStop(0.6, 'rgba(' + b.hue + ', ' + b.opacity + ')');
                    grad.addColorStop(1, 'rgba(' + b.hue + ', 0)');
                    ctx.fillStyle = grad;
                } else {
                    ctx.fillStyle = 'rgba(' + b.hue + ', ' + b.opacity + ')';
                }

                ctx.fill();
            }

            animFrame = requestAnimationFrame(draw);
        }

        window.addEventListener('resize', resize);
        init();
        draw();

        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                cancelAnimationFrame(animFrame);
            } else {
                draw();
            }
        });
    }

    /* ----- Gallery Drag Scroll ----- */
    var galleryScroll = document.querySelector('.gallery__scroll');
    if (galleryScroll) {
        var isDown = false;
        var startX;
        var scrollLeft;

        galleryScroll.addEventListener('mousedown', function (e) {
            isDown = true;
            startX = e.pageX - this.offsetLeft;
            scrollLeft = this.scrollLeft;
        });

        galleryScroll.addEventListener('mouseleave', function () { isDown = false; });
        galleryScroll.addEventListener('mouseup', function () { isDown = false; });

        galleryScroll.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - this.offsetLeft;
            this.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
    }

    /* ----- Counter animation for stats ----- */
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        var countObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseInt(el.getAttribute('data-count'), 10);
                var suffix = el.getAttribute('data-suffix') || '';
                var duration = 2000;
                var start = 0;
                var startTime = null;

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    var progress = Math.min((timestamp - startTime) / duration, 1);
                    var eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                }

                requestAnimationFrame(step);
                countObserver.unobserve(el);
            });
        }, { threshold: 0.5 });

        counters.forEach(function (c) { countObserver.observe(c); });
    }
})();
