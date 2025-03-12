import { Injectable } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryRequest } from './entities/delivery-request.entity';

@Injectable()
export class TrackingCodeGenerator {
  constructor(
    @InjectRepository(DeliveryRequest)
    private deliveryRequestRepository: Repository<DeliveryRequest>,
  ) {}

  async generateTrackingCode(
    fromTownship: string,
    toTownship: string,
  ): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get the current sequence number for today
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );

    const todayCount = await this.deliveryRequestRepository.count({
      where: {
        created_at: Between(startOfDay, endOfDay),
      },
    });

    const sequence = (todayCount + 1).toString().padStart(4, '0');

    // Format: FROM-SEQUENCE-YYYYMMDD-TO
    return `${fromTownship}-${sequence}-${year}${month}${day}-${toTownship}`;
  }
}
