// ==========================================
// SIT Academy - All 7 Chapters
// ==========================================

var Academy = (function() {
    var chapters = [
        { n: '01', t: 'The Seed', d: 'Origin, varieties, growing, harvesting. Where coffee begins.', id: 'seed', l: false },
        { n: '02', t: 'The Process', d: 'Washed, natural, honey, experimental. How processing shapes flavor.', id: 'process', l: true },
        { n: '03', t: 'The Roast', d: 'Chemistry, curves, and crack. The transformation of green to brown.', id: 'roast', l: true },
        { n: '04', t: 'The Brew', d: 'Ratios, grind size, water chemistry. Extraction mastered.', id: 'brew', l: true },
        { n: '05', t: 'The Cup', d: 'Tasting, cupping, the flavor wheel. Learning to speak coffee.', id: 'cup', l: true },
        { n: '06', t: 'The Art', d: 'Milk science, crema, pattern theory. The why behind every pour.', id: 'art', l: true },
        { n: '07', t: 'The Industry', d: 'Careers, competitions, supply chain. Your place in coffee.', id: 'industry', l: true }
    ];

    function getChapters() { return chapters; }

    function canAccess(ch) {
        return SIT.hasAccess() || !ch.l;
    }

    function populateAcademy() {
        var grid = document.getElementById('academyGrid');
        if (!grid) return;
        grid.innerHTML = chapters.map(function(ch) {
            var ok = canAccess(ch);
            return '<div class="info-card' + (ok ? '' : ' locked') + '" onclick="Academy.openChapter(\'' + ch.id + '\')"><div class="c-num">' + ch.n + '</div><h3>' + ch.t + '</h3><p>' + ch.d + '</p>' + (ok ? '' : '<div class="lock-icon">🔒</div>') + '</div>';
        }).join('');
    }

    function openChapter(id) {
        var ch = chapters.find(function(c) { return c.id === id; });
        if (!ch || !canAccess(ch)) { SIT.showUpgrade(); return; }
        document.getElementById('chapterContent').innerHTML = getContent(id);
        document.getElementById('chapterModal').classList.add('active');
    }

    function closeChapter() { document.getElementById('chapterModal').classList.remove('active'); }

    function checkQuiz(btn, correct) {
        var p = btn.parentElement;
        var bs = p.querySelectorAll('.quiz-opt');
        var r = p.querySelector('.quiz-result');
        bs.forEach(function(b) { b.disabled = true; });
        if (correct) {
            btn.classList.add('correct');
            r.textContent = '✅ Correct!';
            r.style.color = 'var(--success)';
        } else {
            btn.classList.add('wrong');
            bs.forEach(function(b) { if (b.getAttribute('onclick').indexOf('true') !== -1) b.classList.add('correct'); });
            r.textContent = '❌ The correct answer is highlighted.';
            r.style.color = 'var(--error)';
        }
        r.style.display = 'block';
        var state = SIT.getState();
        state.academyProgress = Math.min(state.academyProgress + 2, 100);
        localStorage.setItem('sit_academyProgress', state.academyProgress);
        SIT.updateDashboardStats();
    }

    function getContent(id) {
        var c = {};
        
        c['seed'] = '<h1>Chapter 1: The Seed</h1><p><em>Where coffee begins. Origin, varieties, growing, and harvesting.</em></p>' +
            '<h2>1.1 The Coffee Belt</h2>' +
            '<p>Coffee grows in a narrow band around the center of the Earth, between the Tropics of Cancer and Capricorn. This region — the Bean Belt — provides the perfect combination of altitude, rainfall, and temperature that coffee needs to thrive.</p>' +
            '<p>The major growing regions stretch across Central and South America, Africa, and Asia. Each origin produces beans with distinct flavor characteristics shaped by the local soil, climate, and altitude.</p>' +
            '<div class="hl-box"><strong>Key insight:</strong> Coffee is a crop before it is a drink. The decisions made at origin — which variety to plant, how to harvest, how to process — determine everything you taste in the cup. Great baristas understand this chain.</div>' +
            '<h2>1.2 Arabica vs. Robusta</h2>' +
            '<p>The coffee world runs on two species: <strong>Coffea arabica</strong> and <strong>Coffea canephora</strong> (commonly called Robusta). They are different in almost every way.</p>' +
            '<p><strong>Arabica</strong> accounts for about 60-70% of global production. It grows at higher altitudes (1,200-2,200 meters), is more delicate, more susceptible to disease, and produces beans with higher sugar content and more complex acidity. This is specialty coffee\'s species.</p>' +
            '<p><strong>Robusta</strong> is hardier, more disease-resistant, grows at lower altitudes, and contains roughly twice the caffeine of Arabica. It has a stronger, harsher taste with earthy, woody, and sometimes rubbery notes. Robusta is common in instant coffee and traditional Italian espresso blends for crema and body.</p>' +
            '<h2>1.3 Heirloom Varieties</h2>' +
            '<p>Within Arabica, thousands of varieties exist. Some of the most prized:</p>' +
            '<ul><li><strong>Geisha/Gesha:</strong> Originally from Ethiopia, made famous in Panama. Jasmine, bergamot, stone fruit. The most expensive coffee variety in the world, with auction lots selling for hundreds of dollars per pound.</li>' +
            '<li><strong>Bourbon:</strong> Named after the island (now Réunion). Sweet, balanced, complex. The parent of many modern varieties.</li>' +
            '<li><strong>Typica:</strong> One of the oldest cultivated varieties. Clean cup, gentle acidity. The genetic baseline from which many cultivars descend.</li>' +
            '<li><strong>SL-28 & SL-34:</strong> Kenyan varieties developed by Scott Laboratories. Blackcurrant, tomato, intense acidity. Distinctly African character that coffee professionals either love or find overwhelming.</li>' +
            '<li><strong>Caturra:</strong> A natural mutation of Bourbon discovered in Brazil. Compact plant, high yield. Bright acidity but lighter body than Bourbon.</li>' +
            '<li><strong>Catuai:</strong> A cross between Mundo Novo and Caturra. High yield, disease resistant. Very common in Brazil and Central America.</li></ul>' +
            '<h2>1.4 Growing Conditions</h2>' +
            '<p><strong>Altitude</strong> is one of the biggest predictors of coffee quality. Higher elevations mean cooler temperatures, which slow the cherry\'s maturation. Slower growth allows more sugar to develop in the bean, resulting in more complex flavors.</p>' +
            '<ul><li><strong>Below 900m:</strong> Simple, mild, often nutty or chocolatey. Common in Brazilian commodity coffee.</li>' +
            '<li><strong>900-1,200m:</strong> Balanced, pleasant acidity. Good everyday specialty coffee.</li>' +
            '<li><strong>1,200-1,500m:</strong> Bright, complex, floral or fruity notes emerging.</li>' +
            '<li><strong>Above 1,500m:</strong> Intense acidity, pronounced origin character. The realm of competition-grade lots.</li></ul>' +
            '<p><strong>Shade-grown vs. sun-grown:</strong> Coffee evolved as an understory plant in Ethiopian forests. Shade-grown coffee preserves biodiversity, provides habitat for migratory birds, and often produces more complex flavors due to slower cherry maturation. Sun-grown coffee yields more per hectare but requires significantly more fertilizer and pesticide input.</p>' +
            '<h2>1.5 Harvesting</h2>' +
            '<p>Coffee cherries do not ripen all at once. On the same branch, you will find green (unripe), red (ripe), and purple (overripe) cherries side by side. This is why selective hand-picking matters — and why it costs more.</p>' +
            '<p>In specialty coffee, pickers return to the same tree multiple times over a harvest season, selecting only perfectly ripe cherries by hand. One picker harvests roughly 100-200 pounds of cherries per day. After processing and roasting, that becomes about 10-20 pounds of green coffee — enough for perhaps 500-1,000 cups.</p>' +
            '<p><strong>Strip picking:</strong> All cherries are stripped from the branch at once, regardless of ripeness. Faster and cheaper, but the mix of ripe and unripe fruit produces inconsistent quality. Common in commodity-grade and mechanical harvesting operations.</p>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>What percentage of global coffee production is Arabica?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">60-70%</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">30-40%</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">90-100%</button><p class="quiz-result"></p></div>';

        c['process'] = '<h1>Chapter 2: The Process</h1><p><em>Washed, natural, honey, and experimental. How processing shapes flavor.</em></p>' +
            '<h2>2.1 Understanding Coffee Processing</h2>' +
            '<p>Before coffee beans ever see a roaster, they are seeds inside fruit. Getting them out — and getting it right — is where flavor begins. The processing method is one of the biggest determinants of a coffee\'s final taste profile.</p>' +
            '<p>A ripe coffee cherry has distinct layers: outer skin (exocarp), sticky mucilage (mesocarp), papery parchment (endocarp), silver skin, and the bean (seed) at the center.</p>' +
            '<h2>2.2 Washed (Wet) Process</h2>' +
            '<p>In the washed process, you remove everything — skin, mucilage, all of it — before the bean dries. The bean dries naked. This produces clean, articulate coffees where origin characteristics shine through clearly.</p>' +
            '<p><strong>Step by step:</strong> Harvesting ripe cherries → Depulping to remove skin → Fermentation in water tanks for 12-72 hours where natural yeasts break down the mucilage → Washing with clean water → Drying on raised beds or patios for 7-15 days until 10-12% moisture.</p>' +
            '<div class="hl-box"><strong>Flavor profile:</strong> Clean, bright acidity, light to medium body, transparent origin character. Think jasmine, lemon, stone fruit, black tea.</div>' +
            '<h2>2.3 Natural (Dry) Process</h2>' +
            '<p>The oldest method. The entire cherry — skin, fruit, mucilage, and all — dries around the bean. As the fruit dries, sugars ferment and seep into the seed, creating intensely fruity, often wild flavors.</p>' +
            '<p>Cherries are sorted and laid out on raised beds or patios. They dry in the sun for 3-6 weeks, turned regularly to prevent mold. Once dried to 10-12% moisture, the fruit is mechanically removed.</p>' +
            '<div class="hl-box"><strong>Flavor profile:</strong> Heavy body, low acidity, intense fruit notes (blueberry, strawberry, tropical fruit), sometimes fermented or wine-like qualities. Can taste "funky" — loved or hated.</div>' +
            '<h2>2.4 Honey Process</h2>' +
            '<p>The middle path. The skin is removed, but the sticky mucilage is left on the bean during drying. The amount of mucilage left determines the "color" of the honey:</p>' +
            '<ul><li><strong>White honey:</strong> Minimal mucilage. Closest to washed. Clean, mild.</li>' +
            '<li><strong>Yellow honey:</strong> Moderate mucilage. Balanced sweetness and clarity.</li>' +
            '<li><strong>Red honey:</strong> Significant mucilage. Fuller body, pronounced sweetness.</li>' +
            '<li><strong>Black honey:</strong> Maximum mucilage. Almost natural-like intensity with more control.</li></ul>' +
            '<p>Developed in Costa Rica, honey processing offers a spectrum between washed cleanliness and natural fruitiness.</p>' +
            '<h2>2.5 Experimental Processes</h2>' +
            '<p>The specialty coffee world increasingly borrows from winemaking:</p>' +
            '<ul><li><strong>Anaerobic fermentation:</strong> Fermentation in sealed, oxygen-deprived tanks. Intensifies fruit character and creates unique flavor compounds.</li>' +
            '<li><strong>Carbonic maceration:</strong> Whole cherries fermented in CO₂-rich environments. Borrowed directly from Beaujolais winemaking. Produces wildly fruity, sometimes boozy notes.</li>' +
            '<li><strong>Koji fermentation:</strong> Using the same mold that makes sake and miso. Umami, savory complexity in coffee.</li>' +
            '<li><strong>Lactic fermentation:</strong> Encouraging lactic acid bacteria. Creamy, yogurt-like body and fermented fruit notes.</li></ul>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>Which processing method dries the bean inside the whole cherry?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">Washed</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">Natural</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">Honey</button><p class="quiz-result"></p></div>';

        c['roast'] = '<h1>Chapter 3: The Roast</h1><p><em>Chemistry, curves, and crack. The transformation of green to brown.</em></p>' +
            '<h2>3.1 What Roasting Actually Does</h2>' +
            '<p>Green coffee beans are dense, grassy-smelling seeds. Roasting transforms them through a cascade of chemical reactions into the aromatic, brittle beans we grind and brew. Understanding roasting helps baristas taste more intelligently and communicate better with roasters.</p>' +
            '<h2>3.2 The Roasting Curve</h2>' +
            '<p>Every roast follows a temperature-over-time curve. Key moments:</p>' +
            '<ul><li><strong>Drying phase:</strong> First few minutes. Moisture evaporates. Bean color shifts from green to yellow to light brown.</li>' +
            '<li><strong>Maillard reaction:</strong> Around 150°C (300°F). Amino acids and sugars react. This is the same browning reaction that gives bread crust and seared steak their flavor. Hundreds of flavor compounds form.</li>' +
            '<li><strong>First crack:</strong> Around 195°C (385°F). Water vapor and CO₂ build up inside the bean until it audibly cracks. Like popcorn, but quieter. The bean expands, the silverskin flakes off. This marks the beginning of drinkable coffee.</li>' +
            '<li><strong>Caramelization:</strong> Above first crack, sugars break down further. Acidity decreases, body increases.</li>' +
            '<li><strong>Second crack:</strong> Around 225°C (440°F). The bean\'s cellulose structure fractures. Oils migrate to the surface. Roast character dominates origin character.</li></ul>' +
            '<h2>3.3 Roast Levels</h2>' +
            '<ul><li><strong>Light roast (City, Cinnamon):</strong> Dropped shortly after first crack. Bean surface is dry, no oils. Pronounced acidity, origin flavors dominant. Tasting notes: floral, citrus, herbal, tea-like.</li>' +
            '<li><strong>Medium roast (Full City, American):</strong> Dropped between first and second crack. Balanced acidity and body. Tasting notes: caramel, chocolate, nuts, balanced fruit.</li>' +
            '<li><strong>Medium-dark (Vienna, Light French):</strong> Dropped at the start of second crack. Oils appear on the surface. Roast notes emerge. Tasting notes: dark chocolate, toasted nuts, subtle smokiness.</li>' +
            '<li><strong>Dark roast (French, Italian):</strong> Well into second crack. Oily surface. Roast dominates. Tasting notes: smoke, ash, carbon, bitterness. Low acidity, heavy body.</li></ul>' +
            '<h2>3.4 Degassing</h2>' +
            '<p>Freshly roasted coffee releases CO₂ for days after roasting. This is why coffee bags have one-way valves — to let gas escape without letting oxygen in. Coffee needs rest time after roasting: 3-5 days for filter, 5-14 days for espresso. Too fresh, and the CO₂ interferes with extraction.</p>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>At what temperature does first crack typically occur?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">150°C (300°F)</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">195°C (385°F)</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">225°C (440°F)</button><p class="quiz-result"></p></div>';

        c['brew'] = '<h1>Chapter 4: The Brew</h1><p><em>Ratios, grind size, water chemistry. Extraction mastered.</em></p>' +
            '<h2>4.1 The Golden Ratio</h2>' +
            '<p>The Specialty Coffee Association recommends a ratio of 1:16 to 1:18 — one part coffee to 16-18 parts water. This translates to roughly 60 grams of coffee per liter of water.</p>' +
            '<ul><li><strong>Espresso:</strong> 1:2 (18g in, 36g out)</li><li><strong>Pour-over:</strong> 1:16 (20g coffee, 320g water)</li><li><strong>French Press:</strong> 1:15 (30g coffee, 450g water)</li><li><strong>Cold Brew concentrate:</strong> 1:4 to 1:8, diluted to taste</li></ul>' +
            '<h2>4.2 Grind Size — The Most Important Variable</h2>' +
            '<p>Grind size determines surface area exposed to water, which directly affects extraction rate.</p>' +
            '<ul><li><strong>Too fine:</strong> Over-extraction. Bitter, astringent, hollow.</li><li><strong>Too coarse:</strong> Under-extraction. Sour, salty, weak.</li><li><strong>Just right:</strong> Sweet, balanced, complex.</li></ul>' +
            '<p><strong>Grind sizes by method:</strong> Turkish (powder), Espresso (fine salt), AeroPress (fine to medium), Pour-over V60 (medium-fine), Drip (medium), Chemex (medium-coarse), French Press (coarse sea salt), Cold Brew (extra coarse).</p>' +
            '<h2>4.3 Brewing Methods</h2>' +
            '<p><strong>Espresso:</strong> Pressurized water (9 bars) forced through finely ground coffee. Produces a concentrated shot with crema. Time: 25-30 seconds. Ratio: 1:2.</p>' +
            '<p><strong>Pour-over (V60, Kalita, Chemex):</strong> Hot water poured over coffee in a filter. Gravity does the work. Time: 2:30-4:00. Gives you the most control over every variable.</p>' +
            '<p><strong>French Press:</strong> Immersion brewing. Coffee steeps in hot water for 4 minutes, then a mesh plunger separates grounds. Full-bodied because oils pass through the metal filter.</p>' +
            '<p><strong>AeroPress:</strong> Combines immersion and pressure. Versatile, portable, forgiving. Time: 1:30-2:00. Hundreds of recipes exist.</p>' +
            '<p><strong>Cold Brew:</strong> Room temperature or cold water steeped with coarse grounds for 12-24 hours. Low acidity, smooth, chocolate-forward. Served cold or over ice.</p>' +
            '<h2>4.4 Water Chemistry</h2>' +
            '<p>Water is 98% of brewed coffee. Its mineral content dramatically affects extraction.</p>' +
            '<ul><li><strong>Too soft (low TDS):</strong> Flat, weak coffee. Not enough minerals to extract flavor.</li><li><strong>Too hard (high TDS):</strong> Muted, chalky coffee. Excess minerals buffer acids and block extraction.</li><li><strong>Ideal:</strong> 75-175 ppm TDS, with calcium and magnesium for extraction and bicarbonate for buffering.</li></ul>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>What happens when you grind too fine?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">Under-extraction (sour taste)</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">Over-extraction (bitter taste)</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">Nothing — grind size doesn\'t matter</button><p class="quiz-result"></p></div>';

        c['cup'] = '<h1>Chapter 5: The Cup</h1><p><em>Tasting, cupping, the flavor wheel. Learning to speak coffee.</em></p>' +
            '<h2>5.1 How to Taste Coffee</h2>' +
            '<p>Tasting is a skill, not a talent. It can be learned. The key is slowing down and paying attention to what your senses are already detecting.</p>' +
            '<p><strong>The five attributes:</strong></p>' +
            '<ul><li><strong>Aroma:</strong> What you smell before and during drinking. Most of what we perceive as "taste" is actually smell.</li>' +
            '<li><strong>Acidity:</strong> The bright, lively quality. Not sour — think citrus, apple, wine. Described by intensity and type (citric, malic, phosphoric, acetic).</li>' +
            '<li><strong>Body:</strong> Mouthfeel. Light (tea-like), medium (whole milk), heavy (cream).</li>' +
            '<li><strong>Flavor:</strong> The overall taste impression. What specific notes can you identify?</li>' +
            '<li><strong>Aftertaste:</strong> What lingers after swallowing. Pleasant? Unpleasant? How long?</li></ul>' +
            '<h2>5.2 The SCA Flavor Wheel</h2>' +
            '<p>The Specialty Coffee Association\'s Flavor Wheel is the industry standard for describing coffee. It starts broad and narrows down:</p>' +
            '<ul><li><strong>Fruity:</strong> Berry, dried fruit, citrus, stone fruit, tropical</li><li><strong>Floral:</strong> Jasmine, rose, chamomile, honeysuckle</li><li><strong>Sweet:</strong> Brown sugar, molasses, honey, caramel, vanilla</li><li><strong>Nutty/Cocoa:</strong> Almond, hazelnut, dark chocolate, milk chocolate</li><li><strong>Spices:</strong> Cinnamon, clove, black pepper, nutmeg</li><li><strong>Roasted:</strong> Smoky, tobacco, burnt, ash (usually defects at high levels)</li></ul>' +
            '<div class="hl-box"><strong>Practice tip:</strong> Taste two very different coffees side by side — a washed Ethiopian and a natural Brazilian, for example. The differences will be obvious, and that contrast trains your palate faster than tasting alone.</div>' +
            '<h2>5.3 Cupping Protocol</h2>' +
            '<p>Cupping is the industry standard for evaluating coffee. It\'s how roasters decide what to buy and how baristas calibrate.</p>' +
            '<ol><li><strong>Smell the dry grounds:</strong> Fragrance</li><li><strong>Add hot water (just off boil):</strong> Smell again — this is the aroma</li><li><strong>Wait 4 minutes:</strong> A crust forms on top</li><li><strong>Break the crust:</strong> Push the grounds aside with a spoon while inhaling deeply. This is the most intense aromatic moment</li><li><strong>Skim:</strong> Remove floating grounds and foam</li><li><strong>Slurp:</strong> Spoon coffee, slurp it vigorously across your palate. The loud slurp aerates the coffee, distributing it across your tongue and retro-nasal passages</li><li><strong>Score:</strong> Rate fragrance/aroma, flavor, aftertaste, acidity, body, balance, uniformity, cleanliness, sweetness, and overall impression</li></ol>' +
            '<h2>5.4 Building Your Vocabulary</h2>' +
            '<p>Moving beyond "smooth" and "strong":</p>' +
            '<ul><li>Instead of "smooth," try: balanced, round, silky, integrated</li><li>Instead of "strong," try: bold, intense, concentrated, robust</li><li>Instead of "acidic," try: bright, lively, crisp, tangy, sharp</li></ul>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>What is the purpose of slurping during cupping?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">It cools the coffee faster</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">It aerates the coffee and distributes it across the palate</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">It\'s just tradition with no practical purpose</button><p class="quiz-result"></p></div>';

        c['art'] = '<h1>Chapter 6: The Art</h1><p><em>Milk science, crema, pattern theory. The why behind every pour.</em></p>' +
            '<h2>6.1 Milk Science</h2>' +
            '<p>Great latte art starts with properly steamed milk. Understanding what\'s happening inside the pitcher is essential.</p>' +
            '<p>Milk is water, protein, fat, and sugar (lactose). When you steam:</p>' +
            '<ul><li><strong>Proteins</strong> denature and form a network that traps air bubbles. This is what creates microfoam.</li><li><strong>Fats</strong> coat the air bubbles, stabilizing the foam and adding richness.</li><li><strong>Lactose</strong> breaks down into sweeter compounds at higher temperatures.</li></ul>' +
            '<p><strong>Whole milk</strong> (3.5% fat): The standard. Produces silky, stable foam. Easiest to work with.</p>' +
            '<p><strong>Skim milk</strong> (0% fat): Foams easily but the bubbles are less stable. Foam separates quickly. Can produce sharp contrast in art.</p>' +
            '<p><strong>Alternative milks:</strong> Oat (best for art — similar protein/fat profile to dairy), soy (good foam, can curdle at high heat), almond (thin, harder to work with), coconut (separates easily).</p>' +
            '<h2>6.2 The Temperature Window</h2>' +
            '<p>The ideal milk temperature for latte art is 55-65°C (131-149°F). Above 70°C (158°F), proteins break down and the milk scalds — foam collapses, sweetness disappears, and the milk tastes burnt. Below 50°C (122°F), the milk is too cool for proper foam stability.</p>' +
            '<div class="hl-box"><strong>Barista trick:</strong> When the pitcher becomes too hot to hold comfortably against your palm, the milk is at the right temperature. This is more reliable than a thermometer once you develop the feel.</div>' +
            '<h2>6.3 Stretching vs. Texturing</h2>' +
            '<p><strong>Stretching (aeration):</strong> The first phase. The steam wand tip is near the surface, introducing air with a gentle tearing sound. This creates volume. Duration depends on your drink: 2-3 seconds for a flat white, 5-7 seconds for a cappuccino.</p>' +
            '<p><strong>Texturing (incorporation):</strong> The second phase. The wand tip is submerged deeper, creating a whirlpool that breaks large bubbles into microfoam. This is where the silky, wet-paint texture develops.</p>' +
            '<p>The goal is microfoam: bubbles so small they\'re invisible individually, creating a glossy, paint-like surface. The milk should look like melted ice cream.</p>' +
            '<h2>6.4 Espresso for Art</h2>' +
            '<p>The canvas matters as much as the paint. A good shot for latte art has:</p>' +
            '<ul><li><strong>Fresh crema:</strong> The golden-brown foam on top of espresso. Crema is a foam of CO₂ bubbles coated with coffee oils.</li><li><strong>Good contrast:</strong> The crema should be thick enough to hold its color against the milk.</li><li><strong>Proper timing:</strong> Pour within 30 seconds of pulling the shot. Crema dissipates quickly.</li></ul>' +
            '<h2>6.5 Pattern Theory</h2>' +
            '<p>Every latte art design follows the same physics:</p>' +
            '<ul><li><strong>Flow rate:</strong> The speed of your pour controls how the milk penetrates the crema. Fast pour = milk dives deep. Slow pour = milk floats on top.</li><li><strong>Distance:</strong> Pitcher spout close to the surface = more control, sharper lines. Higher up = milk submerges, no surface design.</li><li><strong>Movement:</strong> The wiggle (side-to-side oscillation) creates the rippled leaves in rosettas.</li><li><strong>Pull-through:</strong> The final motion that cuts through the design. Should be slow and elevated to avoid destroying your work.</li></ul>' +
            '<h2>6.6 Common Mistakes</h2>' +
            '<ul><li><strong>Foam too thick:</strong> Looks like a blob of whipped cream. Solution: stretch less, texture more.</li><li><strong>Foam too thin:</strong> Milk mixes with crema, no contrast. Solution: stretch more before texturing.</li><li><strong>Pouring too fast:</strong> Breaks the crema surface, creates blobs.</li><li><strong>Pitcher too high:</strong> Milk sinks, no surface design.</li><li><strong>Pitcher too low:</strong> Spout drags through crema.</li></ul>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>What is the ideal milk temperature range for latte art?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">35-45°C (95-113°F)</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">55-65°C (131-149°F)</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">75-85°C (167-185°F)</button><p class="quiz-result"></p></div>';

        c['industry'] = '<h1>Chapter 7: The Industry</h1><p><em>Careers, competitions, the supply chain. Your place in coffee.</em></p>' +
            '<h2>7.1 The Coffee Supply Chain</h2>' +
            '<p>Understanding who gets paid what is essential for any coffee professional.</p>' +
            '<ol><li><strong>Farmer:</strong> Grows and harvests the coffee. Typically receives 1-3% of the final retail price of a bag of specialty coffee. This is the most vulnerable link.</li><li><strong>Processor/Mill:</strong> Processes cherries into green coffee.</li><li><strong>Exporter:</strong> Aggregates coffee, handles logistics, navigates regulations.</li><li><strong>Importer:</strong> Brings coffee into consuming countries.</li><li><strong>Roaster:</strong> Transforms green coffee into roasted coffee. This is where most of the value is added.</li><li><strong>Retailer/Café:</strong> Sells the final cup. Captures the largest margin per serving.</li></ol>' +
            '<div class="hl-box"><strong>The reality:</strong> A $20 bag of specialty coffee might have paid the farmer $0.50-$1.00. Direct trade and relationship coffee models aim to shorten this chain and increase farmer compensation.</div>' +
            '<h2>7.2 Competition Pathways</h2>' +
            '<p>Coffee competitions are the Olympics of the industry. They\'re how careers are made.</p>' +
            '<ul><li><strong>World Barista Championship (WBC):</strong> The big one. 15 minutes to prepare 4 espressos, 4 milk drinks, and 4 signature beverages while delivering a presentation.</li><li><strong>World Latte Art Championship (WLAC):</strong> Head-to-head pour battles.</li><li><strong>World Brewers Cup:</strong> Manual brewing competition focused on filter coffee.</li><li><strong>World Cup Tasters Championship:</strong> Triangulation — identify the odd cup out of three. Fastest time wins.</li><li><strong>Coffee in Good Spirits:</strong> Coffee cocktails.</li></ul>' +
            '<h2>7.3 Career Paths</h2>' +
            '<p><strong>The café track:</strong> Barista → Head Barista → Café Manager → Operations Manager → Director of Coffee</p>' +
            '<p><strong>The roastery track:</strong> Production Roaster → Head Roaster → Green Buyer → Director of Coffee</p>' +
            '<p><strong>The education track:</strong> Barista Trainer → SCA Certified Trainer → Coffee Educator → Author/Content Creator</p>' +
            '<p><strong>The competition track:</strong> Competitor → National Champion → World Competitor → Consultant/Brand Ambassador</p>' +
            '<h2>7.4 Certifications That Matter</h2>' +
            '<ul><li><strong>SCA Coffee Skills Program:</strong> The industry standard. Modules in Barista Skills, Brewing, Green Coffee, Roasting, and Sensory Skills. Foundation → Intermediate → Professional.</li><li><strong>Q Grader:</strong> The coffee industry\'s sommelier certification. Licensed by the Coffee Quality Institute. Requires passing 22 sensory tests over three days.</li><li><strong>AST (Authorized SCA Trainer):</strong> Qualified to teach SCA certification courses.</li></ul>' +
            '<h2>7.5 The Future of Coffee</h2>' +
            '<p><strong>Climate change:</strong> By 2050, up to 50% of current coffee-growing land may be unsuitable. Wild Arabica is already endangered.</p>' +
            '<p><strong>Equity:</strong> The specialty coffee industry is increasingly reckoning with its colonial roots.</p>' +
            '<p><strong>Innovation:</strong> Molecular coffee, fermented coffee products, RTD specialty cans — coffee is diversifying beyond the cup.</p>' +
            '<div class="quiz"><h3>Quick Quiz</h3><p>What does Q Grader certification test?</p><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">Espresso extraction theory</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,false)">Barista speed and efficiency</button><button class="quiz-opt" onclick="Academy.checkQuiz(this,true)">Sensory skills — the ability to identify and grade coffee quality</button><p class="quiz-result"></p></div>';

        return c[id] || '<h1>Coming Soon</h1><p>This chapter is being written.</p>';
    }

    return {
        getChapters: getChapters,
        canAccess: canAccess,
        populateAcademy: populateAcademy,
        openChapter: openChapter,
        closeChapter: closeChapter,
        checkQuiz: checkQuiz,
        getContent: getContent
    };
})();