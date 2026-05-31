// ==========================================
// SIT Fluid Simulation Engine
// Canvas 2D latte art simulator
// ==========================================

var FluidEngine = (function() {
    var canvas, ctx, W, H, cx, cy, cupR;
    var artLayer, artCtx;
    var brushSize = 14;
    var flowRate = 5;
    var tiltAngle = 0;
    var strokes = [];
    var currentStroke = [];
    var isDrawing = false;

    function init(canvasElement, options) {
        canvas = canvasElement;
        ctx = canvas.getContext('2d');
        W = canvas.width;
        H = canvas.height;
        cx = W / 2;
        cy = H / 2;
        cupR = (W / 2) - 15;

        if (options) {
            brushSize = options.brushSize || 14;
            flowRate = options.flowRate || 5;
        }

        artLayer = document.createElement('canvas');
        artLayer.width = W;
        artLayer.height = H;
        artCtx = artLayer.getContext('2d');

        reset();
    }

    function drawCrema() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cupR, 0, Math.PI * 2);
        ctx.clip();

        var grad = ctx.createRadialGradient(cx - 25, cy - 35, 20, cx, cy, cupR);
        grad.addColorStop(0, '#A07830');
        grad.addColorStop(0.3, '#7A4A2A');
        grad.addColorStop(0.6, '#4A2515');
        grad.addColorStop(1, '#1A0D06');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        for (var i = 0; i < 150; i++) {
            var rx = Math.random() * W;
            var ry = Math.random() * H;
            if (Math.sqrt((rx - cx) ** 2 + (ry - cy) ** 2) < cupR - 5) {
                var alpha = 0.02 + Math.random() * 0.08;
                var shade = 100 + Math.random() * 80;
                ctx.fillStyle = 'rgba(' + shade + ',' + (shade * 0.5) + ',' + (shade * 0.2) + ',' + alpha + ')';
                ctx.beginPath();
                ctx.arc(rx, ry, 3 + Math.random() * 15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    function drawRim() {
        ctx.beginPath();
        ctx.arc(cx, cy, cupR + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#3C1F0F';
        ctx.lineWidth = 7;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, cupR + 7, 0, Math.PI * 2);
        ctx.strokeStyle = '#8B6914';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, cupR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    function drawMilkOnArt(x, y) {
        var dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        if (dist > cupR - 8) return;

        artCtx.save();
        artCtx.beginPath();
        artCtx.arc(cx, cy, cupR - 3, 0, Math.PI * 2);
        artCtx.clip();

        var s = brushSize;
        var grad = artCtx.createRadialGradient(x, y, 0, x, y, s);
        grad.addColorStop(0, 'rgba(255,255,255,0.95)');
        grad.addColorStop(0.4, 'rgba(255,252,248,0.75)');
        grad.addColorStop(0.7, 'rgba(255,250,240,0.35)');
        grad.addColorStop(1, 'rgba(255,248,238,0)');
        artCtx.fillStyle = grad;
        artCtx.beginPath();
        artCtx.arc(x, y, s, 0, Math.PI * 2);
        artCtx.fill();
        artCtx.restore();
    }

    function renderFrame() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#F5F0E8';
        ctx.fillRect(0, 0, W, H);
        drawCrema();
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, cupR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(artLayer, 0, 0);
        ctx.restore();
        drawRim();
    }

    function addPoint(x, y) {
        var tx = x, ty = y;
        if (tiltAngle === -1) { tx += brushSize * 0.3;
            ty += 1; } else if (tiltAngle === 1) { tx -= brushSize * 0.3;
            ty += 1; }

        drawMilkOnArt(tx, ty);

        var extras = Math.floor(flowRate / 3);
        for (var i = 0; i < extras; i++) {
            var ox = tx + (Math.random() - 0.5) * brushSize * 1.5;
            var oy = ty + (Math.random() - 0.5) * brushSize * 1.5;
            drawMilkOnArt(ox, oy);
        }

        currentStroke.push({ x: x, y: y });
        renderFrame();
    }

    function startStroke() { currentStroke = [];
        isDrawing = true; }

    function continueStroke(x, y) { if (isDrawing) addPoint(x, y); }

    function endStroke() {
        if (!isDrawing) return;
        isDrawing = false;
        if (currentStroke.length > 0) strokes.push(currentStroke);
        currentStroke = [];
    }

    function undo() {
        if (strokes.length === 0) return false;
        strokes.pop();
        artCtx.clearRect(0, 0, W, H);
        strokes.forEach(function(s) { s.forEach(function(pt) { drawMilkOnArt(pt.x, pt.y); }); });
        renderFrame();
        return true;
    }

    function reset() {
        ctx.clearRect(0, 0, W, H);
        artCtx.clearRect(0, 0, W, H);
        strokes = [];
        currentStroke = [];
        ctx.fillStyle = '#F5F0E8';
        ctx.fillRect(0, 0, W, H);
        drawCrema();
        drawRim();
    }

    function setTilt(dir) {
        if (dir === 'left') tiltAngle = -1;
        else if (dir === 'right') tiltAngle = 1;
        else tiltAngle = 0;
    }

    function getDataURL() { renderFrame(); return canvas.toDataURL(); }
    function getStrokes() { return strokes; }
    function getBrushSize() { return brushSize; }
    function setBrushSize(s) { brushSize = s; }
    function getFlowRate() { return flowRate; }
    function setFlowRate(f) { flowRate = f; }
    function getTilt() { return tiltAngle; }

    return {
        init: init,
        startStroke: startStroke,
        continueStroke: continueStroke,
        endStroke: endStroke,
        undo: undo,
        reset: reset,
        setTilt: setTilt,
        getDataURL: getDataURL,
        getStrokes: getStrokes,
        getBrushSize: getBrushSize,
        setBrushSize: setBrushSize,
        getFlowRate: getFlowRate,
        setFlowRate: setFlowRate,
        getTilt: getTilt,
        renderFrame: renderFrame
    };
})();