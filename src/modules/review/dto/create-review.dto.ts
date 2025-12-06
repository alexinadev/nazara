import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  appointmentId: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsString()
  comment?: string;

  @IsArray()
  @ArrayMinSize(1)
  criteriaScores: { criteriaId: string; score: number }[];
}
