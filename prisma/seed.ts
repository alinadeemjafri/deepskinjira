import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Epic 1: Regulatory & Compliance
  const regulatory = await prisma.epic.create({
    data: {
      title: 'Regulatory & Compliance',
      description: 'All regulatory registrations, certifications, and compliance work needed before launch.',
      status: 'TODO',
      priority: 'CRITICAL',
      color: '#db2777',
      createdBy: 'Ali',
    },
  })

  await prisma.story.createMany({
    data: [
      { title: 'Complete EHRA registration', description: 'Register with EHRA (Economic Operators Registration).', status: 'TODO', priority: 'HIGH', epicId: regulatory.id, createdBy: 'Ali' },
      { title: 'MHRA portal registration', description: 'Register on the MHRA portal for medical device compliance.', status: 'TODO', priority: 'HIGH', epicId: regulatory.id, createdBy: 'Ali' },
      { title: 'Research VAT registration requirements', description: 'Determine if VAT registration is needed and what the process looks like.', status: 'TODO', priority: 'MEDIUM', epicId: regulatory.id, createdBy: 'Ali' },
      { title: 'Clarify technical file with supplier', description: 'Follow up with supplier on technical file clarification. Also follow up with Fiverr contact.', status: 'TODO', priority: 'HIGH', epicId: regulatory.id, createdBy: 'Ali' },
    ],
  })

  // Epic 2: Brand & Amazon Setup
  const brand = await prisma.epic.create({
    data: {
      title: 'Brand & Amazon Setup',
      description: 'Brand Registry, Amazon listing creation, and all listing assets.',
      status: 'TODO',
      priority: 'HIGH',
      color: '#3C2415',
      createdBy: 'Ali',
    },
  })

  await prisma.story.createMany({
    data: [
      { title: 'Stay on top of Brand Registry application', description: 'Monitor and push Brand Registry application through to completion.', status: 'TODO', priority: 'HIGH', epicId: brand.id, createdBy: 'Ali' },
      { title: 'Understand Brand Registry benefits', description: 'Research and document all the benefits that come with Brand Registry (A+ Content, Brand Analytics, etc).', status: 'TODO', priority: 'MEDIUM', epicId: brand.id, createdBy: 'Ali' },
      { title: 'Create Amazon listing', description: 'Set up the full product listing on Amazon.', status: 'TODO', priority: 'HIGH', epicId: brand.id, createdBy: 'Ali' },
      { title: 'Create listing images', description: 'Design and produce all listing images (main image, infographics, lifestyle shots).', status: 'TODO', priority: 'HIGH', epicId: brand.id, createdBy: 'Waleed' },
      { title: 'Create listing text (copy)', description: 'Write title, bullet points, description, and backend keywords.', status: 'TODO', priority: 'HIGH', epicId: brand.id, createdBy: 'Ali' },
    ],
  })

  // Epic 3: Pricing & PPC
  const ppc = await prisma.epic.create({
    data: {
      title: 'Pricing & PPC Strategy',
      description: 'Pricing model, PPC strategy, and all paid advertising content.',
      status: 'TODO',
      priority: 'HIGH',
      color: '#2563eb',
      createdBy: 'Ali',
    },
  })

  await prisma.story.createMany({
    data: [
      { title: 'Create pricing model', description: 'Build out pricing model accounting for COGS, FBA fees, PPC spend, and margin targets.', status: 'TODO', priority: 'HIGH', epicId: ppc.id, createdBy: 'Ali' },
      { title: 'Finalise PPC strategy', description: 'Define PPC campaign structure, keyword targets, budget, and launch plan.', status: 'TODO', priority: 'HIGH', epicId: ppc.id, createdBy: 'Ali' },
      { title: 'Create PPC content', description: 'Produce all creative assets needed for Sponsored Products, Brands, and Display ads.', status: 'TODO', priority: 'MEDIUM', epicId: ppc.id, createdBy: 'Waleed' },
    ],
  })

  // Epic 4: Marketing & Launch Prep
  const marketing = await prisma.epic.create({
    data: {
      title: 'Marketing & Launch Prep',
      description: 'External marketing, website polish, review strategy, and launch readiness.',
      status: 'TODO',
      priority: 'MEDIUM',
      color: '#4A7C59',
      createdBy: 'Ali',
    },
  })

  await prisma.story.createMany({
    data: [
      { title: 'Finalise external marketing plan', description: 'Lock down external marketing approach — product photography, videography, potential ads outside Amazon.', status: 'TODO', priority: 'MEDIUM', epicId: marketing.id, createdBy: 'Ali' },
      { title: 'Fix website / A+ content', description: 'Fix remaining bits and pieces on the website. Polish A+ content for the listing.', status: 'TODO', priority: 'MEDIUM', epicId: marketing.id, createdBy: 'Waleed' },
      { title: 'Organise friends & family launch orders', description: 'Get commitments from friends and family to order at launch. Ask them to start reviewing competitor products now to build reviewer profiles.', status: 'TODO', priority: 'MEDIUM', epicId: marketing.id, createdBy: 'Ali' },
      { title: 'Plan returns handling process', description: 'Understand and document how we will navigate returns — FBA returns policy, refund thresholds, customer service approach.', status: 'TODO', priority: 'LOW', epicId: marketing.id, createdBy: 'Ali' },
    ],
  })

  // Epic 5: Supplier & Operations
  const operations = await prisma.epic.create({
    data: {
      title: 'Supplier & Operations',
      description: 'Supplier management, packaging, and operational tasks.',
      status: 'TODO',
      priority: 'HIGH',
      color: '#7c3aed',
      createdBy: 'Ali',
    },
  })

  await prisma.story.createMany({
    data: [
      { title: 'Chase down packaging supplier', description: 'Follow up aggressively with the packaging supplier. Get final samples, pricing, and timelines locked in.', status: 'TODO', priority: 'CRITICAL', epicId: operations.id, createdBy: 'Ali' },
    ],
  })

  console.log('Seeded successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
