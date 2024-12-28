import { tool } from "ai";
import { Sunrise, Sunset } from "lucide-react";
import { z } from "zod";
import { getToolApiKey } from "~utils/toolsstorage";

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface WeatherData {
  weather: string;
  weatherIcon: string;
  description: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  location: string;
  windSpeed: number;
  sunSet: number;
  sunRise: number;
  pressure: number;
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

type WeatherResponse = WeatherData | { error: string; location: string };

const styles = {
  container: {
    background: "linear-gradient(to bottom right, #4a90e2, #63b8ff)",
    borderRadius: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    color: "#ffffff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    width: "350px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  locationText: {
    fontSize: "30px",
    fontWeight: "bold",
    margin: 0,
  },
  weatherIcon: {
    width: "60px",
    height: "60px",
  },
  temperature: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  weatherDescription: {
    fontSize: "18px",
    marginBottom: "20px",
  },
  detailsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    padding: "15px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  detailLabel: {
    fontWeight: "bold",
  },
  sunContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "5px",
  },
  sunRise: {
    display: "flex",
  },
  icon: {
    marginRight: "8px",
  },
  sunSet: {
    display: "flex",
    marginLeft: "30px",
  },
} as const;

const weatherService = {
  async getApiKeys() {
    return {
      geocodeKey:
        process.env.PLASMO_PUBLIC_GEOCODE_MAP_API_KEY ||
        (await getToolApiKey("weather", "Geocode Map API")),
      weatherKey:
        process.env.PLASMO_PUBLIC_OPENWEATHER_API_KEY ||
        (await getToolApiKey("weather", "Weather API")),
    };
  },

  async getWeatherData(location: string): Promise<WeatherResponse> {
    try {
      const { geocodeKey, weatherKey } = await this.getApiKeys();

      if (!geocodeKey || !weatherKey) {
        throw new Error(
          "API keys not configured. Please set them in settings.",
        );
      }

      const geoData = await this.getGeocodingData(location, geocodeKey);
      return await this.getWeatherDetails(geoData, weatherKey);
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
  ): Promise<GeocodingResult> {
    const response = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(location)}&api_key=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error("Geocoding API request failed");
    }

    const results: GeocodingResult[] = await response.json();
    if (results.length === 0) {
      throw new Error("Location not found");
    }

    return results[0];
  },

  async getWeatherDetails(
    geoData: GeocodingResult,
    apiKey: string,
  ): Promise<WeatherData> {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${geoData.lat}&lon=${geoData.lon}&appid=${apiKey}&units=metric`,
    );

    if (!response.ok) {
      throw new Error("Weather API request failed");
    }

    const data = await response.json();

    return {
      weather: data.weather[0].main,
      weatherIcon: data.weather[0].icon,
      description: data.weather[0].description,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      location: geoData.display_name.split(",")[0],
      windSpeed: data.wind.speed,
      sunSet: data.sys.sunset,
      sunRise: data.sys.sunrise,
      pressure: data.main.pressure,
      coordinates: {
        latitude: geoData.lat,
        longitude: geoData.lon,
      },
    };
  },
};

export const weather = {
  handler: tool({
    description: "Display the weather for a location",
    parameters: z.object({
      location: z.string(),
    }),
    execute: async ({ location }) => {
      return weatherService.getWeatherData(location);
    },
  }),
  render: (data: WeatherData) => {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.locationText}>{data.location}</h2>
          <img
            style={styles.weatherIcon}
            alt={data.location}
            src={`http://openweathermap.org/img/wn/${data.weatherIcon}@2x.png`}
          />
        </div>
        <div style={styles.temperature}>{data.temperature} °C</div>
        <div style={styles.weatherDescription}>{data.weather}</div>
        <div style={styles.sunContainer}>
          <div style={styles.sunRise}>
            <Sunrise style={styles.icon} />
            {new Date(data.sunRise * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div style={styles.sunSet}>
            <Sunset style={styles.icon} />
            {new Date(data.sunSet * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <div style={styles.detailsContainer}>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Humidity:</span>
            <span>{data.humidity} %</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Wind:</span>
            <span>{data.windSpeed} m/s</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>Pressure:</span>
            <span>{data.pressure} hPa</span>
          </div>
        </div>
      </div>
    );
  },
};
