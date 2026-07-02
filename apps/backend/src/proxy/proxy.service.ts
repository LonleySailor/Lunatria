import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ProxyService {
  constructor(private readonly http: HttpService) {}
}
