import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ConflictException('Email già registrata');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || '',
    });
    await user.save();

    const token = this.generateToken(user);
    return { token, user: { email: user.email, name: user.name } };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const token = this.generateToken(user);
    return { token, user: { email: user.email, name: user.name } };
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({ sub: user._id, email: user.email });
  }
}
