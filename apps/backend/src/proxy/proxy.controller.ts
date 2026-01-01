import { Controller } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { HttpService } from '@nestjs/axios';

@Controller()
export class ProxyController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly http: HttpService,
  ) {}
}
