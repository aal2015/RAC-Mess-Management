export type Coordinates = {
    latitude: number;
    longitude: number;
};

export function getCurrentBrowserLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                const messages: Record<number, string> = {
                    1: "Location permission was denied.",
                    2: "Your current location is unavailable.",
                    3: "Getting your location timed out.",
                };

                reject(
                    new Error(
                        messages[error.code] ??
                            "Failed to get your current location.",
                    ),
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 30000,
            },
        );
    });
}