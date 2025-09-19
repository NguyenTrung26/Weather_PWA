import React, { useState, useEffect } from "react";

const Weather = () => {
  const [city, setCity] = useState("Hanoi");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [history, setHistory] = useState([]);
  const [inputValue, setInputValue] = useState("Hanoi");

  const API_KEY = "c5d03a881b1a7ac21729c3e77fc6064d";

  // Detect online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save city to history (in memory)
  const saveToHistory = (newCity) => {
    const updated = [newCity, ...history.filter(c => c !== newCity)].slice(0, 5);
    setHistory(updated);
  };

  // Fetch weather & forecast
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      // Nếu offline, dùng cache
      if (!isOnline) {
        const cachedWeather = localStorage.getItem('weather-' + city);
        const cachedForecast = localStorage.getItem('forecast-' + city);
        if (cachedWeather) setWeather(JSON.parse(cachedWeather));
        if (cachedForecast) setForecast(JSON.parse(cachedForecast));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        if (!res.ok) throw new Error("City not found");
        const data = await res.json();
        setWeather(data);

        const resForecast = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await resForecast.json();
        const forecastSlice = forecastData.list.slice(0, 5);
        setForecast(forecastSlice);

        // Lưu cache offline
        localStorage.setItem('weather-' + city, JSON.stringify(data));
        localStorage.setItem('forecast-' + city, JSON.stringify(forecastSlice));

        saveToHistory(city);
      } catch (err) {
        setError(err.message);
        setWeather(null);
        setForecast([]);
      } finally {
        setLoading(false);
      }
    };

    if (city) fetchWeather();
  }, [city, isOnline]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setCity(inputValue.trim());
    }
  };

  const handleCityClick = (selectedCity) => {
    setCity(selectedCity);
    setInputValue(selectedCity);
  };
  // Enhanced gradient based on weather with animation
  const getGradient = () => {
    if (!weather) return "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
    const main = weather.weather[0].main.toLowerCase();
    const time = new Date().getHours();
    const isNight = time < 6 || time > 18;
    
    if (main.includes("cloud")) {
      return isNight 
        ? "linear-gradient(135deg, #2c3e50 0%, #3498db 50%, #9b59b6 100%)"
        : "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 50%, #34495e 100%)";
    }
    if (main.includes("rain")) {
      return "linear-gradient(135deg, #4e54c8 0%, #8f94fb 50%, #a8edea 100%)";
    }
    if (main.includes("clear")) {
      return isNight
        ? "linear-gradient(135deg, #0c3483 0%, #a2b6df 50%, #6b73ff 100%)"
        : "linear-gradient(135deg, #fceabb 0%, #f8b500 50%, #fbc2eb 100%)";
    }
    if (main.includes("snow")) {
      return "linear-gradient(135deg, #e0eafc 0%, #cfdef3 50%, #a8edea 100%)";
    }
    return "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
  };

  // Comfort Index calculations with enhanced advice
  const getComfortAdvice = () => {
    if (!weather) return "";
    const temp = weather.main.temp;
    const feels = weather.main.feels_like;
    const wind = weather.wind.speed;
    const humidity = weather.main.humidity;
    const main = weather.weather[0].main.toLowerCase();

    let advice = [];
    
    // Temperature advice with emojis
    if (feels >= 35) advice.push("🔥 Rất nóng! Hạn chế ra ngoài, uống nhiều nước");
    else if (feels >= 30) advice.push("☀️ Nóng, mặc đồ nhẹ màu sáng");
    else if (feels >= 25) advice.push("🌤️ Ấm áp, thời tiết dễ chịu");
    else if (feels >= 15) advice.push("👕 Mát mẻ, mặc áo tay dài");
    else if (feels >= 5) advice.push("🧥 Lạnh, mặc áo khoác");
    else advice.push("❄️ Rất lạnh! Mặc nhiều lớp, đội mũ");

    // Wind advice
    if (wind >= 10) advice.push("💨 Gió rất mạnh, cẩn thận khi ra ngoài");
    else if (wind >= 6) advice.push("🌬️ Gió khá mạnh");

    // Weather specific advice
    if (main.includes("rain")) advice.push("🌧️ Có mưa, nhớ mang ô");
    if (main.includes("snow")) advice.push("❄️ Có tuyết, đi giày chống trượt");
    if (main.includes("storm")) advice.push("⛈️ Có bão, tránh ra ngoài");
    
    // Humidity advice
    if (humidity >= 80) advice.push("💧 Độ ẩm cao, cảm giác oi bức");
    else if (humidity <= 30) advice.push("🏜️ Độ ẩm thấp, da có thể khô");

    return advice.join(" • ");
  };

  // Get weather emoji
  const getWeatherEmoji = (main) => {
    const weather = main.toLowerCase();
    if (weather.includes("clear")) return "☀️";
    if (weather.includes("cloud")) return "☁️";
    if (weather.includes("rain")) return "🌧️";
    if (weather.includes("snow")) return "❄️";
    if (weather.includes("thunder")) return "⛈️";
    if (weather.includes("mist") || weather.includes("fog")) return "🌫️";
    return "🌤️";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: getGradient(),
      padding: "20px",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      transition: "background 0.8s ease-in-out",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background particles */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0.1,
        pointerEvents: "none",
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        animation: "float 20s ease-in-out infinite"
      }}></div>

      <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header with animation */}
        <div style={{
          textAlign: "center",
          marginBottom: "40px",
          paddingTop: "30px",
          animation: "fadeInDown 1s ease-out"
        }}>
          <h1 style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            background: "linear-gradient(45deg, #fff, rgba(255,255,255,0.8))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 4px 8px rgba(0,0,0,0.3)",
            margin: "0 0 15px 0",
            animation: "pulse 2s ease-in-out infinite alternate"
          }}>
            🌤️ Weather Forecast
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.95)",
            fontSize: "1.3rem",
            margin: "0",
            fontWeight: "500",
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            Get accurate weather information worldwide
          </p>
        </div>

        {/* Offline indicator */}
        {!isOnline && (
          <div style={{
            backgroundColor: "rgba(255, 193, 7, 0.95)",
            color: "#856404",
            padding: "15px 25px",
            borderRadius: "15px",
            textAlign: "center",
            marginBottom: "25px",
            fontWeight: "600",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            animation: "slideInDown 0.5s ease-out"
          }}>
            ⚠️ You are offline. Please check your internet connection.
          </div>
        )}

        {/* Search input with enhanced styling */}
        <div style={{
          marginBottom: "25px",
          position: "relative",
          animation: "slideInUp 0.8s ease-out"
        }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleSearch}
            placeholder="🔍 Search for a city..."
            style={{
              width: "100%",
              padding: "20px 25px",
              fontSize: "1.2rem",
              border: "none",
              borderRadius: "30px",
              backgroundColor: "rgba(255,255,255,0.95)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2), inset 0 1px 3px rgba(0,0,0,0.1)",
              outline: "none",
              transition: "all 0.3s ease",
              backdropFilter: "blur(15px)",
              fontWeight: "500"
            }}
            onFocus={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.25)";
            }}
            onBlur={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
            }}
          />
        </div>

        {/* Search History */}
        {history.length > 0 && (
          <div style={{
            marginBottom: "30px",
            animation: "fadeIn 1s ease-out 0.3s both"
          }}>
            <h4 style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.1rem",
              fontWeight: "600",
              marginBottom: "15px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}>
              📍 Recent searches:
            </h4>
            <div style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap"
            }}>
              {history.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCityClick(c)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderRadius: "25px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(10px)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(255,255,255,0.3)";
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "white",
            animation: "fadeIn 0.5s ease-out"
          }}>
            <div style={{
              width: "60px",
              height: "60px",
              border: "5px solid rgba(255,255,255,0.3)",
              borderTop: "5px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 25px"
            }}></div>
            <p style={{
              fontSize: "1.3rem",
              margin: "0",
              fontWeight: "500",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}>
              🌐 Loading weather data...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            backgroundColor: "rgba(220, 53, 69, 0.95)",
            color: "white",
            padding: "25px",
            borderRadius: "20px",
            textAlign: "center",
            marginBottom: "25px",
            fontWeight: "600",
            fontSize: "1.1rem",
            boxShadow: "0 10px 30px rgba(220, 53, 69, 0.3)",
            animation: "shake 0.5s ease-out"
          }}>
            ❌ Error: {error}
          </div>
        )}

        {/* Current weather card */}
        {weather && weather.weather && weather.weather.length > 0 && (
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "25px",
            padding: "35px",
            marginBottom: "30px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)",
            animation: "slideInLeft 0.8s ease-out",
            transition: "transform 0.3s ease",
            cursor: "pointer"
          }}
          onMouseEnter={(e) => e.target.style.transform = "translateY(-5px)"}
          onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "25px"
            }}>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: "2.2rem",
                  fontWeight: "800",
                  color: "#333",
                  margin: "0 0 10px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  {getWeatherEmoji(weather.weather[0].main)} {weather.name}, {weather.sys.country}
                </h2>
                <p style={{
                  textTransform: "capitalize",
                  fontSize: "1.4rem",
                  color: "#666",
                  margin: "0 0 15px 0",
                  fontWeight: "600"
                }}>
                  {weather.weather[0].description}
                </p>
                <div style={{
                  fontSize: "4rem",
                  fontWeight: "900",
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "0",
                  animation: "numberPulse 3s ease-in-out infinite"
                }}>
                  {Math.round(weather.main.temp)}°C
                </div>
              </div>
              <div style={{
                textAlign: "center",
                marginLeft: "25px"
              }}>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                  alt="weather icon"
                  style={{
                    width: "140px",
                    height: "140px",
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                    animation: "bounce 2s ease-in-out infinite"
                  }}
                />
              </div>
            </div>

            {/* Weather details grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "20px",
              marginBottom: "25px"
            }}>
              <div style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                borderRadius: "18px",
                border: "1px solid rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🌡️</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                  Feels like
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#667eea" }}>
                  {Math.round(weather.main.feels_like)}°C
                </div>
              </div>
              <div style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))",
                borderRadius: "18px",
                border: "1px solid rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💧</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                  Humidity
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#3498db" }}>
                  {weather.main.humidity}%
                </div>
              </div>
              <div style={{
                textAlign: "center",
                padding: "20px",
                background: "linear-gradient(135deg, rgba(46, 204, 113, 0.1), rgba(39, 174, 96, 0.1))",
                borderRadius: "18px",
                border: "1px solid rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💨</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333", marginBottom: "5px" }}>
                  Wind Speed
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#2ecc71" }}>
                  {Math.round(weather.wind.speed)} m/s
                </div>
              </div>
            </div>

            {/* Enhanced Comfort Advice */}
            <div style={{
              background: "linear-gradient(135deg, rgba(241, 196, 15, 0.1), rgba(230, 126, 34, 0.1))",
              borderRadius: "18px",
              padding: "25px",
              border: "2px solid rgba(241, 196, 15, 0.2)",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <h4 style={{
                margin: "0 0 15px 0",
                color: "#333",
                fontSize: "1.3rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                💡 Smart Weather Advice
              </h4>
              <p style={{
                margin: "0",
                color: "#555",
                fontSize: "1.1rem",
                lineHeight: "1.6",
                fontWeight: "500"
              }}>
                {getComfortAdvice()}
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Forecast */}
        {forecast && forecast.length > 0 && (
          <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "25px",
            padding: "35px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.3)",
            animation: "slideInRight 0.8s ease-out"
          }}>
            <h3 style={{
              fontSize: "1.8rem",
              fontWeight: "800",
              color: "#333",
              textAlign: "center",
              marginBottom: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px"
            }}>
              📊 Next 5 Hours Forecast
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "20px"
            }}>
              {forecast.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.6))",
                    borderRadius: "20px",
                    padding: "25px 15px",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    border: "1px solid rgba(0,0,0,0.1)",
                    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    animation: `slideInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-10px) scale(1.05)";
                    e.target.style.boxShadow = "0 15px 30px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
                  }}
                >
                  <div style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#666",
                    marginBottom: "12px"
                  }}>
                    ⏰ {new Date(item.dt * 1000).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div style={{
                    fontSize: "1.8rem",
                    marginBottom: "8px"
                  }}>
                    {getWeatherEmoji(item.weather[0].main)}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt="weather icon"
                    style={{
                      width: "70px",
                      height: "70px",
                      margin: "10px 0",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                    }}
                  />
                  <div style={{
                    fontSize: "1.4rem",
                    fontWeight: "900",
                    color: "#333",
                    marginBottom: "8px"
                  }}>
                    {Math.round(item.main.temp)}°C
                  </div>
                  <div style={{
                    fontSize: "0.85rem",
                    color: "#777",
                    textTransform: "capitalize",
                    fontWeight: "600",
                    lineHeight: "1.3"
                  }}>
                    {item.weather[0].description}
                  </div>
                  <div style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    marginTop: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <span>💧 {item.main.humidity}%</span>
                    <span>💨 {Math.round(item.wind.speed)}m/s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.02); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes numberPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default Weather;