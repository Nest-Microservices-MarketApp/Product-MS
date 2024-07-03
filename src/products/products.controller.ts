import { Controller, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/index';
import { PaginationDto, ResponseDto } from 'src/common';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('create-product')
  async create(@Payload() createProductDto: CreateProductDto) {
    const payload = await this.productsService.create(createProductDto);

    return new ResponseDto(HttpStatus.CREATED, 'Created', payload);
  }

  @MessagePattern('find-all-products')
  async findAll(@Payload() paginationDto: PaginationDto) {
    const payload = await this.productsService.findAll(paginationDto);

    return new ResponseDto(HttpStatus.OK, 'Success', payload);
  }

  @MessagePattern('find-one-product')
  async findOne(@Payload('id', ParseIntPipe) id: number) {
    const payload = await this.productsService.findOne(id);

    return new ResponseDto(HttpStatus.OK, 'Success', payload);
  }

  @MessagePattern('update-product')
  async update(@Payload() updateProductDto: UpdateProductDto) {
    const payload = await this.productsService.update(
      updateProductDto.id,
      updateProductDto,
    );

    return new ResponseDto(HttpStatus.OK, 'Updated', payload);
  }

  @MessagePattern('remove-product')
  async remove(@Payload('id', ParseIntPipe) id: number) {
    const payload = await this.productsService.remove(id);

    return new ResponseDto(HttpStatus.OK, 'Deleted', payload);
  }
}
