
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

const LOCATIONIQ_TOKEN =
    process.env.EXPO_PUBLIC_LOCATIONIQ_MAP_TOKEN;

export type ActiveDeliveryMapLocation = {
    id: string;
    name: string;
    username: string;
    latitude: number;
    longitude: number;
    road_name?: string | null;
};

type Coordinates = {
    latitude: number;
    longitude: number;
};

type ActiveDeliveryMapProps = {
    driverLocation: Coordinates | null;
    locations: ActiveDeliveryMapLocation[];
    selectedLocationId: string | null;
};


function MapLegend() {
    const items = [
        { color: "#2563EB", label: "Your location" },
        { color: "#EA580C", label: "Selected delivery" },
        { color: "#16A34A", label: "Other deliveries" },
    ];

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 16,
            }}
        >
            {items.map((item) => (
                <View
                    key={item.label}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <View
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: item.color,
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 12,
                            color: "#374151",
                        }}
                    >
                        {item.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}


export default function ActiveDeliveryMap({
    driverLocation,
    locations,
    selectedLocationId,
}: ActiveDeliveryMapProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const mapLoadedRef = useRef(false);
    const renderMapRef = useRef<(() => void) | null>(null);

    const [status, setStatus] = useState("Loading map...");
    const [error, setError] = useState<string | null>(null);

    renderMapRef.current = () => {
        const map = mapRef.current;

        if (!map || !mapLoadedRef.current) return;

        const maplibregl = (window as any).maplibregl;

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const validLocations = locations.filter(
            (location) =>
                Number.isFinite(location.latitude) &&
                Number.isFinite(location.longitude) &&
                Math.abs(location.latitude) <= 90 &&
                Math.abs(location.longitude) <= 180
        );

        const validDriverLocation =
            driverLocation &&
                Number.isFinite(driverLocation.latitude) &&
                Number.isFinite(driverLocation.longitude) &&
                Math.abs(driverLocation.latitude) <= 90 &&
                Math.abs(driverLocation.longitude) <= 180
                ? driverLocation
                : null;

        const bounds = new maplibregl.LngLatBounds();
        let pointCount = 0;

        // Driver marker
        if (validDriverLocation) {
            const coordinates: [number, number] = [
                validDriverLocation.longitude,
                validDriverLocation.latitude,
            ];

            const popupContent = document.createElement("div");
            const title = document.createElement("strong");
            title.textContent = "Your location";
            popupContent.appendChild(title);

            const marker = new maplibregl.Marker({
                color: "#2563EB",
            })
                .setLngLat(coordinates)
                .setPopup(
                    new maplibregl.Popup({ offset: 25 }).setDOMContent(
                        popupContent
                    )
                )
                .addTo(map);

            markersRef.current.push(marker);
            bounds.extend(coordinates);
            pointCount++;
        }

        // Delivery markers
        validLocations.forEach((location) => {
            const coordinates: [number, number] = [
                location.longitude,
                location.latitude,
            ];

            const isSelected = location.id === selectedLocationId;

            const popupContent = document.createElement("div");

            const title = document.createElement("strong");
            title.textContent = location.name;
            popupContent.appendChild(title);

            const username = document.createElement("div");
            username.textContent = `@${location.username}`;
            popupContent.appendChild(username);

            if (location.road_name) {
                const road = document.createElement("div");
                road.textContent = location.road_name;
                popupContent.appendChild(road);
            }

            if (isSelected) {
                const selected = document.createElement("div");
                selected.textContent = "Selected destination";
                popupContent.appendChild(selected);
            }

            const marker = new maplibregl.Marker({
                color: isSelected ? "#EA580C" : "#16A34A",
            })
                .setLngLat(coordinates)
                .setPopup(
                    new maplibregl.Popup({ offset: 25 }).setDOMContent(
                        popupContent
                    )
                )
                .addTo(map);

            markersRef.current.push(marker);
            bounds.extend(coordinates);
            pointCount++;
        });

        if (pointCount === 0) {
            setStatus("Waiting for your location and deliveries");
            return;
        }

        // Zoom to show the driver and all delivery locations.
        if (pointCount === 1) {
            map.flyTo({
                center: bounds.getCenter(),
                zoom: 16,
                duration: 800,
            });
        } else {
            map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 16,
                duration: 800,
            });
        }

        setStatus(
            `Showing ${validLocations.length} delivery location(s)`
        );
    };

    // Initialize the map once.
    useEffect(() => {
        if (!mapContainer.current) return;

        if (!LOCATIONIQ_TOKEN) {
            setError("LocationIQ map token is missing.");
            setStatus("Map initialization failed");
            return;
        }

        let cancelled = false;

        const loadScript = (src: string) =>
            new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");
                script.src = src;
                script.onload = () => resolve();
                script.onerror = () =>
                    reject(new Error("Failed to load map library."));
                document.head.appendChild(script);
            });

        const loadCss = (href: string) => {
            if (document.querySelector(`link[href="${href}"]`)) return;

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        };

        async function initializeMap() {
            try {
                setStatus("Loading map libraries...");

                loadCss(
                    "https://tiles.locationiq.com/v3/libs/maplibre-gl/5.24.0/maplibre-gl.css?v=0.1.9"
                );

                await loadScript(
                    "https://tiles.locationiq.com/v3/libs/maplibre-gl/5.24.0/maplibre-gl.js?v=0.1.9"
                );

                await loadScript(
                    "https://tiles.locationiq.com/v3/libs/liq/liq-styles-ctrl-libre-gl-v5.js?v=0.1.9"
                );

                if (cancelled) return;

                const maplibregl = (window as any).maplibregl;
                const locationiq = (window as any).locationiq;

                if (!maplibregl || !locationiq) {
                    throw new Error(
                        "LocationIQ or MapLibre failed to initialize."
                    );
                }

                locationiq.key = LOCATIONIQ_TOKEN;

                mapRef.current = new maplibregl.Map({
                    container: mapContainer.current!,
                    style: locationiq.getLayer("Streets"),
                    center: [77.225261, 28.545192],
                    zoom: 12,
                });

                mapRef.current.on("load", () => {
                    if (cancelled) return;

                    mapLoadedRef.current = true;
                    setError(null);
                    renderMapRef.current?.();
                });

                mapRef.current.on("error", (event: any) => {
                    const message =
                        event?.error?.message ?? "Unknown map error";

                    console.error("ActiveDeliveryMap error:", message);
                    setError(message);
                });
            } catch (err) {
                if (cancelled) return;

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to initialize map.";

                setError(message);
                setStatus("Map initialization failed");
                console.error("Failed to initialize active delivery map:", err);
            }
        }

        initializeMap();

        return () => {
            cancelled = true;
            mapLoadedRef.current = false;

            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];

            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // Refresh markers when the driver, destinations, or selection changes.
    useEffect(() => {
        renderMapRef.current?.();
    }, [driverLocation, locations, selectedLocationId]);

    return (
        <View style={{ gap: 10 }}>
            <Text>{status}</Text>

            {error && (
                <Text style={{ color: "#DC2626" }}>
                    {error}
                </Text>
            )}

            <MapLegend />

            <View
                style={{
                    width: "100%",
                    height: 350,
                    overflow: "hidden",
                    borderRadius: 12,
                }}
            >
                <div
                    ref={mapContainer}
                    style={{
                        width: "100%",
                        height: "100%",
                    }}
                />
            </View>
        </View>
    );
}
