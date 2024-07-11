import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto/index';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.product.create({
        data: createProductDto,
      });

      return product;
    } catch (err) {
      this.logger.error(err.message);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Bad request: ${err.message}`,
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [collection, totalProducts] = await Promise.all([
        this.product.findMany({
          where: {
            deleted: false,
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.product.count({ where: { deleted: false } }),
      ]);

      const lastPage = Math.ceil(totalProducts / limit);

      if (page > lastPage) {
        this.logger.error('Page not found');
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Page not found',
        });
      }

      return {
        data: collection,
        meta: {
          totalProducts,
          page,
          lastPage,
        },
      };
    } catch (err) {
      this.logger.error(`Error retrieving products: ${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Error retrieving products: ${err.message}`,
      });
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.product.findFirst({
        where: {
          id,
          deleted: false,
        },
      });

      if (!product)
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Product not found',
        });

      return product;
    } catch (err) {
      this.logger.error(`Product not found: ${err.message}`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product not found: ${err.message}`,
      });
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    try {
      if (!data) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'No data to update',
        });
      }

      await this.findOne(id);

      const product = await this.product.update({
        where: {
          id,
        },
        data: data,
      });

      return product;
    } catch (err) {
      this.logger.error(`Error updating product: ${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Error updating product: ${err.message}`,
      });
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const product = await this.product.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      });

      return product;
    } catch (err) {
      this.logger.error(`Error deleting product: ${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Error deleting product: ${err.message}`,
      });
    }
  }
}
