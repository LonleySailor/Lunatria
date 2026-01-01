import { SetMetadata } from '@nestjs/common';

/**
 * @Service('service-name') sets metadata for service-based access control.
 */
export const Service = (serviceName: string) =>
  SetMetadata('service', serviceName);
