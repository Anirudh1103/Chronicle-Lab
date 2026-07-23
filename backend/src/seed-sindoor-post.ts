import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the ultimate "Decoding Operation Sindoor" blog post...');

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
        text: '<p><em>Note: This post was originally written shortly after the events. It has been updated at the bottom with the newly released official government data.</em></p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 1: The Preceding Event: The Pahalgam Terror Attack (April 22, 2025)</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The Baisaran Valley Tragedy</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The tranquility of Pahalgam, often referred to as the "Valley of Shepherds" and a jewel in the crown of Jammu and Kashmir\'s tourism, was shattered on the afternoon of April 22, 2025. A group of five heavily armed terrorists descended upon the Baisaran Valley, a picturesque meadow approximately six kilometers from the main Pahalgam town. This area, surrounded by dense pine forests and accessible mainly by foot or horseback, was teeming with tourists enjoying the serene landscape.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>A Horrifying Modus Operandi</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Eyewitness accounts painted a horrifying picture of the attack. The militants, clad in military-style uniforms and wielding automatic weapons like AK-47s and possibly M4 carbines, reportedly emerged from the dense foliage and began firing indiscriminately at the unsuspecting tourists. Initial reports indicated that the attackers specifically targeted the male Hindu tourists. Survivors recounted how the terrorists asked for names and inquired about their religion. Some victims were forced to recite the Islamic Kalima (declaration of faith) to distinguish Muslims from non-Muslims.</p>'
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
        url: '',
        alt: 'Placeholder: Pahalgam Incident Site',
        caption: 'Baisaran Valley meadow, site of the tragic April 22 terror attack.'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 2: The Claim of Responsibility and the Perpetrators</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The TRF Claim</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Within hours of the attack, a relatively lesser-known terror outfit called "The Resistance Front" (TRF) claimed responsibility through a message on the Telegram messaging app. The TRF, believed to be a front organization for the Pakistan-based Lashkar-e-Taiba (LeT), stated that the attack was in retaliation against the Indian government\'s policies regarding the settlement of non-locals in Kashmir following the abrogation of Article 370. However, in a perplexing turn of events a few days later, the TRF denied any involvement, attributing their initial claim to a "coordinated cyber intrusion." This denial was met with skepticism by Indian security agencies, who continued to believe in the TRF\'s and by extension, the LeT\'s involvement.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Intelligence Findings</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Intelligence reports later suggested that the attack was orchestrated by Sheikh Sajjad Gul, the head of the TRF, operating from Pakistan under the protection of the LeT. Investigations also revealed that some of the terrorists involved had received advanced military training in Pakistan, possibly by the Special Service Group (SSG). One of the key identified terrorists, Hashim Musa, was even reported to have served as a para-commando in the Pakistani SSG before joining the LeT.</p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 3: Immediate Aftermath and India\'s Response</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Diplomatic and Economic Action</p>'
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
        text: '<p>In the immediate aftermath, India took several strong diplomatic and economic steps against Pakistan, including:</p>'
      })
    },
    {
      type: 'list',
      content: JSON.stringify({
        type: 'bullet',
        items: [
          '<p><strong>Suspension of the Indus Waters Treaty:</strong> A crucial water-sharing agreement was suspended indefinitely as a punitive measure.</p>',
          '<p><strong>Expulsion of Pakistani Diplomats:</strong> The number of Pakistani diplomats in India was significantly reduced.</p>',
          '<p><strong>Closure of Borders:</strong> The Wagah-Attari border crossing was closed for civilian movement.</p>',
          '<p><strong>Cancellation of Visas:</strong> Visas for Pakistani nationals were canceled.</p>'
        ]
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 4: India\'s Response: Operation Sindhoor (Launched May 7, 2025)</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Strategic Offensive</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Following intelligence gathering and strategic planning, the Indian Armed Forces launched "Operation Sindhoor" on the night of May 6 and the early morning of May 7, 2025. The operation was a multi-domain offensive involving the Army, Air Force, and Navy, with a clear objective: to dismantle terrorist infrastructure inside Pakistan and Pakistan-occupied Kashmir (PoK) from where attacks against India were being planned and executed.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Key Actions by the Indian Army and Air Force</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p><strong>Precision Strikes on Terrorist Infrastructure:</strong> India conducted precise air and ground strikes, targeting nine identified high-value terrorist launchpads and training camps linked to Lashkar-e-Taiba, Jaish-e-Mohammed, and Hizbul Mujahideen. These locations were deep inside Pakistan and PoK, including areas like Punjab province and Bahawalpur, which were previously considered beyond reach.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p><strong>Targeting Key Terrorist Operatives:</strong> Several high-value terrorist operatives, including those involved in past attacks like the IC814 hijack and the Pulwama bombing, were reportedly eliminated in these strikes. The leadership of multiple terror modules was dismantled.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p><strong>Retaliation Against Pakistan\'s Military Response:</strong> Pakistan retaliated to the initial Indian strikes with drone and missile attacks targeting Indian military installations and even civilian areas. India\'s air defense systems, including the Akashteer system, successfully intercepted many of these threats.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p><strong>Strikes on Pakistani Air Bases:</strong> In response to Pakistan\'s aggression, India escalated its actions and conducted strikes on at least eleven Pakistani air bases across the Western Front, including Nur Khan, Rafiqui, and Sargodha. These strikes reportedly caused significant damage to Pakistan\'s air force infrastructure, estimated at around 20%.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p><strong>Naval Deployment:</strong> The Indian Navy deployed in the Arabian Sea to deter Pakistani naval movements and maintain operational readiness.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p><strong>Emphasis on Precision and Non-Escalation (Initially):</strong> India initially emphasized that its strikes were targeted solely at terrorist infrastructure to avoid civilian and general military casualties, signaling a measured response. However, the escalation by Pakistan led to a broader targeting of military assets.</p>'
      })
    },
    {
      type: 'image',
      content: JSON.stringify({
        url: '',
        alt: 'Placeholder: Strike aftermath',
        caption: 'Ground zero of strategic terror camps targeted by precision strikes.'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 5: Pakistan Calls for a Ceasefire (May 10, 2025)</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The Ceasefire Agreement</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>After facing significant losses and infrastructure damage, Pakistan\'s Director General of Military Operations (DGMO) contacted his Indian counterpart on the afternoon of May 10, 2025, proposing a cessation of hostilities. A ceasefire agreement was reached, effective from 5:00 PM IST on the same day, encompassing all military actions on land, air, and sea.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Pakistan Violates the Ceasefire (Hours After Agreement)</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Despite agreeing to the ceasefire, Pakistan violated it within hours. Cross-border firing and drone intrusions were reported in various sectors of Jammu and Kashmir, as well as in Gujarat.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>India\'s Foreign Secretary strongly condemned these violations, stating that the Indian armed forces were responding appropriately and were instructed to retaliate firmly to any further breaches.</p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 6: Aftermath and Continued Tensions</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The Geopolitical Landscape</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>India accused Pakistan of bad faith and emphasized that the ceasefire was a pause, and any future provocations would be met with a strong response.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Prime Minister Modi, in a public address, stated that India had only "paused" military action and would act decisively if another terror attack occurred. He also ruled out any talks with Pakistan unless they pertained to terrorism or the return of PoK.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Despite the ceasefire agreement, tensions along the border remained high, with reports of continued violations and heightened vigilance on the Indian side.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The international community, particularly the US, had reportedly played a role in pushing both sides towards de-escalation, although India maintained that the ceasefire was a bilateral decision.</p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 7: Indian Military Assets Used During Operation Sindhoor</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Aircrafts used by India For Offensive Strikes</p>'
      })
    },
    {
      type: 'table',
      content: JSON.stringify({
        headers: ['Aircraft', 'Description', 'Image'],
        rows: [
          ['Dassault Rafale', 'Advanced multirole fighter jet used for precision deep strikes.', '<img alt="Rafale" src="" />'],
          ['Sukhoi Su-30MKI', 'Mainstay multirole fighter for air superiority and strike roles.', '<img alt="Su-30MKI" src="" />'],
          ['Dassault Mirage 2000', 'Used for precision strike missions against specific terrorist infrastructure.', '<img alt="Mirage 2000" src="" />']
        ]
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 8: Update: Official Government Casualty Data (June 2026)</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Honoring the Fallen</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>In late June 2026, the Indian government provided the first official disclosure of military casualties from Operation Sindhoor. The names of six armed forces personnel who made the supreme sacrifice have been permanently inscribed on Wall No. 3D of the Tyag Chakra (Circle of Sacrifice) at the National War Memorial in New Delhi.</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The Fallen Heroes:</p>'
      })
    },
    {
      type: 'list',
      content: JSON.stringify({
        type: 'bullet',
        items: [
          '<p><strong>Subedar Major Pawan Kumar</strong> – Headquarters 10 Infantry Brigade</p>',
          '<p><strong>Rifleman Sunil Kumar, Vir Chakra</strong> – 4 Jammu and Kashmir Light Infantry</p>',
          '<p><strong>Lance Naik Dinesh Kumar</strong> – 5 Field Regiment</p>',
          '<p><strong>Agniveer Mood Muralinaik</strong> – 851 Light Regiment</p>',
          '<p><strong>Havildar Sunil Kumar Singh</strong> – 237 Field Workshop Company</p>',
          '<p><strong>Sergeant Surendra Kumar, Vayu Sena Medal</strong> – 39 Wing, Indian Air Force</p>'
        ]
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Additionally, the government confirmed that the precision strikes launched across the nine terrorist camps successfully eliminated over 100 terrorists. This included key handlers and trainers affiliated with Jaish-e-Mohammed, Lashkar-e-Taiba, and Hizbul Mujahideen, effectively dismantling major segments of the terror infrastructure.</p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 9: Analysis of Air Defense & Joint-Operations Coordination</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>The Akashteer Tactical Air Defense Shield</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>During the escalation, Pakistan launched several counter-strike attempts employing tactical drones, medium-altitude loitering munitions, and precision glide bombs. The cornerstone of the Indian defense was the deployment of the Akashteer system. An indigenous automated air defense command and control grid, Akashteer linked forward-deployed search radars, flight control computers, and firing batteries. By constructing a real-time integrated air picture, Akashteer enabled Indian surface-to-air units to successfully detect, track, and neutralize hostile intrusions along the border with unprecedented efficiency.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Carrier Battle Group Deployment in the Arabian Sea</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Simultaneous with the strikes, the Indian Navy executed a massive mobilization in the Arabian Sea, deploying a Carrier Battle Group spearheaded by INS Vikrant. The naval fleet established an impenetrable surveillance perimeter and operational screen, restricting the Pakistani Navy\'s freedom of maneuver. This maritime posture acted as a critical strategic deterrent, blockading key shipping lanes and signaling to regional actors that any attempt to widen the conflict would result in an absolute maritime blockade.</p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 10: Electronic Warfare and the Anti-Drone Campaign</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Neutralizing the Drone Threat</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The border sectors witnessed an unprecedented volume of unmanned aerial vehicle (UAV) sorties from Pakistan. To counter this threat, Indian forces deployed the D4 Anti-Drone System alongside electronic warfare (EW) jamming clusters. These units successfully jammed the command frequencies, radio control bands, and satellite navigation systems of the incoming drone swarms. Cut off from their operators, the hostile drones were either forced into soft-landings or crashed harmlessly in remote buffer zones, preventing the reconnaissance of Indian positions.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Debuts of Loitering Munitions</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>Operation Sindhoor marked a technological leap for the Indian military with the combat debut of indigenous and imported loitering munitions, including the Harop and SkyStriker kamikaze drones. Guided by real-time target identification feeds, these munitions hovered over contested sectors before executing high-precision, vertical dives on hostile radar centers, ammunition depots, and assembly points. The integration of loitering platforms minimized the risk to manned aircraft and ensured that critical tactical targets were neutralized with surgical precision.</p>'
      })
    },
    {
      type: 'heading',
      content: JSON.stringify({
        level: 2,
        text: '<p>Chapter 11: International Reactions and the Geopolitical Fallout</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Global Powers Urging Moderation</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>The sudden escalation between two nuclear-armed states sent shockwaves through international diplomatic channels. Washington, Moscow, and Brussels engaged in round-the-clock backchannel negotiations, emphasizing the need for immediate de-escalation. India maintained its stance that Operation Sindhoor was a non-military, pre-emptive counter-terrorism action strictly targeted at active terror camps. This message resonated globally, as multiple countries acknowledged India\'s right to defend its citizens against cross-border incursions.</p>'
      })
    },
    {
      type: 'subheading',
      content: JSON.stringify({
        level: 3,
        text: '<p>Pakistan\'s Strategic Isolation</p>'
      })
    },
    {
      type: 'paragraph',
      content: JSON.stringify({
        text: '<p>In the wake of the operation, Islamabad attempted to mobilize support at the United Nations Security Council, alleging Indian aggression. However, Pakistan found itself diplomatically isolated. The undeniable proof of Lashkar-e-Taiba (LeT) and Special Service Group (SSG) linked training camps inside Bahawalpur and Punjab province, combined with the brutality of the Pahalgam terror attack, led major global powers to pressure Pakistan to dismantle its proxy warfare infrastructure once and for all.</p>'
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
