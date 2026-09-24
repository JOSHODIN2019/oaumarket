import { IsString, IsNotEmpty } from 'class-validator';

export class CheckMatricDto {
  @IsString()
  @IsNotEmpty()
  matricNumber: string;
}
