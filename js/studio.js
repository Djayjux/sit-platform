// ==========================================
// SĪT MILK CANVAS ENGINE — Mobile Safe v2
// All errors fixed
// ==========================================

var Studio = (function() {
    var espressoCanvas, milkCanvas, guideCanvas, outputCanvas;
    var espCtx, milkCtx, guideCtx, outCtx;
    var W = 0, H = 0;

    var isPouring = false;
    var lastX = 0, lastY = 0;
    var strokeCount = 0;
    var currentStroke = [];
    var allStrokes = [];
    var tiltAngle = 0;
    var currentMode = 'guided';
    var currentPattern = 'heart';
    var currentStep = 0;
    var thicknessMult = 1.0;
    var ghostFrame = 0;
    var ghostAnimId = null;
    var MAX_UNDO = 20;
    var undoLoading = false; // Prevent rapid undo

    var undoScreen = document.createElement('canvas');
    var undoCtx = undoScreen.getContext('2d');

    var thicknessMap = { fine: 0.6, med: 1.0, thick: 1.6 };

    var patterns = [
        {
            id: 'heart', name: 'Heart', difficulty: 2, color: '#e8c4a0',
            steps: ['Pour a wide base circle in center','Wiggle left-right as you pull back','Pull sharply through the base','Lift and finish with a clean tip'],
            guide: [
                { type: 'circle', cx: 0.5, cy: 0.52, r: 0.22 },
                { type: 'path', points: [[0.5,0.42],[0.42,0.35],[0.35,0.38],[0.33,0.46],[0.38,0.54],[0.5,0.62],[0.62,0.54],[0.67,0.46],[0.65,0.38],[0.58,0.35],[0.5,0.42]] }
            ]
        }, {
            id: 'tulip', name: 'Tulip', difficulty: 2, color: '#ddb88a',
            steps: ['Pour 3 stacked circles from bottom up','Make each circle smaller than the last','Pull a thin line down through centers','Add two small leaf curves at base'],
            guide: [
                { type: 'circle', cx: 0.5, cy: 0.68, r: 0.14 },
                { type: 'circle', cx: 0.5, cy: 0.52, r: 0.11 },
                { type: 'circle', cx: 0.5, cy: 0.39, r: 0.08 },
            ]
        }, {
            id: 'rosetta', name: 'Rosetta', difficulty: 4, color: '#c8a070',
            steps: ['Start with a thin line down the center','Wiggle outward on both sides evenly','Keep spacing uniform','Pull back through the center to finish'],
            guide: [
                { type: 'path', points: [[0.5,0.25],[0.5,0.3],[0.42,0.34],[0.5,0.38],[0.58,0.42],[0.5,0.46],[0.42,0.50],[0.5,0.54],[0.58,0.58],[0.5,0.62],[0.5,0.72]] }
            ]
        }, {
            id: 'swan', name: 'Swan', difficulty: 5, color: '#b89060',
            steps: ['Pour the body as a wide teardrop','Curl the neck in a smooth S-curve','Add the head as a tiny round dot','Finish the tail with a feather fan'],
            guide: [
                { type: 'path', points: [[0.5,0.65],[0.58,0.60],[0.62,0.52],[0.60,0.44],[0.54,0.38],[0.48,0.34],[0.44,0.30],[0.42,0.26]] },
                { type: 'circle', cx: 0.40, cy: 0.24, r: 0.04 },
            ]
        }, {
            id: 'wave', name: 'Wave', difficulty: 3, color: '#d0a878',
            steps: ['Start from the left edge of the cup','Sweep a smooth S-curve across center','Add ripple echoes above and below','Pull a fine thread from end to start'],
            guide: [
                { type: 'path', points: [[0.2,0.5],[0.3,0.4],[0.4,0.5],[0.5,0.6],[0.6,0.5],[0.7,0.4],[0.8,0.5]] }
            ]
        }, {
            id: 'free', name: 'Free Pour', difficulty: 1, color: '#f0c890',
            steps: ['Pour anything you like!'], guide: []
        },
    ];

    // ===== INIT =====
    function init() {
        espressoCanvas = document.getElementById('espressoCanvas');
        milkCanvas = document.getElementById('milkCanvas');
        guideCanvas = document.getElementById('guideCanvas');
        outputCanvas = document.getElementById('outputCanvas');

        if (!espressoCanvas || !milkCanvas) { setTimeout(init, 200); return; }

        espCtx = espressoCanvas.getContext('2d', { alpha: false });
        milkCtx = milkCanvas.getContext('2d', { alpha: true,willReadFrequently: false});
        guideCtx = guideCanvas.getContext('2d', { alpha: true });
        outCtx = outputCanvas.getContext('2d', { alpha: true });

        resizeCanvases();
        drawEspressoBase();
        buildPatternGrid();
        buildGuideSteps();
        bindEvents();
        startGhostAnimation();

        // Stop ghost when tab hidden
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) stopGhostAnimation();
            else startGhostAnimation();
        });

        window.addEventListener('resize', function() {
            var tc = document.createElement('canvas');
            tc.width = W; tc.height = H;
            tc.getContext('2d').drawImage(milkCanvas, 0, 0);
            resizeCanvases();
            milkCtx.drawImage(tc, 0, 0, W, H);
            drawEspressoBase();
            drawGuide();
        });
    }

    function resizeCanvases() {
        var stack = document.getElementById('canvasStack');
        if (!stack) return;
        var rect = stack.getBoundingClientRect();
        W = Math.floor(rect.width);
        H = Math.floor(rect.height);

        [espressoCanvas, milkCanvas, guideCanvas, outputCanvas].forEach(function(c) {
            if (c) { c.width = W; c.height = H; }
        });

        undoScreen.width = W;
        undoScreen.height = H;
    }

    // ===== ESPRESSO BASE =====
    function drawEspressoBase() {
        if (!espCtx || W === 0) return;
        var cx = W/2, cy = H/2;

        var bg = espCtx.createRadialGradient(cx, cy*0.8, 0, cx, cy, Math.max(W,H)*0.7);
        bg.addColorStop(0, '#5C3018');
        bg.addColorStop(0.4, '#3C1F0F');
        bg.addColorStop(1, '#1A0D06');
        espCtx.fillStyle = bg;
        espCtx.fillRect(0, 0, W, H);

        var crema = espCtx.createRadialGradient(cx, cy, W*0.15, cx, cy, W*0.48);
        crema.addColorStop(0, 'rgba(180,110,40,0)');
        crema.addColorStop(0.6, 'rgba(180,110,40,0.08)');
        crema.addColorStop(0.85, 'rgba(200,130,50,0.15)');
        crema.addColorStop(1, 'rgba(140,80,30,0.25)');
        espCtx.fillStyle = crema;
        espCtx.fillRect(0, 0, W, H);

        espCtx.globalAlpha = 0.04;
        for (var i = 0; i < 60; i++) {
            var tx = Math.random()*W, ty = Math.random()*H;
            espCtx.beginPath();
            espCtx.arc(tx, ty, Math.random()*2+0.5, 0, Math.PI*2);
            espCtx.fillStyle = 'rgba(220,180,120,'+(Math.random()*0.5+0.2)+')';
            espCtx.fill();
        }
        espCtx.globalAlpha = 1;
    }

    // ===== SOFT MILK BRUSH =====
    function drawSoftStroke(ctx, x, y, radius, flow, softness) {
        var soft = softness / 10;
        var edgeStart = 1 - soft * 0.7;
        var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, 'rgba(248,235,218,'+(flow*0.18)+')');
        g.addColorStop(edgeStart*0.4, 'rgba(240,222,198,'+(flow*0.14)+')');
        g.addColorStop(edgeStart, 'rgba(230,208,180,'+(flow*0.07)+')');
        g.addColorStop(1, 'rgba(215,190,160,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI*2);
        ctx.fill();

        if (flow > 0.4) {
            var hl = ctx.createRadialGradient(x-radius*0.2, y-radius*0.2, 0, x, y, radius*0.3);
            hl.addColorStop(0, 'rgba(255,250,240,'+(flow*0.1)+')');
            hl.addColorStop(1, 'rgba(255,250,240,0)');
            ctx.fillStyle = hl;
            ctx.beginPath();
            ctx.arc(x, y, radius*0.3, 0, Math.PI*2);
            ctx.fill();
        }
    }

    function lerpStroke(x1, y1, x2, y2, radius, flow, softness) {
        var dx = x2-x1, dy = y2-y1;
        var dist = Math.sqrt(dx*dx+dy*dy);
        var step = Math.max(2, radius*0.3);
        var steps = Math.ceil(dist/step);
        for (var i = 0; i <= steps; i++) {
            var t = i/Math.max(steps,1);
            drawSoftStroke(milkCtx, x1+dx*t, y1+dy*t, radius, flow, softness);
        }
    }

    // ===== SNAPSHOT (GPU-friendly, no getImageData) =====
    function saveUndoSnapshot() {
        undoCtx.clearRect(0, 0, W, H);
        undoCtx.drawImage(milkCanvas, 0, 0);
    }

    function getSnapshotString() {
        return undoScreen.toDataURL('image/webp', 0.5);
    }

    function restoreSnapshot(dataUrl, callback) {
        undoLoading = true;
        var img = new Image();
        img.onload = function() {
            milkCtx.clearRect(0, 0, W, H);
            milkCtx.drawImage(img, 0, 0);
            undoLoading = false;
            if (callback) callback();
        };
        img.onerror = function() {
            undoLoading = false;
            if (callback) callback();
        };
        img.src = dataUrl;
    }

    // ===== INPUT =====
    function getPointerPos(e, canvas) {
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width/rect.width;
        var scaleY = canvas.height/rect.height;
        if (e.touches && e.touches.length > 0) {
            return { x: (e.touches[0].clientX-rect.left)*scaleX, y: (e.touches[0].clientY-rect.top)*scaleY };
        }
        return { x: (e.clientX-rect.left)*scaleX, y: (e.clientY-rect.top)*scaleY };
    }

    function startPour(e) {
    e.preventDefault();
    
    // Check access for freestyle mode
    if (currentMode === 'freestyle') {
        if (typeof SIT !== 'undefined' && !SIT.canFreestyle()) {
            SIT.showUpgrade();
            return;
        }
        if (typeof SIT !== 'undefined') SIT.useFreestyleCredit();
    }
    
    saveUndoSnapshot();
    isPouring = true;
    var pos = getPointerPos(e, milkCanvas);
    lastX = pos.x; lastY = pos.y;
    currentStroke = [{x:lastX, y:lastY}];
    var hint = document.getElementById('pourHint');
    if (hint) hint.classList.add('hidden');
    var r = getBrushRadius(), f = getFlow(), s = getSoftness();
    drawSoftStroke(milkCtx, lastX, lastY, r, f, s);
}
    
    function continuePour(e) {
        if (!isPouring) return;
        e.preventDefault();
        var pos = getPointerPos(e, milkCanvas);
        var r = getBrushRadius(), f = getFlow(), s = getSoftness();
        lerpStroke(lastX, lastY, pos.x, pos.y, r, f, s);
        currentStroke.push({x:pos.x, y:pos.y});
        lastX = pos.x; lastY = pos.y;
    }

    function endPour(e) {
        if (!isPouring) return;
        isPouring = false;
        strokeCount++;

        // Store snapshot as compressed string
        var snapshot = getSnapshotString();
        allStrokes.push(snapshot);
        if (allStrokes.length > MAX_UNDO) allStrokes.shift();

        var sc = document.getElementById('strokeCount');
        if (sc) sc.textContent = strokeCount;

        addStrokeHistoryItem();
        if (currentMode === 'guided') advanceGuideStep();
    }

    function bindEvents() {
        if (!milkCanvas) return;
        milkCanvas.addEventListener('mousedown', startPour);
        milkCanvas.addEventListener('mousemove', continuePour);
        milkCanvas.addEventListener('mouseup', endPour);
        milkCanvas.addEventListener('mouseleave', endPour);
        milkCanvas.addEventListener('touchstart', startPour, {passive:false});
        milkCanvas.addEventListener('touchmove', continuePour, {passive:false});
        milkCanvas.addEventListener('touchend', endPour);
        milkCanvas.addEventListener('touchcancel', endPour);
    }

    // ===== CONTROLS =====
    function getBrushRadius() {
        var bs = document.getElementById('brushSize');
        return (bs ? parseInt(bs.value) : 14) * thicknessMult;
    }
    function getFlow() {
        var fr = document.getElementById('flowRate');
        return (fr ? parseInt(fr.value) : 5) / 10;
    }
    function getSoftness() {
        var sf = document.getElementById('softness');
        return sf ? parseInt(sf.value) : 7;
    }

    function updateBrushLabel() {
        var bs = document.getElementById('brushSize');
        var bv = document.getElementById('brushVal');
        if (bs && bv) bv.textContent = bs.value;
    }
    function updateFlowLabel() {
        var fr = document.getElementById('flowRate');
        var fv = document.getElementById('flowVal');
        if (fr && fv) fv.textContent = fr.value;
    }
    function updateSoftLabel() {
        var sf = document.getElementById('softness');
        var sv = document.getElementById('softVal');
        if (sf && sv) sv.textContent = sf.value;
    }

    function setThickness(type, btn) {
        thicknessMult = thicknessMap[type] || 1.0;
        document.querySelectorAll('.thick-btn').forEach(function(b){b.classList.remove('active');});
        if (btn) btn.classList.add('active');
    }

    function setMode(mode, btnElement) {
        currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(function(b){b.classList.remove('active');});
        // Use the passed button element or find by mode text
        if (btnElement) {
            btnElement.classList.add('active');
        } else {
            document.querySelectorAll('.mode-btn').forEach(function(b) {
                if (b.textContent.toLowerCase().indexOf(mode) !== -1) b.classList.add('active');
            });
        }
        var ml = document.getElementById('modeLabel');
        if (ml) ml.textContent = mode.charAt(0).toUpperCase()+mode.slice(1);
        var guideSec = document.getElementById('guidedStepsSection');
        if (guideSec) guideSec.style.opacity = mode==='guided'?'1':'0.3';
        if (mode==='guided') drawGuide();
        else if (guideCtx) guideCtx.clearRect(0,0,W,H);
    }

    // ===== TILT =====
    function tiltCup(dir) {
        tiltAngle = Math.max(-15, Math.min(15, tiltAngle+dir*5));
        var cupBody = document.getElementById('cupBody');
        if (cupBody) cupBody.style.transform = 'rotate('+tiltAngle+'deg)';
        var indicator = document.getElementById('tiltIndicator');
        if (indicator) indicator.style.transform = 'rotate('+tiltAngle+'deg)';
        var label = tiltAngle===0?'Level':(tiltAngle<0?Math.abs(tiltAngle)+'° Left':tiltAngle+'° Right');
        var tl = document.getElementById('tiltLabel');
        if (tl) tl.textContent = label;
    }

    // ===== UNDO =====
    function undoStroke() {
        if (undoLoading) return; // Block rapid undo
        if (allStrokes.length === 0) {
            milkCtx.clearRect(0,0,W,H);
            strokeCount = 0;
            var sc = document.getElementById('strokeCount'); if (sc) sc.textContent = 0;
            resetStrokeHistory();
            if (currentMode==='guided') { currentStep=0; updateGuideSteps(); }
            return;
        }

        // Remove last stroke snapshot
        allStrokes.pop();
        strokeCount = Math.max(0, strokeCount-1);
        var sc = document.getElementById('strokeCount'); if (sc) sc.textContent = strokeCount;
        removeLastStrokeHistoryItem();

        if (allStrokes.length > 0) {
            // Restore from previous snapshot
            restoreSnapshot(allStrokes[allStrokes.length-1]);
        } else {
            milkCtx.clearRect(0,0,W,H);
        }

        if (currentMode==='guided' && currentStep>0) { currentStep--; updateGuideSteps(); }
    }

    function clearCanvas() {
        milkCtx.clearRect(0,0,W,H);
        allStrokes = [];
        strokeCount = 0;
        currentStep = 0;
        var sc = document.getElementById('strokeCount'); if (sc) sc.textContent = 0;
        var ph = document.getElementById('pourHint'); if (ph) ph.classList.remove('hidden');
        var sb = document.getElementById('scoreBadge'); if (sb) sb.classList.remove('visible');
        resetStrokeHistory();
        updateGuideSteps();
        if (currentMode==='guided') drawGuide();
    }

       // ===== SCORE (optimized) =====
    function scoreCanvas() {
        if (strokeCount === 0) return;
        
        // Create a temporary canvas with willReadFrequently for scoring
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = W;
        tempCanvas.height = H;
        var tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        // Composite the layers
        tempCtx.drawImage(espressoCanvas, 0, 0);
        tempCtx.drawImage(milkCanvas, 0, 0);
        
        // Sample-based scoring (every 20px = much faster)
        var sampleSize = 20;
        var milkPixels = 0, totalSamples = 0;
        
        for (var sx = 0; sx < W; sx += sampleSize) {
            for (var sy = 0; sy < H; sy += sampleSize) {
                totalSamples++;
                try {
                    var px = tempCtx.getImageData(sx, sy, 1, 1).data;
                    // Check if this pixel is milk (white/cream colored)
                    if (px[0] > 200 && px[1] > 180 && px[2] > 150 && px[3] > 20) {
                        milkPixels++;
                    }
                } catch(e) { /* skip edge pixels */ }
            }
        }
        
        if (totalSamples === 0) return;
        
        var coverage = milkPixels / totalSamples;
        var strokeBonus = Math.min(strokeCount * 8, 30);
        var rawScore = Math.min(100, Math.round(coverage * 400 + strokeBonus + 20));
        var score = Math.max(10, rawScore);
        
        var sv = document.getElementById('scoreValue');
        if (sv) sv.textContent = score;
        
        var sb = document.getElementById('scoreBadge');
        if (sb) sb.classList.add('visible');
        
        setTimeout(function() {
            var sb2 = document.getElementById('scoreBadge');
            if (sb2) sb2.classList.remove('visible');
        }, 3500);
        
        // Show score overlay
        var so = document.getElementById('scoreOverlay');
        if (so) { so.classList.add('active'); so.style.display = 'flex'; }
        
        // Also call SIT scoring if available
        if (typeof SIT !== 'undefined' && SIT.scorePour) {
            // SIT handles the detailed breakdown display
        }
    }
    // ===== DOWNLOAD =====
    function downloadCanvas() {
        if (!outCtx || !espressoCanvas || !milkCanvas) return;
        outCtx.clearRect(0,0,W,H);
        outCtx.drawImage(espressoCanvas,0,0);
        outCtx.drawImage(milkCanvas,0,0);
        var link = document.createElement('a');
        link.download = 'sit-pour-'+Date.now()+'.png';
        link.href = outputCanvas.toDataURL('image/png');
        link.click();
    }

    // ===== GUIDE OVERLAY =====
    function drawGuide() {
        if (!guideCtx || W===0) return;
        guideCtx.clearRect(0,0,W,H);
        if (currentMode!=='guided') return;
        var pattern = patterns.find(function(p){return p.id===currentPattern;});
        if (!pattern || !pattern.guide.length) return;

        guideCtx.setLineDash([3,5]);
        guideCtx.lineWidth = 1.5;
        guideCtx.strokeStyle = 'rgba(200,133,58,0.5)';
        guideCtx.fillStyle = 'rgba(200,133,58,0.06)';

        pattern.guide.forEach(function(shape) {
            if (shape.type==='circle') {
                guideCtx.beginPath();
                guideCtx.arc(shape.cx*W, shape.cy*H, shape.r*W, 0, Math.PI*2);
                guideCtx.fill();
                guideCtx.stroke();
            } else if (shape.type==='path') {
                guideCtx.beginPath();
                shape.points.forEach(function(p, i) {
                    if (i===0) guideCtx.moveTo(p[0]*W, p[1]*H);
                    else guideCtx.lineTo(p[0]*W, p[1]*H);
                });
                guideCtx.stroke();
            }
        });
        guideCtx.setLineDash([]);
        drawStepArrow();
    }

    function drawStepArrow() {
        var pattern = patterns.find(function(p){return p.id===currentPattern;});
        if (!pattern) return;
        var guide = pattern.guide[currentStep];
        if (!guide) return;
        var ax, ay;
        if (guide.type==='circle') { ax=guide.cx*W; ay=guide.cy*H-guide.r*W-12; }
        else if (guide.type==='path' && guide.points.length) { ax=guide.points[0][0]*W; ay=guide.points[0][1]*H-14; }
        if (ax===undefined) return;
        var pulse = Math.sin(ghostFrame*0.05)*3;
        guideCtx.fillStyle = 'rgba(200,133,58,0.9)';
        guideCtx.font = '14px serif';
        guideCtx.textAlign = 'center';
        guideCtx.fillText('↓', ax, ay+pulse);
    }
    function filterPatterns(cat, btnElement) {
        document.querySelectorAll('.pattern-tab').forEach(function(b) {
            b.classList.remove('active');
        });
        if (btnElement) btnElement.classList.add('active');
        
        var grid = document.getElementById('patternGrid');
        if (!grid) return;
        grid.innerHTML = '';
        
        var filtered = cat === 'all' ? patterns : patterns.filter(function(p) {
            return p.cat === cat;
        });
        
        filtered.forEach(function(p) {
            var card = document.createElement('div');
            card.className = 'pattern-card' + (p.id === currentPattern ? ' active' : '');
            card.addEventListener('click', function() { selectPattern(p.id, this); });
            
            var mini = document.createElement('canvas');
            mini.width = 40; mini.height = 40;
            var mctx = mini.getContext('2d');
            var bg = mctx.createRadialGradient(20, 20, 0, 20, 20, 20);
            bg.addColorStop(0, '#5C3018');
            bg.addColorStop(1, '#1A0D06');
            mctx.fillStyle = bg;
            mctx.beginPath();
            mctx.arc(20, 20, 20, 0, Math.PI * 2);
            mctx.fill();
            
            mctx.strokeStyle = p.color;
            mctx.lineWidth = 1;
            mctx.setLineDash([2, 3]);
            mctx.globalAlpha = 0.6;
            p.guide.forEach(function(s) {
                if (s.type === 'circle') {
                    mctx.beginPath();
                    mctx.arc(s.cx * 40, s.cy * 40, s.r * 40, 0, Math.PI * 2);
                    mctx.stroke();
                } else if (s.type === 'path') {
                    mctx.beginPath();
                    s.points.forEach(function(pt, i) {
                        if (i === 0) mctx.moveTo(pt[0] * 40, pt[1] * 40);
                        else mctx.lineTo(pt[0] * 40, pt[1] * 40);
                    });
                    mctx.stroke();
                }
            });
            mctx.globalAlpha = 1;
            
            var dots = document.createElement('div');
            dots.className = 'pattern-difficulty';
            for (var i = 0; i < 5; i++) {
                var d = document.createElement('div');
                d.className = 'diff-dot' + (i < p.difficulty ? ' filled' : '');
                dots.appendChild(d);
            }
            
            card.appendChild(mini);
            card.innerHTML += '<div class="pattern-card-label">' + p.name + '</div>';
            card.appendChild(dots);
            card.insertBefore(mini, card.firstChild);
            grid.appendChild(card);
        });
    }    
    function startGhostAnimation() {
        stopGhostAnimation();
        function anim() { ghostFrame++; drawGuide(); ghostAnimId = requestAnimationFrame(anim); }
        ghostAnimId = requestAnimationFrame(anim);
    }

    function stopGhostAnimation() {
        if (ghostAnimId) { cancelAnimationFrame(ghostAnimId); ghostAnimId = null; }
    }

    // ===== GUIDED STEPS =====
    function buildGuideSteps() {
        var pattern = patterns.find(function(p){return p.id===currentPattern;});
        if (!pattern) return;
        var container = document.getElementById('guideSteps');
        if (!container) return;
        container.innerHTML = '';
        pattern.steps.forEach(function(step, i) {
            var div = document.createElement('div');
            div.className = 'guide-step'+(i===0?' active':'');
            div.innerHTML = '<div class="step-num">'+(i+1)+'</div><span>'+step+'</span>';
            container.appendChild(div);
        });
    }

    function updateGuideSteps() {
        var steps = document.querySelectorAll('.guide-step');
        steps.forEach(function(el, i) {
            el.className = 'guide-step'+(i<currentStep?' done':'')+(i===currentStep?' active':'');
        });
        drawGuide();
    }

    function advanceGuideStep() {
        var pattern = patterns.find(function(p){return p.id===currentPattern;});
        if (!pattern) return;
        if (currentStep < pattern.steps.length-1) { currentStep++; updateGuideSteps(); }
    }

    // ===== PATTERN CARDS =====
    function buildPatternGrid() {
        var grid = document.getElementById('patternGrid');
        if (!grid) return;
        grid.innerHTML = '';
        patterns.forEach(function(p) {
            var card = document.createElement('div');
            card.className = 'pattern-card'+(p.id===currentPattern?' active':'');
            card.addEventListener('click', function() { selectPattern(p.id, this); });
            var mini = document.createElement('canvas');
            mini.width=40; mini.height=40;
            var mctx=mini.getContext('2d');
            var bg=mctx.createRadialGradient(20,20,0,20,20,20);
            bg.addColorStop(0,'#5C3018'); bg.addColorStop(1,'#1A0D06');
            mctx.fillStyle=bg; mctx.beginPath(); mctx.arc(20,20,20,0,Math.PI*2); mctx.fill();
            mctx.strokeStyle=p.color; mctx.lineWidth=1; mctx.setLineDash([2,3]); mctx.globalAlpha=0.6;
            p.guide.forEach(function(s) {
                if (s.type==='circle') { mctx.beginPath();
                    mctx.arc(s.cx*40,s.cy*40,s.r*40,0,Math.PI*2); mctx.stroke(); }
                else if (s.type==='path') { mctx.beginPath();
                    s.points.forEach(function(pt,i){ if(i===0)mctx.moveTo(pt[0]*40,pt[1]*40); else mctx.lineTo(pt[0]*40,pt[1]*40); });
                    mctx.stroke(); }
            });
            mctx.globalAlpha=1;
            var dots=document.createElement('div'); dots.className='pattern-difficulty';
            for (var i=0; i<5; i++) { var d=document.createElement('div');
                d.className='diff-dot'+(i<p.difficulty?' filled':''); dots.appendChild(d); }
            card.appendChild(mini); card.innerHTML+='<div class="pattern-card-label">'+p.name+'</div>';
            card.appendChild(dots); card.insertBefore(mini, card.firstChild);
            grid.appendChild(card);
        });
    }

    function selectPattern(id, cardElement) {
        currentPattern=id; currentStep=0;
        document.querySelectorAll('.pattern-card').forEach(function(c){c.classList.remove('active');});
        if (cardElement) cardElement.classList.add('active');
        var pat = patterns.find(function(p){return p.id===id;});
        var pl = document.getElementById('patternLabel'); if (pl) pl.textContent = pat?pat.name:id;
        clearCanvas(); buildGuideSteps(); drawGuide();
    }

    // ===== STROKE HISTORY =====
    function addStrokeHistoryItem() {
        var hist=document.getElementById('strokeHistory'); if (!hist) return;
        var ph=hist.querySelector('div[style]'); if (ph) ph.remove();
        var item=document.createElement('div'); item.className='stroke-item'; item.id='stroke-'+strokeCount;
        item.innerHTML='<div class="stroke-dot"></div><span>Stroke '+strokeCount+'</span>';
        hist.insertBefore(item, hist.firstChild);
        var items=hist.querySelectorAll('.stroke-item'); if (items.length>6) items[items.length-1].remove();
    }

    function removeLastStrokeHistoryItem() {
        var hist=document.getElementById('strokeHistory'); if (!hist) return;
        var items=hist.querySelectorAll('.stroke-item'); if (items.length>0) items[0].remove();
        if (hist.querySelectorAll('.stroke-item').length===0) resetStrokeHistory();
    }

    function resetStrokeHistory() {
        var hist=document.getElementById('strokeHistory'); if (!hist) return;
        hist.innerHTML='<div style="font-size:9px;color:var(--text-muted);">No strokes yet</div>';
    }
    // ===== PUBLIC API =====
    return {
        init: init,
        setMode: setMode,
        setThickness: setThickness,
        tiltCup: tiltCup,
        undoStroke: undoStroke,
        clearCanvas: clearCanvas,
        scoreCanvas: scoreCanvas,
        downloadCanvas: downloadCanvas,
        updateBrushLabel: updateBrushLabel,
        updateFlowLabel: updateFlowLabel,
        updateSoftLabel: updateSoftLabel,
        filterPatterns: filterPatterns,
        selectPattern: selectPattern,
        getDataURL: function() { 
            if (!outCtx || !espressoCanvas || !milkCanvas) return '';
            outCtx.clearRect(0,0,W,H);
            outCtx.drawImage(espressoCanvas,0,0);
            outCtx.drawImage(milkCanvas,0,0);
            return outputCanvas.toDataURL('image/png');
        },
        getStrokes: function() { return allStrokes; }
    };
})();

window.addEventListener('DOMContentLoaded', function() { Studio.init(); });
