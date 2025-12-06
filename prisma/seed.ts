import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // create review criteria
  const criteria = ['Punctuality', 'Professionalism', 'Quality', 'Value'];
  for (const name of criteria) {
    await prisma.reviewCriteria.upsert({
      where: { name },
      update: {},
      create: { name, weight: 1 },
    });
  }

  // create a salon
  const salon = await prisma.salon.upsert({
    where: { name: 'Glamour Beauty' },
    update: {},
    create: {
      name: 'Glamour Beauty',
      address: '123 Beauty Ave',
      phone: '+1234567890',
      description: 'Top salon',
    },
  });

  // staff
  const staff = await prisma.staff.upsert({
    where: { phone: '+1111111111' },
    update: {},
    create: {
      salonId: salon.id,
      phone: '+1111111111',
      firstName: 'Jane',
      lastName: 'Doe',
      role: Role.STAFF,
    },
  });

  // customer
  const customer = await prisma.customer.upsert({
    where: { phone: '+2222222222' },
    update: {},
    create: { phone: '+2222222222', firstName: 'John', lastName: 'Client' },
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
