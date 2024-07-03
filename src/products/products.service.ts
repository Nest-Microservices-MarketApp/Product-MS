import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
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
      throw new HttpException(
        `Bad request: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
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
        throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
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
      throw new HttpException(
        `Error retrieving products: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

      if (!product) throw new NotFoundException('Product not found');

      return product;
    } catch (err) {
      this.logger.error(`Product not found: ${err.message}`);
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto;
    try {
      if (!data) {
        throw new HttpException(
          'Bad request, no data provider',
          HttpStatus.BAD_REQUEST,
        );
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
      throw new HttpException(
        `Error updating product: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
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
      throw new HttpException(
        `Error deleting product: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
