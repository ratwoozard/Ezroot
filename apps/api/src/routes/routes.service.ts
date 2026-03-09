import { Injectable, BadRequestException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { GraphhopperService } from './graphhopper.service';
import { RouteRequestDto } from './dto/route-request.dto';
import { ERROR_CODES } from '@ezroot/shared';

@Injectable()
export class RoutesService {
  constructor(
    private db: DbService,
    private graphhopper: GraphhopperService,
  ) {}

  async compute(orgId: string, dto: RouteRequestDto) {
    const origin = this.graphhopper.parsePoint(dto.origin);
    const destination = this.graphhopper.parsePoint(dto.destination);
    if (!origin) {
      throw new BadRequestException({
        error_code: 'INVALID_INPUT',
        message: 'Invalid origin; use "lat,lon" or "lon,lat"',
      });
    }
    if (!destination) {
      throw new BadRequestException({
        error_code: 'INVALID_INPUT',
        message: 'Invalid destination; use "lat,lon" or "lon,lat"',
      });
    }
    const waypoints: Array<[number, number]> = [];
    if (dto.waypoints?.length) {
      for (const wp of dto.waypoints) {
        const p = this.graphhopper.parsePoint(wp);
        if (!p) {
          throw new BadRequestException({
            error_code: 'INVALID_INPUT',
            message: `Invalid waypoint: ${wp}`,
          });
        }
        waypoints.push(p);
      }
    }
    let vehicleProfile: { weight?: number; height?: number; width?: number } | undefined;
    if (dto.vehicleId) {
      const row = await this.db.runInTenant(orgId, async (client) => {
        const r = await client.query(
          `SELECT weight, height, width FROM vehicle_profiles WHERE vehicle_id = $1`,
          [dto.vehicleId],
        );
        return r.rows[0];
      });
      if (!row) {
        throw new NotFoundException({
          error_code: ERROR_CODES.NOT_FOUND,
          message: 'Vehicle profile not found',
        });
      }
      vehicleProfile = {
        weight: parseFloat(row.weight),
        height: parseFloat(row.height),
        width: parseFloat(row.width),
      };
    }
    const points = [origin, ...waypoints, destination];
    const result = await this.graphhopper.route(points, vehicleProfile);
    return result;
  }
}
