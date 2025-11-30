import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonLoggerModule } from './common/logger/winston-logger.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AddressModule } from './modules/address/address.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // minimal change in AppModule
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/nest-ecommerce',
      {
        serverSelectionTimeoutMS: 5000, // fail in 5s
        socketTimeoutMS: 45000,
      },
    ),
    WinstonLoggerModule,
    UsersModule,
    AuthModule,
    AddressModule,
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
