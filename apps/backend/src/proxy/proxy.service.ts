import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import Redis from 'ioredis';

@Injectable()
export class ProxyService {
  private readonly redis: Redis;

  constructor(private readonly http: HttpService) {
    this.redis = new Redis(process.env.REDIS_URL);
  }
}
