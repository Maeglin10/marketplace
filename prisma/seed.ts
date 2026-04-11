import prisma from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Starting seed...');

  // Categories
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

  const createdCategories: Record<string, string> = {};
  for (const category of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories[category.slug] = cat.id;
    console.log(`Category: ${category.name}`);
  }

  // Demo sellers
  const sellers = [
    {
      email: 'alex@demo.com', name: 'Alex Rivera',
      password: 'demo1234', role: 'SELLER' as const,
      bio: 'Full-stack developer with 8 years of experience. React, Node.js, and cloud architecture specialist.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    },
    {
      email: 'marie@demo.com', name: 'Marie Dubois',
      password: 'demo1234', role: 'SELLER' as const,
      bio: 'UI/UX Designer & Illustrator. I create beautiful, user-centered interfaces for SaaS and mobile apps.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=200&h=200&fit=crop&crop=face',
    },
    {
      email: 'james@demo.com', name: 'James Chen',
      password: 'demo1234', role: 'SELLER' as const,
      bio: 'SEO strategist & content marketer. Helped 50+ SaaS companies grow organic traffic by 200%+.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    },
    {
      email: 'sofia@demo.com', name: 'Sofia Tanaka',
      password: 'demo1234', role: 'SELLER' as const,
      bio: 'Mobile app developer (iOS/Android). Flutter specialist with 30+ published apps on the App Store.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    },
    {
      email: 'lucas@demo.com', name: 'Lucas Martin',
      password: 'demo1234', role: 'SELLER' as const,
      bio: 'Video editor & motion graphics designer. Adobe CC expert with 10 years in commercial production.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    },
  ];

  const createdSellers: { id: string; email: string }[] = [];
  for (const s of sellers) {
    const hash = await bcrypt.hash(s.password, 12);
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email, name: s.name, password: hash, role: s.role,
        avatar: s.avatar, bio: s.bio,
        sellerProfile: { create: { description: s.bio } },
      },
    });
    createdSellers.push({ id: user.id, email: user.email });
    console.log(`Seller: ${s.name}`);
  }

  // Demo buyer
  const buyerHash = await bcrypt.hash('demo1234', 12);
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@demo.com' },
    update: {},
    create: {
      email: 'buyer@demo.com', name: 'Demo Buyer', password: buyerHash, role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    },
  });
  console.log('Buyer: Demo Buyer');

  // Services
  const services = [
    {
      sellerIdx: 0, // Alex - Web Dev
      title: 'I will build a full-stack Next.js web application',
      description: 'Professional Next.js 15 application with TypeScript, Prisma ORM, Tailwind CSS, and deployment on Vercel. Includes authentication, API routes, and responsive design.',
      price: 450, deliveryDays: 7, categorySlug: 'web-development',
      images: ['https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 0, // Alex - Web Dev
      title: 'I will create a REST API with NestJS and PostgreSQL',
      description: 'Production-ready NestJS API with JWT auth, Swagger docs, rate limiting, and PostgreSQL via Prisma. Fully tested and Docker-ready.',
      price: 350, deliveryDays: 5, categorySlug: 'web-development',
      images: ['https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 1, // Marie - Design
      title: 'I will design a modern SaaS landing page in Figma',
      description: 'Complete landing page design with hero, features, pricing, testimonials, and CTA sections. Responsive, dark mode variant included. Delivered as Figma file + exported assets.',
      price: 180, deliveryDays: 3, categorySlug: 'design',
      images: ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 1, // Marie - Design
      title: 'I will create a complete brand identity system',
      description: 'Logo, color palette, typography, icon set, and brand guidelines. Everything you need to launch a consistent brand across all channels.',
      price: 280, deliveryDays: 5, categorySlug: 'design',
      images: ['https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 2, // James - Marketing
      title: 'I will create an SEO strategy and optimize your website',
      description: 'Full SEO audit, keyword research, on-page optimization, and a 90-day content roadmap. Previous clients saw 3x organic traffic increase within 6 months.',
      price: 220, deliveryDays: 4, categorySlug: 'marketing',
      images: ['https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 2, // James - Marketing
      title: 'I will write 5 SEO-optimized blog articles for your SaaS',
      description: 'Data-driven content written by a SaaS marketing expert. Each article is 1500+ words, keyword-optimized, with internal links and meta descriptions.',
      price: 150, deliveryDays: 5, categorySlug: 'writing',
      images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 3, // Sofia - Mobile
      title: 'I will build a cross-platform Flutter mobile app',
      description: 'Full Flutter app for iOS and Android from design to App Store deployment. State management with Riverpod, REST API integration, push notifications.',
      price: 600, deliveryDays: 14, categorySlug: 'mobile-development',
      images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 3, // Sofia - Mobile
      title: 'I will fix bugs and optimize your React Native app',
      description: 'Performance audit, bug fixes, and optimization for your React Native app. Reduce startup time, eliminate ANRs, fix memory leaks.',
      price: 200, deliveryDays: 3, categorySlug: 'mobile-development',
      images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 4, // Lucas - Video
      title: 'I will edit a professional product demo video',
      description: 'Polished product demo or explainer video (up to 3 min). Motion graphics, captions, background music, color grading. Perfect for landing pages and Product Hunt launches.',
      price: 250, deliveryDays: 5, categorySlug: 'video-editing',
      images: ['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=400&fit=crop'],
    },
    {
      sellerIdx: 4, // Lucas - Video
      title: 'I will create animated social media content (10 clips)',
      description: 'Pack of 10 animated social media clips (Reels/TikTok format) from your existing content. Custom transitions, text overlays, branded colors.',
      price: 120, deliveryDays: 3, categorySlug: 'video-editing',
      images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop'],
    },
  ];

  const createdServices: { id: string }[] = [];
  for (const svc of services) {
    const seller = createdSellers[svc.sellerIdx];
    const catId = createdCategories[svc.categorySlug];
    const service = await prisma.service.upsert({
      where: { id: `seed-svc-${svc.sellerIdx}-${services.indexOf(svc)}` },
      update: {},
      create: {
        id: `seed-svc-${svc.sellerIdx}-${services.indexOf(svc)}`,
        userId: seller.id, categoryId: catId,
        title: svc.title, description: svc.description,
        price: svc.price, deliveryDays: svc.deliveryDays,
        isActive: true, images: svc.images,
      },
    });
    createdServices.push(service);
    console.log(`Service: ${svc.title.slice(0, 50)}...`);
  }

  // Reviews
  const reviewTexts = [
    { rating: 5, comment: 'Exceptional work! Delivered ahead of schedule and the code quality is outstanding. Will definitely work with again.' },
    { rating: 5, comment: 'Amazing experience. Clear communication, professional delivery, and exceeded all expectations.' },
    { rating: 4, comment: 'Great quality work. Minor revision needed but handled quickly. Would recommend.' },
    { rating: 5, comment: 'Perfect! Exactly what I needed. Will hire again for the next project.' },
    { rating: 5, comment: 'Outstanding professionalism. The result was better than I imagined. 5 stars all the way.' },
    { rating: 4, comment: 'Good work, fast delivery. The final product works great for our needs.' },
    { rating: 5, comment: 'Absolute pleasure to work with. Deep expertise and very responsive communication.' },
    { rating: 5, comment: 'Highly skilled and delivered everything as promised. My go-to freelancer now!' },
  ];

  for (let i = 0; i < Math.min(8, createdServices.length); i++) {
    const service = createdServices[i];
    const seller = createdSellers[Math.floor(i / 2)];
    const review = reviewTexts[i];

    await prisma.review.upsert({
      where: { id: `seed-review-${i}` },
      update: {},
      create: {
        id: `seed-review-${i}`,
        reviewerId: buyer.id,
        revieweeId: seller.id,
        serviceId: service.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
    console.log(`Review ${i + 1} created`);
  }

  console.log('\n✅ Seed completed!');
  console.log('\nDemo accounts:');
  console.log('  Buyer:  buyer@demo.com / demo1234');
  console.log('  Seller: alex@demo.com  / demo1234 (Full-stack dev)');
  console.log('  Seller: marie@demo.com / demo1234 (Designer)');
  console.log('  Seller: james@demo.com / demo1234 (Marketing)');
}

seed()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
