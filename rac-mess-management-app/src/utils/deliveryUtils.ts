import type {
    DeliveryUserResponse,} from "@/api/routes";
import type { DeliveryGroup } from "@/app/(authenticated)/driver/active-delivery"; 
import type { MealType } from "@/api/tracking";


export function isDelivered(
    booking: DeliveryUserResponse,
    meal: MealType
): boolean {
    return meal === "lunch"
        ? booking.lunch_delivered
        : booking.dinner_delivered;
}

export function isGroupDelivered(
    group: DeliveryGroup,
    meal: MealType
): boolean {
    return group.bookings.every((booking) =>
        isDelivered(booking, meal)
    );
}

export function getDeliveredCount(
    bookings: DeliveryUserResponse[],
    meal: MealType
): number {
    return bookings.filter((booking) =>
        isDelivered(booking, meal)
    ).length;
}

export function getGroupDeliveryStatus(
    group: DeliveryGroup,
    meal: MealType
): "Completed" | "Partially delivered" | "Pending" {
    const deliveredCount = getDeliveredCount(group.bookings, meal);

    if (deliveredCount === group.bookings.length) {
        return "Completed";
    }

    if (deliveredCount > 0) {
        return "Partially delivered";
    }

    return "Pending";
}
// 3. Sort pending groups by distance, completed groups last.
export function sortDeliveryGroups(
    groups: DeliveryGroup[],
    distances: Record<string, {
        distanceMeters: number;
        durationSeconds: number;
    }>,
    meal: MealType
) {
    return groups
        .map((group) => {
            const distance = distances[group.locationId];

            return {
                ...group,
                distanceMeters: distance?.distanceMeters ?? null,
                durationSeconds: distance?.durationSeconds ?? null,
            };
        })
        .sort((a, b) => {
            const aDelivered = isGroupDelivered(a, meal);
            const bDelivered = isGroupDelivered(b, meal);

            if (aDelivered !== bDelivered) {
                return aDelivered ? 1 : -1;
            }

            return (
                (a.distanceMeters ?? Infinity) -
                (b.distanceMeters ?? Infinity)
            );
        });
}

// 4. Format distance.
export function formatDistance(meters: number | null): string {
    if (meters == null || !Number.isFinite(meters)) {
        return "Distance unavailable";
    }

    return meters < 1000
        ? `${Math.round(meters)} m`
        : `${(meters / 1000).toFixed(1)} km`;
}

// 5. Format duration.
export function formatDuration(seconds: number | null): string {
    if (seconds == null || !Number.isFinite(seconds)) {
        return "";
    }

    const minutes = Math.round(seconds / 60);

    if (minutes < 1) return "Under 1 min";
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining
        ? `${hours} hr ${remaining} min`
        : `${hours} hr`;
}

export function groupBookingsByLocation(
    bookings: DeliveryUserResponse[]
): DeliveryGroup[] {
    const groups = new Map<string, DeliveryGroup>();

    bookings.forEach((booking) => {
        const location = booking.location;

        if (!location?.id) return;

        const locationId = String(location.id);
        const existingGroup = groups.get(locationId);

        if (existingGroup) {
            existingGroup.bookings.push(booking);
        } else {
            groups.set(locationId, {
                locationId,
                location,
                bookings: [booking],
            });
        }
    });

    return Array.from(groups.values());
}

export function hasValidCoordinates(location: DeliveryGroup["location"]): boolean {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
    );
}

export function mapDistancesByLocationId(
    groups: DeliveryGroup[],
    distances: {
        distanceMeters: number;
        durationSeconds: number;
    }[]
) {
    const result: Record<string, {
        distanceMeters: number;
        durationSeconds: number;
    }> = {};

    groups.forEach((group, index) => {
        const distance = distances[index];

        if (distance) {
            result[group.locationId] = distance;
        }
    });

    return result;
}