import { Controller } from '@nestjs/common';
import { ServiceOrdersService } from './service-orders.service';

@Controller('service-orders')
export class ServiceOrdersController {
    constructor(private readonly serviceOrdersService: ServiceOrdersService) { }
}
