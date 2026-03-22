/**
 * Isaac Dead God Tracker — Détecteur d'images 404
 *
 * À coller dans la console du navigateur (dev server Vite uniquement).
 * Teste :
 *   - Images déjà cassées dans le DOM
 *   - 641 achievement icons
 *   - ~730 collectible icons
 *   - 34 portraits de personnages
 *   - 18 completion marks
 *
 * Résultats groupés + liste copiée dans le clipboard.
 */
(async () => {
  // ── Chargement des modules Vite ──────────────────────────────────────────
  console.log('%c[Isaac Image Tester] Chargement des modules...', 'color: #d4aa58');

  // JSON via fetch (Firefox refuse import() sur .json)
  const [achievements, collectibles] = await Promise.all([
    fetch('/src/data/achievements.json').then(r => r.json()),
    fetch('/src/data/collectibles.json').then(r => r.json()),
  ]);

  // Modules JS via import()
  const [charMod, spritesMod, urlsMod] = await Promise.all([
    import('/src/data/characterMarks.js'),
    import('/src/utils/sprites.js'),
    import('/src/utils/urls.js'),
  ]);

  const { CHARACTERS, NORMAL_MARK_KEYS, TAINTED_MARK_KEYS } = charMod;
  const { getCharSprite, getTaintedCharSprite, getMarkSprite } = spritesMod;
  const { achIconUrl, collIconUrl } = urlsMod;

  // ── 1. SCAN DOM — images déjà cassées dans la vue ────────────────────────
  const domBroken = [...document.querySelectorAll('img')]
    .filter(img => {
      const s = img.getAttribute('style') || '';
      return s.includes('visibility: hidden') || s.includes('display: none');
    })
    .map(img => new URL(img.src).pathname);

  // ── 2. GÉNÉRER TOUTES LES URLs ATTENDUES ─────────────────────────────────

  // Achievement icons (641)
  const achUrls = Object.values(achievements).map(a => achIconUrl(a.name));

  // Collectible icons (~730)
  const collUrls = Object.values(collectibles).map(name => collIconUrl(name));

  // Character portraits (17 normaux + 17 tainted = 34)
  const charUrls = CHARACTERS
    .map(c => c.tainted ? getTaintedCharSprite(c.key) : getCharSprite(c.key))
    .filter(Boolean);

  // Completion marks (dédupliqués par URL réelle)
  const markUrls = [
    ...new Set(
      [...NORMAL_MARK_KEYS, ...TAINTED_MARK_KEYS]
        .map(k => getMarkSprite(k))
        .filter(Boolean)
    ),
  ];

  // ── 3. TEST HEAD REQUESTS (batches de 50 en parallèle) ───────────────────
  async function testBatch(urls, concurrency = 50) {
    const failed = [];
    for (let i = 0; i < urls.length; i += concurrency) {
      const batch = urls.slice(i, i + concurrency);
      const results = await Promise.all(
        batch.map(url =>
          fetch(url, { method: 'HEAD' })
            .then(r => r.ok ? null : url)
            .catch(() => url)
        )
      );
      failed.push(...results.filter(Boolean));
    }
    return failed;
  }

  console.log('%c[Isaac Image Tester] Tests en cours...', 'color: #d4aa58');

  const [achFailed, collFailed, charFailed, markFailed] = await Promise.all([
    testBatch(achUrls),
    testBatch(collUrls),
    testBatch(charUrls),
    testBatch(markUrls),
  ]);

  // ── 4. RAPPORT ────────────────────────────────────────────────────────────
  const allFailed = [
    ...new Set([...domBroken, ...achFailed, ...collFailed, ...charFailed, ...markFailed]),
  ];

  console.log('━━━ Isaac Image Tester ━━━━━━━━━━━━━━━━━━━━━━━━');

  console.table([
    { Catégorie: 'DOM (vue actuelle)', Total: '—',              Cassées: domBroken.length, Statut: domBroken.length  ? '⚠' : '✓' },
    { Catégorie: 'Achievement icons',  Total: achUrls.length,  Cassées: achFailed.length,  Statut: achFailed.length  ? '✗' : '✓' },
    { Catégorie: 'Collectible icons',  Total: collUrls.length, Cassées: collFailed.length, Statut: collFailed.length ? '✗' : '✓' },
    { Catégorie: 'Portraits',          Total: charUrls.length, Cassées: charFailed.length, Statut: charFailed.length ? '✗' : '✓' },
    { Catégorie: 'Completion marks',   Total: markUrls.length, Cassées: markFailed.length, Statut: markFailed.length ? '✗' : '✓' },
  ]);

  if (allFailed.length === 0) {
    console.log('%c✓ Aucune image cassée.', 'color: #58b858; font-weight: bold');
  } else {
    console.log(`%c✗ ${allFailed.length} image(s) cassée(s) :`, 'color: #e05858; font-weight: bold');
    allFailed.forEach(url => console.log('  ' + url));
    try {
      copy(allFailed.join('\n'));
      console.log('%c✓ Liste copiée dans le clipboard', 'color: #58b858');
    } catch {
      console.log('%c⚠ copy() indisponible dans Firefox — copiez manuellement', 'color: #c8ae8a');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})();
