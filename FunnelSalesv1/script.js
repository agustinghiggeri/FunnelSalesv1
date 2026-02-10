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
                    submittedAt: new Date().toISOString()
                };

                // Store current lead for TY page (only keep latest, don't accumulate)
                localStorage.setItem('gs_current_lead', JSON.stringify(leadData));

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
                    submittedAt: new Date().toISOString()
                };

                // Store current lead for TY page
                localStorage.setItem('gs_current_lead', JSON.stringify(auditData));

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

});
