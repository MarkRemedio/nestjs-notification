import { ApiProperty } from '@nestjs/swagger';

class PaginationMetaDto {
  @ApiProperty({ example: 100 })
  totalItems!: number;

  @ApiProperty({ example: 10 })
  itemCount!: number;

  @ApiProperty({ example: 10 })
  itemsPerPage!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;

  @ApiProperty({ example: 1 })
  currentPage!: number;
}

export class PaginatedResultDto<T> {
  data!: T[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}