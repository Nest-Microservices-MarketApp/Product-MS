import { Controller, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/index';
import { PaginationDto, ResponseDto } from 'src/common';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern('createProduct')
  async create(@Payload() createProductDto: CreateProductDto) {
    const payload = await this.productsService.create(createProductDto);

    return new ResponseDto(HttpStatus.CREATED, 'Created', payload);
  }

  @MessagePattern('findAllProducts')
  async findAll(@Payload() paginationDto: PaginationDto) {
    const payload = await this.productsService.findAll(paginationDto);

    return new ResponseDto(HttpStatus.OK, 'Success', payload);
  }

  @MessagePattern('findOneProduct')
  async findOne(@Payload('id', ParseIntPipe) id: number) {
    const payload = await this.productsService.findOne(id);

    return new ResponseDto(HttpStatus.OK, 'Success', payload);
  }

  @MessagePattern('updateProduct')
  async update(@Payload() updateProductDto: UpdateProductDto) {
    const payload = await this.productsService.update(
      updateProductDto.id,
      updateProductDto,
    );

    return new ResponseDto(HttpStatus.OK, 'Updated', payload);
  }

  @MessagePattern('removeProduct')
  async remove(@Payload('id', ParseIntPipe) id: number) {
    const payload = await this.productsService.remove(id);

    return new ResponseDto(HttpStatus.OK, 'Deleted', payload);
  }
}
