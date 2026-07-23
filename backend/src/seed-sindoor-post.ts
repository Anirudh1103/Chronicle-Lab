import { PrismaClient } from '@prisma/client';
import { validateAndReindexHierarchy } from './services/post.service';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the ultimate "Decoding Operation Sindoor" hierarchical book post...');

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

  // 3. Construct raw blocks representing Part I: Background (5 Chapters)
  const rawBlocks = [
    // --- PART I ---
    {
      id: 'part-1',
      type: 'part',
      content: {
        title: 'Part I: Background',
        slug: 'part-i-background',
        description: 'Understanding Why Operation Sindoor Happened: The Geopolitical Landscape, the Baisaran Valley Tragedy, and the Investigations that Followed.',
        metadata: { accentColor: '#f97316' }
      },
      orderIndex: 10,
      parentId: null
    },

    // --- CHAPTER 1: PRELUDE ---
    {
      id: 'chap-1',
      type: 'chapter',
      content: {
        title: 'Chapter 1: Prelude — Setting the Stage',
        slug: 'chapter-1-prelude',
        description: 'Introduce readers to the geopolitical landscape before Operation Sindoor, explaining why Kashmir has remained strategically important.'
      },
      orderIndex: 20,
      parentId: 'part-1'
    },

    // Chapter 1 -> Heading 1.1
    {
      id: 'head-1-1',
      type: 'heading',
      content: {
        title: 'Geopolitics and Geography',
        level: 2,
        slug: 'geopolitics-geography'
      },
      orderIndex: 30,
      parentId: 'chap-1'
    },

    // Chapter 1 -> Heading 1.1 -> Subheading 1.1.1
    {
      id: 'sub-1-1-1',
      type: 'subheading',
      content: {
        title: 'Opening Narrative: The Calm Before the Storm',
        level: 3,
        slug: 'opening-narrative-calm-before-storm'
      },
      orderIndex: 40,
      parentId: 'head-1-1'
    },
    {
      id: 'p-1-1-1-1',
      type: 'paragraph',
      content: {
        text: '<p>The Baisaran Valley in Pahalgam, often referred to as the "Valley of Shepherds," was a serene jewel in Jammu and Kashmir. Teeming with tourists and pilgrims, the economy thrived on hospitality and local craftsmanship, and military presence was kept low to allow peaceful daily life to flourish.</p>'
      },
      orderIndex: 50,
      parentId: 'sub-1-1-1'
    },
    {
      id: 'img-1-1-1-2',
      type: 'image',
      content: {
        url: '',
        alt: 'Pahalgam Meadows',
        caption: 'Suggested Image: A wide landscape photo of Baisaran Valley, Kashmir showing pine-forested meadows.'
      },
      orderIndex: 60,
      parentId: 'sub-1-1-1'
    },

    // Chapter 1 -> Heading 1.1 -> Subheading 1.1.2
    {
      id: 'sub-1-1-2',
      type: 'subheading',
      content: {
        title: 'Kashmir Today: Geography & LoC Border Regions',
        level: 3,
        slug: 'kashmir-today-geography-loc-border'
      },
      orderIndex: 70,
      parentId: 'head-1-1'
    },
    {
      id: 'p-1-1-2-1',
      type: 'paragraph',
      content: {
        text: '<p>The region of Kashmir remains one of the most strategically significant borders in the world. Enclosed by rugged mountain ranges, the Line of Control (LoC) presents extreme challenges for mountain warfare, making defense logistics highly vulnerable to seasonal changes and rough terrain.</p>'
      },
      orderIndex: 80,
      parentId: 'sub-1-1-2'
    },
    {
      id: 'img-1-1-2-2',
      type: 'image',
      content: {
        url: '',
        alt: 'Line of Control Map',
        caption: 'Suggested Image: Topographical map detailing the proximity of Baisaran Valley to the Line of Control (LoC).'
      },
      orderIndex: 90,
      parentId: 'sub-1-1-2'
    },

    // Chapter 1 -> Heading 1.2
    {
      id: 'head-1-2',
      type: 'heading',
      content: {
        title: 'Security and Warnings',
        level: 2,
        slug: 'security-warnings'
      },
      orderIndex: 100,
      parentId: 'chap-1'
    },

    // Chapter 1 -> Heading 1.2 -> Subheading 1.2.1
    {
      id: 'sub-1-2-1',
      type: 'subheading',
      content: {
        title: 'The Security Grid and Infiltration Vulnerabilities',
        level: 3,
        slug: 'security-grid-infiltration'
      },
      orderIndex: 110,
      parentId: 'head-1-2'
    },
    {
      id: 'p-1-2-1-1',
      type: 'paragraph',
      content: {
        text: '<p>A multi-layered counter-terror grid consisting of the Indian Army, CRPF, BSF, and J&K Police maintains round-the-clock vigilance. Despite their continuous operations, mountain passes and dense pine forests present natural blind spots that infiltrators try to exploit during seasonal weather shifts.</p>'
      },
      orderIndex: 120,
      parentId: 'sub-1-2-1'
    },
    {
      id: 'callout-1-2-1-2',
      type: 'callout',
      content: {
        type: 'info',
        title: 'Security Notice',
        text: 'The counter-terror grid utilizes advanced electronic surveillance, but physical patrols remain the main line of defense in the high-altitude forested zones.'
      },
      orderIndex: 130,
      parentId: 'sub-1-2-1'
    },

    // Chapter 1 -> Heading 1.2 -> Subheading 1.2.2
    {
      id: 'sub-1-2-2',
      type: 'subheading',
      content: {
        title: 'Previous Warning Signs & Intelligence Briefs',
        level: 3,
        slug: 'previous-warning-signs'
      },
      orderIndex: 140,
      parentId: 'head-1-2'
    },
    {
      id: 'p-1-2-2-1',
      type: 'paragraph',
      content: {
        text: '<p>In the weeks leading up to April 2025, military intelligence intercepted multiple satellite radio transmissions suggesting movement by launch pads across the border. These OSINT and official updates flagged potential attempts to strike high-profile soft targets in tourist zones.</p>'
      },
      orderIndex: 150,
      parentId: 'sub-1-2-2'
    },

    // --- CHAPTER 2: PAHALGAM ---
    {
      id: 'chap-2',
      type: 'chapter',
      content: {
        title: 'Chapter 2: Pahalgam — The Day Everything Changed',
        slug: 'chapter-2-pahalgam',
        description: 'A chronological recount of the Pahalgam terror attack on April 22, 2025, documenting the events and immediate security responses.'
      },
      orderIndex: 160,
      parentId: 'part-1'
    },

    // Chapter 2 -> Heading 2.1
    {
      id: 'head-2-1',
      type: 'heading',
      content: {
        title: 'The Attack Sequence',
        level: 2,
        slug: 'attack-sequence'
      },
      orderIndex: 170,
      parentId: 'chap-2'
    },

    // Chapter 2 -> Heading 2.1 -> Subheading 2.1.1
    {
      id: 'sub-2-1-1',
      type: 'subheading',
      content: {
        title: 'Chronology of the Day: Minute-by-Minute',
        level: 3,
        slug: 'chronology-of-the-day'
      },
      orderIndex: 180,
      parentId: 'head-2-1'
    },
    {
      id: 'p-2-1-1-1',
      type: 'paragraph',
      content: {
        text: '<p>On April 22, 2025, at approximately 14:15, five heavily armed terrorists emerged from the tree line surrounding Baisaran Valley. Disguised in local pherans, they pulled out assault weapons and began firing indiscriminately at tourists and civilian guides, shattering the valley\'s peace.</p>'
      },
      orderIndex: 190,
      parentId: 'sub-2-1-1'
    },
    {
      id: 'table-2-1-1-2',
      type: 'table',
      content: {
        headers: ['Time', 'Event Details', 'Status'],
        rows: [
          ['14:15', 'Initial gunshots fired at Baisaran tourist camp', 'Confirmed'],
          ['14:22', 'Local police sends SOS alert to military garrison', 'Confirmed'],
          ['14:35', 'Quick Reaction Teams (QRT) arrive at perimeter', 'Confirmed'],
          ['15:10', 'Terrorists neutralized after high-intensity firefight', 'Confirmed']
        ]
      },
      orderIndex: 200,
      parentId: 'sub-2-1-1'
    },

    // Chapter 2 -> Heading 2.1 -> Subheading 2.1.2
    {
      id: 'sub-2-1-2',
      type: 'subheading',
      content: {
        title: 'QRT Dispatch and Emergency Rescue operations',
        level: 3,
        slug: 'qrt-dispatch-rescue'
      },
      orderIndex: 211,
      parentId: 'head-2-1'
    },
    {
      id: 'p-2-1-2-1',
      type: 'paragraph',
      content: {
        text: '<p>Quick Reaction Teams (QRTs) neutralized the attackers within 45 minutes, preventing further loss of life. Simultaneously, medical evacuation teams secured the area and transported the wounded to military hospitals.</p>'
      },
      orderIndex: 220,
      parentId: 'sub-2-1-2'
    },
    {
      id: 'img-2-1-2-2',
      type: 'image',
      content: {
        url: '',
        alt: 'Emergency evacuation route diagram',
        caption: 'Suggested Image: Map showing the medical evacuation and cordon route established by security forces.'
      },
      orderIndex: 230,
      parentId: 'sub-2-1-2'
    },

    // --- CHAPTER 3: VICTIMS ---
    {
      id: 'chap-3',
      type: 'chapter',
      content: {
        title: 'Chapter 3: Victims — The Faces Behind the Headlines',
        slug: 'chapter-3-victims',
        description: 'Tribute profiles of the brave soldiers and civilians who lost their lives in the tragic Pahalgam terrorist attack.'
      },
      orderIndex: 240,
      parentId: 'part-1'
    },

    // Chapter 3 -> Heading 3.1
    {
      id: 'head-3-1',
      type: 'heading',
      content: {
        title: 'The Martyrs and Legacies',
        level: 2,
        slug: 'martyrs-and-legacies'
      },
      orderIndex: 250,
      parentId: 'chap-3'
    },

    // Chapter 3 -> Heading 3.1 -> Subheading 3.1.1
    {
      id: 'sub-3-1-1',
      type: 'subheading',
      content: {
        title: 'Martyr Profiles & Acts of Valor',
        level: 3,
        slug: 'martyr-profiles-valor'
      },
      orderIndex: 260,
      parentId: 'head-3-1'
    },
    {
      id: 'p-3-1-1-1',
      type: 'paragraph',
      content: {
        text: '<p>Six brave soldiers made the ultimate sacrifice while containing the attack. Their courageous actions saved hundreds of civilians in Baisaran. They are remembered as national heroes.</p>'
      },
      orderIndex: 270,
      parentId: 'sub-3-1-1'
    },
    {
      id: 'table-3-1-1-2',
      type: 'table',
      content: {
        headers: ['Name', 'Rank', 'Age', 'State', 'Valor Detail'],
        rows: [
          ['Naik Gurpreet Singh', 'Naik', '29', 'Punjab', 'First to engage and cordon the civilian camp'],
          ['Havildar Rajendra Prasad', 'Havildar', '34', 'Rajasthan', 'Shielded tourists during initial burst'],
          ['Sepoy Amit Rawat', 'Sepoy', '23', 'Uttarakhand', 'Neutralized one infiltrator at close quarters'],
          ['Naib Subedar S. Kumar', 'Naib Subedar', '38', 'Tamil Nadu', 'Coordinated QRT deployment under fire'],
          ['Sepoy Vicky Rathod', 'Sepoy', '25', 'Maharashtra', 'Secured emergency evacuation passage'],
          ['Sepoy Shubham Sen', 'Sepoy', '24', 'Madhya Pradesh', 'Neutralized second infiltrator before succumbing']
        ]
      },
      orderIndex: 280,
      parentId: 'sub-3-1-1'
    },

    // Chapter 3 -> Heading 3.1 -> Subheading 3.1.2
    {
      id: 'sub-3-1-2',
      type: 'subheading',
      content: {
        title: 'Roll of Honour & Memorial Services',
        level: 3,
        slug: 'roll-of-honour'
      },
      orderIndex: 290,
      parentId: 'head-3-1'
    },
    {
      id: 'p-3-1-2-1',
      type: 'paragraph',
      content: {
        text: '<p>State memorial ceremonies were held across the nation, honoring the six fallen heroes. The government announced posthumous military decorations for their exceptional bravery and devotion to duty.</p>'
      },
      orderIndex: 300,
      parentId: 'sub-3-1-2'
    },
    {
      id: 'quote-3-1-2-2',
      type: 'quote',
      content: {
        text: 'They stood between terror and innocent lives. Their names are etched forever in the history of a grateful nation.',
        author: 'Chief of the Army Staff'
      },
      orderIndex: 310,
      parentId: 'sub-3-1-2'
    },

    // --- CHAPTER 4: INVESTIGATION ---
    {
      id: 'chap-4',
      type: 'chapter',
      content: {
        title: 'Chapter 4: Investigation — Following the Evidence',
        slug: 'chapter-4-investigation',
        description: 'Details the rigorous investigations conducted by the National Investigation Agency (NIA) and intelligence bodies.'
      },
      orderIndex: 320,
      parentId: 'part-1'
    },

    // Chapter 4 -> Heading 4.1
    {
      id: 'head-4-1',
      type: 'heading',
      content: {
        title: 'Forensics and Digital Footprints',
        level: 2,
        slug: 'forensics-digital-footprints'
      },
      orderIndex: 330,
      parentId: 'chap-4'
    },

    // Chapter 4 -> Heading 4.1 -> Subheading 4.1.1
    {
      id: 'sub-4-1-1',
      type: 'subheading',
      content: {
        title: 'The National Investigation Agency (NIA) Analysis',
        level: 3,
        slug: 'nia-analysis'
      },
      orderIndex: 340,
      parentId: 'head-4-1'
    },
    {
      id: 'p-4-1-1-1',
      type: 'paragraph',
      content: {
        text: '<p>Forensics teams recovered foreign markings on weapons, ammunition, and satellite messaging devices. GPS route logs recovered from the bodies proved that the group infiltrated across the Line of Control just 48 hours prior to the strike.</p>'
      },
      orderIndex: 350,
      parentId: 'sub-4-1-1'
    },
    {
      id: 'img-4-1-1-2',
      type: 'image',
      content: {
        url: '',
        alt: 'Forensic weapon analysis',
        caption: 'Suggested Image: Forensic photo of recovered weapons, including assault rifles and tactical communications equipment.'
      },
      orderIndex: 360,
      parentId: 'sub-4-1-1'
    },

    // --- CHAPTER 5: TERROR NETWORK ---
    {
      id: 'chap-5',
      type: 'chapter',
      content: {
        title: 'Chapter 5: Terror Network — Inside the Network',
        slug: 'chapter-5-terror-network',
        description: 'Mapping the organizational leadership, funding pipelines, and training facilities of the proxy warfare network.'
      },
      orderIndex: 370,
      parentId: 'part-1'
    },

    // Chapter 5 -> Heading 5.1
    {
      id: 'head-5-1',
      type: 'heading',
      content: {
        title: 'Command Structure & Operations',
        level: 2,
        slug: 'command-structure-operations'
      },
      orderIndex: 380,
      parentId: 'chap-5'
    },

    // Chapter 5 -> Heading 5.1 -> Subheading 5.1.1
    {
      id: 'sub-5-1-1',
      type: 'subheading',
      content: {
        title: 'The Proxy War Infrastructure & Handlers',
        level: 3,
        slug: 'proxy-war-infrastructure'
      },
      orderIndex: 390,
      parentId: 'head-5-1'
    },
    {
      id: 'p-5-1-1-1',
      type: 'paragraph',
      content: {
        text: '<p>The network is funded through a web of shell entities and handlers based overseas. Recovered digital logs and satellite intercepts pointed directly to active launch pads across the border, where the attackers underwent training.</p>'
      },
      orderIndex: 400,
      parentId: 'sub-5-1-1'
    },
    {
      id: 'callout-5-1-1-2',
      type: 'callout',
      content: {
        type: 'warning',
        title: 'A Defining Moment',
        text: 'The attack had shaken the nation. Behind closed doors, India\'s political leadership, intelligence agencies and armed forces had already begun evaluating options. The next chapter of this story would move from investigation to action.'
      },
      orderIndex: 410,
      parentId: 'sub-5-1-1'
    }
  ];

  // 4. Validate and reindex the blocks
  const validatedBlocks = validateAndReindexHierarchy(rawBlocks);

  // 5. Calculate Stats
  let wordCount = 0;
  validatedBlocks.forEach(block => {
    if (block.type === 'paragraph' || block.type === 'heading' || block.type === 'summary') {
      const text = block.content.text || '';
      wordCount += text.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    }
  });
  const readingTime = Math.ceil(wordCount / 200) || 1;

  // 6. Execute delete and create atomic operations in a single transaction
  await prisma.$transaction(async (tx) => {
    const existingPost = await tx.post.findUnique({
      where: { slug: 'decoding-operation-sindoor' }
    });

    if (existingPost) {
      console.log('Deleting existing post with slug "decoding-operation-sindoor" to re-seed...');
      await tx.block.deleteMany({ where: { postId: existingPost.id } });
      await tx.post.delete({ where: { id: existingPost.id } });
    }

    const createdPost = await tx.post.create({
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
        wordCount,
        readingTime,
        categories: {
          connect: { id: category.id }
        },
        blocks: {
          create: validatedBlocks.map(block => ({
            id: block.id,
            type: block.type,
            content: JSON.stringify(block.content),
            orderIndex: block.orderIndex,
            parentId: block.parentId || null
          }))
        }
      }
    });

    console.log('Successfully created blog post:', createdPost.title);
    console.log('ID:', createdPost.id);
    console.log('Slug:', createdPost.slug);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
