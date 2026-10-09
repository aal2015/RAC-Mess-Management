import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

const LOCATIONIQ_TOKEN =
    process.env.EXPO_PUBLIC_LOCATIONIQ_MAP_TOKEN;

export type RouteMapLocation = {
    id: string;
    name: string;
    username: string;
    latitude: number;
    longitude: number;
    road_name?: string | null;
};

type RouteMapProps = {
    locations: RouteMapLocation[];
};

export default function RouteMap({ locations }: RouteMapProps) {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const mapLoadedRef = useRef(false);
    const locationsRef = useRef(locations);
    const renderMarkersRef = useRef<(() => void) | null>(null);

    const [status, setStatus] = useState("Loading map...");
    const [error, setError] = useState<string | null>(null);

    // Keep the latest locations available to map callbacks.
    locationsRef.current = locations;

    // Remove old markers and render markers for the current route.
    renderMarkersRef.current = () => {
        const map = mapRef.current;

        if (!map || !mapLoadedRef.current) {
            return;
        }

        // Remove markers from the previous render.
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const maplibregl = (window as any).maplibregl;

        const validLocations = locationsRef.current.filter(
            (location) =>
                Number.isFinite(location.latitude) &&
                Number.isFinite(location.longitude) &&
                Math.abs(location.latitude) <= 90 &&
                Math.abs(location.longitude) <= 180
        );

        if (validLocations.length === 0) {
            map.flyTo({
                center: [77.225261, 28.545192],
                zoom: 12,
            });

            setStatus("No locations assigned to this route");
            return;
        }

        const bounds = new maplibregl.LngLatBounds();

        validLocations.forEach((location) => {
            const coordinates: [number, number] = [
                location.longitude,
                location.latitude,
            ];

            // Create a popup safely without inserting raw HTML.
            const popupContent = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = location.name;
            popupContent.appendChild(name);

            const username = document.createElement("div");
            username.textContent = `@${location.username}`;
            popupContent.appendChild(username);

            if (location.road_name) {
                const road = document.createElement("div");
                road.textContent = location.road_name;
                popupContent.appendChild(road);
            }

            const popup = new maplibregl.Popup({
                offset: 25,
            }).setDOMContent(popupContent);

            const marker = new maplibregl.Marker({
                color: "#2563EB",
            })
                .setLngLat(coordinates)
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
            bounds.extend(coordinates);
        });

        if (validLocations.length === 1) {
            const location = validLocations[0];

            map.flyTo({
                center: [location.longitude, location.latitude],
                zoom: 16,
                duration: 800,
            });
        } else {
            map.fitBounds(bounds, {
                padding: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50,
                },
                maxZoom: 16,
                duration: 800,
            });
        }

        setStatus(
            `Showing ${validLocations.length} user location(s)`
        );
    };

    // Initialize MapLibre only once.
    useEffect(() => {
        if (!mapContainer.current) {
            setError("Map container not found");
            return;
        }

        if (!LOCATIONIQ_TOKEN) {
            setError("LocationIQ map token is missing");
            setStatus("Initialization failed");
            return;
        }

        let cancelled = false;

        const loadScript = (src: string) =>
            new Promise<void>((resolve, reject) => {
                const script = document.createElement("script");

                script.src = src;
                script.onload = () => resolve();
                script.onerror = () =>
                    reject(new Error(`Failed to load script: ${src}`));

                document.head.appendChild(script);
            });

        const loadCss = (href: string) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        };

        const initializeMap = async () => {
            try {
                setStatus("Loading LocationIQ...");

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
                        "LocationIQ or MapLibre failed to initialize"
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
                    mapLoadedRef.current = true;
                    setError(null);
                    renderMarkersRef.current?.();
                });

                mapRef.current.on("error", (event: any) => {
                    const message =
                        event?.error?.message ?? "Unknown map error";

                    console.error("RouteMap error:", message);
                    setError(message);
                });
            } catch (err) {
                if (cancelled) return;

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to initialize map";

                console.error("Failed to initialize RouteMap:", err);
                setError(message);
                setStatus("Initialization failed");
            }
        };

        initializeMap();

        return () => {
            cancelled = true;
            mapLoadedRef.current = false;

            markersRef.current.forEach((marker) => marker.remove());
            markersRef.current = [];

            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers and zoom when the route's locations change.
    useEffect(() => {
        renderMarkersRef.current?.();
    }, [locations]);

    return (
        <View style={{ gap: 8 }}>
            <Text>Status: {status}</Text>

            {error && <Text>Error: {error}</Text>}

            <View
                style={{
                    width: "100%",
                    height: 400,
                    overflow: "hidden",
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