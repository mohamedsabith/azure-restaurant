import type { ImageKey } from '@/content/images';
import type { FaqItem, Testimonial } from '@/types/content';

/* ———————————————————————————— STORY TIMELINE ———————————————————————————— */

export interface Milestone {
  year: string;
  title: string;
  text: string;
  image: ImageKey;
  position?: string;
}

/** The restaurant's journey, shown as a roadmap on the home page and on Our Story. */
export const storyTimeline: Milestone[] = [
  {
    year: '2019',
    title: 'A table in a boathouse',
    text: 'Noa Laurent starts a monthly supper club in a converted boathouse: one long table, one menu, forty guests.',
    image: 'tableCandleGlasses',
    position: '45% 55%',
  },
  {
    year: '2021',
    title: 'The warehouse on the quay',
    text: 'The club outgrows the boathouse. A disused customs warehouse on the quay comes up for lease.',
    image: 'interiorWindowTables',
  },
  {
    year: '2023',
    title: 'Eighteen months of restoration',
    text: 'The stone floor and iron windows stay; the kitchen opens onto the room, with a counter facing the fire.',
    image: 'interiorWarmDining',
    position: '50% 62%',
  },
  {
    year: '2024',
    title: 'AZURE opens',
    text: 'Forty-six seats, two seatings a night and a menu written each morning after the boats come in.',
    image: 'heroDiningRoom',
    position: '70% 50%',
  },
  {
    year: '2025',
    title: 'The private room',
    text: 'A sixteen-seat room opens for long tables, birthdays and the occasional wedding supper.',
    image: 'tableFlowersCandle',
  },
  {
    year: 'Today',
    title: 'The next course',
    text: 'A seven-course tasting menu, a pairing from small growers and the same rule as the first night: cook the day, not the plan.',
    image: 'dishTruffleShaved',
    position: '58% 60%',
  },
];

/* ———————————————————————————— HOME ———————————————————————————— */

export const home = {
  hero: {
    eyebrow: 'A coastal kitchen',
    /** Rendered as two lines; the last word of the second is set in italic. */
    title: { first: 'Coastal Cooking.', second: 'Composed with', accent: 'Restraint.' },
    statement:
      'The morning’s catch, the season’s produce and the best of the land, cooked over embers on the harbour.',
    slides: [
      { image: 'dishFilletCandle' as ImageKey, position: '12% 55%' },
      { image: 'dishScallopsCaviar' as ImageKey, position: '52% 62%' },
      { image: 'dishTruffleShaved' as ImageKey, position: '62% 55%' },
    ],
  },
  philosophy: {
    eyebrow: 'Our philosophy',
    title: 'A Kitchen That Follows the Tide',
    text: 'We buy from four day boats and two farms within an hour of the door. The menu is written each morning, cooked over embers with salt, acidity and time, and served with warmth.',
    image: 'interiorWarmDining' as ImageKey,
    imagePosition: '50% 60%',
  },
  story: {
    eyebrow: 'Our story',
    title: 'Our Story Begins',
    intro: 'From one long table in a boathouse to a dining room on the quay: the milestones that made AZURE.',
  },
  film: {
    eyebrow: 'The film',
    title: 'An Evening at AZURE',
    caption: 'From the pass to the last course, in eighteen quiet seconds.',
    description:
      'A silent film of the open kitchen, black truffle shaved over tagliatelle, a jus poured at the table, scallops with caviar, a braised lamb shank, flowers by candlelight and the beef fillet.',
  },
  notes: {
    eyebrow: 'Guest notes',
    title: 'Kind Words',
    disclaimer: 'Sample notes written for this demonstration of a fictional restaurant.',
  },
  visit: {
    eyebrow: 'Find us',
    title: 'On the Quay',
    text: 'In the old customs house at the end of the harbour wall, a short walk from the old town. Look for the lanterns by the door.',
    directions: [
      { label: 'On foot', text: 'Five minutes along the harbour from the old town square.' },
      { label: 'By car', text: 'Public parking on Quay Road, two minutes from the door.' },
    ],
  },
  signatures: {
    eyebrow: 'Signature dishes',
    title: 'A Taste of the Season',
    dishIds: ['seared-scallops', 'truffle-tagliatelle', 'herb-crusted-lamb'],
  },
  installation: {
    eyebrow: 'The pairing',
    title: 'A Glass for Every Course',
    text: 'Our sommelier pours a glass to meet each course of the tasting menu: a saline Albariño with the oysters, an old-vine Chenin with the turbot, and small growers from the Atlantic coast all the way through. The wine pairing is €85; the zero-proof pairing, made in-house, is €55.',
    caption: 'Interactive rendering: the glass is poured as you arrive. Move across it to turn the light.',
  },
  experience: {
    eyebrow: 'The experience',
    title: 'An Evening on the Water',
    text: 'From dinner for two to the private room for sixteen: two unhurried seatings a night, and a seven-course tasting menu that traces the day from the quay to the fire.',
    image: 'tableCandleGlasses' as ImageKey,
  },
  gallery: [
    { image: 'chefSaucing', caption: 'A sauce finished at the pass' },
    { image: 'dishTomatoes', caption: 'The first tomatoes of the summer' },
    { image: 'tableFlowersCandle', caption: 'Flowers from the farm, every table' },
    { image: 'interiorGreenery', caption: 'The bar lounge at dusk' },
  ] satisfies { image: ImageKey; caption: string }[],
  cta: {
    title: 'Your Table Awaits',
    text: 'Reservations open sixty days ahead. Dinner Tuesday to Saturday.',
  },
  chef: {
    title: 'Noa Laurent',
    role: 'Chef & co-founder',
    quote: 'I want a guest to taste the water the fish came from, and nothing that gets in its way.',
  },
};

export const testimonials: Testimonial[] = [
  {
    id: 't1',
    quote:
      'The turbot was the most precise piece of fish we have eaten this year, and the room is quiet enough to actually talk.',
    attribution: 'Sample guest',
    context: 'Dinner for two',
  },
  {
    id: 't2',
    quote:
      'Service anticipated everything without hovering. The zero-proof pairing was as considered as the wine.',
    attribution: 'Sample guest',
    context: 'Tasting menu',
  },
  {
    id: 't3',
    quote:
      'They had read the note on our booking. A small detail, remembered without fuss, made the evening.',
    attribution: 'Sample guest',
    context: 'Anniversary dinner',
  },
  {
    id: 't4',
    quote:
      'Truffle shaved at the table, a sommelier who asked what we liked rather than what we wanted to spend. We stayed until the candles burned down.',
    attribution: 'Sample guest',
    context: 'Wine pairing',
  },
  {
    id: 't5',
    quote:
      'We booked the private room for my father’s seventieth. The kitchen cooked his mother’s fish soup, from a recipe we sent the week before.',
    attribution: 'Sample guest',
    context: 'Private dining',
  },
];

/* ———————————————————————————— STORY ———————————————————————————— */

export const story = {
  hero: {
    eyebrow: 'Our story',
    title: ['A Warehouse', 'on the'],
    accent: 'Quay.',
    intro:
      'AZURE began as a supper club in a boathouse and became a forty-six-seat dining room. This is how it is built, who it depends on and why it cooks the way it does.',
    image: 'chefSeafood' as ImageKey,
    position: '50% 38%',
  },
  philosophy: {
    eyebrow: '01 — Philosophy',
    title: 'Clarity over complexity.',
    text: 'We cook as little as the ingredient needs and as precisely as we can. A plate is finished when removing anything would make it worse, not when nothing more can be added.',
  },
  history: {
    eyebrow: '02 — History',
    title: 'From a boathouse to the harbour.',
    intro: 'Six years, one long table at a time: how a monthly supper club became a dining room on the quay.',
    image: 'interiorGreenery' as ImageKey,
    timeline: storyTimeline,
  },
  approach: {
    eyebrow: '03 — Culinary approach',
    title: 'Three rules the kitchen does not break.',
    image: 'dishComposed' as ImageKey,
    rules: [
      {
        title: 'Cook the day, not the plan',
        text: 'The menu is written after the morning landing and the farm delivery. If the fish is not right, the dish waits.',
      },
      {
        title: 'Fire, salt and time',
        text: 'Embers, salt-baking, curing and fermentation do most of the work. We would rather master a few methods than collect many.',
      },
      {
        title: 'Three or four elements',
        text: 'Each plate is built around one ingredient and the two or three things that make it taste more like itself.',
      },
    ],
  },
  chef: {
    eyebrow: '04 — The chef',
    title: 'Noa Laurent',
    image: 'chefHerbs' as ImageKey,
    paragraphs: [
      'Noa trained in classical kitchens and spent six years cooking on the Atlantic coast, writing the menu each morning at the fish market. The habit stayed.',
      'In the kitchen at AZURE that means short lists, quiet service and a team that tastes everything. Outside it, it means time on the boats and at the farms, learning what will be good in three weeks rather than what is fashionable today.',
    ],
    quote: 'The best thing a cook can do for a perfect piece of fish is to get out of its way.',
  },
  sourcing: {
    eyebrow: '05 — Sourcing',
    title: 'Ingredients that travel less than an hour.',
    text: 'We buy directly from four day boats and two farms. Fish is line- or pot-caught, landed in the morning and on the plate the same evening. Vegetables are grown to our order, and the kitchen takes what the season gives — including the odd shapes.',
    facts: [
      { value: '4', label: 'day boats we buy from directly' },
      { value: '2', label: 'partner farms within an hour' },
      { value: '< 12 h', label: 'from landing to plate' },
    ],
    images: { primary: 'seafoodOnIce' as ImageKey, secondary: 'marketVegetables' as ImageKey },
  },
  craft: {
    eyebrow: '06 — Craft',
    title: 'An open kitchen, a fermentation room and a fire.',
    text: 'The kitchen faces the dining room across a ten-seat counter. Behind it sit an ember grill, a cold room for curing and a small fermentation room where the kitchen keeps vinegars, garums and misos made from the season’s surplus.',
    images: { primary: 'kitchenTeam' as ImageKey, secondary: 'chefSeafood' as ImageKey },
  },
  architecture: {
    eyebrow: '07 — Architecture',
    title: 'Stone, oak and lime plaster.',
    text: 'The restoration kept what the building already did well: thick walls, high windows and a limestone floor worn smooth by a century of trade. New elements are few and deliberate — oak tables made to one size, lime plaster that softens the sound of a full room, and lamps low enough to light the table rather than the ceiling.',
    images: { primary: 'interiorWarmDining' as ImageKey, secondary: 'interiorWindowTables' as ImageKey },
  },
  atmosphere: {
    eyebrow: '08 — In the room',
    title: 'An evening at AZURE.',
    text: 'Two seatings a night. Lights lower as the room fills. Courses arrive at the pace of the table, not the kitchen, and nobody will hurry you towards the second seating.',
    image: 'interiorDimTables' as ImageKey,
  },
  gallery: {
    eyebrow: '09 — Gallery',
    title: 'Details from the house.',
    items: [
      { image: 'dishScallopsCaviar', caption: 'Scallops, caviar and a butter sauce' },
      { image: 'chefGreens', caption: 'Finishing a course at the pass' },
      { image: 'wineGlassesRow', caption: 'Glassware for the pairing' },
      { image: 'dishLambShank', caption: 'Lamb shank, braised overnight' },
      { image: 'barMartini', caption: 'The Azure martini' },
      { image: 'dishTruffleShaved', caption: 'Truffle, shaved at the table' },
    ] satisfies { image: ImageKey; caption: string }[],
  },
};

/* ———————————————————————————— RESERVATIONS ———————————————————————————— */

export const reservationsPage = {
  hero: {
    eyebrow: 'Reservations',
    title: 'Reserve a',
    accent: 'Table.',
    intro:
      'Tables are released sixty days ahead. Choose a date and a time, tell us about allergies or an occasion, and we will take care of the rest.',
    image: 'tableFlowersCandle' as ImageKey,
  },
  occasions: ['Birthday', 'Anniversary', 'Business dinner', 'Celebration', 'First visit'] as const,
  dietaryOptions: [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'pescatarian', label: 'Pescatarian' },
    { id: 'gluten-free', label: 'Gluten-free' },
    { id: 'dairy-free', label: 'Dairy-free' },
    { id: 'nut-allergy', label: 'Nut allergy' },
    { id: 'shellfish-allergy', label: 'Shellfish allergy' },
  ] as const,
  visit: {
    eyebrow: 'Visit',
    title: 'Finding us',
    parking:
      'Parking and public-transport details will be published together with the address. Guests with reduced mobility can tell us in their booking and we will arrange step-free access.',
    accessibility:
      'Step-free entrance, an accessible restroom and tables that seat a wheelchair comfortably — please mention it so we can plan the table.',
  },
};

export const faq: FaqItem[] = [
  {
    id: 'how-far-ahead',
    question: 'How far ahead can I book?',
    answer:
      'Reservations open sixty days in advance. Same-day bookings are possible up to two hours before a seating if a table is free.',
  },
  {
    id: 'allergies',
    question: 'Can you cater for allergies and dietary requirements?',
    answer:
      'Yes. Tell us when you book and again at the table. With notice we can adapt most courses, including the full tasting menu, for vegetarian, vegan, gluten-free and dairy-free diets and for most allergies.',
  },
  {
    id: 'tasting-duration',
    question: 'How long does the tasting menu take?',
    answer:
      'About two and a half hours. The à la carte menu usually takes ninety minutes to two hours. The tasting menu is served to the whole table.',
  },
  {
    id: 'dress-code',
    question: 'Is there a dress code?',
    answer: 'No formal dress code. Most guests dress smart-casual.',
  },
  {
    id: 'children',
    question: 'Are children welcome?',
    answer:
      'Children are welcome for lunch and the early dinner seating. We can prepare a shorter menu for younger guests if you let us know.',
  },
  {
    id: 'cancellations',
    question: 'What is the cancellation policy?',
    answer:
      'Please give us forty-eight hours’ notice to cancel or change a booking so that we can offer the table to someone else.',
  },
  {
    id: 'private-dining',
    question: 'Do you host private dinners?',
    answer:
      'The private room seats nine to sixteen guests with its own menu. Write to us with your date and party size and we will reply with options.',
  },
  {
    id: 'accessibility',
    question: 'Is the restaurant accessible?',
    answer:
      'Yes — the entrance is step-free and there is an accessible restroom. Mention any access needs in your booking so that we can prepare the right table.',
  },
];
