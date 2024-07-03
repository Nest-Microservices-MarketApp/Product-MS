import { ApiProperty } from '@nestjs/swagger';
import { IResponse } from '../interfaces/response.interface';

export class ResponseDto<T> implements IResponse {
  @ApiProperty({ example: 200, description: 'Status code' })
  statusCode: number;

  @ApiProperty({ example: 'Success', description: 'Message' })
  message: string;

  @ApiProperty({ example: {}, description: 'Data' })
  response: T;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.response = data;
  }
}
