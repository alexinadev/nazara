import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayMinSize,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  appointmentId: string;

  @IsNumber()
  rating: number;

  @IsString()
  comment?: string;

  @IsArray()
  @ArrayMinSize(1)
  criteriaScores: { criteriaId: string; score: number }[];
}
