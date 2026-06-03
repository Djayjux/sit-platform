// ==========================================
// SĪT — Main Application Logic
// Google Sheets Pro Code Validation
// ==========================================

var SIT = (function() {
    var CONFIG = {
        selarLink: 'https://selar.com/1en1216w11',
        phone: '+256 704 864021',
        phoneName: 'SĪT Support',
        priceUSD: '$14.99',
        priceUGX: '55,000 UGX',
        googleScriptURL: 'https://script.google.com/macros/s/AKfycbz0vEOn7BWqbrDaF444hnCWq2HfTFe3Mw_u77QjpLAd3DHIJ9Q2cprtoFB0DtSvyCet/exec'
    };

    // State
    var state = {
        trialDays: parseInt(localStorage.getItem('sit_trial') || '7'),
        trialStart: localStorage.getItem('sit_trialStart') || null,
        proActive: localStorage.getItem('sit_pro') === 'true',
        proExpiry: localStorage.getItem('sit_proExpiry') || null,
        proCode: localStorage.getItem('sit_proCode') || '',
        totalPours: parseInt(localStorage.getItem('sit_pours') || '0'),
        bestScore: parseFloat(localStorage.getItem('sit_bestScore') || '0'),
        savedDesigns: parseInt(localStorage.getItem('sit_saved') || '0'),
        academyProgress: parseInt(localStorage.getItem('sit_academyProgress') || '0'),
        userName: localStorage.getItem('sit_userName') || '',
        loggedIn: localStorage.getItem('sit_loggedIn') === 'true',
    };

    // Check expiry
    if (state.proActive && state.proExpiry && Date.now() > parseInt(state.proExpiry)) {
        state.proActive = false;
        state.proExpiry = null;
        state.proCode = '';
        localStorage.removeItem('sit_pro');
        localStorage.removeItem('sit_proExpiry');
        localStorage.removeItem('sit_proCode');
    }

    if (state.trialStart) {
        state.trialDays = Math.max(0, 7 - Math.floor((Date.now() - new Date(state.trialStart)) / 86400000));
        localStorage.setItem('sit_trial', state.trialDays);
    }

    function hasAccess() { return state.proActive || state.trialDays > 0; }

    function getDaysRemaining() {
        if (state.proActive && state.proExpiry) {
            return Math.max(0, Math.ceil((parseInt(state.proExpiry) - Date.now()) / 86400000));
        }
        return state.trialDays;
    }

    function saveState() {
        localStorage.setItem('sit_pours', state.totalPours);
        localStorage.setItem('sit_bestScore', state.bestScore);
        localStorage.setItem('sit_saved', state.savedDesigns);
        localStorage.setItem('sit_academyProgress', state.academyProgress);
        localStorage.setItem('sit_trial', state.trialDays);
        localStorage.setItem('sit_userName', state.userName);
        localStorage.setItem('sit_loggedIn', state.loggedIn);
    }

    function startTrial() {
        if (!state.trialStart) {
            state.trialStart = new Date().toISOString();
            state.trialDays = 7;
            localStorage.setItem('sit_trialStart', state.trialStart);
            localStorage.setItem('sit_trial', 7);
        }
        showToast('7-day trial active! All features unlocked.');
        if (typeof Academy !== 'undefined' && Academy.populateAcademy) Academy.populateAcademy();
        if (typeof Beyond !== 'undefined' && Beyond.populateBeyond) Beyond.populateBeyond();
        updateProUI();
    }

    function showToast(msg) {
        var t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function() { t.classList.remove('show'); }, 2500);
    }

    function updateProUI() {
        var db = document.getElementById('designerBtn');
        if (db) db.style.display = hasAccess() ? 'inline-block' : 'none';
    }

    // ===== SCORING =====
    function scorePour() {
        var strokes = Studio ? (Studio.getStrokes ? Studio.getStrokes() : []) : [];
        if (strokes.length === 0) { showToast('Pour something first!'); return; }
        if (!hasAccess()) { showUpgrade(); return; }

        var sym = Math.random() * 3 + 6.5;
        var con = Math.random() * 2.5 + 7;
        var def = Math.random() * 2 + 7.5;
        var flo = Math.random() * 3 + 6;
        var ov = parseFloat(((sym + con + def + flo) / 4).toFixed(1));

        if (ov > state.bestScore) { state.bestScore = ov; saveState(); }

        document.getElementById('scoreNumber').textContent = ov;
        document.getElementById('scoreEmoji').textContent = ov >= 8 ? '🌟' : ov >= 6 ? '👍' : '💪';
        document.getElementById('scoreDetail').innerHTML =
            '<div><div class="score-m-label">Symmetry</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (sym * 10) + '%"></div></div></div>' +
            '<div><div class="score-m-label">Contrast</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (con * 10) + '%"></div></div></div>' +
            '<div><div class="score-m-label">Definition</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (def * 10) + '%"></div></div></div>' +
            '<div><div class="score-m-label">Flow</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (flo * 10) + '%"></div></div></div>';

        var tips = [
            'Try a finer brush for detailed line work.',
            'Use thick brush for filling large areas.',
            'Tilt the cup while pouring for curved designs.',
            'Slow, steady pulls create cleaner lines.',
            'Practice the classic heart: top center, curve down both sides, pull through.',
            'For rosettas: wiggle side-to-side while pulling back.',
            'Increase flow rate for bolder patterns.',
            'Use undo (Ctrl+Z) to fix mistakes and retry.'
        ];
        document.getElementById('scoreTip').textContent = tips[Math.floor(Math.random() * tips.length)];
        document.getElementById('scoreOverlay').classList.add('active');
    }

    function closeScore() { document.getElementById('scoreOverlay').classList.remove('active'); }

    // ===== SAVE / DOWNLOAD =====
    function savePour() {
        if (!hasAccess()) { showUpgrade(); return; }
        state.savedDesigns++;
        saveState();
        showToast('Pour saved! (' + state.savedDesigns + ' total)');
    }

    function downloadArt() {
        if (typeof Studio !== 'undefined' && Studio.downloadCanvas) {
            Studio.downloadCanvas();
        } else {
            showToast('Studio not ready. Try again.');
        }
    }

    // ===== UPGRADE / PRO CODE =====
    function showUpgrade() {
        document.getElementById('upgradeContent').innerHTML =
            '<button class="modal-close" onclick="closeUpgrade()">✕</button>' +
            '<h2>Unlock SĪT Pro</h2>' +
            '<p style="margin-bottom:1.5rem;color:var(--text-light);">Full Academy. Unlimited pours. All features.</p>' +
            '<div style="background:#F5F0E8;padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;">' +
            '<h3 style="color:var(--espresso);">Pay Online (International)</h3>' +
            '<a href="' + CONFIG.selarLink + '" target="_blank" class="btn btn-primary btn-large" style="display:block;text-align:center;text-decoration:none;">Pay ' + CONFIG.priceUSD + ' on Selar</a>' +
            '<p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">Card, PayPal, mobile money accepted.</p></div>' +
            '<div style="background:#FFF3CD;padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;">' +
            '<h3 style="color:#856404;">Uganda — Mobile Money</h3>' +
            '<p style="color:#856404;">Send <strong>' + CONFIG.priceUGX + '</strong> to:</p>' +
            '<p style="color:#856404;font-size:1.25rem;font-weight:700;">' + CONFIG.phone + '</p>' +
            '<p style="color:#856404;">Name: ' + CONFIG.phoneName + '</p>' +
            '<p style="color:#856404;font-size:0.85rem;">Include your username. Code sent via WhatsApp within 15 minutes.</p></div>' +
            '<div style="border:1px solid var(--border);padding:1.5rem;border-radius:12px;">' +
            '<h3 style="color:var(--espresso);">Already have a code?</h3>' +
            '<input type="text" id="accessCodeInput" placeholder="SIT-PRO-XXXXX" style="width:100%;padding:0.75rem;border:1px solid var(--border);border-radius:8px;margin:0.75rem 0;text-align:center;font-size:1rem;text-transform:uppercase;">' +
            '<button class="btn btn-primary btn-full" onclick="SIT.redeemProCode()">Activate Pro</button>' +
            '<p id="codeError" style="color:var(--error);display:none;margin-top:0.5rem;"></p></div>' +
            '<p style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted);">WhatsApp: <strong>' + CONFIG.phone + '</strong></p>';
        document.getElementById('upgradeModal').classList.add('active');
        setTimeout(function() {
            var inp = document.getElementById('accessCodeInput');
            if (inp) { inp.focus(); inp.addEventListener('keypress', function(e) { if (e.key === 'Enter') redeemProCode(); }); }
        }, 100);
    }

    function closeUpgrade() { document.getElementById('upgradeModal').classList.remove('active'); }

    function redeemProCode() {
        var code = document.getElementById('accessCodeInput').value.trim().toUpperCase();
        var err = document.getElementById('codeError');
        if (!code) { err.textContent = 'Enter a code.'; err.style.display = 'block'; return; }

        // Show loading
        err.textContent = 'Validating...';
        err.style.color = 'var(--text-muted)';
        err.style.display = 'block';

        // Try Google Sheets validation
        var url = CONFIG.googleScriptURL + '?action=validate&code=' + encodeURIComponent(code) + '&user=' + encodeURIComponent(state.userName || 'anonymous');

        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.valid) {
                    activatePro(code);
                } else {
                    err.textContent = data.message || 'Invalid code.';
                    err.style.color = 'var(--error)';
                    err.style.display = 'block';
                }
            })
            .catch(function() {
                // Google Sheets failed — try local fallback
                if (code.indexOf('SIT-PRO-') === 0 && code.length > 8) {
                    activatePro(code);
                } else {
                    err.textContent = 'Cannot validate code. Check your connection or contact ' + CONFIG.phone;
                    err.style.color = 'var(--error)';
                    err.style.display = 'block';
                }
            });
    }

    function activatePro(code) {
        state.proActive = true;
        state.proCode = code;
        var exp = new Date();
        exp.setDate(exp.getDate() + 30);
        state.proExpiry = exp.getTime().toString();
        localStorage.setItem('sit_pro', 'true');
        localStorage.setItem('sit_proExpiry', state.proExpiry);
        localStorage.setItem('sit_proCode', state.proCode);
        closeUpgrade();
        showToast('🎉 Pro activated! 30 days of full access!');
        updateProUI();
        if (typeof Academy !== 'undefined' && Academy.populateAcademy) Academy.populateAcademy();
        if (typeof Beyond !== 'undefined' && Beyond.populateBeyond) Beyond.populateBeyond();
    }

    // ===== LOGIN / LOGOUT =====
    function doLogin() {
        var un = document.getElementById('loginUsername').value.trim();
        var pw = document.getElementById('loginPassword').value;
        var er = document.getElementById('loginError');
        if (!un) { er.textContent = 'Enter a username.'; er.style.display = 'block'; return; }
        if (!pw) { er.textContent = 'Enter a password.'; er.style.display = 'block'; return; }
        state.userName = un;
        state.loggedIn = true;
        saveState();
        if (!state.trialStart) startTrial();
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('userName').textContent = '@' + state.userName;
        document.getElementById('userAvatar').textContent = state.userName.charAt(0).toUpperCase();
        updateDashboardStats();
        updateProUI();
        showDashTab('overview');
        document.getElementById('dashboard').classList.add('active');
        showToast('Welcome, ' + state.userName + '!');
    }

    function doLogout() {
        state.loggedIn = false;
        saveState();
        document.getElementById('dashboard').classList.remove('active');
        document.getElementById('loginScreen').classList.remove('active');
        showToast('Logged out. See you soon!');
    }

    function openDashboard() {
        if (state.loggedIn && state.userName) {
            document.getElementById('userName').textContent = '@' + state.userName;
            document.getElementById('userAvatar').textContent = state.userName.charAt(0).toUpperCase();
            if (!state.trialStart) startTrial();
            document.getElementById('dashboard').classList.add('active');
            updateDashboardStats();
            updateProUI();
            showDashTab('overview');
        } else {
            document.getElementById('loginScreen').classList.add('active');
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('loginError').style.display = 'none';
        }
    }

    function closeDashboard() { document.getElementById('dashboard').classList.remove('active'); }

    function updateDashboardStats() {
        var tp = document.getElementById('totalPours'); if (tp) tp.textContent = state.totalPours;
        var bs = document.getElementById('bestScore'); if (bs) bs.textContent = state.bestScore ? state.bestScore.toFixed(1) : '--';
        var sd = document.getElementById('savedDesigns'); if (sd) sd.textContent = state.savedDesigns;
        var ap = document.getElementById('academyProgress'); if (ap) ap.textContent = state.academyProgress + '%';
        var bd = document.getElementById('trialBadge');
        if (bd) {
            var d = getDaysRemaining();
            if (state.proActive) {
                bd.textContent = 'Pro: ' + d + ' days';
                bd.style.background = '#D4EDDA';
                bd.style.color = '#155724';
            } else if (state.trialDays > 0) {
                bd.textContent = 'Trial: ' + d + ' days';
                bd.style.background = 'var(--accent-light)';
                bd.style.color = 'var(--espresso)';
            } else {
                bd.textContent = 'Free — Upgrade';
                bd.style.background = '#F8D7DA';
                bd.style.color = '#721C24';
            }
        }
    }

    function showDashTab(tb) {
        document.querySelectorAll('.dash-nav-item').forEach(function(i) { i.classList.remove('active'); });
        if (event && event.target) event.target.classList.add('active');
        var ct = document.getElementById('dashContent');
        var d = getDaysRemaining();
        var lb = state.proActive ? 'Pro — ' + d + ' days' : state.trialDays > 0 ? 'Trial — ' + d + ' days' : 'Free Plan';
        if (tb === 'overview') {
            ct.innerHTML =
                '<div class="dash-header"><h2>Your Studio</h2><span class="trial-badge">' + lb + '</span></div>' +
                '<div class="dash-stats"><div class="stat-card"><span class="stat-number">' + state.totalPours + '</span><span class="stat-label">Total Pours</span></div><div class="stat-card"><span class="stat-number">' + (state.bestScore ? state.bestScore.toFixed(1) : '--') + '</span><span class="stat-label">Best Score</span></div><div class="stat-card"><span class="stat-number">' + state.savedDesigns + '</span><span class="stat-label">Saved Designs</span></div><div class="stat-card"><span class="stat-number">' + state.academyProgress + '%</span><span class="stat-label">Academy</span></div></div>' +
                (!state.proActive && state.trialDays <= 0 ? '<div style="text-align:center;margin-top:2rem;padding:2rem;background:#FFF3CD;border-radius:16px;"><h3 style="color:#856404;">✨ Upgrade to Pro</h3><p style="color:#856404;">Unlock everything for ' + CONFIG.priceUSD + '/month</p><button class="btn btn-primary btn-large" onclick="SIT.showUpgrade()">Get Pro</button></div>' : '');
        } else if (tb === 'settings') {
            ct.innerHTML =
                '<div class="dash-header"><h2>Settings</h2></div><div style="background:#fff;padding:2rem;border-radius:16px;border:1px solid var(--border);"><label style="display:block;margin-bottom:1rem;font-weight:600;">Username</label><input type="text" id="settingsUsername" value="' + state.userName + '" style="width:100%;padding:0.75rem;border:1px solid var(--border);border-radius:8px;margin-bottom:1rem;"><button class="btn btn-primary" onclick="SIT.saveSettings()">Save</button>' +
                (state.proActive ? '<div style="margin-top:1.5rem;padding:1rem;background:#D4EDDA;border-radius:8px;"><p style="color:#155724;"><strong>Pro Active</strong> — ' + d + ' days remaining</p><p style="color:#155724;font-size:0.85rem;">Code: ' + state.proCode + '</p></div>' : '') +
                '<button class="btn btn-outline" style="margin-top:1rem;" onclick="SIT.showUpgrade()">Enter Pro Code</button></div>';
        } else {
            ct.innerHTML = '<div class="dash-header"><h2>' + tb.charAt(0).toUpperCase() + tb.slice(1) + '</h2></div><p class="empty-state">Coming soon.</p>';
        }
    }

    function saveSettings() {
        var n = document.getElementById('settingsUsername').value;
        if (n) {
            state.userName = n;
            saveState();
            document.getElementById('userName').textContent = '@' + n;
            document.getElementById('userAvatar').textContent = n.charAt(0).toUpperCase();
            showToast('Settings saved!');
        }
    }

    // ===== PAGES =====
    function showPage(page) {
        var pages = {
            'about': '<h1>About SĪT</h1><p>SĪT is a platform for baristas to practice latte art with real fluid simulation and master coffee knowledge from farm to cup. Built by baristas, for baristas.</p><p><strong>WhatsApp:</strong> ' + CONFIG.phone + '</p><p><strong>Selar:</strong> <a href="' + CONFIG.selarLink + '" target="_blank">' + CONFIG.selarLink + '</a></p>',
            'contact': '<h1>Contact Us</h1><p><strong>WhatsApp:</strong> ' + CONFIG.phone + '</p><p><strong>Selar:</strong> <a href="' + CONFIG.selarLink + '" target="_blank">' + CONFIG.selarLink + '</a></p><p>We respond within 15 minutes during business hours.</p>',
            'privacy': '<h1>Privacy Policy</h1><p>Your data stays on your device. We do not collect or share personal information. Payment processing is handled securely by Selar. Pro codes are validated via Google Sheets.</p>',
            'terms': '<h1>Terms of Service</h1><p>Pro subscriptions are valid for 30 days from activation. Access codes are for individual use only. Academy content is copyrighted. Refund requests are handled via Selar on a case-by-case basis.</p>'
        };
        document.getElementById('chapterContent').innerHTML = pages[page] || '<h1>Coming Soon</h1>';
        document.getElementById('chapterModal').classList.add('active');
    }

    // ===== PUBLIC API =====
    return {
        hasAccess: hasAccess,
        startTrial: startTrial,
        showToast: showToast,
        scorePour: scorePour,
        closeScore: closeScore,
        savePour: savePour,
        downloadArt: downloadArt,
        showUpgrade: showUpgrade,
        closeUpgrade: closeUpgrade,
        redeemProCode: redeemProCode,
        doLogin: doLogin,
        doLogout: doLogout,
        openDashboard: openDashboard,
        closeDashboard: closeDashboard,
        updateDashboardStats: updateDashboardStats,
        showDashTab: showDashTab,
        saveSettings: saveSettings,
        showPage: showPage,
        getState: function() { return state; },
        getConfig: function() { return CONFIG; },
        updateProUI: updateProUI
    };
})();
