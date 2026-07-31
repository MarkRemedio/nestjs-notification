import { ApiProperty } from "@nestjs/swagger";

export class ErrorCommonResponse {
  
  @ApiProperty({description:'HTTP status code of the error'})
  statusCode!: number;
  
  @ApiProperty({description:'Timestamp when the error occurred'})
  timestamp!: Date;
  
  @ApiProperty({description:'Path of the request that caused the error'})
  path!: string;
  
  @ApiProperty({description:'Error message'})
  message!: string;

}