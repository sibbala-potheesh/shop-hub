// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLogger } from './common/logger/winston-logger.service';
import { ProductsService } from './modules/products/products.service';
import { UsersService } from './modules/users/users.service';
import { CreateProductDto } from './modules/products/dto/create-product.dto';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const DUMMY_PRODUCTS_URL =
  process.env.DUMMY_PRODUCTS_URL || 'https://dummyjson.com/products?limit=100';
// default: dummyjson returns up to 100; we will repeat/variation to reach 500 if needed
const TARGET_COUNT = 500;
const BATCH_SIZE = 20; // number of concurrent create requests per batch

function mapDummyToCreateDto(dummy: any, variationIndex = 0): CreateProductDto {
  // Map fields from dummy product to your CreateProductDto shape.
  // Adjust as needed depending on the dummy endpoint structure.
  const title = dummy.title || dummy.name || `Product ${dummy.id ?? ''}`;
  const description = dummy.description || dummy.body || 'No description';
  const basePrice =
    typeof dummy.price === 'number'
      ? dummy.price
      : parseFloat(dummy.price) || 10;

  // Slightly vary price/stock if repeating same item to avoid exact duplicates
  const price = +(basePrice * (1 + (variationIndex % 7) * 0.01)).toFixed(2);
  const stock = Math.max(
    0,
    (dummy.stock ?? dummy.rating ?? 10) + (variationIndex % 20) - 5,
  );

  const images =
    Array.isArray(dummy.images) && dummy.images.length > 0
      ? dummy.images
      : dummy.thumbnail
      ? [dummy.thumbnail]
      : [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        ];

  const category = dummy.category || 'General';

  const variants =
    dummy.variants ??
    (dummy.color || dummy.colors
      ? [
          {
            type: 'color',
            name: 'Color',
            options: Array.isArray(dummy.colors)
              ? dummy.colors
              : [dummy.color].filter(Boolean),
          },
        ]
      : []);

  const rating =
    typeof dummy.rating === 'number'
      ? dummy.rating
      : +(Math.random() * 5).toFixed(1);
  const reviews =
    typeof dummy.reviews === 'number'
      ? dummy.reviews
      : Math.floor(Math.random() * 500);

  return {
    title,
    description,
    price,
    images,
    category,
    stock,
    variants,
    rating,
    reviews,
  } as CreateProductDto;
}

async function fetchDummyProducts(): Promise<any[]> {
  try {
    const res = await axios.get(DUMMY_PRODUCTS_URL, { timeout: 20000 });
    // dummyjson returns { products: [...] } ; fakestoreapi returns array
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.products)) return res.data.products;
    // fallback: if payload is single product, wrap it
    return [res.data];
  } catch (err) {
    console.error('Failed to fetch dummy products:', err?.message || err);
    return [];
  }
}

async function batchInsert(
  productsService: ProductsService,
  items: CreateProductDto[],
) {
  // Insert in batches with concurrency limit
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (p) => {
        try {
          await productsService.create(p);
        } catch (e) {
          // log and continue for resilient seeding
          // depending on your service, you might need to handle duplicates etc.
          console.error(
            `Failed to create product ${p.title}:`,
            e?.message ?? e,
          );
        }
      }),
    );
  }
}

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });
  const logger = app.get(WinstonLogger);

  const productsService = app.get(ProductsService);
  const usersService = app.get(UsersService);

  try {
    // Check existing products
    const products = await (productsService as any).list({}, 1, 1);
    if (products.total === 0) {
      logger.log('No products found — fetching dummy products to seed...');

      const dummy = await fetchDummyProducts();

      if (dummy.length === 0) {
        logger.error('No dummy products available. Exiting seed.');
      } else {
        // Build up to TARGET_COUNT entries by repeating and slightly varying
        const mapped: CreateProductDto[] = [];
        let idx = 0;
        while (mapped.length < TARGET_COUNT) {
          const source = dummy[idx % dummy.length];
          const variationIndex = Math.floor(mapped.length / dummy.length);
          const dto = mapDummyToCreateDto(source, variationIndex);
          // Optionally add more variation to title to avoid exact duplicates
          dto.title = `${dto.title} ${mapped.length + 1}`;
          mapped.push(dto);
          idx++;
        }

        logger.log(
          `Prepared ${mapped.length} product DTOs, inserting in batches...`,
        );
        await batchInsert(productsService, mapped);
        logger.log(`Seeded ${mapped.length} products.`);
      }
    } else {
      logger.log('Products exist, skipping product seed');
    }

    // Create admin user if no users
    const seedAdminEmail = 'admin@example.com';
    const seedAdminPassword = 'adminpass';
    const created = await usersService.ensureAdminUser(
      seedAdminEmail,
      seedAdminPassword,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    );
    if (created) {
      logger.log(`Created admin user: ${seedAdminEmail}`);
    } else {
      logger.log('Users exist, skipping admin seed');
    }
  } catch (err) {
    logger.error('Seeding failed', err.stack || err);
  } finally {
    await app.close();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
