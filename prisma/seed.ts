import prisma from '../src/lib/db';

async function seed() {
  console.log('Starting seed...');

  const categories = [
    { name: 'Web Development', slug: 'web-development', description: 'Custom website and web app development' },
    { name: 'Mobile Development', slug: 'mobile-development', description: 'iOS and Android app development' },
    { name: 'Design', slug: 'design', description: 'UI/UX, graphic design, and branding' },
    { name: 'Writing', slug: 'writing', description: 'Content writing, copywriting, and editing' },
    { name: 'Marketing', slug: 'marketing', description: 'Digital marketing and SEO services' },
    { name: 'Video Editing', slug: 'video-editing', description: 'Professional video editing and production' },
    { name: 'Photography', slug: 'photography', description: 'Professional photography services' },
    { name: 'Music & Audio', slug: 'music-audio', description: 'Music production and audio services' },
  ];

  for (const category of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Created category: ${category.name}`);
    }
  }

  console.log('Seed completed!');
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
