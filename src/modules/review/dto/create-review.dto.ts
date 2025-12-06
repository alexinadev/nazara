import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayMinSize,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsString()
  comment?: string;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  criteriaScores: { criteriaId: string; score: number }[];
}
