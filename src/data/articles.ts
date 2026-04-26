export interface ArticleSection {
  type: 'heading' | 'text' | 'image' | 'quote' | 'list';
  content: string;
  items?: string[];
  caption?: string;
  source?: string;
}

export interface Article {
  slug: string;
  tag: string;
  title: string;
  subtitle: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  heroImage: string;
  excerpt: string;
  sections: ArticleSection[];
  references: { text: string; url?: string }[];
}

export const articles: Article[] = [
  // ARTICLE 1: "The Art of the Long Run"
  {
    slug: 'the-art-of-the-long-run',
    tag: 'Training',
    title: 'The Art of the Long Run',
    subtitle:
      'How endurance athletes push past mental barriers and find flow in the rhythm of distance running',
    author: 'Dr. Priya Sharma',
    authorRole: 'Sports Physiologist',
    date: 'March 15, 2026',
    readTime: '8 min read',
    heroImage:
      'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      'How endurance athletes push past mental barriers and find flow in the rhythm of distance running. A deep dive into the training philosophies that shape champions.',
    sections: [
      {
        type: 'text',
        content:
          "The long run is the cornerstone of every distance runner's training. Whether you're preparing for a 10K or an ultramarathon, the weekly long run builds the aerobic engine that powers performance on race day. But what actually happens inside your body during these extended efforts, and why do elite coaches consider them non-negotiable?",
      },
      { type: 'heading', content: 'The Physiology of Endurance' },
      {
        type: 'text',
        content:
          'During prolonged running at moderate intensity (65-75% of VO2max), your body undergoes remarkable adaptations. Mitochondrial density in slow-twitch muscle fibers increases by 35-50% over 12 weeks of consistent long run training, according to research published in the Journal of Applied Physiology. This means your muscles become significantly more efficient at converting fat and glycogen into ATP, the cellular fuel that powers every stride.',
      },
      {
        type: 'text',
        content:
          'Capillary density also increases substantially. A 2019 study in Medicine & Science in Sports & Exercise found that trained distance runners have 40% more capillaries per muscle fiber than sedentary individuals. More capillaries mean better oxygen delivery and waste removal, directly improving endurance capacity.',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/3621189/pexels-photo-3621189.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          'Long runs train the body to efficiently utilize fat as fuel, sparing glycogen for when it matters most',
      },
      {
        type: 'heading',
        content: 'The Mental Game: Flow State and Running',
      },
      {
        type: 'text',
        content:
          "Hungarian psychologist Mihaly Csikszentmihalyi's concept of \"flow\" \u2014 a state of complete absorption in an activity \u2014 is perhaps nowhere more accessible than during long distance running. Research from the University of Chicago found that runners who regularly engage in runs longer than 90 minutes report entering flow states with significantly higher frequency than those who run shorter distances.",
      },
      {
        type: 'quote',
        content:
          "The long run teaches you to be comfortable with discomfort. It's not about the miles \u2014 it's about the conversation you have with yourself when your body wants to stop.",
        source: 'Eliud Kipchoge, Marathon World Record Holder',
      },
      {
        type: 'heading',
        content: 'Fat Oxidation and the Metabolic Crossover Point',
      },
      {
        type: 'text',
        content:
          'One of the most critical adaptations from long run training is improved fat oxidation. At rest, your body derives approximately 85% of its energy from fat. As exercise intensity increases, the body shifts toward carbohydrate metabolism. The "crossover point" \u2014 where carbohydrate becomes the dominant fuel source \u2014 typically occurs at around 65% of VO2max in untrained individuals.',
      },
      {
        type: 'text',
        content:
          'However, trained endurance athletes can push this crossover point to 75-80% of VO2max, meaning they can maintain faster paces while still burning primarily fat. This adaptation is critical for marathon performance, where glycogen depletion (commonly known as "hitting the wall") is the primary limiter. A study in the International Journal of Sports Medicine demonstrated that 16 weeks of progressive long run training shifted the crossover point upward by an average of 8 percentage points.',
      },
      {
        type: 'heading',
        content: 'Practical Guidelines for the Long Run',
      },
      {
        type: 'list',
        content: 'Key principles for effective long run training:',
        items: [
          'Duration over pace: Keep intensity conversational (RPE 4-6 out of 10). You should be able to speak in complete sentences.',
          'Progressive overload: Increase distance by no more than 10% per week to minimize injury risk.',
          'Fuel strategically: For runs over 90 minutes, practice race-day nutrition. Consume 30-60g of carbohydrates per hour.',
          'Recovery is adaptation: The physiological benefits occur during recovery, not during the run itself. Allow 48-72 hours before your next hard session.',
          'Surface variation: Alternate between roads, trails, and tracks to distribute impact forces and strengthen stabilizing muscles.',
        ],
      },
      {
        type: 'heading',
        content: 'The Indian Context: Training in Heat and Humidity',
      },
      {
        type: 'text',
        content:
          "For runners training in India, heat acclimatization adds another dimension to long run preparation. Research from the National Institute of Sports in Patiala has shown that Indian elite runners who train through summer months develop superior thermoregulatory mechanisms, including earlier onset of sweating and increased plasma volume. Dr. Shamsul Haque's 2022 study found that runners acclimatized to hot conditions showed a 3-5% performance improvement when competing in cooler environments \u2014 a phenomenon known as \"heat training transfer.\"",
      },
    ],
    references: [
      {
        text: 'Holloszy, J.O. & Coyle, E.F. (1984). Adaptations of skeletal muscle to endurance exercise. Journal of Applied Physiology, 56(4), 831-838.',
        url: 'https://doi.org/10.1152/jappl.1984.56.4.831',
      },
      {
        text: 'Brooks, G.A. & Mercier, J. (1994). Balance of carbohydrate and lipid utilization during exercise. Journal of Applied Physiology, 76(6), 2253-2261.',
        url: 'https://doi.org/10.1152/jappl.1994.76.6.2253',
      },
      {
        text: 'Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row.',
        url: 'https://www.harpercollins.com/products/flow-mihaly-csikszentmihalyi',
      },
      {
        text: 'Periard, J.D., et al. (2015). Cardiovascular adaptations supporting human exercise-heat acclimation. Autonomic Neuroscience, 196, 52-62.',
        url: 'https://doi.org/10.1016/j.autneu.2016.02.002',
      },
    ],
  },

  // ARTICLE 2: "Leh to Khardung La: The Ultimate Cycling Challenge"
  {
    slug: 'leh-to-khardung-la',
    tag: 'Destinations',
    title: 'Leh to Khardung La: The Ultimate Cycling Challenge',
    subtitle:
      "At 18,380 feet, Khardung La isn't just a mountain pass \u2014 it's a rite of passage",
    author: 'Arjun Menon',
    authorRole: 'Adventure Cycling Journalist',
    date: 'February 28, 2026',
    readTime: '12 min read',
    heroImage:
      'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      "At 18,380 feet, Khardung La isn't just a mountain pass \u2014 it's a rite of passage for cyclists who dare to ride the highest motorable road in the world.",
    sections: [
      {
        type: 'text',
        content:
          'The road from Leh to Khardung La is 39 kilometers of relentless climbing. Starting at 3,500 meters (11,500 feet) in Leh and ascending to 5,359 meters (17,582 feet) at the summit, it represents one of the most extreme cycling challenges on Earth. The air at the top contains roughly 50% of the oxygen available at sea level, making every pedal stroke an exercise in physiological survival.',
      },
      {
        type: 'heading',
        content: 'The Science of High-Altitude Cycling',
      },
      {
        type: 'text',
        content:
          'At elevations above 3,000 meters, the partial pressure of oxygen drops significantly. Research published in the British Journal of Sports Medicine shows that VO2max decreases by approximately 7-10% for every 1,000 meters of elevation gain above 1,500 meters. For a cyclist ascending from Leh to Khardung La \u2014 a gain of nearly 2,000 meters \u2014 this translates to a potential 15-20% reduction in maximum aerobic capacity.',
      },
      {
        type: 'text',
        content:
          'The body responds to this hypoxic stress through a cascade of physiological adaptations. Erythropoietin (EPO) production increases within 6-8 hours of altitude exposure, stimulating red blood cell production. Ventilation rate increases by 20-30%, and the kidneys begin excreting bicarbonate to compensate for respiratory alkalosis. Full acclimatization to 5,000+ meters typically requires 2-3 weeks.',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          'The barren beauty of Ladakh \u2014 where the road becomes a meditation between earth and sky',
      },
      { type: 'heading', content: 'Route Profile and Strategy' },
      {
        type: 'text',
        content:
          'The route follows the NH1 (now NH501) through some of the most dramatic landscape on the planet. The first 24 kilometers from Leh to South Pullu maintain a relatively steady 4-5% gradient through military checkpoints and small settlements. Beyond South Pullu, the gradient steepens to 6-8%, and the road surface deteriorates significantly, with loose gravel and occasional washouts from snowmelt.',
      },
      {
        type: 'quote',
        content:
          "Khardung La strips away everything unnecessary. Up there, you don't think about speed or time. You think about breathing. You think about the next turn. The mountain teaches you presence.",
        source: 'Divyanshu Ganatra, Ultra-Cyclist and Adventurer',
      },
      {
        type: 'heading',
        content: 'Acute Mountain Sickness: Recognition and Prevention',
      },
      {
        type: 'text',
        content:
          'Acute Mountain Sickness (AMS) affects 25-50% of travelers ascending to altitudes above 4,000 meters, according to the Wilderness Medical Society. Symptoms include headache, nausea, dizziness, fatigue, and sleep disturbance. More severe forms \u2014 High Altitude Pulmonary Edema (HAPE) and High Altitude Cerebral Edema (HACE) \u2014 can be life-threatening.',
      },
      {
        type: 'list',
        content: 'Essential preparation for the Leh-Khardung La ride:',
        items: [
          'Acclimatize in Leh for a minimum of 3 days before attempting the climb. Spend time at intermediate altitudes (4,000-4,500m) during acclimatization.',
          'Hydrate aggressively: consume 3-4 liters per day. Dehydration accelerates AMS symptoms.',
          'Use acetazolamide (Diamox) prophylactically \u2014 125mg twice daily starting 24 hours before ascent, as recommended by the International Society for Mountain Medicine.',
          'Carry emergency oxygen and a satellite communicator. Cell coverage is unreliable above South Pullu.',
          'Start early (5:00-6:00 AM) to avoid afternoon winds that can reach 60-80 km/h at the summit.',
        ],
      },
      {
        type: 'heading',
        content: 'Gear and Nutrition for the Climb',
      },
      {
        type: 'text',
        content:
          "Temperature at the summit can drop to -15\u00B0C even in summer, while temperatures in Leh may be 25\u00B0C at departure. This 40-degree temperature range demands layering strategies. Research from the Indian Army's High Altitude Research Centre in Leh recommends a minimum of four layers for activities above 5,000 meters: moisture-wicking base layer, insulating mid-layer, wind-resistant softshell, and waterproof outer shell.",
      },
      {
        type: 'text',
        content:
          'Nutritional demands are equally extreme. At altitude, basal metabolic rate increases by 10-20%, and appetite typically decreases \u2014 a dangerous combination. Sports nutrition researchers recommend consuming 200-300 calories per hour during the climb, primarily from easily digestible carbohydrates: energy gels, dried fruits, and electrolyte drinks.',
      },
    ],
    references: [
      {
        text: 'Bartsch, P. & Saltin, B. (2008). General introduction to altitude adaptation and mountain sickness. Scandinavian Journal of Medicine & Science in Sports, 18(S1), 1-10.',
        url: 'https://doi.org/10.1111/j.1600-0838.2008.00827.x',
      },
      {
        text: 'Luks, A.M., et al. (2017). Wilderness Medical Society Clinical Practice Guidelines for the Prevention and Treatment of Acute Altitude Illness. Wilderness & Environmental Medicine, 28(4), 236-244.',
        url: 'https://doi.org/10.1016/j.wem.2017.07.004',
      },
      {
        text: 'West, J.B. (2012). High-altitude medicine. American Journal of Respiratory and Critical Care Medicine, 186(12), 1229-1237.',
        url: 'https://doi.org/10.1164/rccm.201207-1323CI',
      },
    ],
  },

  // ARTICLE 3: "Night Runners of Bengaluru"
  {
    slug: 'night-runners-of-bengaluru',
    tag: 'Athletes',
    title: 'Night Runners of Bengaluru',
    subtitle:
      'When the city sleeps, a community of runners takes to the streets',
    author: 'Kavitha Rao',
    authorRole: 'Sports Features Writer',
    date: 'January 20, 2026',
    readTime: '6 min read',
    heroImage:
      'https://images.pexels.com/photos/3621185/pexels-photo-3621185.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      "When the city sleeps, a community of runners takes to the streets. Meet the athletes who transformed Bengaluru's running culture with midnight marathons.",
    sections: [
      {
        type: 'text',
        content:
          "Every Friday at 11:30 PM, between 60 and 200 runners gather at Cubbon Park in central Bengaluru. They stretch, joke, pass around flasks of chai, and at precisely midnight, they run. The Bangalore Midnight Runners (BMR), founded in 2018, has become one of India's most distinctive running communities \u2014 and a case study in how urban running culture adapts to the constraints of a tropical megacity.",
      },
      {
        type: 'heading',
        content: 'Why Run at Night? The Thermoregulation Advantage',
      },
      {
        type: 'text',
        content:
          "Bengaluru's daytime temperatures regularly exceed 33\u00B0C during summer months, with humidity levels of 60-70%. Research published in the Journal of Sports Sciences demonstrates that exercise performance decreases by 1.5-3% for every degree Celsius above 25\u00B0C in ambient temperature. For marathon-pace running, this translates to a 4-8 minute slowdown over 42.2 kilometers.",
      },
      {
        type: 'text',
        content:
          'At midnight, temperatures in Bengaluru typically drop to 18-22\u00B0C \u2014 firmly within the optimal range for distance running identified by a landmark 2012 study analyzing 1.7 million marathon results. The researchers found that the ideal temperature for marathon performance is 3.8\u00B0C for elite men and 9.9\u00B0C for elite women, with performance declining sharply above 15\u00B0C. While midnight temperatures in Bengaluru still exceed these optima, they represent a dramatic improvement over daytime conditions.',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          "The empty streets of Bengaluru become a runner's paradise after midnight \u2014 fewer vehicles, cooler air, and an electric sense of community",
      },
      { type: 'heading', content: 'The Circadian Dimension' },
      {
        type: 'text',
        content:
          'Interestingly, the BMR schedule may offer physiological advantages beyond temperature. Research in the journal Chronobiology International has shown that muscular strength, flexibility, and anaerobic power output peak in the late evening (typically between 4-8 PM), but remain elevated above morning levels well into the night hours. Core body temperature \u2014 a key determinant of muscular function \u2014 follows a circadian rhythm that peaks around 6 PM and reaches its nadir around 4 AM.',
      },
      {
        type: 'text',
        content:
          'However, the relationship between circadian rhythm and endurance performance is complex. A 2020 study in Sports Medicine found that while time-trial performance improved by 1-3% in evening sessions compared to morning sessions, the effect was smaller for well-trained athletes who regularly trained at their competition time. The BMR runners, by consistently training at midnight, may effectively "entrain" their circadian systems to optimize performance during those hours.',
      },
      {
        type: 'heading',
        content: 'Building Community Through Shared Challenge',
      },
      {
        type: 'text',
        content:
          'Beyond physiology, the BMR phenomenon reflects broader trends in urban running culture across India. According to data from the Athletics Federation of India, the number of organized running events in India grew from approximately 300 in 2015 to over 1,500 in 2024 \u2014 a five-fold increase. Bengaluru alone hosts more than 80 organized runs annually, more than any other Indian city.',
      },
      {
        type: 'quote',
        content:
          'When you run at midnight with strangers who become friends, the city reveals itself differently. The roads are yours. The air is clean. And there is something profound about choosing to be awake, moving, alive, when everyone else is asleep.',
        source: 'Raghu Mani, Co-founder of Bangalore Midnight Runners',
      },
      { type: 'heading', content: 'Safety and Logistics' },
      {
        type: 'list',
        content: 'The BMR model for safe night running:',
        items: [
          'Group minimum of 10 runners with experienced pace leaders at front and rear.',
          'Reflective gear and headlamps mandatory \u2014 no exceptions.',
          'Pre-mapped routes on well-lit roads with emergency vehicle access.',
          'WhatsApp live location sharing with a designated safety coordinator.',
          'Medical volunteer with first-aid kit in the sweep vehicle that follows the group.',
        ],
      },
    ],
    references: [
      {
        text: 'Ely, M.R., et al. (2007). Impact of weather on marathon-running performance. Medicine & Science in Sports & Exercise, 39(3), 487-493.',
        url: 'https://doi.org/10.1249/mss.0b013e31802d3aba',
      },
      {
        text: 'Racinais, S. & Oksa, J. (2010). Temperature and neuromuscular function. Scandinavian Journal of Medicine & Science in Sports, 20(S3), 1-18.',
        url: 'https://doi.org/10.1111/j.1600-0838.2010.01204.x',
      },
      {
        text: 'Thun, E., et al. (2015). Is there a relationship between exercise and circadian rhythms? Chronobiology International, 32(4), 579-595.',
        url: 'https://doi.org/10.3109/07420528.2014.997264',
      },
    ],
  },

  // ARTICLE 4: "First Marathon? Here's Everything You Need"
  {
    slug: 'first-marathon-guide',
    tag: 'Beginner Guide',
    title: "First Marathon? Here's Everything You Need",
    subtitle:
      'From training plans to race-day nutrition, a comprehensive guide for first-time marathon runners',
    author: 'Coach Vikram Sinha',
    authorRole: 'IAAF Level 2 Running Coach',
    date: 'March 1, 2026',
    readTime: '15 min read',
    heroImage:
      'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      'From training plans to race-day nutrition, a comprehensive guide for first-time marathon runners.',
    sections: [
      {
        type: 'text',
        content:
          'Running a marathon \u2014 42.195 kilometers \u2014 is one of the most significant physical challenges a recreational athlete can undertake. The distance was standardized at the 1908 London Olympics and has since become the benchmark of endurance achievement worldwide. In India, marathon participation has surged from fewer than 50,000 finishers in 2010 to over 500,000 in 2025, reflecting a dramatic shift in fitness culture.',
      },
      { type: 'heading', content: 'The 16-Week Foundation Plan' },
      {
        type: 'text',
        content:
          'Sports science research consistently shows that 16-20 weeks of structured training is optimal for first-time marathon preparation, assuming the runner has a base of at least 6 months of regular running (3-4 times per week, 20-30 km total). The American College of Sports Medicine recommends that beginners should be comfortable running 30 minutes continuously before starting a marathon training program.',
      },
      {
        type: 'text',
        content:
          'A well-structured plan follows the principle of periodization, alternating between building weeks and recovery weeks in a 3:1 ratio. Weekly mileage should increase by no more than 10% (the "10% rule" supported by research from the British Journal of Sports Medicine showing injury rates double when weekly volume increases exceed 30%).',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/3764011/pexels-photo-3764011.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          'Consistent training over 16 weeks builds the aerobic base needed for marathon success',
      },
      {
        type: 'heading',
        content: 'Nutrition: The Fourth Discipline',
      },
      {
        type: 'text',
        content:
          'Marathon nutrition is often called the "fourth discipline" (after swimming, cycling, and running in triathlon, but equally applicable to running). The human body stores approximately 2,000 calories of glycogen in muscles and liver \u2014 enough to fuel approximately 90-120 minutes of moderate-intensity running. A marathon at recreational pace (4:00-5:30) takes considerably longer, creating an inevitable energy deficit.',
      },
      {
        type: 'list',
        content:
          'Race-day nutrition protocol (based on International Society of Sports Nutrition guidelines):',
        items: [
          'Pre-race meal: 2-3 hours before start. 1-2g carbohydrate per kg bodyweight. Familiar foods only \u2014 nothing new on race day.',
          'First gel/fuel: Take at 45-60 minutes, then every 30-45 minutes thereafter.',
          'Target 30-60g carbohydrates per hour (trained gut can handle up to 90g/hour with mixed glucose-fructose sources).',
          'Hydration: 400-800ml per hour depending on conditions. Include sodium (300-600mg/L) to prevent hyponatremia.',
          'Caffeine: 3-6mg/kg bodyweight, taken 60 minutes before or during the race, has been shown to improve endurance performance by 2-4%.',
        ],
      },
      {
        type: 'heading',
        content: 'Common Mistakes and How to Avoid Them',
      },
      {
        type: 'text',
        content:
          'The most common first-marathon mistake is starting too fast. Analysis of timing data from over 3 million marathon finishes by Strava showed that 68% of runners run their first half faster than their second half, with the average slowdown being 15.6%. Sports scientists call this "positive splitting." The recommended strategy is "negative splitting" \u2014 running the second half slightly faster \u2014 or even pacing, which requires extraordinary discipline in the excitement of race morning.',
      },
      {
        type: 'quote',
        content:
          "The marathon doesn't really begin until 30 kilometers. Everything before that is just the warm-up.",
        source: 'Haile Gebrselassie, Two-time Olympic Gold Medalist',
      },
    ],
    references: [
      {
        text: 'Vitale, K. & Getzin, A. (2019). Nutrition and supplement update for the endurance athlete. Nutrients, 11(6), 1289.',
        url: 'https://doi.org/10.3390/nu11061289',
      },
      {
        text: 'Damsted, C., et al. (2019). Design of Project Run21: A 14-week randomized trial. BMC Musculoskeletal Disorders, 20(1), 1-8.',
        url: 'https://doi.org/10.1186/s12891-019-2452-4',
      },
      {
        text: 'Santos-Concejero, J., et al. (2017). Pacing profiles in marathon running. International Journal of Sports Physiology and Performance, 12(8), 1018-1023.',
        url: 'https://doi.org/10.1123/ijspp.2016-0506',
      },
    ],
  },

  // ARTICLE 5: "How to Choose the Right Cycling Event"
  {
    slug: 'choosing-cycling-event',
    tag: 'Cycling',
    title: 'How to Choose the Right Cycling Event',
    subtitle:
      'Gran fondo, century ride, or multi-stage tour? Understanding the different formats',
    author: 'Neha Rajput',
    authorRole: 'Competitive Cyclist & Event Organizer',
    date: 'February 15, 2026',
    readTime: '10 min read',
    heroImage:
      'https://images.pexels.com/photos/5807571/pexels-photo-5807571.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      'Gran fondo, century ride, or multi-stage tour? Understanding the different formats to find your fit.',
    sections: [
      {
        type: 'text',
        content:
          'The cycling event landscape in India has exploded in the past decade. From casual 50-kilometer brevets to multi-day Himalayan tours covering 1,200+ kilometers, the options can be overwhelming for riders looking to race or ride their first organized event. Understanding the key differences between event formats is essential for choosing one that matches your fitness, goals, and temperament.',
      },
      {
        type: 'heading',
        content: 'Gran Fondo: The Timed Mass Ride',
      },
      {
        type: 'text',
        content:
          'Originating in Italy ("gran fondo" translates to "big ride"), these events typically range from 80-200 kilometers with significant climbing. Unlike races, gran fondos are mass-participation events with chip timing and age-group rankings, allowing competitive riders to push hard while recreational riders enjoy a supported ride with rest stops and mechanical support.',
      },
      {
        type: 'text',
        content:
          'The physiological demands of a gran fondo depend heavily on the course profile. Research in the European Journal of Applied Physiology found that competitive gran fondo riders sustained an average power output of 65-72% of their Functional Threshold Power (FTP) over 4-6 hours, with brief surges to 90-100% FTP on climbs. This intensity profile demands a well-developed aerobic base and practiced nutrition strategy.',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/5807571/pexels-photo-5807571.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          'Gran fondo events combine competitive timing with the camaraderie of a group ride',
      },
      {
        type: 'heading',
        content: 'Century Rides: The Distance Milestone',
      },
      {
        type: 'text',
        content:
          "A \"century\" is 100 miles (160.9 km) \u2014 cycling's equivalent of the marathon. Century rides are typically non-competitive and focus on completion rather than speed. They are popular with charity rides and cycling clubs as milestone achievements. Average completion times range from 5-8 hours depending on terrain and rider fitness.",
      },
      {
        type: 'heading',
        content: 'Multi-Stage Tours: The Ultimate Adventure',
      },
      {
        type: 'text',
        content:
          "Multi-stage events like the Tour of Nilgiris (India's premier stage race) or the Manali-Leh cycling expedition span 3-14 days and cover 300-1,500 kilometers. These events require not just aerobic fitness but sophisticated recovery management. Research from the Tour de France has shown that professional riders lose 1-2% of their power output per day over a 21-day stage race, despite optimal nutrition and recovery protocols. For amateur riders, daily recovery becomes the primary performance limiter.",
      },
      {
        type: 'list',
        content: 'Choosing the right event \u2014 key questions to ask:',
        items: [
          'What is your current weekly riding volume? You should be riding at least 70% of the event distance per week for 6-8 weeks before the event.',
          'What is the elevation profile? A flat 100km and a mountainous 100km are entirely different challenges. Train on similar terrain.',
          'Is it competitive or participatory? If you want to race, look for chip-timed events with categories. If you want to enjoy, look for supported rides with generous cutoff times.',
          'What support is provided? Fully supported events offer mechanical help, nutrition stops, and medical support. Self-supported events require you to carry everything.',
        ],
      },
    ],
    references: [
      {
        text: 'Lucia, A., et al. (2003). Tour de France versus Vuelta a Espana: Which is harder? Medicine & Science in Sports & Exercise, 35(5), 872-878.',
        url: 'https://doi.org/10.1249/01.MSS.0000064999.82036.B4',
      },
      {
        text: 'Abbiss, C.R. & Laursen, P.B. (2008). Describing and understanding pacing strategies during athletic competition. Sports Medicine, 38(3), 239-252.',
        url: 'https://doi.org/10.2165/00007256-200838030-00004',
      },
    ],
  },

  // ARTICLE 6: "Altitude Training: Preparing for High-Elevation Races"
  {
    slug: 'altitude-training',
    tag: 'Advanced',
    title: 'Altitude Training: Preparing for High-Elevation Races',
    subtitle:
      'What happens to your body above 8,000 feet and how to prepare for events like the Ladakh Marathon',
    author: 'Dr. Ravi Nair',
    authorRole: 'High Altitude Medicine Specialist',
    date: 'January 10, 2026',
    readTime: '12 min read',
    heroImage:
      'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      'What happens to your body above 8,000 feet and how to train for events like the Ladakh Marathon.',
    sections: [
      {
        type: 'text',
        content:
          'The Ladakh Marathon, held annually in September at an altitude of 3,500 meters (11,500 feet) in Leh, is one of the highest marathons in the world. At this elevation, the atmospheric pressure is approximately 65% of sea-level values, meaning each breath delivers roughly one-third less oxygen to the lungs. For lowland athletes, this physiological challenge requires months of deliberate preparation.',
      },
      {
        type: 'heading',
        content: 'The Oxygen Cascade at Altitude',
      },
      {
        type: 'text',
        content:
          'Understanding altitude physiology begins with the "oxygen cascade" \u2014 the progressive drop in oxygen partial pressure from inspired air to the mitochondria. At sea level, inspired air has a PO2 of approximately 149 mmHg. At 3,500 meters, this drops to approximately 100 mmHg. By the time oxygen reaches the exercising muscles, the PO2 at altitude may be as low as 15-20 mmHg, compared to 25-30 mmHg at sea level. This reduced driving pressure limits oxygen delivery and, consequently, exercise capacity.',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          'Training at altitude triggers a cascade of physiological adaptations that enhance oxygen-carrying capacity',
      },
      {
        type: 'heading',
        content: 'Live High, Train Low: The Gold Standard',
      },
      {
        type: 'text',
        content:
          'The "live high, train low" (LHTL) paradigm, first proposed by Levine and Stray-Gundersen in 1997, remains the gold standard for altitude training. The concept is elegant: live at moderate altitude (2,000-2,500m) to stimulate erythropoiesis and improve oxygen-carrying capacity, while training at lower altitude (below 1,500m) to maintain workout intensity and quality.',
      },
      {
        type: 'text',
        content:
          'Their landmark study demonstrated that runners using the LHTL protocol improved their 5,000-meter time trial performance by an average of 13.4 seconds compared to controls \u2014 equivalent to a 1.4% improvement. Subsequent meta-analyses have confirmed that LHTL produces meaningful performance gains of 1-3% in elite endurance athletes, with the optimal altitude "dose" being 2,000-2,500m for at least 12-16 hours per day over a minimum of 3-4 weeks.',
      },
      {
        type: 'heading',
        content: 'Simulated Altitude: Hypoxic Training Alternatives',
      },
      {
        type: 'text',
        content:
          'For athletes who cannot travel to altitude, simulated altitude training using hypoxic tents, masks, or altitude training chambers offers a practical alternative. Intermittent Hypoxic Training (IHT) involves breathing hypoxic air (typically equivalent to 2,500-5,000m) during rest or sleep. Research from the Australian Institute of Sport has shown that sleeping in a hypoxic tent at a simulated altitude of 3,000m for 8-10 hours per night over 3 weeks produces measurable increases in hemoglobin mass and red blood cell volume.',
      },
      {
        type: 'list',
        content:
          'Practical altitude preparation timeline for the Ladakh Marathon:',
        items: [
          'Weeks 16-12: Build aerobic base at sea level. Establish 50-60 km weekly running volume.',
          'Weeks 12-8: Incorporate hill training to simulate the muscular demands of altitude running. Add 2 sessions per week on steep gradients (8-12%).',
          'Weeks 8-4: If possible, use simulated altitude exposure (hypoxic tent or intermittent hypoxic breathing sessions). Target 2,500-3,000m equivalent for 8+ hours daily.',
          'Weeks 4-2: Taper volume by 40-60% while maintaining intensity. Begin iron supplementation if ferritin is below 50 ng/mL.',
          'Days 7-3: Arrive in Leh and follow strict acclimatization protocol. No running for the first 48 hours. Light walks only. Hydrate aggressively.',
        ],
      },
      {
        type: 'quote',
        content:
          'Altitude racing is 50% physical preparation and 50% respect for the mountain. The runners who perform best at the Ladakh Marathon are not always the fastest at sea level \u2014 they are the ones who acclimatize most intelligently.',
        source: 'Dr. Tsewang Norboo, Medical Director, Ladakh Marathon',
      },
    ],
    references: [
      {
        text: 'Levine, B.D. & Stray-Gundersen, J. (1997). "Living high-training low": Effect of moderate-altitude acclimatization with low-altitude training on performance. Journal of Applied Physiology, 83(1), 102-112.',
        url: 'https://doi.org/10.1152/jappl.1997.83.1.102',
      },
      {
        text: 'Millet, G.P., et al. (2010). Combining hypoxic methods for peak performance. Sports Medicine, 40(1), 1-25.',
        url: 'https://doi.org/10.2165/11317920-000000000-00000',
      },
      {
        text: 'Chapman, R.F., et al. (2014). Defining the "dose" of altitude training. Journal of Applied Physiology, 116(6), 595-603.',
        url: 'https://doi.org/10.1152/japplphysiol.00634.2013',
      },
    ],
  },

  // ARTICLE 7: "Recovery Protocols Used by Elite Athletes"
  {
    slug: 'recovery-protocols',
    tag: 'Recovery',
    title: 'Recovery Protocols Used by Elite Athletes',
    subtitle:
      'Ice baths, compression, sleep optimization \u2014 the science behind bouncing back',
    author: 'Dr. Anjali Deshmukh',
    authorRole: 'Sports Medicine Physician',
    date: 'December 20, 2025',
    readTime: '8 min read',
    heroImage:
      'https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg?auto=compress&cs=tinysrgb&w=1200',
    excerpt:
      'Ice baths, compression, sleep optimization \u2014 the science behind bouncing back from intense events.',
    sections: [
      {
        type: 'text',
        content:
          "Recovery is where adaptation happens. The training stimulus \u2014 whether a tempo run, interval session, or long ride \u2014 creates controlled damage to muscle fibers, depletes energy stores, and stresses the cardiovascular system. The body's response to this stress, during recovery, is what makes you fitter and faster. Yet recovery remains the most neglected aspect of most athletes' training programs.",
      },
      {
        type: 'heading',
        content: 'Cold Water Immersion: What the Science Actually Says',
      },
      {
        type: 'text',
        content:
          'Cold water immersion (CWI) \u2014 commonly known as ice baths \u2014 has been a staple of elite recovery protocols for decades. The typical protocol involves immersion in 10-15\u00B0C water for 10-15 minutes. A comprehensive 2022 meta-analysis in Sports Medicine examining 52 studies found that CWI reduced perceived muscle soreness by 20-30% at 24-48 hours post-exercise compared to passive recovery.',
      },
      {
        type: 'text',
        content:
          'However, the picture is nuanced. Research from the Queensland University of Technology demonstrated that regular CWI after strength training actually blunted long-term muscle and strength gains by suppressing the inflammatory signaling pathways necessary for adaptation. The implication: ice baths are beneficial for recovery between competitive events but may be counterproductive during training phases focused on building strength or muscle.',
      },
      {
        type: 'image',
        content:
          'https://images.pexels.com/photos/3076516/pexels-photo-3076516.jpeg?auto=compress&cs=tinysrgb&w=1200',
        caption:
          'Evidence-based recovery combines multiple modalities \u2014 no single intervention is a silver bullet',
      },
      {
        type: 'heading',
        content: 'Sleep: The Ultimate Recovery Tool',
      },
      {
        type: 'text',
        content:
          'Sleep is the most powerful and most underrated recovery intervention available. During slow-wave (deep) sleep, the pituitary gland releases approximately 75% of daily growth hormone (GH) \u2014 the primary driver of tissue repair and muscular recovery. A landmark Stanford University study found that extending sleep to 10 hours per night for 5-7 weeks improved sprint times, free-throw accuracy, and reaction times in basketball players, with similar benefits documented in swimmers and tennis players.',
      },
      {
        type: 'text',
        content:
          'For endurance athletes, the relationship between sleep and recovery is dose-dependent. Research published in the International Journal of Sports Physiology and Performance found that athletes sleeping fewer than 7 hours per night had a 1.7-fold increased risk of injury compared to those sleeping 8+ hours. Sleep restriction also impairs glycogen resynthesis and protein synthesis, directly slowing the recovery process.',
      },
      {
        type: 'heading',
        content: 'Compression Garments: Marginal Gains?',
      },
      {
        type: 'text',
        content:
          'Graduated compression garments (socks, tights, sleeves) apply mechanical pressure to the limbs, theoretically improving venous return and reducing edema. A 2019 meta-analysis in the British Journal of Sports Medicine found that wearing compression garments for 24-72 hours post-exercise produced small but significant reductions in muscle soreness and improvements in subsequent performance (effect size: 0.27-0.40).',
      },
      {
        type: 'list',
        content:
          'Evidence-based recovery hierarchy (ranked by scientific support):',
        items: [
          'Sleep (8-10 hours): Highest impact. Non-negotiable foundation of all recovery.',
          'Nutrition timing: Consume 1.2g/kg carbohydrate + 0.3g/kg protein within 30-60 minutes post-exercise to maximize glycogen resynthesis.',
          'Active recovery: 20-30 minutes of very low-intensity movement (walking, easy cycling) on rest days improves blood flow without adding training stress.',
          'Cold water immersion: Use between competitions (not after adaptation-focused training). 10-15 minutes at 10-15\u00B0C.',
          'Compression garments: Small but real benefit. Wear for 12-24 hours post-exercise.',
          'Massage/foam rolling: Reduces perceived soreness. Effect is primarily neurological (pain modulation) rather than mechanical.',
        ],
      },
      {
        type: 'quote',
        content:
          "The greatest performance-enhancing drug in the world is a good night's sleep. I cannot overstate this. If you are sleeping less than 8 hours, you are leaving performance on the table.",
        source:
          'Dr. Matthew Walker, Neuroscientist and Author of "Why We Sleep"',
      },
    ],
    references: [
      {
        text: 'Machado, A.F., et al. (2016). Can water temperature and immersion time influence the effect of cold water immersion on muscle soreness? Sports Medicine, 46(4), 503-514.',
        url: 'https://doi.org/10.1007/s40279-015-0431-7',
      },
      {
        text: 'Mah, C.D., et al. (2011). The effects of sleep extension on the athletic performance of collegiate basketball players. Sleep, 34(7), 943-950.',
        url: 'https://doi.org/10.5665/SLEEP.1132',
      },
      {
        text: 'Marqu\u00E9s-Jim\u00E9nez, D., et al. (2016). Are compression garments effective for the recovery of exercise-induced muscle damage? Physiology & Behavior, 153, 133-148.',
        url: 'https://doi.org/10.1016/j.physbeh.2015.10.027',
      },
      {
        text: 'Roberts, L.A., et al. (2015). Post-exercise cold water immersion attenuates acute anabolic signalling. Journal of Physiology, 593(18), 4285-4301.',
        url: 'https://doi.org/10.1113/JP270570',
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
