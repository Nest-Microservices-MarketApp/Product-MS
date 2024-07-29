import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma, PrismaClient } from '@prisma/client';
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
      // validation that the data in the fields is unique
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          const failedField = (err.meta?.['target'] as string[])?.join(', ');
          this.logger.error(
            `Unique constraint failed for field(s): ${failedField}`,
          );
          throw new RpcException({
            status: HttpStatus.CONFLICT,
            message: `Unique constraint failed on the fields: (${failedField})`,
          });
        }
      }

      this.logger.error(err.message);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `${err.message}`,
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
      this.logger.error(`${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `${err.message}`,
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
      this.logger.error(`${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `${err.message}`,
      });
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      this.logger.error(`${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `${err.message}`,
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
      this.logger.error(`${err.message}`);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `${err.message}`,
      });
    }
  }

  async validateId(ids: number[]) {
    ids = [...new Set(ids)];

    try {
      const products = await this.product.findMany({
        where: {
          id: {
            in: ids,
          },
          deleted: false,
        },
      });

      if (products.length !== ids.length) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'One or more products not found',
        });
      }

      return products;
    } catch (err) {
      this.logger.error(`Error validating IDs: ${err.message}`);
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `${err.message}`,
      });
    }
  }
}
