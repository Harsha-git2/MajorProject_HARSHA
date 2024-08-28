const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const API_key = "4cd73f0e5d720d0471339ed0890809a8";


const createWeatherCard = (weatherItem) => {
    return `<li class="card">
                <h3>${new Date(weatherItem.dt_txt).toDateString()} (<span>${weatherItem.weather[0].description}</span>)</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather-icon">
                <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
}


const updateCurrentWeather = (weather) => {
    const currentWeatherElement = document.querySelector(".current-weather .details");
    const currentWeatherIcon = document.querySelector(".current-weather .icon img");
    const currentWeatherDesc = document.querySelector(".current-weather .icon h4");

    if (currentWeatherElement && currentWeatherIcon && currentWeatherDesc) {
        currentWeatherElement.innerHTML = `
            <h2>${weather.name} (${new Date().toDateString()})</h2>
            <h4>Temperature: ${(weather.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weather.wind.speed} M/S</h4>
            <h4>Humidity: ${weather.main.humidity}%</h4>
        `;
        currentWeatherIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        currentWeatherDesc.innerText = weather.weather[0].description;
    } else {
        alert("Current weather element not found.");
    }
}


const getWeatherDetails = (cityName, lat, lon) => {
    const Weather_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}`;

    
    const Current_Weather_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`;

    Promise.all([
        fetch(Current_Weather_API_URL).then(res => res.json()),
        fetch(Weather_API_URL).then(res => res.json())
    ]).then(([currentWeather, forecastData]) => {
        updateCurrentWeather(currentWeather);

        const uniqueForecastDays = [];
        const fiveDaysForecast = forecastData.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        const weatherList = document.querySelector(".weather-cards");
        if (weatherList) {
            weatherList.innerHTML = ""; // Clear existing content
            fiveDaysForecast.forEach(weatherItem => {
                const weatherCard = createWeatherCard(weatherItem);
                weatherList.innerHTML += weatherCard;
            });
        } else {
            alert("Weather list element not found.");
        }
    }).catch(error => {
        alert(`Error: ${error.message}`);
    });
}


const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_key}`;

    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        })
        .then(data => {
            if (!data.length) return alert(`No Coordinates Found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
}


const getCurrentLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherDetails('Current Location', lat, lon);
            },
            error => {
                alert("Error getting your location. Please enable location services.");
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}


searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getCurrentLocation);