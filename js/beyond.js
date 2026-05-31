// ==========================================
// SIT Beyond the Cup - All 4 Sections
// ==========================================

var Beyond = (function() {
    var cards = [
        { i: '🍽️', t: 'Culinary', d: '12 recipes. Coffee rubs, espresso brownies, tiramisu, cocktails, and more.', count: '12 recipes', id: 'culinary', l: false },
        { i: '✨', t: 'Body & Beauty', d: '8 recipes. Coffee body scrub, face mask, hair rinse, lip balm, soap.', count: '8 recipes', id: 'beauty', l: true },
        { i: '🌱', t: 'Home & Garden', d: '10 guides. Composting, pest control, deodorizer, natural dyeing, candles.', count: '10 guides', id: 'garden', l: true },
        { i: '🎨', t: 'Creative', d: '6 projects. Coffee painting, mushroom growing, play-dough, photography.', count: '6 projects', id: 'creative', l: true }
    ];

    function getCards() { return cards; }

    function canAccess(cd) {
        return SIT.hasAccess() || !cd.l;
    }

    function populateBeyond() {
        var grid = document.getElementById('beyondGrid');
        if (!grid) return;
        grid.innerHTML = cards.map(function(cd) {
            var ok = canAccess(cd);
            return '<div class="info-card' + (ok ? '' : ' locked') + '" onclick="Beyond.openBeyond(\'' + cd.id + '\')"><div class="c-icon">' + cd.i + '</div><h3>' + cd.t + '</h3><p>' + cd.d + '</p><span class="c-count">' + cd.count + '</span>' + (ok ? '' : '<div class="lock-icon">🔒</div>') + '</div>';
        }).join('');
    }

    function openBeyond(id) {
        var cd = cards.find(function(c) { return c.id === id; });
        if (!cd || !canAccess(cd)) { SIT.showUpgrade(); return; }
        document.getElementById('chapterContent').innerHTML = getContent(id);
        document.getElementById('chapterModal').classList.add('active');
    }

    function getContent(id) {
        var b = {};
        
        b['culinary'] = '<h1>Coffee in the Kitchen</h1><p><em>12 recipes that prove coffee belongs in your food, not just your cup.</em></p>' +
            '<h2>1. Espresso Brownies</h2><p>The richest brownies you\'ll ever make. Espresso doesn\'t make these taste like coffee — it makes the chocolate taste more like chocolate.</p>' +
            '<div class="hl-box"><strong>Recipe:</strong> 200g dark chocolate (70%), 150g unsalted butter, 2 shots espresso (60ml), 200g brown sugar, 3 large eggs, 100g all-purpose flour, 30g cocoa powder, pinch of flaky sea salt.<br><br><strong>Method:</strong> Melt chocolate, butter, and espresso together. Whisk sugar and eggs until pale and thick. Fold in chocolate mixture. Sift in flour and cocoa. Pour into lined 8x8 pan. Bake at 180°C (350°F) for 22-25 minutes — the center should still have a slight wobble. Cool completely before cutting.</div>' +
            '<h2>2. Coffee-Rubbed Steak</h2><p>Spent coffee grounds, dried and mixed with spices, make an incredible steak rub. The coffee\'s acidity helps tenderize the meat while adding a deep, smoky crust.</p>' +
            '<div class="hl-box"><strong>Rub Recipe:</strong> 2 tbsp dried spent coffee grounds, 1 tbsp brown sugar, 1 tsp smoked paprika, 1 tsp garlic powder, 1 tsp kosher salt, ½ tsp black pepper, ¼ tsp cayenne (optional).<br><br>Pat steak dry. Coat generously with rub. Let rest at room temperature for 30 minutes. Grill or pan-sear to desired doneness.</div>' +
            '<h2>3. Classic Espresso Martini</h2><p>Created in London\'s Soho in the 1980s, the espresso martini is the perfect after-dinner cocktail.</p>' +
            '<div class="hl-box"><strong>Recipe:</strong> 50ml vodka, 25ml fresh espresso (cooled slightly), 25ml coffee liqueur (Kahlúa or Mr. Black), 10ml simple syrup (optional).<br><br>Shake all ingredients hard with ice for 15 seconds. Double strain into a chilled coupe glass. The shaking creates the signature foam from the espresso\'s crema. Garnish with three coffee beans — representing health, wealth, and happiness.</div>' +
            '<h2>4. Authentic Tiramisu</h2><p>The real Italian version — no cream, no alcohol needed. Just coffee, mascarpone, eggs, and cocoa.</p>' +
            '<div class="hl-box"><strong>Recipe:</strong> 6 egg yolks, 120g sugar, 500g mascarpone cheese, 300ml strong brewed coffee (cooled), 30-40 ladyfinger biscuits (savoiardi), unsweetened cocoa powder for dusting.<br><br>Beat yolks with sugar until thick and pale. Fold in mascarpone. Briefly dip each ladyfinger in coffee (don\'t soak — just a quick dip). Layer: biscuits, cream, biscuits, cream. Dust top generously with cocoa. Refrigerate at least 6 hours, ideally overnight.</div>' +
            '<h2>5. Coffee-Braised Short Ribs</h2><p>Add 250ml of strong brewed coffee to your braising liquid along with beef stock, red wine, onions, carrots, and garlic. The coffee\'s roasted notes complement the caramelized meat beautifully. Cook low and slow for 3-4 hours.</p>' +
            '<h2>6. Red-Eye Gravy</h2><p>A Southern classic. After frying country ham, deglaze the pan with strong black coffee. Scrape up the browned bits. Simmer until slightly reduced. Serve over biscuits, ham, and grits. The combination of salty ham, bitter coffee, and rich pan drippings is addictive.</p>' +
            '<h2>7. Mole Sauce with Coffee</h2><p>Oaxacan mole negro traditionally uses many ingredients — chiles, nuts, seeds, spices, chocolate, and sometimes coffee. Add ½ cup of strong brewed coffee to your mole for an earthy depth that complements the dried chiles perfectly.</p>' +
            '<h2>8. Coffee Negroni</h2><p>Equal parts gin, sweet vermouth, and Campari — plus 30ml of cold brew concentrate. The coffee adds body and a bitter-roasted note that plays beautifully with the Campari. Stir with ice, strain over a large cube, garnish with an orange twist.</p>' +
            '<h2>9. No-Churn Coffee Ice Cream</h2><p>Whip 500ml heavy cream to soft peaks. Fold in one can of sweetened condensed milk mixed with 60ml of very strong espresso or cold brew concentrate. Freeze 6 hours. The coffee flavor intensifies as it freezes.</p>' +
            '<h2>10. Mocha Overnight Oats</h2><p>Combine rolled oats, milk, yogurt, cocoa powder, and a shot of espresso. Refrigerate overnight. In the morning, top with banana, nuts, and a drizzle of honey. Breakfast that tastes like dessert with a caffeine kick.</p>' +
            '<h2>11. Spiced Coffee Rub for Chicken</h2><p>Mix finely ground coffee with brown sugar, chipotle powder, cumin, and salt. Rub on chicken thighs before grilling. The coffee caramelizes beautifully and adds a smoky-sweet crust.</p>' +
            '<h2>12. Affogato</h2><p>The simplest and most elegant coffee dessert. A scoop of good vanilla gelato or ice cream, drowned in a hot shot of freshly pulled espresso. The contrast of hot and cold, bitter and sweet, creamy and sharp — perfect in 30 seconds.</p>';

        b['beauty'] = '<h1>Coffee for Body & Beauty</h1><p><em>8 recipes for self-care using coffee.</em></p>' +
            '<h2>1. Coffee Body Scrub</h2><p>The classic. Coffee grounds are the perfect physical exfoliant — fine enough not to scratch, coarse enough to slough off dead skin. Caffeine temporarily tightens skin, which is why it appears in so many high-end cellulite creams.</p>' +
            '<div class="hl-box"><strong>Recipe:</strong> ½ cup spent coffee grounds (dried), ¼ cup coconut oil (melted), ¼ cup brown sugar, 5 drops vanilla essential oil (optional).<br><br>Mix all ingredients. Store in an airtight jar. Use in the shower — massage onto damp skin in circular motions, then rinse. The coconut oil leaves skin moisturized. Use within 2 weeks (or refrigerate).</div>' +
            '<h2>2. Coffee Face Mask</h2><p>Gentler than the body scrub. Coffee\'s antioxidants fight free radicals, and the mild acidity can help brighten skin.</p>' +
            '<div class="hl-box"><strong>Recipe:</strong> 1 tbsp very finely ground coffee, 1 tbsp plain yogurt, ½ tsp honey.<br><br>Mix into a paste. Apply to clean face, avoiding eye area. Leave for 10-15 minutes. Rinse with warm water in gentle circular motions. Follow with moisturizer.</div>' +
            '<h2>3. Under-Eye Treatment</h2><p>Caffeine is a vasoconstrictor — it narrows blood vessels, which can temporarily reduce puffiness and dark circles. Mix a tiny amount of coffee grounds with coconut oil, dab gently under eyes (very carefully — don\'t get in eyes), leave for 5-10 minutes, rinse.</p>' +
            '<h2>4. Coffee Hair Rinse</h2><p>Brewed coffee (cooled) poured through hair after shampooing can add shine and may darken hair slightly over time. The acidity helps close the hair cuticle. Rinse with cool coffee, leave for 5 minutes, rinse with water. Do not use on light-colored hair unless you want subtle darkening.</p>' +
            '<h2>5. Scalp Scrub</h2><p>Coffee grounds + a little conditioner = a gentle scalp exfoliant. Massage into scalp before shampooing. Removes product buildup and stimulates circulation. Use once a week.</p>' +
            '<h2>6. Coffee Lip Balm</h2><p>Infuse coffee into oil: warm 2 tbsp coconut oil with 1 tsp coffee grounds on very low heat for 30 minutes. Strain. Mix with 1 tbsp beeswax pellets, melt together, pour into small tins. The coffee oil adds a subtle color and flavor. Makes great gifts.</p>' +
            '<h2>7. Coffee Soap</h2><p>Add dried coffee grounds to melt-and-pour soap base. The grounds provide gentle exfoliation, and the coffee scent is naturally present. Use about 1 tbsp grounds per cup of soap base.</p>' +
            '<h2>8. Cellulite Massage Oil</h2><p>Infuse coffee in carrier oil (as above), add a few drops of grapefruit essential oil. Massage into skin daily. The combination of caffeine\'s temporary tightening effect plus massage stimulation may temporarily reduce cellulite appearance. Results are temporary but real.</p>';

        b['garden'] = '<h1>Coffee for Home & Garden</h1><p><em>10 guides for using coffee around the house.</em></p>' +
            '<h2>1. Composting with Coffee Grounds</h2><p>Coffee grounds are a "green" (nitrogen-rich) material in composting terms. They\'re about 2% nitrogen by volume. Mix with "browns" (carbon-rich materials like dried leaves, cardboard, straw) at roughly a 1:3 ratio. Grounds also attract earthworms, which accelerate decomposition.</p>' +
            '<div class="hl-box"><strong>Tip:</strong> Many cafés give away spent grounds for free. Ask your local shop — they\'re usually happy to have someone take it off their hands.</div>' +
            '<h2>2. Direct Soil Amendment</h2><p>Coffee grounds are slightly acidic (pH 6.5-6.8 after brewing), making them good for acid-loving plants. Sprinkle a thin layer around blueberries, azaleas, rhododendrons, roses, hydrangeas (for blue flowers — acidity affects color), and camellias. <strong>Don\'t</strong> use fresh (unbrewed) grounds — they\'re too acidic and can inhibit plant growth. Always use spent grounds.</p>' +
            '<h2>3. Worm Composting</h2><p>Composting worms (red wigglers) love coffee grounds. Add grounds to your worm bin in moderation — they\'re a grit source that helps worms digest food. Don\'t exceed about 25% of the total bedding volume.</p>' +
            '<h2>4. Natural Pest Deterrent</h2><p>Coffee grounds may deter slugs and snails (they don\'t like crawling over the gritty texture) and cats (they dislike the strong smell). Sprinkle a barrier around vulnerable plants. Reapply after rain. Note: evidence is anecdotal — don\'t expect 100% effectiveness.</p>' +
            '<h2>5. Deodorizing Your Fridge</h2><p>A bowl of dried coffee grounds in the back of the fridge absorbs odors just like baking soda. The grounds\' porous structure traps odor molecules. Replace every 2-3 weeks.</p>' +
            '<h2>6. Hand Deodorizer</h2><p>After chopping garlic, onions, or handling fish, rub a handful of spent coffee grounds over your wet hands. Rinse. The grounds physically scrub away odor molecules and leave hands smelling neutral.</p>' +
            '<h2>7. Scrubbing Tough Pots</h2><p>Coffee grounds are mildly abrasive without being destructive. Use them to scrub stubborn residue from pots, pans, and baking dishes. They won\'t scratch most surfaces (test on delicate non-stick first).</p>' +
            '<h2>8. Coffee Candles</h2><p>Add dried coffee grounds to melted soy wax when making candles. The grounds suspend in the wax and release a subtle coffee scent when the candle burns. Use about 1 tbsp grounds per cup of wax. Pour into heat-safe containers with a wick.</p>' +
            '<h2>9. Natural Fabric Dye</h2><p>Coffee produces beautiful vintage browns on natural fabrics like cotton, linen, and muslin. Simmer fabric in strong brewed coffee for an hour. The longer the soak, the darker the result. Fix with a vinegar rinse. Each piece is unique.</p>' +
            '<h2>10. Wood Stain for Small Projects</h2><p>Strong brewed coffee can stain unfinished wood a warm brown. Apply with a brush, let dry, and assess. Multiple coats build depth. Seal with clear wax or polyurethane. This is a non-toxic alternative to chemical stains — great for picture frames, small boxes, and craft projects.</p>';

        b['creative'] = '<h1>Coffee as Creative Medium</h1><p><em>6 projects where coffee is the art supply.</em></p>' +
            '<h2>1. Coffee Painting</h2><p>Using brewed coffee as watercolor. The technique is centuries old — coffee painting predates modern art supplies. The strength of the brew controls the shade: from pale tan (weak coffee) to deep espresso brown (strong or reduced coffee).</p>' +
            '<div class="hl-box"><strong>Getting started:</strong> Brew three concentrations: light, medium, and dark. Use watercolor paper — it handles the wet medium best. Layer from light to dark, just like watercolor. Let each layer dry before adding the next. Add instant coffee granules to wet areas for texture. A fine brush and dark coffee makes excellent line work. The smell while painting is a bonus.</div>' +
            '<h2>2. Coffee Grounds Play-Dough</h2><p>A kid-friendly activity. The coffee scent is pleasant, and the grounds add a speckled texture.</p>' +
            '<div class="hl-box"><strong>Recipe:</strong> 2 cups flour, ½ cup dried spent coffee grounds, 1 cup salt, 2 tbsp cream of tartar, 2 tbsp vegetable oil, 2 cups boiling water.<br><br>Mix dry ingredients. Add oil and boiling water. Stir until combined, then knead when cool enough. The dough is edible (tastes terrible, so kids won\'t eat much). Dries into permanent sculptures. Store in airtight container.</div>' +
            '<h2>3. Coffee-Stained Paper</h2><p>For vintage-effect paper: brew strong coffee, pour into a shallow baking dish. Briefly dip paper and lay flat to dry. For more texture, sprinkle dry instant coffee on the wet paper. The result is beautifully aged — perfect for wedding invitations, scrapbooking, or prop letters.</p>' +
            '<h2>4. Growing Mushrooms in Coffee Grounds</h2><p>Oyster mushrooms grow enthusiastically in spent coffee grounds. The grounds are already pasteurized from the brewing process, and the fine texture provides an ideal growing medium.</p>' +
            '<div class="hl-box"><strong>Basic method:</strong> Collect fresh spent grounds (use within 24 hours to avoid mold). Mix with oyster mushroom spawn (available online). Place in a container with air holes. Keep in a dark, warm place (20-24°C). Mist daily to maintain humidity. Mushrooms appear in 2-4 weeks. Harvest when the caps flatten out. Cook and eat. Then compost the spent substrate.</div>' +
            '<h2>5. Coffee Photography</h2><p>Coffee is an incredibly photogenic subject. Tips for phone photographers:</p><ul><li><strong>Flat lays:</strong> Arrange beans, grounds, a cup, and a plant on a neutral surface. Shoot from directly above in natural window light.</li><li><strong>Pour shots:</strong> Use burst mode to capture the moment milk hits crema. A tripod helps enormously.</li><li><strong>Steam:</strong> Backlight a hot cup to make steam visible. Dark backgrounds make steam pop.</li><li><strong>Beans:</strong> A macro lens (or phone macro mode) reveals the intricate surface of roasted beans.</li></ul>' +
            '<h2>6. Coffee Grounds Fossils</h2><p>Kids\' activity: Make a dough from coffee grounds, flour, salt, and water. Press small objects (leaves, shells, toy dinosaurs) into the dough to create impressions. Let dry completely — the coffee gives them an "ancient artifact" look. String them as necklaces or display them as "archaeological finds."</p>';

        return b[id] || '<h1>Coming Soon</h1>';
    }

    return {
        getCards: getCards,
        canAccess: canAccess,
        populateBeyond: populateBeyond,
        openBeyond: openBeyond,
        getContent: getContent
    };
})();