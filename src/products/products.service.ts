import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto
    })
    this.logger.log(`Product created: ${product.id}`);
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    return await this.prisma.product.findMany({
      skip: (page! - 1) * limit!,
      take: limit!,
      where: { available: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findFirst({ where: { id, available: true } });
    if (!product) {
      throw new RpcException({
        message: `Product not found: ${id}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (!product){
      throw new RpcException({
        message: `Product not found: ${id}`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    this.logger.log(`Product updated: ${product.id}`);
    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    if (!product){
      throw new RpcException({
        message: `Product not found: ${id}`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    this.logger.log(`Product deleted: ${product.id}`);
    return await this.prisma.product.update({
      where: { id },
      data: { available: false },
    });
  }
}
