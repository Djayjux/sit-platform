// ==========================================
// SIT Pattern Library
// ==========================================

var PatternLibrary = (function() {
    var patterns = [
        { name: 'Heart', icon: '♡', diff: 2, cat: 'heart', id: 'heart', guide: 'Start at top center. Pour a circle, then pull through the center to create the point.' },
        { name: 'Tulip', icon: '🌷', diff: 3, cat: 'tulip', id: 'tulip', guide: 'Pour base circle. Stack two smaller circles above. Pull through center.' },
        { name: 'Layered Heart', icon: '💚', diff: 3, cat: 'heart', id: 'layered-heart', guide: 'Pour a large heart base. Add a smaller heart inside. Pull through.' },
        { name: 'Rosetta', icon: '🍂', diff: 4, cat: 'rosetta', id: 'rosetta', guide: 'Start at top. Wiggle pitcher side-to-side while pulling back. Pull through center.' },
        { name: 'Swan', icon: '🦢', diff: 5, cat: 'swan', id: 'swan', guide: 'Pour body circle. Create neck by pouring a thin line upward. Add head dot. Add beak.' },
        { name: 'Simple Tulip', icon: '🌿', diff: 2, cat: 'tulip', id: 'simple-tulip', guide: 'Pour one circle. Stack second circle. Simple pull through.' },
        { name: 'Double Heart', icon: '💕', diff: 3, cat: 'heart', id: 'double-heart', guide: 'Pour two hearts side by side. Connect with a single pull through.' },
        { name: 'Triple Tulip', icon: '🌺', diff: 4, cat: 'tulip', id: 'triple-tulip', guide: 'Stack three circles decreasing in size. Pull through all three.' },
        { name: 'Classic Rosetta', icon: '🌾', diff: 4, cat: 'rosetta', id: 'classic-rosetta', guide: 'Traditional rosetta. Wide wiggle at top, narrowing toward bottom.' },
        { name: 'Baby Swan', icon: '🐥', diff: 4, cat: 'swan', id: 'baby-swan', guide: 'Smaller swan. Compact body, short neck. Good for practice.' },
        { name: 'Phoenix', icon: '🔥', diff: 5, cat: 'swan', id: 'phoenix', guide: 'Complex swan variation. Multiple body layers. Elaborate tail.' },
        { name: 'Wave Heart', icon: '〰️', diff: 3, cat: 'heart', id: 'wave-heart', guide: 'Heart with wavy edges. Wiggle while pouring the heart shape.' }
    ];

    var currentPattern = 'heart';
    var currentFilter = 'all';
    var customPatterns = [];

    function loadCustomPatterns() {
        var stored = localStorage.getItem('sit_customPatterns');
        if (stored) {
            try { customPatterns = JSON.parse(stored); } catch (e) { customPatterns = []; }
        }
    }

    function saveCustomPattern(name, icon) {
        var cp = { name: name, icon: icon || '🎨', diff: 1, cat: 'custom', id: 'custom-' + Date.now(), guide: 'Your custom design.' };
        customPatterns.push(cp);
        localStorage.setItem('sit_customPatterns', JSON.stringify(customPatterns));
        return cp;
    }

    function getAllPatterns() {
        loadCustomPatterns();
        return patterns.concat(customPatterns);
    }

    function getPatternById(id) {
        return getAllPatterns().find(function(p) { return p.id === id; });
    }

    function getFilteredPatterns(filter, search) {
        var all = getAllPatterns();
        if (filter && filter !== 'all') {
            all = all.filter(function(p) { return p.cat === filter; });
        }
        if (search) {
            var s = search.toLowerCase();
            all = all.filter(function(p) { return p.name.toLowerCase().indexOf(s) !== -1; });
        }
        return all;
    }

    function getCurrentPattern() { return currentPattern; }
    function setCurrentPattern(id) { currentPattern = id; }
    function getCurrentFilter() { return currentFilter; }
    function setCurrentFilter(f) { currentFilter = f; }
    function getPatterns() { return patterns; }
    function getCustomPatterns() { loadCustomPatterns(); return customPatterns; }

    return {
        getFilteredPatterns: getFilteredPatterns,
        getPatternById: getPatternById,
        getCurrentPattern: getCurrentPattern,
        setCurrentPattern: setCurrentPattern,
        getCurrentFilter: getCurrentFilter,
        setCurrentFilter: setCurrentFilter,
        saveCustomPattern: saveCustomPattern,
        getAllPatterns: getAllPatterns,
        getPatterns: getPatterns,
        getCustomPatterns: getCustomPatterns
    };
})();