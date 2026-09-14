import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Изчистване на стари данни при повторно пускане
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.business.deleteMany();

  // 1. Далемски Сервиз
  await prisma.business.create({
    data: {
      name: 'Далемски Сервиз',
      slug: 'dalemski-serviz',
      category: 'Касови Апарати & Фискални Устройства',
      phone: '0899 777 888',
      address: 'Пловдив, бул. Васил Априлов 45',
      services: {
        create: [
          { name: 'Фискализация и регистрация в НАП', price: 60, durationMin: 30 },
          { name: 'Заверяване на годишен сервизен договор', price: 80, durationMin: 20 },
          { name: 'Програмиране на артикули и бази данни', price: 40, durationMin: 40 },
          { name: 'Смяна на фискална памет & технически преглед', price: 100, durationMin: 60 },
        ],
      },
    },
  });

  // 2. Автосервиз Иван
  await prisma.business.create({
    data: {
      name: 'Автосервиз "Иван"',
      slug: 'avtoserviz-ivan',
      category: 'Експресни Автоуслуги',
      phone: '0888 123 456',
      address: 'София, бул. Сливница 120',
      services: {
        create: [
          { name: 'Смяна на масло и филтри', price: 80, durationMin: 45 },
          { name: 'Смяна на предни накладки', price: 60, durationMin: 60 },
          { name: 'Компютърна диагностика', price: 40, durationMin: 30 },
        ],
      },
    },
  });

  console.log('Успешно вкарани данни в базата!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });