const getCityWeather = async (city = "") => {
  try {
    const response = await fetch(
      `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}&aqi=no`
    );
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const json = await response.json();
    return JSON.stringify(json);
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    return JSON.stringify({
      error: "Unable to fetch weather data. Please try again later.",
    });
  }
};

// Tools mapping
const TOOLS = {
  getCityWeather,
};

export default TOOLS;
