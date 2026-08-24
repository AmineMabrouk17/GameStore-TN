-- GameStore TN — seed data
-- Apply locally: npm run db:seed:local
-- Safe to run on a fresh database; re-running duplicates rows.

INSERT INTO categories (id, name_ar, name_fr, slug, icon_url) VALUES
    ('cat-free-fire', 'فري فاير', 'Free Fire', 'free-fire', '/games/free-fire.svg'),
    ('cat-efootball', 'بيس / eFootball', 'PES / eFootball', 'efootball-pes', '/games/efootball.svg'),
    ('cat-pubg', 'ببجي موبايل', 'PUBG Mobile', 'pubg-mobile', '/games/pubg.svg'),
    ('cat-valorant', 'فالورانت', 'Valorant', 'valorant', '/games/valorant.svg'),
    ('cat-steam', 'ستيم / ألعاب PC', 'Steam / PC Games', 'steam-games', '/games/steam.svg');

INSERT INTO products (id, title_ar, title_fr, category_id, price, currency, description_ar, description_fr, images, status, featured, created_at) VALUES
    ('ff-diamond-elite',
     'حساب فري فاير — رانك الماس + 20 سكن',
     'Compte Free Fire — Rang Diamant + 20 skins',
     'cat-free-fire', 89.0, 'TND',
     'حساب فري فاير نادر، رانك الماس، أكثر من 20 سكن حصري بما في ذلك سكنات Alok و K. بريد إلكتروني قابل للتغيير.',
     'Compte Free Fire rare, rang Diamant, plus de 20 skins exclusifs incluant Alok et K. Email changeable.',
     '["/games/free-fire.svg","/games/free-fire-2.svg"]',
     'AVAILABLE', 1, datetime('now', '-2 days')),

    ('ff-elite-starter',
     'حساب فري فاير — بداية Elite Pass',
     'Compte Free Fire — Starter Elite Pass',
     'cat-free-fire', 45.0, 'TND',
     'حساب نظيف مع Elite Pass الحالي، مستوى 45، عدة أسلحة مطورة.',
     'Compte propre avec le passe Elite actuel, niveau 45, plusieurs armes améliorées.',
     '["/games/free-fire.svg"]',
     'AVAILABLE', 0, datetime('now', '-1 day')),

    ('pes-legends-messi',
     'حساب eFootball — ميسي و نيمار أسطوري',
     'Compte eFootball — Messi & Neymar légendaires',
     'cat-efootball', 149.0, 'TND',
     'فريق أسطوري مع ميسي ونيمار وبطاقات Black Ball متعددة. متوافق مع iOS و Android.',
     'Équipe légendaire avec Messi, Neymar et plusieurs cartes Black Ball. Compatible iOS et Android.',
     '["/games/efootball.svg","/games/efootball-2.svg"]',
     'AVAILABLE', 1, datetime('now', '-3 days')),

    ('pes-budget-squad',
     'حساب PES — فريق اقتصادي قوي',
     'Compte PES — Squad économique solide',
     'cat-efootball', 35.0, 'TND',
     'فريق متوازن مع بطاقات ذهبية، مناسب للبداية السريعة في myClub.',
     'Effectif équilibré avec cartes dorées, parfait pour démarrer vite en myClub.',
     '["/games/efootball.svg"]',
     'RESERVED', 0, datetime('now', '-5 hours')),

    ('pubg-royale-pass',
     'حساب ببجي موبايل — Royale Pass كامل',
     'Compte PUBG Mobile — Royale Pass complet',
     'cat-pubg', 120.0, 'TND',
     'حساب ببجي موبايل مع Royale Pass MK47 مسدود، طائرات نادرة وأميال Conqueror سابقة.',
     'Compte PUBG Mobile avec Royal Pass complet, avions rares et ancien mileage Conqueror.',
     '["/games/pubg.svg"]',
     'SOLD', 0, datetime('now', '-6 days')),

    ('pubg-uc-starter',
     'حساب ببجي موبايل — 660 UC + بدلات نادرة',
     'Compte PUBG Mobile — 660 UC + tenues rares',
     'cat-pubg', 60.0, 'TND',
     'حساب ببجي موبايل مع 660 UC، بدلات M416 مطورة ومستوى Royale Pass نشط.',
     'Compte PUBG Mobile avec 660 UC, M416 améliorée et Royal Pass actif.',
     '["/games/pubg.svg"]',
     'AVAILABLE', 0, datetime('now', '-4 days')),

    ('valorant-radiant-smurf',
     'حساب Valorant — Radiant سابق + سكنات Prime',
     'Compte Valorant — Ex-Radiant + skins Prime',
     'cat-valorant', 199.0, 'TND',
     'حساب EU مع أعلى رانك سابق Radiant، سكنات Prime و Reaver، جميع الوكلاء مفتوحين.',
     'Compte EU ayant atteint Radiant, skins Prime et Reaver, tous les agents débloqués.',
     '["/games/valorant.svg","/games/valorant-2.svg"]',
     'AVAILABLE', 1, datetime('now', '-8 hours')),

    ('steam-aaa-library',
     'حساب Steam — مكتبة AAA (+10 ألعاب)',
     'Compte Steam — Bibliothèque AAA (+10 jeux)',
     'cat-steam', 59.0, 'EUR',
     'حساب Steam عمره سنتان مع GTA V، Elden Ring، Cyberpunk 2077 والمزيد. بريد كامل مع التغيير الآمن.',
     'Compte Steam de 2 ans avec GTA V, Elden Ring, Cyberpunk 2077 et plus. Email full access avec changement sécurisé.',
     '["/games/steam.svg","/games/steam-2.svg"]',
     'AVAILABLE', 0, datetime('now', '-30 minutes'));

INSERT INTO admins (id, username, password_hash) VALUES
    ('admin-root', 'admin', 'pbkdf2_sha256$100000$pKrqVQuais4kM9bI8oywKg==$TPqAHk3lRsYD2v8zUiLV82SOxjFPJrHPvU+nBnrAF5I=');
