import { Injectable } from '@nestjs/common';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

type StoredLocation = {
  lat: number;
  lng: number;
  timestamp: string;
  technician: {
    clerkUserId: string;
    email: string | null;
    id: string;
    name: string | null;
  };
};

@Injectable()
export class LocationsService {
  private readonly locations = new Map<string, StoredLocation>();

  updateLocation(user: CurrentUserPayload, lat: number, lng: number) {
    this.locations.set(user.id, {
      lat,
      lng,
      timestamp: new Date().toISOString(),
      technician: {
        clerkUserId: user.clerkUserId,
        email: user.email ?? null,
        id: user.id,
        name: user.name ?? null,
      },
    });

    return { success: true };
  }

  findAll() {
    return Array.from(this.locations.values()).sort((left, right) =>
      right.timestamp.localeCompare(left.timestamp),
    );
  }
}
