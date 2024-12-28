import { tool } from "ai";
import { MapPin } from "lucide-react";
import { z } from "zod";
import { getToolApiKey } from "~utils/toolsstorage";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    borderRadius: "20px",
    padding: "20px",
    width: "350px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    backgroundColor: "#fb8c00",
    color: "white",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "bold",
    margin: 0,
    width: "280px",
  },
  coordinate: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  label: {
    fontWeight: "bold",
  },
  value: {
    textAlign: "right" as const,
  },
  direction: {
    fontStyle: "italic",
  },
};

interface GeoMapData {
  lat: string;
  lon: string;
  display_name: string;
}

type GeoMapResponse = GeoMapData | { error: string; location: string };

const geoMapService = {
  async getApiKeys() {
    return {
      geocodeKey:
        process.env.PLASMO_PUBLIC_GEOCODE_MAP_API_KEY ||
        (await getToolApiKey("geomap", "Geocode Map API")),
    };
  },

  async getGeoMapData(location: string): Promise<GeoMapResponse> {
    try {
      const { geocodeKey } = await this.getApiKeys();
      if (!geocodeKey) {
        throw new Error(
          "Geocode Map API key not configured. Please set it in settings.",
        );
      }
      return await this.getGeocodingData(location, geocodeKey);
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch weather data",
        location,
      };
    }
  },

  async getGeocodingData(
    location: string,
    apiKey: string,
  ): Promise<GeoMapData> {
    const response = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(location)}&api_key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error("Geocoding API request failed");
    }

    const results: GeoMapData[] = await response.json();
    if (results.length === 0) {
      throw new Error("Location not found");
    }
    return results[0];
  },
};

export const geomap = {
  handler: tool({
    description: "Display the weather for a location",
    parameters: z.object({
      location: z.string(),
    }),
    execute: async ({ location }) => {
      return geoMapService.getGeoMapData(location);
    },
  }),
  render: (data: GeoMapData) => {
    const getLatitudeDirection = (lat: number) => (lat >= 0 ? "N" : "S");
    const getLongitudeDirection = (lon: number) => (lon >= 0 ? "E" : "W");

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{data.display_name}</h2>
          <MapPin size="30" />
        </div>

        <div style={styles.coordinate}>
          <span style={styles.label}>Latitude:</span>
          <span style={styles.value}>
            {Math.abs(Number(data.lat)).toFixed(4)}°{" "}
            <span style={styles.direction}>
              {getLatitudeDirection(Number(data.lat))}
            </span>
          </span>
        </div>
        <div style={styles.coordinate}>
          <span style={styles.label}>Longitude:</span>
          <span style={styles.value}>
            {Math.abs(Number(data.lon)).toFixed(4)}°{" "}
            <span style={styles.direction}>
              {getLongitudeDirection(Number(data.lon))}
            </span>
          </span>
        </div>
      </div>
    );
  },
};
