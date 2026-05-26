import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email non valida' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La password deve avere almeno 8 caratteri' })
  @MaxLength(72, { message: 'La password non può superare 72 caratteri' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La password deve contenere almeno una lettera maiuscola, una minuscola e un numero',
  })
  password!: string;

  @IsString()
  @MaxLength(100, { message: 'Il nome non può superare 100 caratteri' })
  name?: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Email non valida' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Password obbligatoria' })
  password!: string;
}
