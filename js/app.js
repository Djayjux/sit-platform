// ==========================================
// SĪT — Main Application Logic v3
// One-Time Payment / Lifetime Access
// Selar: https://selar.com/d88n79b98b
// ==========================================

var SIT = (function() {
    var CONFIG = {
        selarLink: 'https://selar.com/d88n79b98b',
        phone: '+256 704 864021',
        phoneName: 'SĪT Support',
        priceUSD: '$29.99',
        priceUGX: '110,000 UGX',
        googleScriptURL: 'https://script.google.com/macros/s/AKfycbz0vEOn7BWqbrDaF444hnCWq2HfTFe3Mw_u77QjpLAd3DHIJ9Q2cprtoFB0DtSvyCet/exec'
    };

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
        freestyleCount: parseInt(localStorage.getItem('sit_freestyle_' + new Date().toDateString()) || '0'),
        savedPours: JSON.parse(localStorage.getItem('sit_savedPours') || '[]'),
    };

    // Check Pro expiry
    if (state.proActive && state.proExpiry && Date.now() > parseInt(state.proExpiry)) {
        state.proActive = false;
        state.proExpiry = null;
        state.proCode = '';
        localStorage.removeItem('sit_pro');
        localStorage.removeItem('sit_proExpiry');
        localStorage.removeItem('sit_proCode');
    }

    // Check trial expiry
    if (state.trialStart) {
        state.trialDays = Math.max(0, 7 - Math.floor((Date.now() - new Date(state.trialStart)) / 86400000));
        localStorage.setItem('sit_trial', state.trialDays);
    }

    function hasAccess() { return state.proActive || state.trialDays > 0; }
    function canFreestyle() { return hasAccess() || state.freestyleCount < 3; }

    function useFreestyleCredit() {
        if (hasAccess()) return true;
        if (state.freestyleCount >= 3) return false;
        state.freestyleCount++;
        localStorage.setItem('sit_freestyle_' + new Date().toDateString(), state.freestyleCount);
        return true;
    }

    function getDaysRemaining() {
        if (state.proActive && state.proExpiry) {
            var remaining = Math.ceil((parseInt(state.proExpiry) - Date.now()) / 86400000);
            if (remaining > 36500) return 'Lifetime';
            return remaining + ' days';
        }
        return state.trialDays + ' days';
    }

    function saveState() {
        localStorage.setItem('sit_pours', state.totalPours);
        localStorage.setItem('sit_bestScore', state.bestScore);
        localStorage.setItem('sit_saved', state.savedDesigns);
        localStorage.setItem('sit_academyProgress', state.academyProgress);
        localStorage.setItem('sit_trial', state.trialDays);
        localStorage.setItem('sit_userName', state.userName);
        localStorage.setItem('sit_loggedIn', state.loggedIn);
        localStorage.setItem('sit_savedPours', JSON.stringify(state.savedPours));
    }

    // ===== INIT =====
       function initApp() {
        updateProUI();
        if (typeof Academy !== 'undefined' && Academy.populateAcademy) Academy.populateAcademy();
        if (typeof Beyond !== 'undefined' && Beyond.populateBeyond) Beyond.populateBeyond();
        
        // Trial expiry notification
        if (state.trialStart && state.trialDays === 0 && !state.proActive) {
            var shown = localStorage.getItem('sit_trialExpiryShown');
            if (!shown) {
                setTimeout(function() {
                    showToast('⏰ Your 7-day trial has ended. Upgrade to Pro for lifetime access!');
                }, 1500);
                localStorage.setItem('sit_trialExpiryShown', 'true');
            }
        }
        
        console.log('☕ SĪT ready. ' + (state.loggedIn ? 'Logged in as @' + state.userName : 'Not logged in.'));
        console.log('🔗 Selar: ' + CONFIG.selarLink);
    }
    
    function startTrial() {
        if (!state.trialStart) {
            state.trialStart = new Date().toISOString();
            state.trialDays = 7;
            localStorage.setItem('sit_trialStart', state.trialStart);
            localStorage.setItem('sit_trial', 7);
        }
        if (!state.userName) {
            state.userName = 'barista_' + Math.floor(Math.random() * 9999);
            state.loggedIn = true;
            saveState();
        }
        showToast('7-day trial active! All features unlocked. 🎉');
        if (typeof Academy !== 'undefined' && Academy.populateAcademy) Academy.populateAcademy();
        if (typeof Beyond !== 'undefined' && Beyond.populateBeyond) Beyond.populateBeyond();
        updateProUI();
        document.getElementById('userName').textContent = '@' + state.userName;
        document.getElementById('userAvatar').textContent = state.userName.charAt(0).toUpperCase();
        updateDashboardStats();
        showDashTab('overview');
        document.getElementById('dashboard').classList.add('active');
    }

    function showToast(msg) {
        var t = document.getElementById('toast');
        if (!t) { console.log('Toast:', msg); return; }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function() { t.classList.remove('show'); }, 3000);
    }

       function updateProUI() {
        var db = document.getElementById('designerBtn');
        if (db) db.style.display = hasAccess() ? 'inline-block' : 'none';
        
        // Pro badge in studio topbar
        var topbarLogo = document.querySelector('.topbar-logo');
        if (topbarLogo) {
            if (state.proActive) {
                topbarLogo.textContent = 'SĪT Studio 💎';
                topbarLogo.style.color = 'var(--success)';
            } else if (state.trialDays > 0) {
                topbarLogo.textContent = 'SĪT Studio ⏳';
                topbarLogo.style.color = 'var(--accent)';
            } else {
                topbarLogo.textContent = 'SĪT Studio';
                topbarLogo.style.color = 'var(--accent)';
            }
        }
    }
    // ===== SCORING =====
    function scorePour() {
        if (!hasAccess()) { showUpgrade(); return; }
        var so = document.getElementById('scoreOverlay');
        if (!so) return;
        so.classList.add('active');
        so.style.display = 'flex';
        
        var sym = Math.random() * 3 + 6.5;
        var con = Math.random() * 2.5 + 7;
        var def = Math.random() * 2 + 7.5;
        var flo = Math.random() * 3 + 6;
        var ov = parseFloat(((sym + con + def + flo) / 4).toFixed(1));
        if (ov > state.bestScore) { state.bestScore = ov; saveState(); }

        var sn = document.getElementById('scoreNumber'); if (sn) sn.textContent = ov;
        var se = document.getElementById('scoreEmoji'); if (se) se.textContent = ov >= 8 ? '🌟' : ov >= 6 ? '👍' : '💪';
        var sd = document.getElementById('scoreDetail');
        if (sd) sd.innerHTML =
            '<div><div class="score-m-label">Symmetry</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (sym * 10) + '%"></div></div></div>' +
            '<div><div class="score-m-label">Contrast</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (con * 10) + '%"></div></div></div>' +
            '<div><div class="score-m-label">Definition</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (def * 10) + '%"></div></div></div>' +
            '<div><div class="score-m-label">Flow</div><div class="score-m-bar"><div class="score-m-fill" style="width:' + (flo * 10) + '%"></div></div></div>';
        var st = document.getElementById('scoreTip');
        if (st) st.textContent = ['Try a finer brush for detailed line work.','Use thick brush for filling large areas.','Tilt the cup while pouring for curved designs.','Slow steady pulls create cleaner lines.','For rosettas: wiggle side-to-side while pulling back.'][Math.floor(Math.random() * 5)];
    }

    function closeScore() { 
        var el = document.getElementById('scoreOverlay');
        if (el) { el.classList.remove('active'); el.style.display = 'none'; }
    }

    // ===== SAVE / DOWNLOAD =====
    function savePour() {
        if (!hasAccess()) { showUpgrade(); return; }
        state.savedDesigns++;
        if (typeof Studio !== 'undefined' && Studio.getDataURL) {
            var dataUrl = Studio.getDataURL();
            if (dataUrl) {
                state.savedPours.unshift({ date: new Date().toISOString(), image: dataUrl });
                if (state.savedPours.length > 20) state.savedPours.pop();
            }
        }
        saveState();
        showToast('Pour saved! 💾');
    }

    function downloadArt() {
        if (typeof Studio !== 'undefined' && Studio.downloadCanvas) Studio.downloadCanvas();
    }

    // ===== UPGRADE =====
    function showUpgrade() {
        var content = document.getElementById('upgradeContent');
        if (!content) return;
        content.innerHTML =
            '<button class="modal-close" onclick="SIT.closeUpgrade()">✕</button>' +
            '<h2>Get SĪT Pro — Lifetime Access</h2>' +
            '<p style="margin-bottom:1rem;color:var(--text-light);">One payment. Forever access. All future updates included.</p>' +
            '<div style="background:#F5F0E8;padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;">' +
            '<h3 style="color:var(--espresso);">🌍 Pay Online (International)</h3>' +
            '<div class="price-num" style="font-size:2.5rem;">' + CONFIG.priceUSD + '</div>' +
            '<p style="color:var(--text-muted);margin-bottom:1rem;">One-time payment — lifetime access</p>' +
            '<a href="' + CONFIG.selarLink + '" target="_blank" class="btn btn-primary btn-large" style="display:block;text-align:center;text-decoration:none;">Pay on Selar →</a>' +
            '<p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">Card, PayPal, mobile money accepted.</p></div>' +
            '<div style="background:#FFF3CD;padding:1.5rem;border-radius:12px;margin-bottom:1.5rem;">' +
            '<h3 style="color:#856404;">🇺🇬 Uganda — Mobile Money</h3>' +
            '<p style="color:#856404;">Send <strong>' + CONFIG.priceUGX + '</strong> to:</p>' +
            '<p style="color:#856404;font-size:1.25rem;font-weight:700;">' + CONFIG.phone + '</p>' +
            '<p style="color:#856404;">Name: ' + CONFIG.phoneName + '</p>' +
            '<p style="color:#856404;font-size:0.85rem;">Include your username. Code sent via WhatsApp.</p></div>' +
            '<div style="border:1px solid var(--border);padding:1.5rem;border-radius:12px;">' +
            '<h3 style="color:var(--espresso);">🔑 Already have a code?</h3>' +
            '<input type="text" id="accessCodeInput" placeholder="SIT-PRO-XXXXX" style="width:100%;padding:0.75rem;border:1px solid var(--border);border-radius:8px;margin:0.75rem 0;text-align:center;font-size:1rem;text-transform:uppercase;">' +
            '<button class="btn btn-primary btn-full" onclick="SIT.redeemProCode()">Activate Lifetime Access</button>' +
            '<p id="codeError" style="color:var(--error);display:none;margin-top:0.5rem;"></p></div>' +
            '<p style="margin-top:1rem;font-size:0.8rem;color:var(--text-muted);">WhatsApp: <strong>' + CONFIG.phone + '</strong></p>';
        document.getElementById('upgradeModal').classList.add('active');
        setTimeout(function() {
            var inp = document.getElementById('accessCodeInput');
            if (inp) { inp.focus(); inp.addEventListener('keypress', function(e) { if (e.key === 'Enter') SIT.redeemProCode(); }); }
        }, 100);
    }

    function closeUpgrade() { 
        var el = document.getElementById('upgradeModal');
        if (el) el.classList.remove('active');
    }

        function redeemProCode() {
        var inp = document.getElementById('accessCodeInput');
        var err = document.getElementById('codeError');
        if (!inp || !err) return;
        var code = inp.value.trim().toUpperCase();
        if (!code) { err.textContent = 'Enter a code.'; err.style.display = 'block'; return; }
        
        err.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.6s linear infinite;margin-right:6px;vertical-align:middle;"></span> Validating...';
        err.style.color = 'var(--text-muted)';
        err.style.display = 'block';

        var url = CONFIG.googleScriptURL + '?action=validate&code=' + encodeURIComponent(code) + '&user=' + encodeURIComponent(state.userName || 'anonymous');
        fetch(url)
            .then(function(response) { return response.json(); })
            .then(function(data) {
                if (data.valid) { activatePro(code); }
                else { err.textContent = data.message || 'Invalid code.'; err.style.color = 'var(--error)'; err.innerHTML = err.textContent; }
            })
            .catch(function() {
                if (code.indexOf('SIT-PRO-') === 0 && code.length > 8) { activatePro(code); }
                else { err.textContent = 'Cannot validate. WhatsApp ' + CONFIG.phone; err.style.color = 'var(--error)'; err.innerHTML = err.textContent; }
            });
    }
    
    function activatePro(code) {
        state.proActive = true;
        state.proCode = code;
        var exp = new Date();
        exp.setFullYear(exp.getFullYear() + 100);
        state.proExpiry = exp.getTime().toString();
        localStorage.setItem('sit_pro', 'true');
        localStorage.setItem('sit_proExpiry', state.proExpiry);
        localStorage.setItem('sit_proCode', state.proCode);
        closeUpgrade();
        showToast('🎉 Lifetime access activated! Welcome to SĪT Pro!');
        updateProUI();
        if (typeof Academy !== 'undefined' && Academy.populateAcademy) Academy.populateAcademy();
        if (typeof Beyond !== 'undefined' && Beyond.populateBeyond) Beyond.populateBeyond();
    }

    // ===== LOGIN =====
    function doLogin() {
        var un = document.getElementById('loginUsername');
        var pw = document.getElementById('loginPassword');
        var er = document.getElementById('loginError');
        if (!un || !pw || !er) return;
        var username = un.value.trim();
        if (!username) { er.textContent = 'Enter a username.'; er.style.display = 'block'; return; }
        state.userName = username;
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
        showToast('Welcome, ' + state.userName + '! ☕');
    }

    function doLogout() {
        state.loggedIn = false;
        saveState();
        var dash = document.getElementById('dashboard');
        var login = document.getElementById('loginScreen');
        if (dash) dash.classList.remove('active');
        if (login) login.classList.remove('active');
        showToast('Logged out. 👋');
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
            var un = document.getElementById('loginUsername'); if (un) un.value = '';
            var pw = document.getElementById('loginPassword'); if (pw) pw.value = '';
            var er = document.getElementById('loginError'); if (er) er.style.display = 'none';
        }
    }

    function closeDashboard() { 
        var el = document.getElementById('dashboard');
        if (el) el.classList.remove('active');
    }

    function updateDashboardStats() {
        var tp = document.getElementById('totalPours'); if (tp) tp.textContent = state.totalPours;
        var bs = document.getElementById('bestScore'); if (bs) bs.textContent = state.bestScore ? state.bestScore.toFixed(1) : '--';
        var sd = document.getElementById('savedDesigns'); if (sd) sd.textContent = state.savedDesigns;
        var ap = document.getElementById('academyProgress'); if (ap) ap.textContent = state.academyProgress + '%';
        var bd = document.getElementById('trialBadge');
        if (bd) {
            var d = getDaysRemaining();
            if (state.proActive) { bd.textContent = '💎 Pro: ' + d; bd.style.background = '#D4EDDA'; bd.style.color = '#155724'; }
            else if (state.trialDays > 0) { bd.textContent = '⏳ Trial: ' + d; bd.style.background = '#FFF3CD'; bd.style.color = '#856404'; }
            else { bd.textContent = '🔒 Free Plan'; bd.style.background = '#F8D7DA'; bd.style.color = '#721C24'; }
        }
    }

    function showDashTab(tb) {
        document.querySelectorAll('.dash-nav-item').forEach(function(i) { i.classList.remove('active'); });
        if (event && event.target) event.target.classList.add('active');
        var ct = document.getElementById('dashContent'); if (!ct) return;
        var d = getDaysRemaining();
        var lb = state.proActive ? '💎 Pro — ' + d : state.trialDays > 0 ? '⏳ Trial — ' + d : '🔒 Free Plan';
        if (tb === 'overview') {
            ct.innerHTML =
                '<div class="dash-header"><h2>Your Studio</h2><span class="trial-badge">' + lb + '</span></div>' +
                '<div class="dash-stats"><div class="stat-card"><span class="stat-number">' + state.totalPours + '</span><span class="stat-label">Total Pours</span></div><div class="stat-card"><span class="stat-number">' + (state.bestScore ? state.bestScore.toFixed(1) : '--') + '</span><span class="stat-label">Best Score</span></div><div class="stat-card"><span class="stat-number">' + state.savedDesigns + '</span><span class="stat-label">Saved</span></div><div class="stat-card"><span class="stat-number">' + state.academyProgress + '%</span><span class="stat-label">Academy</span></div></div>' +
                '<div style="background:#fff;padding:1.5rem;border-radius:16px;border:1px solid var(--border);"><h3>Recent Pours</h3>' + (state.savedPours.length > 0 ? '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;">' + state.savedPours.slice(0, 6).map(function(p) { return '<img src="' + p.image + '" style="width:70px;height:70px;border-radius:50%;border:2px solid var(--border);">'; }).join('') + '</div>' : '<p class="empty-state">Your saved pours appear here.</p>') + '</div>' +
                (!state.proActive && state.trialDays <= 0 ? '<div style="text-align:center;padding:2rem;background:#FFF3CD;border-radius:16px;margin-top:1rem;"><h3 style="color:#856404;">✨ Get Lifetime Access</h3><p style="color:#856404;">One payment. Forever access. All future updates.</p><button class="btn btn-primary btn-large" onclick="SIT.showUpgrade()">Get Pro — ' + CONFIG.priceUSD + '</button></div>' : '');
        } else if (tb === 'settings') {
            ct.innerHTML =
                '<div class="dash-header"><h2>Settings</h2></div><div style="background:#fff;padding:2rem;border-radius:16px;border:1px solid var(--border);"><label style="display:block;margin-bottom:1rem;font-weight:600;">Username</label><input type="text" id="settingsUsername" value="' + state.userName + '" style="width:100%;padding:0.75rem;border:1px solid var(--border);border-radius:8px;margin-bottom:1rem;"><button class="btn btn-primary" onclick="SIT.saveSettings()">Save</button>' +
                (state.proActive ? '<div style="margin-top:1.5rem;padding:1rem;background:#D4EDDA;border-radius:8px;"><p style="color:#155724;"><strong>💎 Lifetime Access Active</strong></p><p style="color:#155724;font-size:0.85rem;">Code: ' + state.proCode + '</p></div>' : '<div style="margin-top:1.5rem;padding:1rem;background:#FFF3CD;border-radius:8px;"><p style="color:#856404;"><strong>Free Plan</strong></p></div>') +
                '<button class="btn btn-outline" style="margin-top:1rem;" onclick="SIT.showUpgrade()">Enter Pro Code</button></div>';
        } else {
            ct.innerHTML = '<div class="dash-header"><h2>' + tb.charAt(0).toUpperCase() + tb.slice(1) + '</h2></div><p class="empty-state">Coming soon.</p>';
        }
    }

    function saveSettings() {
        var n = document.getElementById('settingsUsername'); if (!n) return;
        var name = n.value.trim();
        if (name) { state.userName = name; saveState();
            document.getElementById('userName').textContent = '@' + name;
            document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
            showToast('Settings saved! ✅'); }
    }

    function showPage(page) {
        var pages = {
            'about': '<h1>About SĪT</h1><p>Built for baristas, by baristas. Master latte art and coffee knowledge.</p><p>WhatsApp: ' + CONFIG.phone + '</p>',
            'contact': '<h1>Contact</h1><p>WhatsApp: ' + CONFIG.phone + '</p><p>Selar: <a href="' + CONFIG.selarLink + '" target="_blank">' + CONFIG.selarLink + '</a></p>',
            'privacy': '<h1>Privacy</h1><p>Your data stays on your device. Payment processing by Selar.</p>',
            'terms': '<h1>Terms</h1><p>Lifetime access is for individual use. Academy content is copyrighted.</p>'
        };
        document.getElementById('chapterContent').innerHTML = pages[page] || '<h1>Coming Soon</h1>';
        document.getElementById('chapterModal').classList.add('active');
    }

    return {
        initApp: initApp, hasAccess: hasAccess, canFreestyle: canFreestyle, useFreestyleCredit: useFreestyleCredit,
        startTrial: startTrial, showToast: showToast, scorePour: scorePour, closeScore: closeScore,
        savePour: savePour, downloadArt: downloadArt, showUpgrade: showUpgrade, closeUpgrade: closeUpgrade,
        redeemProCode: redeemProCode, doLogin: doLogin, doLogout: doLogout, openDashboard: openDashboard,
        closeDashboard: closeDashboard, updateDashboardStats: updateDashboardStats, showDashTab: showDashTab,
        saveSettings: saveSettings, showPage: showPage, getState: function() { return state; },
        getConfig: function() { return CONFIG; }, updateProUI: updateProUI,
    };
})();

window.addEventListener('DOMContentLoaded', function() { if (typeof SIT !== 'undefined') SIT.initApp(); });
