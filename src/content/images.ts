import type { ImageAsset } from '@/types/content';

/**
 * Photography manifest.
 *
 * Every image is a free-to-use photo under the Unsplash License, verified on its
 * public Unsplash page (license line, photographer, CDN path). Images are served
 * from Unsplash's CDN, which handles resizing and AVIF/WebP negotiation.
 *
 * These are stand-in stock photographs for a fictional restaurant. A real launch
 * must replace them with the restaurant's own commissioned photography — see
 * docs/ASSETS.md for the art-direction brief for each slot.
 */
const u = (slug: string) => `https://unsplash.com/photos/${slug}`;

export const images = {
  // ——— The house's signature photography (dark, warm, candle-lit) ———
  dishFilletCandle: {
    id: 'photo-1585658930672-bbee7a596e2a',
    alt: 'A seared beef fillet with roasted pepper and thyme on a white plate, a candle and a glass of red wine behind it',
    credit: { name: 'Sanju M Gurung', username: 'sundaymonday_gurung' },
    page: u('yXiJy7zfdzU'),
    tone: 'dark',
  },
  dishScallopsCaviar: {
    id: 'photo-1659275798472-86f479383ae6',
    alt: 'Seared scallops with caviar, asparagus and a butter sauce on a dark stoneware plate',
    credit: { name: 'Luna Wang', username: 'lunawangjl' },
    page: u('i1Hi4plqjDI'),
    tone: 'dark',
  },
  dishTruffleShaved: {
    id: 'photo-1642354609876-5386fea5e7fc',
    alt: 'Black truffle shaved at the table over a plate of fresh tagliatelle',
    credit: { name: 'Vincent Dörig', username: 'vincentdoerig' },
    page: u('-iPCD8Rpve4'),
    tone: 'dark',
  },
  interiorWarmDining: {
    id: 'photo-1602232037779-30b01ac3c457',
    alt: 'The dining room set for the evening: oak tables, wine glasses and dried pampas in low, warm light',
    credit: { name: 'Alessio Dandi', username: 'alessiodandi' },
    page: u('LusjIyLfZ70'),
    tone: 'dark',
  },
  dishScallops: {
    id: 'photo-1564851287875-fb73b71f0e4e',
    alt: 'Pan-seared scallops with shellfish, pea shoots and a bright orange purée on a grey plate',
    credit: { name: 'Louis Hansel', username: 'louishansel' },
    page: u('CZiwTf4rfHY'),
    tone: 'light',
  },
  dishTruffleTagliatelle: {
    id: 'photo-1643644598156-858b6d62405b',
    alt: 'Fresh tagliatelle covered with slices of black truffle',
    credit: { name: 'Jametlene Reskp', username: 'reskp' },
    page: u('KDE2Wb93s64'),
    tone: 'light',
  },
  dishLambRack: {
    id: 'photo-1761983723667-99c7fd98af53',
    alt: 'Herb-crusted rack of lamb with roasted pepper, vegetables and a glossy jus on a white plate',
    credit: { name: 'Hans Westbeek', username: 'hanswestbeek' },
    page: u('449qWYYxEdo'),
    tone: 'light',
  },
  tableCandleGlasses: {
    id: 'photo-1774509623829-881b7946b8e0',
    alt: 'A lit candle beside wine glasses on a table set for dinner',
    credit: { name: 'Max Griss', username: 'grissphoto' },
    page: u('JE2TskHX4Wc'),
    tone: 'dark',
  },
  chefSaucing: {
    id: 'photo-1621494268492-d01b98eba7e4',
    alt: 'Sauce spooned over a plated course at the pass',
    credit: { name: 'Duane Mendes', username: 'duanemendes' },
    page: u('-g5jWce3HUQ'),
    tone: 'dark',
  },
  tableFlowersCandle: {
    id: 'photo-1752888016122-cc0059408ce5',
    alt: 'Garden flowers and a lit candle on a table in the evening',
    credit: { name: 'Maximus Beaumont', username: 'mllewelynb' },
    page: u('b7trrbu-vgA'),
    tone: 'dark',
  },
  interiorGreenery: {
    id: 'photo-1592494804071-faea15d93a8a',
    alt: 'The bar lounge at dusk: tall windows, plants and warm brass lamps',
    credit: { name: 'Katarzyna Urbanek', username: 'kati_ur' },
    page: u('_4qQsmE4VdA'),
    tone: 'dark',
  },
  dishLambShank: {
    id: 'photo-1692197275441-40c874f40385',
    alt: 'A braised lamb shank with roasted vegetables in a dark bowl on an oak board',
    credit: { name: 'Ethan Smith', username: 'smithy_512' },
    page: u('3B_Vlmcd-dY'),
    tone: 'dark',
  },
  interiorWindowTables: {
    id: 'photo-1469234496837-d0101f54be3e',
    alt: 'Wine glasses on tables beside a tall window in a dim, whitewashed dining room',
    credit: { name: 'Todd Diemer', username: 'todd_diemer' },
    page: u('SEFR62Upnqw'),
    tone: 'dark',
  },
  dishTomatoes: {
    id: 'photo-1780181612148-20a394ff0dff',
    alt: 'A tomato course with flower petals and a quenelle of sorbet on a stoneware plate',
    credit: { name: 'Sophie Lee-Tin-Yien', username: 'sophielty' },
    page: u('e1yQbGc0RnQ'),
    tone: 'dark',
  },

  // ——— Interiors & atmosphere ———
  heroDiningRoom: {
    id: 'photo-1653259038915-7cf0b7a4dd6c',
    alt: 'The dining room in the evening: white tablecloths, orchids and candlelight',
    credit: { name: 'Igor Rand', username: 'igorrand' },
    page: u('a-dimly-lit-restaurant-with-a-view-of-the-city-1-IeBcvLUQ4'),
    tone: 'dark',
  },
  interiorLargeRoom: {
    id: 'photo-1667388968964-4aa652df0a9b',
    alt: 'A large dining room arranged with tables and chairs',
    credit: { name: 'Glenov Brankovic', username: 'glenovbrankovic' },
    page: u('a-large-room-with-tables-and-chairs-nulJA9vxJII'),
    tone: 'dark',
  },
  interiorTables: {
    id: 'photo-1667388969250-1c7220bf3f37',
    alt: 'Tables and chairs set in a softly lit dining room',
    credit: { name: 'Glenov Brankovic', username: 'glenovbrankovic' },
    page: u('a-room-with-tables-and-chairs-e4B5AvA7Jqo'),
    tone: 'dark',
  },
  interiorLamps: {
    id: 'photo-1552960226-639240203497',
    alt: 'Lit pendant lamps hanging in a dim room',
    credit: { name: 'takahiro taguchi' },
    page: u('lighted-lamps-in-room-8l_RuuZrOyY'),
    tone: 'dark',
  },
  interiorDimTables: {
    id: 'photo-1709548145082-04d0cde481d4',
    alt: 'A dimly lit restaurant with tables and chairs',
    credit: { name: 'Oliver Guhr' },
    page: u('a-dimly-lit-restaurant-with-tables-and-chairs-EjHiN2KxTO4'),
    tone: 'dark',
  },
  seatingBlueChair: {
    id: 'photo-1615887584283-91f1be7fdc34',
    alt: 'A blue upholstered chair beside a wooden table',
    credit: { name: 'Ambitious Studio* | Rick Barrett' },
    page: u('blue-sofa-chair-beside-brown-wooden-table-eX4m4h64cvs'),
    tone: 'dark',
  },
  tableGlassware: {
    id: 'photo-1574966739987-65e38db0f7ce',
    alt: 'A long table set for the evening: wine glasses, candles and menus',
    credit: { name: 'Ronan' },
    page: u('clear-wine-glasses-on-top-of-dining-table-PCE0T5i4pDI'),
    tone: 'light',
  },
  tableSetting: {
    id: 'photo-1754557619846-0574960c5f3f',
    alt: 'A restaurant table set and ready for guests',
    credit: { name: 'Paul', username: 'paul19977' },
    page: u('elegant-restaurant-table-setting-ready-for-diners-m7IpcYOx8hM'),
    tone: 'light',
  },
  tablePlaceSettings: {
    id: 'photo-1643101570532-88c8ecc07c1f',
    alt: 'A dining table laid with place settings and wine glasses',
    credit: { name: 'Nikita Tikhomirov' },
    page: u('zUQeFiobRYs'),
    tone: 'light',
  },
  wineGlassesRow: {
    id: 'photo-1484156818044-c040038b0719',
    alt: 'Wine glasses lined along a table in shallow focus',
    credit: { name: 'Nils Stahl' },
    page: u('BCkLxilDvJU'),
    tone: 'dark',
  },
  restaurantDetail: {
    id: 'photo-1560053608-13721e0d69e8',
    alt: 'A close view of the restaurant interior',
    credit: { name: 'Igor Rand', username: 'igorrand' },
    page: u('wfM1Fi-kMaY'),
    tone: 'dark',
  },

  // ——— Drinks ———
  barMartini: {
    id: 'photo-1597075687490-8f673c6c17f6',
    alt: 'A martini glass on a wooden table',
    credit: { name: 'Ambitious Studio* | Rick Barrett' },
    page: u('clear-martini-glass-on-brown-wooden-table-QjUY7auDzUQ'),
    tone: 'dark',
  },
  pourSpirits: {
    id: 'photo-1566417713940-fe7c737a9ef2',
    alt: 'A spirit being poured into a clear glass',
    credit: { name: 'Louis Hansel' },
    page: u('person-pouring-liquor-in-clear-drinking-glass-yLUvnCFI500'),
    tone: 'dark',
  },

  // ——— Kitchen & chef (one shoot, one chef — keeps the chef consistent across pages) ———
  chefTweezers: {
    id: 'photo-1775513153018-0c7ac7899751',
    alt: 'The chef placing herbs on a small course with fine tweezers',
    credit: { name: 'Alfonso Betancourt', username: 'tigredemar' },
    page: u('chef-carefully-plating-a-gourmet-dish-with-tweezers-q4nWGwVM2Vk'),
    tone: 'dark',
  },
  chefHerbs: {
    id: 'photo-1775497950035-38677f62bb3e',
    alt: 'The chef finishing a dish with fresh herbs',
    credit: { name: 'Alfonso Betancourt', username: 'tigredemar' },
    page: u('chef-meticulously-garnishes-a-gourmet-dish-with-fresh-herbs-u3OOrE2jeHg'),
    tone: 'dark',
  },
  chefGreens: {
    id: 'photo-1775497950071-965cf9e20b2f',
    alt: 'The chef garnishing a small dish with fresh greens',
    credit: { name: 'Alfonso Betancourt', username: 'tigredemar' },
    page: u('chef-garnishing-a-small-dish-with-fresh-greens-Bq44jpoeFf4'),
    tone: 'dark',
  },
  chefSeafood: {
    id: 'photo-1775498053538-ec293e32b963',
    alt: 'The chef finishing an oyster course by hand',
    credit: { name: 'Alfonso Betancourt', username: 'tigredemar' },
    page: u('chef-garnishing-a-delicate-seafood-dish-with-herbs-8jdHX286teU'),
    tone: 'dark',
  },
  kitchenTeam: {
    id: 'photo-1785068540682-6917367db28e',
    alt: 'Chefs preparing food in a dark professional kitchen',
    credit: { name: 'Zoren Tan' },
    page: u('professional-chefs-preparing-food-in-a-dark-kitchen-fhp0t_fXXPg'),
    tone: 'dark',
  },

  // ——— Sourcing ———
  seafoodOnIce: {
    id: 'photo-1615141982883-c7ad0e69fd62',
    alt: 'The morning catch on crushed ice: whole fish, crab, prawns, lobster and clams',
    credit: { name: 'Mike Bergmann' },
    page: u('fresh-seafood-on-crushed-ice-tHjXXy1kk_Q'),
    tone: 'light',
  },
  marketVegetables: {
    id: 'photo-1591586116988-62fe65164f8d',
    alt: 'Cauliflower, broccoli, radishes and onions on a market stall',
    credit: { name: 'Shelley Pauls' },
    page: u('fresh-vegetables-on-market-stall-Zaiuy5dKeCk'),
    tone: 'light',
  },
  fishOnIce: {
    id: 'photo-1576330383200-2bf325cfec52',
    alt: 'Whole fish laid on ice',
    credit: { name: 'karl muscat' },
    page: u('gray-fishes-on-ice-sEqo82gbhUY'),
    tone: 'light',
  },

  // ——— Architecture ———
  archCurves: {
    id: 'photo-1765776035390-e9f3d5080cb3',
    alt: 'Curved architectural forms in soft natural light',
    credit: { name: 'Miguel Joya' },
    page: u('curved-architectural-forms-with-soft-natural-light-s-5usW1C-r0'),
    tone: 'light',
  },
  archWaterfront: {
    id: 'photo-1761751444572-5596dc488b51',
    alt: 'A modern building beside the water, with people walking along the quay',
    credit: { name: 'Chamfjord.' },
    page: u('modern-building-with-people-walking-by-the-water-0iUkT3zDftg'),
    tone: 'light',
  },
  archStaircase: {
    id: 'photo-1771904488645-fa6ebf7a2d06',
    alt: 'A staircase with a glass railing beside a marble wall',
    credit: { name: 'Wesley Shen' },
    page: u('modern-staircase-with-glass-railing-and-marble-wall-2l2EslhTaOM'),
    tone: 'light',
  },
  archConcrete: {
    id: 'photo-1483366774565-c783b9f70e2c',
    alt: 'Looking up at a concrete building against the sky',
    credit: { name: 'Kimon Maritz' },
    page: u('worms-eye-view-photography-of-concrete-building-mQiZnKwGXW0'),
    tone: 'light',
  },

  // ——— Dishes ———
  dishPlated: {
    id: 'photo-1414235077428-338989a2e8c0',
    alt: 'Guests at dinner with a plated course, bread and white wine',
    credit: { name: 'Jay Wennington' },
    page: u('N_Y88TWmGwA'),
    tone: 'light',
  },
  dishComposed: {
    id: 'photo-1616669944447-d65d41a222bd',
    alt: 'A tasting-menu course on a hand-thrown stoneware plate',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('cooked-food-on-white-ceramic-plate-_WI3DGseB3g'),
    tone: 'light',
  },
  dishMenuHero: {
    id: 'photo-1616671285410-2a676a9a433d',
    alt: 'A fork resting on a white ceramic plate',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('stainless-steel-fork-on-white-ceramic-plate-gVvSNWuw6kQ'),
    tone: 'light',
  },
  dishGrilledFish: {
    id: 'photo-1519708227418-c8fd9a32b7a2',
    alt: 'Grilled fish with cooked vegetables on a plate',
    credit: { name: 'Caroline Attwood', username: '_carolineattwood' },
    page: u('grilled-fish-cooked-vegetables-and-fork-on-plate-bpPTlXWTOvg'),
    tone: 'dark',
  },
  dishBeefPour: {
    id: 'photo-1663530761401-15eefb544889',
    alt: 'A bone-marrow jus poured over aged beef at the table',
    credit: { name: 'Urban Gyllström' },
    page: u('chef-pouring-sauce-over-plated-steak-MaWMfm-HCqQ'),
    tone: 'dark',
  },
  dishGreens: {
    id: 'photo-1616671276441-2f2c277b8bf9',
    alt: 'Aged duck on wilted greens with hazelnuts and a blackcurrant reduction, on a white plate',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('green-vegetable-on-white-ceramic-plate-jHjMWJq2XqU'),
    tone: 'light',
  },
  dishGreensCharred: {
    id: 'photo-1616669967602-91c99d4af626',
    alt: 'A plate of green vegetables on white ceramic',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('green-vegetable-on-white-ceramic-plate-355Z8zIdXb4'),
    tone: 'light',
  },
  dishGreenDessert: {
    id: 'photo-1759277513204-b432a70af08f',
    alt: 'A green apple and sorrel dessert finished with small white flowers',
    credit: { name: 'Madeline Liu', username: 'madeline_sd' },
    page: u('gourmet-green-dessert-with-edible-flowers-and-gold-dust-dZR5FpxIROU'),
    tone: 'light',
  },
  dishOysters: {
    id: 'photo-1633321094192-388268512e0f',
    alt: 'Rock oysters on crushed ice with shallot vinegar',
    credit: { name: 'Anima Visual' },
    page: u('a-plate-of-oysters-on-ice-with-lemon-wedges-XaLh3Nakkz4'),
    tone: 'light',
  },
  dishSalad: {
    id: 'photo-1616669945251-3e8168f6f89a',
    alt: 'A vegetable salad on a white ceramic plate',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('white-ceramic-plate-with-vegetable-salad-HF_Q6QcTolw'),
    tone: 'light',
  },
  dishSoup: {
    id: 'photo-1616671301376-3d98b18cb052',
    alt: 'A white ceramic bowl of soup held in two hands',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('person-holding-white-ceramic-bowl-with-soup--iBOhlbX32s'),
    tone: 'light',
  },
  dishFishVegetables: {
    id: 'photo-1676471926534-d5c9771909fa',
    alt: 'Fish and vegetables on a white plate',
    credit: { name: 'Nima Naseri' },
    page: u('RAUGKcReU8A'),
    tone: 'light',
  },
  dishSalmon: {
    id: 'photo-1467003909585-2f8a72700288',
    alt: 'A salmon fillet with salsa beside a glass of red wine',
    credit: { name: 'Casey Lee' },
    page: u('awj7sRviVXo'),
    tone: 'dark',
  },
  dishPinkMousse: {
    id: 'photo-1759277513190-c1685c3792fe',
    alt: 'A pink mousse dessert with a delicate garnish',
    credit: { name: 'Madeline Liu', username: 'madeline_sd' },
    page: u('gourmet-dessert-with-pink-mousse-and-delicate-garnish-hMsPc8Pg3cE'),
    tone: 'light',
  },
  dishSorbet: {
    id: 'photo-1759277513194-fee965299c48',
    alt: 'A fruit sorbet dessert with caramel sauce',
    credit: { name: 'Madeline Liu', username: 'madeline_sd' },
    page: u('gourmet-dessert-with-fruit-sorbet-and-caramel-sauce-h86kd11khWg'),
    tone: 'light',
  },
  dishIceCreamLeaf: {
    id: 'photo-1616669989627-0cea7f32be2c',
    alt: 'White ice cream with a green leaf on a white plate',
    credit: { name: 'Delightin Dee', username: 'delightindee' },
    page: u('white-ice-cream-with-green-leaf-on-white-ceramic-plate-JSE2mRfuan8'),
    tone: 'light',
  },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;

export function getImage(key: ImageKey): ImageAsset {
  return images[key];
}

/** Unsplash attribution link with the referral parameters Unsplash asks for. */
export function creditUrl(asset: ImageAsset): string {
  return `${asset.page}?utm_source=azure_demo&utm_medium=referral`;
}
