import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";

const LOCATIONIQ_TOKEN =
    process.env.EXPO_PUBLIC_LOCATIONIQ_MAP_TOKEN;

export default function LocationMap() {
    const mapContainer = useRef<HTMLDivElement | null>(null);

    const [status, setStatus] = useState("Loading LocationIQ...");
    const [error, setError] = useState<string | null>(null);

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

        let map: any = null;

        try {
            setStatus("Loading LocationIQ MapLibre...");

            const loadScript = (src: string) =>
                new Promise<void>((resolve, reject) => {
                    const script = document.createElement("script");

                    script.src = src;
                    script.onload = () => resolve();
                    script.onerror = () =>
                        reject(
                            new Error(
                                `Failed to load script: ${src}`
                            )
                        );

                    document.head.appendChild(script);
                });

            const loadCss = (href: string) => {
                const link = document.createElement("link");

                link.rel = "stylesheet";
                link.href = href;

                document.head.appendChild(link);
            };

            loadCss(
                "https://tiles.locationiq.com/v3/libs/maplibre-gl/5.24.0/maplibre-gl.css?v=0.1.9"
            );

            loadScript(
                "https://tiles.locationiq.com/v3/libs/maplibre-gl/5.24.0/maplibre-gl.js?v=0.1.9"
            )
                .then(() => {
                    setStatus("LocationIQ MapLibre loaded");

                    return loadScript(
                        "https://tiles.locationiq.com/v3/libs/liq/liq-styles-ctrl-libre-gl-v5.js?v=0.1.9"
                    );
                })
                .then(() => {
                    setStatus("LocationIQ library loaded");

                    const maplibregl = (window as any).maplibregl;
                    const locationiq = (window as any).locationiq;

                    if (!maplibregl) {
                        throw new Error(
                            "LocationIQ MapLibre was loaded but maplibregl is unavailable"
                        );
                    }

                    if (!locationiq) {
                        throw new Error(
                            "LocationIQ object is unavailable"
                        );
                    }

                    locationiq.key = LOCATIONIQ_TOKEN;

                    setStatus("Creating map...");

                    map = new maplibregl.Map({
                        container: mapContainer.current,
                        style: locationiq.getLayer("Streets"),
                        zoom: 12,
                        center: [77.225261, 28.545192],
                    });

                    map.on("load", () => {
                        setStatus("LocationIQ map loaded");
                    });

                    map.on("error", (event: any) => {
                        const message =
                            event?.error?.message ??
                            "Unknown MapLibre error";

                        console.error(
                            "LocationIQ MapLibre error:",
                            message
                        );

                        setError(message);
                    });
                })
                .catch((error) => {
                    console.error(
                        "Failed to initialize LocationIQ:",
                        error
                    );

                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unknown LocationIQ error"
                    );

                    setStatus("Initialization failed");
                });

            return () => {
                if (map) {
                    map.remove();
                }
            };
        } catch (error) {
            console.error(
                "Failed to initialize LocationIQ:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Unknown LocationIQ error"
            );

            setStatus("Initialization failed");
        }
    }, []);

    return (
        <>
            <Text>Status: {status}</Text>

            {error && <Text>Error: {error}</Text>}

            <div
                ref={mapContainer}
                style={{
                    width: "100%",
                    height: 400,
                }}
            />
        </>
    );
}