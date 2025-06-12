const apiKey = '0b15d5b4d85446312c2bcf623f2e0f57';

async function getWeather() {
    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = '<div class="loading"></div>';
    weatherDiv.classList.remove('hidden');
    
    const city = document.getElementById('cityInput').value;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

async function displayWeather(data) {
    const { name, main, weather, wind, coord } = data;
    const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@4x.png`;

    // Fetch pollution data using coordinates
    try {
        const pollutionData = await getPollutionData(coord.lat, coord.lon);
        const weatherDiv = document.getElementById('weather');
        weatherDiv.innerHTML = `
            <img id="weather-icon" class="weather-icon" src="${iconUrl}" alt="${weather[0].description}">
            <h2 id="location">${name}</h2>
            <div class="weather-temp">${Math.round(main.temp)}°C</div>
            <p class="weather-description">${weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1)}</p>
            <div class="weather-details">
                <div class="detail">
                    <p>Humidity</p>
                    <p>${main.humidity}%</p>
                </div>
                <div class="detail">
                    <p>Wind Speed</p>
                    <p>${Math.round(wind.speed * 3.6)} km/h</p>
                </div>
            </div>
            <div class="pollution-details">
                <h3>Air Quality</h3>
                <div class="aqi-level ${getAQIClass(pollutionData.list[0].main.aqi)}">
                    ${getAQIText(pollutionData.list[0].main.aqi)}
                </div>
                <div class="pollution-grid">
                    <div class="detail">
                        <p>PM2.5</p>
                        <p>${pollutionData.list[0].components.pm2_5} μg/m³</p>
                    </div>
                    <div class="detail">
                        <p>PM10</p>
                        <p>${pollutionData.list[0].components.pm10} μg/m³</p>
                    </div>
                </div>
            </div>
        `;
        
        weatherDiv.classList.remove('hidden');
        setTimeout(() => {
            weatherDiv.classList.add('visible');
        }, 100);
    } catch (error) {
        console.error('Error fetching pollution data:', error);
    }
}

async function getPollutionData(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Pollution data not available');
    return response.json();
}

function getAQIClass(aqi) {
    const classes = ['good', 'fair', 'moderate', 'poor', 'very-poor'];
    return classes[aqi - 1] || 'unknown';
}

function getAQIText(aqi) {
    const texts = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor'
    };
    return texts[aqi] || 'Unknown';
}

// Add error handling with nice UI
function showError(message) {
    const weatherDiv = document.getElementById('weather');
    if (weatherDiv) {
        weatherDiv.innerHTML = `
            <div class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" width="40" height="40">
                    <path fill="currentColor" d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z"/>
                </svg>
                <p class="error-text">${message}</p>
                <p class="error-hint">Please try another city name</p>
            </div>
        `;
        weatherDiv.classList.remove('hidden');
        weatherDiv.classList.add('visible');
    }
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

// DateTime Display
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    document.getElementById('datetime').textContent = now.toLocaleDateString('en-US', options);
}

updateDateTime();
setInterval(updateDateTime, 60000);

// Add Enter key support for mobile keyboards
document.getElementById('cityInput').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});

// Prevent zoom on double tap for mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
