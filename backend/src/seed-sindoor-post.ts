import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding "Decoding Operation Sindoor" blog post...');

  // 1. Get Category
  let category = await prisma.category.findUnique({
    where: { slug: 'military' }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Military',
        slug: 'military'
      }
    });
    console.log('Created category "Military"');
  } else {
    console.log('Found category "Military":', category.id);
  }

  // 2. Get User/Author
  const author = await prisma.user.findFirst({
    where: { email: 'cmanirudh03@gmail.com' }
  });

  if (!author) {
    console.error('Error: Admin user cmanirudh03@gmail.com not found in database!');
    process.exit(1);
  }
  console.log('Found author "Anirudh CM":', author.id);

  // 3. Clean up existing post with same slug to avoid duplicate key errors
  const existingPost = await prisma.post.findUnique({
    where: { slug: 'decoding-operation-sindoor' }
  });

  if (existingPost) {
    console.log('Deleting existing post with slug "decoding-operation-sindoor" to re-seed...');
    await prisma.post.delete({
      where: { id: existingPost.id }
    });
  }

  // 4. Create blocks data
  const rawBlocks = [
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The tranquility of Pahalgam, often referred to as the "Valley of Shepherds" and a jewel in the crown of Jammu and Kashmir\'s tourism, was shattered on the afternoon of April 22, 2025. A group of five heavily armed terrorists descended upon the Baisaran Valley, a picturesque meadow approximately six kilometers from the main Pahalgam town. This area, surrounded by dense pine forests and accessible mainly by foot or horseback, was teeming with tourists enjoying the serene landscape.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Eyewitness accounts painted a horrifying picture of the attack. The militants, clad in military-style uniforms and wielding automatic weapons like AK-47s and possibly M4 carbines, reportedly emerged from the dense foliage and began firing indiscriminately at the unsuspecting tourists. Survivors recounted how the terrorists asked for names and inquired about their religion. Some victims were forced to recite the Islamic Kalima (declaration of faith) to distinguish Muslims from non-Muslims.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The brutality of the attack was particularly disturbing. Hindu men were reportedly separated from women and children and then shot at point-blank range. Some accounts even suggested that the attackers checked for circumcision to further identify Hindu victims. One survivor recounted how her newlywed husband was shot dead in front of her after identifying himself as Hindu.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Among the 26 killed were 25 tourists and a local Muslim pony operator, Syed Adil Hussain Shah, who bravely attempted to resist the terrorists by trying to snatch a weapon before being gunned down himself. The victims included newly married couples, government officials (including personnel from the Indian Air Force, Indian Navy, and the Intelligence Bureau), and a tourist from Nepal. Over 20 others sustained injuries, many of them critically.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The attack was captured inadvertently on video by a tourist who was ziplining in the area, providing chilling footage of the chaos, the injured crying for help, and bodies strewn across the meadow. This visual evidence amplified the shock and grief across the nation.</p>'
      })
    },
    {
      type: 'image',
      content: JSON.stringify({
        url: 'victim_1_1784649894975_9ab9cd6f.webp',
        alt: 'A grieving wife mourns her husband, a victim of the Pahalgam attack',
        caption: 'A grieving wife mourns her husband, a victim of the Pahalgam terror attack, whose life was tragically taken by terrorists.'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The Claim of Responsibility and the Perpetrators</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Within hours of the attack, a relatively lesser-known terror outfit called "The Resistance Front" (TRF) claimed responsibility through a message on the Telegram messaging app. The TRF, believed to be a front organization for the Pakistan-based Lashkar-e-Taiba (LeT), stated that the attack was in retaliation against the Indian government\'s policies regarding the settlement of non-locals in Kashmir following the abrogation of Article 370.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>However, in a perplexing turn of events a few days later, the TRF denied any involvement, attributing their initial claim to a "coordinated cyber intrusion." This denial was met with skepticism by Indian security agencies, who continued to believe in the TRF\'s and by extension, the LeT\'s involvement.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Intelligence reports later suggested that the attack was orchestrated by Sheikh Sajjad Gul, the head of the TRF, operating from Pakistan under the protection of the LeT. Investigations also revealed that some of the terrorists involved had received advanced military training in Pakistan, possibly by the Special Service Group (SSG). One of the key identified terrorists, Hashim Musa, was even reported to have served as a para-commando in the Pakistani SSG before joining the LeT.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Immediate Aftermath and India\'s Response</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The Indian government, led by Prime Minister Narendra Modi, took a firm stance. Top officials, including the Home Minister, visited the affected region. The government vowed to bring the perpetrators to justice and signaled a significant shift in its counter-terrorism strategy.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>In the immediate aftermath, India took several strong diplomatic and economic steps against Pakistan. These punitive measures included: (1) Suspension of the Indus Waters Treaty indefinitely, (2) Expulsion and reduction of Pakistani diplomats in India, (3) Closure of the Wagah-Attari border crossing for civilian movement, and (4) Cancellation of visas for Pakistani nationals.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>India\'s Offensive: Operation Sindoor</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Following intelligence gathering and strategic planning, the Indian Armed Forces launched "Operation Sindoor" (also referred to as "Operation Sindhoor") on the night of May 6 and the early morning of May 7, 2025. The operation was a multi-domain offensive involving the Army, Air Force, and Navy, with a clear objective: to dismantle terrorist infrastructure inside Pakistan and Pakistan-occupied Kashmir (PoK) from where attacks against India were being planned and executed.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>India conducted precise air and ground strikes, targeting nine identified high-value terrorist launchpads and training camps linked to Lashkar-e-Taiba, Jaish-e-Mohammed, and Hizbul Mujahideen. These locations were deep inside Pakistan and PoK, including areas like Punjab province and Bahawalpur, which were previously considered beyond reach. Over 80 terrorists were eliminated in these initial strikes.</p>'
      })
    },
    {
      type: 'image',
      content: JSON.stringify({
        url: 'operation_sindhoor_1784649885770_ee9322f6.webp',
        alt: 'Operation Sindoor precision strikes',
        caption: 'Indian armed forces conducted precision missile strikes on nine terrorist targets across Pakistan and Pakistan-Occupied Kashmir (PoK)'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Pakistan retaliated to the initial Indian strikes with drone and missile attacks targeting Indian military installations and even civilian areas. India\'s air defense systems, including the Akashteer system, successfully intercepted many of these threats.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>In response to Pakistan\'s aggression, India escalated its actions and conducted strikes on at least eleven Pakistani air bases across the Western Front, including Nur Khan, Rafiqui, and Sargodha. These strikes reportedly caused significant damage to Pakistan\'s air force infrastructure, estimated at around 20%. One Pakistani F-16 was shot down by an Indian surface-to-air missile during the aerial skirmish.</p>'
      })
    },
    {
      type: 'image',
      content: JSON.stringify({
        url: 'f16_1784649892181_73f676ec.webp',
        alt: 'F-16 Shot Down',
        caption: 'Pakistan F-16 Shot Down By Indian Surface-To-Air Missile'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The Indian Navy deployed its Carrier Battle Group in the Arabian Sea to deter Pakistani naval movements and maintain operational readiness, demonstrating strong tri-service coordination.</p>'
      })
    },
    {
      type: 'image',
      content: JSON.stringify({
        url: 'post_attack_1784649887983_d0166886.webp',
        alt: 'Post-attack damage',
        caption: 'India attacked nine terror camps in Pakistan and PoK, neutralizing key command positions.'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The Fallen Heroes: Honoring the Martyrs of Operation Sindoor</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>While the initial government briefings emphasized precision and non-escalation to prevent panic, the operation did not come without a heavy price. The Indian Armed Forces suffered casualties in the line of duty during the intense border skirmishes and strikes. At the time of the operation, these details were kept classified under operational security to avoid giving tactical advantages to the enemy.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>In June 2026, the government officially declassified the casualties and inscribed the names of these six brave personnel at the National War Memorial in New Delhi, acknowledging their ultimate sacrifice for the nation\'s security.</p>'
      })
    },
    {
      type: 'table',
      content: JSON.stringify({
        headers: ['Rank & Name', 'Regiment / Unit', 'Honor / Award'],
        rows: [
          ['Subedar Major Pawan Kumar', 'Headquarters 10 Infantry Brigade', 'Mentioned in Despatches'],
          ['Rifleman Sunil Kumar, Vir Chakra', '4 Jammu and Kashmir Light Infantry', 'Vir Chakra (Gallantry)'],
          ['Lance Naik Dinesh Kumar', '5 Field Regiment', 'Sena Medal'],
          ['Agniveer Mood Muralinaik', '851 Light Regiment', 'Honored at National War Memorial'],
          ['Havildar Sunil Kumar Singh', '237 Field Workshop Company', 'Honored at National War Memorial'],
          ['Sergeant Surendra Kumar, Vayu Medal', '39 Wing, Indian Air Force', 'Vayu Medal (Gallantry)']
        ]
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The public inscription of these names at the National War Memorial sparked a national debate over the transparency of casualty reporting, yet it stood as a solemn reminder of the steep cost of defending the borders and responding to cross-border terrorism.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Ceasefire and Continued Volatility</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>After facing significant losses and infrastructure damage, Pakistan\'s Director General of Military Operations (DGMO) contacted his Indian counterpart on the afternoon of May 10, 2025, proposing a cessation of hostilities. A ceasefire agreement was reached, effective from 5:00 PM IST on the same day, encompassing all military actions on land, air, and sea.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Despite agreeing to the ceasefire, Pakistan violated it within hours. Cross-border firing and drone intrusions were reported in various sectors of Jammu and Kashmir, as well as in Gujarat. India\'s Foreign Secretary strongly condemned these violations, stating that the Indian armed forces were responding appropriately and were instructed to retaliate firmly to any further breaches.</p>'
      })
    },
    {
      type: 'image',
      content: JSON.stringify({
        url: 'violation_1784649883076_85e3c730.webp',
        alt: 'Ceasefire violations map/photo',
        caption: 'Ceasefire violations across Jammu and Kashmir hours after the agreement'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Prime Minister Modi, in a public address, stated that India had only "paused" military action and would act decisively if another terror attack occurred. He also ruled out any talks with Pakistan unless they pertained to terrorism or the return of PoK. The international community, particularly the US, played a key role in pushing both sides towards de-escalation, though India maintained that the ceasefire was a bilateral decision.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Indian Military Assets Used During Operation Sindoor</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The operation was a textbook showcase of modern tri-services integration, utilizing high-end offensive and defensive systems.</p>'
      })
    },
    {
      type: 'table',
      content: JSON.stringify({
        headers: ['Asset Name & Class', 'Type', 'Description', 'Combat Role & Image'],
        rows: [
          ['Dassault Rafale', 'Offensive Fighter', 'Advanced multirole fighter jet used for precision deep strikes.', '<img src="raffale_1784649879680_35c118ee.webp" class="max-h-[60px] rounded-lg" />'],
          ['Sukhoi Su-30MKI', 'Offensive Fighter', 'Mainstay multirole fighter for air superiority and strike roles.', '<img src="su_30mki_1784649877173_504efecd.webp" class="max-h-[60px] rounded-lg" />'],
          ['Dassault Mirage 2000', 'Offensive Fighter', 'Used for precision strike missions against specific terrorist infrastructure.', '<img src="mirage2000_1784649874336_98e19f6e.webp" class="max-h-[60px] rounded-lg" />'],
          ['Boeing AH-64 Apache', 'Attack Helicopter', 'Attack helicopters providing cover for special forces and reconnaissance.', '<img src="ah_64d_apache_longbow_1784649866779_ba652bfd.webp" class="max-h-[60px] rounded-lg" />'],
          ['IAI Harop', 'Kamikaze Drone', 'Israeli-origin loitering munition used to target air defense radars.', '<img src="harop_1784649872272_ac5b1e36.webp" class="max-h-[60px] rounded-lg" />'],
          ['SkyStriker', 'Loitering Munition', 'Indigenous loitering munitions that made their combat debut during the operation.', '<img src="skystriker_1784649868874_881bca49.webp" class="max-h-[60px] rounded-lg" />'],
          ['Mikoyan MiG-29 UPG', 'Defensive Fighter', 'Upgraded air superiority fighter engaged in countering Pakistani aircraft.', '<img src="mikoyan_mig_29_upg_1784649863776_cc2e1c7f.webp" class="max-h-[60px] rounded-lg" />'],
          ['Akash Missile System', 'Air Defense', 'Indigenous surface-to-air missile system highly effective against drones.', '<img src="akash_1784649861884_b034f450.webp" class="max-h-[60px] rounded-lg" />'],
          ['L-70 Anti-Aircraft Gun', 'Air Defense', 'Upgraded gun countering low-flying drone swarms with radar tracking.', '<img src="defense_1784649859179_69c1bc51.webp" class="max-h-[60px] rounded-lg" />'],
          ['ZSU-23-4 Shilka', 'Air Defense', 'Upgraded mobile gun system with modern fire control against drone threats.', '<img src="shilka_1784649857078_afe1a211.webp" class="max-h-[60px] rounded-lg" />'],
          ['BrahMos', 'Supersonic Missile', 'Supersonic cruise missile used to strike strategic Pakistani bases.', '<img src="bramhos_1784649847471_ee4622f1.webp" class="max-h-[60px] rounded-lg" />'],
          ['SCALP', 'Cruise Missile', 'Long-range, air-launched cruise missile for deep precision bunker strikes.', '<img src="scalp_1784649853974_2a345aee.webp" class="max-h-[60px] rounded-lg" />'],
          ['HAMMER', 'Guided Bomb', 'Precision-guided bombs for striking medium-range hardened assets.', '<img src="hammer_1784649851282_1874a892.webp" class="max-h-[60px] rounded-lg" />'],
          ['D4 Anti-Drone System', 'Drone Shield', 'Indigenous system used to detect and jam Pakistani incursions.', '<img src="d4_1784649834230_9be5f376.webp" class="max-h-[60px] rounded-lg" />'],
          ['EW Systems', 'Electronic Shield', 'Used to disrupt communication and command links of enemy drones.', '<img src="ews_1784649832370_9b2147f7.webp" class="max-h-[60px] rounded-lg" />'],
          ['Directed Energy (DEW)', 'Advanced Weapon', 'Tactical lasers deployed in limited numbers to burn drone circuits.', '<img src="dew_1784649828441_445a201b.webp" class="max-h-[60px] rounded-lg" />']
        ]
      })
    },
    {
      type: 'summary',
      content: JSON.stringify({
        title: 'The Flame That Never Died',
        text: '<p>In summary, Operation Sindoor was a swift and targeted response by the Indian Army to a major terrorist attack, demonstrating India\'s resolve to act against terrorist infrastructure across its borders. The subsequent ceasefire and its violation highlight the continued volatility of the region, yet the ultimate sacrifice of the six fallen heroes has now been etched forever into the history of the nation.</p>'
      })
    }
  ];

  // 5. Insert Post
  const createdPost = await prisma.post.create({
    data: {
      title: 'Decoding Operation Sindoor',
      subtitle: 'A Response to Terror',
      slug: 'decoding-operation-sindoor',
      excerpt: "An in-depth look at the Indian Army's strategic response to the Pahalgam terror attack and its implications for regional security.",
      status: 'PUBLISHED',
      featured: true,
      coverImage: 'sindhoor-cover-image_1784816591136_3tx28dwa_original.webp',
      coverImageAlt: 'Decoding Operation Sindoor',
      coverImageCaption: 'Decoding Operation Sindoor: A Response to Terror',
      authorId: author.id,
      publishedAt: new Date('2025-05-12T00:00:00Z'),
      categories: {
        connect: { id: category.id }
      },
      blocks: {
        create: rawBlocks.map((block, idx) => ({
          type: block.type,
          content: block.content,
          orderIndex: idx * 10
        }))
      }
    }
  });

  console.log('Successfully created blog post:', createdPost.title);
  console.log('ID:', createdPost.id);
  console.log('Slug:', createdPost.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
