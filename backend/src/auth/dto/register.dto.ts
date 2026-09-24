import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

// DEPT/YEAR/NUMBER - e.g. CSC/2019/093 (department code, year of
// admission, the student's number within that department/year).
const MATRIC_NUMBER_PATTERN = /^[A-Za-z]{2,10}\/\d{4}\/\d{2,5}$/;

export class RegisterDto {
  @IsString()
  @Matches(MATRIC_NUMBER_PATTERN, { message: 'matric number must be in the form DEPT/YEAR/NUMBER, e.g. CSC/2019/093' })
  matricNumber: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName: string;

  @IsString()
  @MinLength(3)
  @MaxLength(24)
  @Matches(/^[a-z0-9_]+$/, { message: 'username must be lowercase letters, numbers, and underscores only' })
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
