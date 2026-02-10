/* ============================================
   GROWTH SYSTEMS — SALES FUNNEL JS
   Animations, interactions, counters
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Sanitize function (shared by both forms) ---
    function sanitize(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML.trim();
    }

    // --- UTM Parameter Tracking ---
    function getUTMParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_content: urlParams.get('utm_content') || '',
            utm_term: urlParams.get('utm_term') || '',
            referrer: document.referrer || ''
        };
    }

    // Store UTM parameters in sessionStorage when page loads
    const utmParams = getUTMParameters();
    if (utmParams.utm_source || utmParams.utm_medium || utmParams.utm_campaign) {
        sessionStorage.setItem('gs_utm_params', JSON.stringify(utmParams));
    } else {
        // Try to retrieve stored UTM params from session
        const storedUTM = sessionStorage.getItem('gs_utm_params');
        if (storedUTM) {
            Object.assign(utmParams, JSON.parse(storedUTM));
        }
    }

    // --- Intersection Observer for fade-up animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    // --- Animated counters ---
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        statsObserver.observe(statsBar);
    }

    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.dataset.target);
            const duration = 2000;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4); // ease out quart

                const current = target * eased;

                if (target === 8) {
                    stat.textContent = `$${current.toFixed(0)}M+`;
                } else if (target === 2.3) {
                    stat.textContent = `${current.toFixed(1)}x`;
                } else if (target === 12) {
                    stat.textContent = Math.round(current).toString();
                } else if (target === 34) {
                    stat.textContent = `${Math.round(current)}%`;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        });
    }

    // --- FAQ Accordion ---
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const item = button.parentElement;
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
            });

            // Open clicked (if it wasn't already open)
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Mobile Menu ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            mobileBtn.classList.toggle('active');
        });

        // Close on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileBtn.classList.remove('active');
            });
        });
    }

    // --- Nav scroll effect ---
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.padding = '10px 0';
        } else {
            nav.style.padding = '16px 0';
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip modal trigger links
        if (anchor.classList.contains('open-form-modal') || anchor.classList.contains('open-audit-modal')) return;

        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Parallax glow follow on hero ---
    const heroGlow = document.querySelector('.hero-glow');
    if (heroGlow) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 40;
            const y = (e.clientY / window.innerHeight - 0.5) * 40;
            heroGlow.style.transform = `translate(calc(-50% + ${x}px), ${y}px)`;
        }, { passive: true });
    }

    // --- Form Modal ---
    const modal = document.getElementById('formModal');
    const modalClose = document.getElementById('modalClose');
    const leadForm = document.getElementById('leadForm');

    if (modal) {
        // Open modal from any CTA with .open-form-modal
        document.querySelectorAll('.open-form-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        // Close modal
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        function openModal() {
            modal.classList.add('active');
            document.body.classList.add('modal-open');

            // Track modal open
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_modal_open', {
                    event_category: 'engagement',
                    event_label: 'Main Form Modal'
                });
            }
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead');
            }

            // Focus first input after animation
            setTimeout(() => {
                const firstInput = modal.querySelector('.form-input');
                if (firstInput) firstInput.focus();
            }, 350);
        }

        function closeModal() {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }

        // Chip selection (single select per group)
        document.querySelectorAll('.chip-group').forEach(group => {
            group.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    group.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-selected'));
                    chip.classList.add('chip-selected');
                });
            });
        });

        // --- Google Sheets Config ---
        // REPLACE this with your deployed Google Apps Script web app URL
        const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwBN52GMkKnxrTWBM62WPF_vkn22CGG9bKVMAAov605LGLcVCKG2wGKpPet0jPbwZaE/exec';

        // Form submission
        if (leadForm) {
            leadForm.addEventListener('submit', (e) => {
                e.preventDefault();

                // Honeypot check — if filled, silently reject (it's a bot)
                const honeypot = document.getElementById('websiteUrl');
                if (honeypot && honeypot.value) {
                    window.location.href = 'thank-you.html';
                    return;
                }

                // Clear previous errors
                leadForm.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));

                const email = document.getElementById('leadEmail');
                const brand = document.getElementById('leadBrand');
                const phone = document.getElementById('leadPhone');
                let valid = true;

                // Validate email
                if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                    email.classList.add('error');
                    valid = false;
                }

                // Validate brand
                if (!brand.value.trim()) {
                    brand.classList.add('error');
                    valid = false;
                }

                if (!valid) return;

                // Gather chip values
                const adSpendChip = document.querySelector('[data-name="adSpend"] .chip-selected');
                const bizTypeChip = document.querySelector('[data-name="businessType"] .chip-selected');

                const leadData = {
                    email: sanitize(email.value),
                    phone: sanitize(phone.value),
                    brand: sanitize(brand.value),
                    adSpend: adSpendChip ? adSpendChip.dataset.value : '',
                    businessType: bizTypeChip ? bizTypeChip.dataset.value : '',
                    submittedAt: new Date().toISOString(),
                    ...utmParams  // Include UTM parameters
                };

                // Store current lead for TY page (only keep latest, don't accumulate)
                localStorage.setItem('gs_current_lead', JSON.stringify(leadData));

                // Track form submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        event_category: 'conversion',
                        event_label: 'Main Form Submission',
                        value: leadData.adSpend
                    });
                }
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'SubmitApplication', {
                        content_name: 'Strategy Call Form',
                        content_category: 'Lead Form'
                    });
                }

                // Show loading state (safe DOM manipulation, no innerHTML)
                const submitBtn = leadForm.querySelector('.btn-submit');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';

                // Send to Google Sheets via hidden form + iframe
                // (fetch fails due to 302 redirect dropping POST body)
                if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL.startsWith('https://script.google.com/')) {
                    // Create hidden iframe to receive the form response
                    let iframe = document.getElementById('gs_hidden_iframe');
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.id = 'gs_hidden_iframe';
                        iframe.name = 'gs_hidden_iframe';
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                    }

                    // Build a hidden form with the lead data
                    const hiddenForm = document.createElement('form');
                    hiddenForm.method = 'POST';
                    hiddenForm.action = GOOGLE_SHEETS_URL;
                    hiddenForm.target = 'gs_hidden_iframe';

                    Object.entries(leadData).forEach(([key, value]) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value;
                        hiddenForm.appendChild(input);
                    });

                    document.body.appendChild(hiddenForm);
                    hiddenForm.submit();
                    hiddenForm.remove();

                    // Redirect after giving the form time to submit
                    setTimeout(() => {
                        window.location.href = 'thank-you.html';
                    }, 1000);
                } else {
                    // No Sheets URL configured — just redirect
                    setTimeout(() => {
                        window.location.href = 'thank-you.html';
                    }, 400);
                }
            });
        }
    }

    // --- Audit Form Modal (for audit.html page) ---
    const auditModal = document.getElementById('auditFormModal');
    const auditModalClose = document.getElementById('auditModalClose');
    const auditLeadForm = document.getElementById('auditLeadForm');

    if (auditModal) {
        // Open audit modal from any CTA with .open-audit-modal
        document.querySelectorAll('.open-audit-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openAuditModal();
            });
        });

        // Close modal
        if (auditModalClose) {
            auditModalClose.addEventListener('click', closeAuditModal);
        }

        // Close on backdrop click
        auditModal.querySelector('.modal-backdrop').addEventListener('click', closeAuditModal);

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && auditModal.classList.contains('active')) {
                closeAuditModal();
            }
        });

        function openAuditModal() {
            auditModal.classList.add('active');
            document.body.classList.add('modal-open');

            // Track audit modal open
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_modal_open', {
                    event_category: 'engagement',
                    event_label: 'Audit Form Modal'
                });
            }
            if (typeof fbq !== 'undefined') {
                fbq('track', 'Lead');
            }

            setTimeout(() => {
                const firstInput = auditModal.querySelector('.form-input');
                if (firstInput) firstInput.focus();
            }, 350);
        }

        function closeAuditModal() {
            auditModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }

        // Chip selection for audit form
        auditModal.querySelectorAll('.chip-group').forEach(group => {
            group.querySelectorAll('.chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    group.querySelectorAll('.chip').forEach(c => c.classList.remove('chip-selected'));
                    chip.classList.add('chip-selected');
                });
            });
        });

        // Audit form submission
        if (auditLeadForm) {
            auditLeadForm.addEventListener('submit', (e) => {
                e.preventDefault();

                // Honeypot check
                const honeypot = document.getElementById('auditWebsiteUrl');
                if (honeypot && honeypot.value) {
                    window.location.href = 'thank-you.html';
                    return;
                }

                // Clear previous errors
                auditLeadForm.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));

                const email = document.getElementById('auditEmail');
                const brand = document.getElementById('auditBrand');
                const phone = document.getElementById('auditPhone');
                const siteUrl = document.getElementById('auditSiteUrl');
                let valid = true;

                // Validate email
                if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                    email.classList.add('error');
                    valid = false;
                }

                // Validate brand
                if (!brand.value.trim()) {
                    brand.classList.add('error');
                    valid = false;
                }

                if (!valid) return;

                // Gather chip values
                const platformChip = document.querySelector('[data-name="auditPlatform"] .chip-selected');
                const adSpendChip = document.querySelector('[data-name="auditAdSpend"] .chip-selected');
                const bizTypeChip = document.querySelector('[data-name="auditBusinessType"] .chip-selected');

                const auditData = {
                    sheetName: 'audit',  // Target the "audit" tab
                    email: sanitize(email.value),
                    phone: sanitize(phone.value),
                    brand: sanitize(brand.value),
                    siteUrl: sanitize(siteUrl.value),
                    platform: platformChip ? platformChip.dataset.value : '',
                    adSpend: adSpendChip ? adSpendChip.dataset.value : '',
                    businessType: bizTypeChip ? bizTypeChip.dataset.value : '',
                    submittedAt: new Date().toISOString(),
                    ...utmParams  // Include UTM parameters
                };

                // Store current lead for TY page
                localStorage.setItem('gs_current_lead', JSON.stringify(auditData));

                // Track audit form submission
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'generate_lead', {
                        event_category: 'conversion',
                        event_label: 'Audit Form Submission',
                        value: auditData.adSpend
                    });
                }
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'SubmitApplication', {
                        content_name: 'Free Audit Form',
                        content_category: 'Lead Form'
                    });
                }

                // Show loading state
                const submitBtn = auditLeadForm.querySelector('.btn-submit');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';

                // Send to Google Sheets
                const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwBN52GMkKnxrTWBM62WPF_vkn22CGG9bKVMAAov605LGLcVCKG2wGKpPet0jPbwZaE/exec';

                if (GOOGLE_SHEETS_URL && GOOGLE_SHEETS_URL.startsWith('https://script.google.com/')) {
                    // Create hidden iframe
                    let iframe = document.getElementById('gs_hidden_iframe_audit');
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.id = 'gs_hidden_iframe_audit';
                        iframe.name = 'gs_hidden_iframe_audit';
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                    }

                    // Build hidden form
                    const hiddenForm = document.createElement('form');
                    hiddenForm.method = 'POST';
                    hiddenForm.action = GOOGLE_SHEETS_URL;
                    hiddenForm.target = 'gs_hidden_iframe_audit';

                    Object.entries(auditData).forEach(([key, value]) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = value;
                        hiddenForm.appendChild(input);
                    });

                    document.body.appendChild(hiddenForm);
                    hiddenForm.submit();
                    hiddenForm.remove();

                    // Redirect after submission
                    setTimeout(() => {
                        window.location.href = 'thank-you.html';
                    }, 1000);
                } else {
                    setTimeout(() => {
                        window.location.href = 'thank-you.html';
                    }, 400);
                }
            });
        }
    }

    // --- Audit Page Stats Counter (different targets) ---
    const auditStatsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateAuditStats();
                auditStatsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const auditStatsBar = document.querySelector('.audit-page .stats-bar');
    if (auditStatsBar) {
        auditStatsObserver.observe(auditStatsBar);
    }

    function animateAuditStats() {
        const auditStats = document.querySelectorAll('.audit-stat');
        auditStats.forEach(stat => {
            const target = parseFloat(stat.dataset.target);
            const duration = 2000;
            const startTime = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 4);

                const current = target * eased;

                if (target === 8) {
                    stat.textContent = `$${current.toFixed(0)}M+`;
                } else if (target === 23) {
                    stat.textContent = `${Math.round(current)}%`;
                } else if (target === 48) {
                    stat.textContent = Math.round(current).toString();
                } else if (target === 100) {
                    stat.textContent = `${Math.round(current)}%`;
                }

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }

            requestAnimationFrame(update);
        });
    }

    // --- Mobile Sticky CTA Bar ---
    const mobileStickyCta = document.getElementById('mobileStickyCta');

    if (mobileStickyCta) {
        let stickyShown = false;

        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;

            // Show after scrolling down 400px
            if (scrollPosition > 400 && !stickyShown) {
                mobileStickyCta.classList.add('show');
                stickyShown = true;

                // Track sticky CTA shown
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'mobile_sticky_cta_shown', {
                        event_category: 'engagement',
                        event_label: 'Mobile Sticky CTA'
                    });
                }
            } else if (scrollPosition <= 200 && stickyShown) {
                // Hide when scrolled back to top
                mobileStickyCta.classList.remove('show');
                stickyShown = false;
            }
        }, { passive: true });
    }

    // --- Urgency Countdown (Spots Left) ---
    const urgencyBanner = document.getElementById('urgencyBanner');
    const spotsLeftEl = document.getElementById('spotsLeft');

    if (spotsLeftEl) {
        const isAuditPage = document.body.classList.contains('audit-page');
        const today = new Date();
        const dayOfMonth = today.getDate();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        // Calculate spots based on day of month
        // Main page: starts with 5 spots, audit page: starts with 10 spots
        const maxSpots = isAuditPage ? 10 : 5;
        const spotsUsed = Math.floor((dayOfMonth / daysInMonth) * (maxSpots - 1));
        const spotsRemaining = Math.max(1, maxSpots - spotsUsed); // Never go below 1

        spotsLeftEl.textContent = spotsRemaining;

        // Update urgency banner color when very low
        if (spotsRemaining <= 2) {
            urgencyBanner.style.animation = 'pulse-urgency 1.5s ease-in-out infinite';
        }
    }

    // --- Social Proof Notifications ---
    const socialProof = document.getElementById('socialProof');

    if (socialProof) {
        // Determine which page we're on
        const isAuditPage = document.body.classList.contains('audit-page');

        // Different data for main page vs audit page
        const mainPageNotifications = [
            { name: 'Sarah M.', action: 'just booked a strategy call', time: '2 minutes ago' },
            { name: 'David K.', action: 'just booked a strategy call', time: '5 minutes ago' },
            { name: 'Jessica T.', action: 'just booked a strategy call', time: '8 minutes ago' },
            { name: 'Marcus P.', action: 'just booked a strategy call', time: '12 minutes ago' },
            { name: 'Rachel L.', action: 'just booked a strategy call', time: '18 minutes ago' },
            { name: 'Brandon W.', action: 'just booked a strategy call', time: '23 minutes ago' },
            { name: 'Emily C.', action: 'just booked a strategy call', time: '31 minutes ago' }
        ];

        const auditPageNotifications = [
            { name: 'Michael R.', action: 'just claimed their free audit', time: '3 minutes ago' },
            { name: 'Amanda S.', action: 'just claimed their free audit', time: '7 minutes ago' },
            { name: 'Tyler H.', action: 'just claimed their free audit', time: '11 minutes ago' },
            { name: 'Natalie D.', action: 'just claimed their free audit', time: '15 minutes ago' },
            { name: 'Connor B.', action: 'just claimed their free audit', time: '22 minutes ago' },
            { name: 'Sophia V.', action: 'just claimed their free audit', time: '28 minutes ago' },
            { name: 'Jordan F.', action: 'just claimed their free audit', time: '35 minutes ago' }
        ];

        const notifications = isAuditPage ? auditPageNotifications : mainPageNotifications;
        let currentIndex = 0;

        function showSocialProof() {
            const notification = notifications[currentIndex];

            // Update content
            document.getElementById('socialProofName').textContent = notification.name;
            document.getElementById('socialProofAction').textContent = notification.action;
            document.getElementById('socialProofTime').textContent = notification.time;

            // Show notification
            socialProof.classList.add('show');

            // Track notification shown
            if (typeof gtag !== 'undefined') {
                gtag('event', 'social_proof_shown', {
                    event_category: 'engagement',
                    event_label: notification.name
                });
            }

            // Hide after 6 seconds
            setTimeout(() => {
                socialProof.classList.remove('show');
            }, 6000);

            // Move to next notification
            currentIndex = (currentIndex + 1) % notifications.length;
        }

        // Show first notification after 8 seconds
        setTimeout(() => {
            showSocialProof();

            // Then show new notifications every 20-30 seconds
            setInterval(() => {
                showSocialProof();
            }, Math.random() * 10000 + 20000); // Random interval between 20-30 seconds
        }, 8000);
    }

    // --- Exit Intent Modal ---
    const exitIntentModal = document.getElementById('exitIntentModal');
    const exitIntentClose = document.getElementById('exitIntentClose');
    const exitIntentCta = document.querySelector('.exit-intent-cta');
    const exitIntentCtaAudit = document.querySelector('.exit-intent-cta-audit');
    const exitIntentDismiss = document.querySelector('.exit-intent-dismiss');

    if (exitIntentModal) {
        let exitIntentShown = sessionStorage.getItem('exitIntentShown');
        let exitIntentTriggered = false;

        // Detect mouse leaving from top of viewport
        document.addEventListener('mouseleave', (e) => {
            // Only trigger if mouse leaves from top (y <= 10)
            if (e.clientY <= 10 && !exitIntentShown && !exitIntentTriggered) {
                exitIntentTriggered = true;

                // Small delay to feel less aggressive
                setTimeout(() => {
                    showExitIntent();
                }, 200);
            }
        });

        function showExitIntent() {
            exitIntentModal.classList.add('active');
            sessionStorage.setItem('exitIntentShown', 'true');
            exitIntentShown = true;

            // Track exit intent popup shown
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exit_intent_shown', {
                    event_category: 'engagement',
                    event_label: 'Exit Intent Popup'
                });
            }
            if (typeof fbq !== 'undefined') {
                fbq('trackCustom', 'ExitIntentShown');
            }
        }

        function hideExitIntent() {
            exitIntentModal.classList.remove('active');
        }

        // Close button
        if (exitIntentClose) {
            exitIntentClose.addEventListener('click', hideExitIntent);
        }

        // Backdrop click
        const exitBackdrop = exitIntentModal.querySelector('.exit-intent-backdrop');
        if (exitBackdrop) {
            exitBackdrop.addEventListener('click', hideExitIntent);
        }

        // CTA button - opens main form modal
        if (exitIntentCta) {
            exitIntentCta.addEventListener('click', () => {
                hideExitIntent();
                // Open the main form modal
                if (modal) {
                    setTimeout(() => {
                        modal.classList.add('active');
                        document.body.classList.add('modal-open');
                        setTimeout(() => {
                            const firstInput = modal.querySelector('.form-input');
                            if (firstInput) firstInput.focus();
                        }, 350);
                    }, 300);
                }
            });
        }

        // CTA button for audit page - opens audit form modal
        if (exitIntentCtaAudit) {
            exitIntentCtaAudit.addEventListener('click', () => {
                hideExitIntent();
                // Open the audit form modal
                if (auditModal) {
                    setTimeout(() => {
                        auditModal.classList.add('active');
                        document.body.classList.add('modal-open');
                        setTimeout(() => {
                            const firstInput = auditModal.querySelector('.form-input');
                            if (firstInput) firstInput.focus();
                        }, 350);
                    }, 300);
                }
            });
        }

        // Dismiss button
        if (exitIntentDismiss) {
            exitIntentDismiss.addEventListener('click', hideExitIntent);
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && exitIntentModal.classList.contains('active')) {
                hideExitIntent();
            }
        });
    }

});
