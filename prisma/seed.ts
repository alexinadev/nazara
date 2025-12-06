import { Role } from '../src/generated/prisma/enums';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

config();

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter});

async function main() {
  console.log('Seeding...');

  // Create review criteria 
  const criteriaNames = ['وقت‌شناسی', 'حرفه‌ای‌گری', 'کیفیت', 'ارزش'];
  for (const name of criteriaNames) {
    await prisma.reviewCriteria.upsert({
      where: { name },
      update: {},
      create: { name, weight: 1 },
    });
  }

  // Create a salon
  const salon = await prisma.salon.upsert({
    where: { slug: 'glamour-beauty' },
    update: {},
    create: {
      name: 'Glamour Beauty Salon',
      address: '123 Beauty Ave',
      phone: '+1234567890',
      slug: 'glamour-beauty',
      description: 'Top salon for hair & makeup',
      lat: 29.637324,
      lng: 52.525075,
    },
  });

  // Create staff
  const staff = await prisma.staff.upsert({
    where: { phone: '+1111111111' },
    update: {},
    create: {
      salonId: salon.id,
      phone: '+1111111111',
      firstName: 'Jane',
      lastName: 'Doe Staff',
      role: Role.STAFF,
      bio: 'Senior stylist',
    },
  });

  // Create customer
  const customer = await prisma.customer.upsert({
    where: { phone: '+2222222222' },
    update: {},
    create: {
      phone: '+2222222222',
      firstName: 'John',
      lastName: 'Client',
    },
  });

  // Create a category, subcategory, service
  const cat = await prisma.category.upsert({
    where: { name_salonId: { name: 'Hair', salonId: salon.id } } as any,
    update: {},
    create: {
      name: 'Hair',
      salonId: salon.id,
    },
  }).catch(async () => {
    // fallback if compound unique not set
    return prisma.category.create({ data: { name: 'Hair', salonId: salon.id }});
  });

  const sub = await prisma.subCategory.create({
    data: { name: 'Cut & Style', categoryId: cat.id },
  });

  const service = await prisma.service.create({
    data: {
      name: "Women's Haircut Service",
      description: 'Full haircut and styling',
      baseDuration: 60,
      basePrice: 45.0,
      subCategoryId: sub.id,
    },
  });

  // StaffService link
  await prisma.staffService.create({
    data: { staffId: staff.id, serviceId: service.id, price: 50.0 },
  });

  console.log('Seed finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
