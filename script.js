const API_KEY="be670a1389eafd9b8736cce1a056a2cf";
const WEATHER_URL="https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL="https://api.openweathermap.org/data/2.5/forecast";
const cityInput=document.querySelector(".city-input");
const searchBtn=document.querySelector(".search-btn");
const cityTxt=document.querySelector(".city-txt");
const dateTxt=document.querySelector(".date-txt");
const tempTxt=document.querySelector(".temp-txt");
const conditionTxt=document.querySelector(".condition-txt");
const feelsLike=document.querySelector(".feels-like");
const humidityValue=document.querySelector(".humidity-value");
const windValue=document.querySelector(".wind-value");
const pressureValue=document.querySelector(".pressure-value");
const visibilityValue=document.querySelector(".visibility-value");
const uvValue=document.querySelector(".uv-value");
const sunriseValue=document.querySelector(".sunrise-value");
const weatherImg=document.querySelector(".weather-status-img");
const hourlyContainer=document.querySelector(".hourly-container");
const forecastContainer=document.querySelector(".forecast-container");
const errorText=document.querySelector(".show-error");
const loading=document.querySelector(".loading-container");
const noData=document.querySelector(".no-data");
const errorContainer=document.querySelector(".error-container");
const themeBtn=document.querySelector(".theme-switch");
const darkIcon=document.querySelector(".dark-icon");
const lightIcon=document.querySelector(".light-icon");
const iconMap={
"Clear":"clear",
"Clouds":"cloud",
"Rain":"rain",
"Drizzle":"drizzle",
"Thunderstorm":"thunderstorm",
"Snow":"snow",
"Mist":"mist",
"Smoke":"mist",
"Haze":"mist",
"Dust":"mist",
"Fog":"mist",
"Sand":"mist",
"Ash":"mist",
"Squall":"wind",
"Tornado":"wind"
};

function showLoading(){
loading.classList.remove("hidden");
errorContainer.classList.add("hidden");
noData.classList.add("hidden");
}

function hideLoading(){
loading.classList.add("hidden");
}

function showError(message){
hideLoading();
errorText.textContent=message;
errorContainer.classList.remove("hidden");
}

function clearError(){
errorText.textContent="";
errorContainer.classList.add("hidden");
}

function formatDate(){
const options={weekday:"long",day:"numeric",month:"long",year:"numeric"};
return new Date().toLocaleDateString("en-US",options);
}

async function fetchWeather(city){
try{
showLoading();
clearError();
const weatherResponse=await fetch(`${WEATHER_URL}?q=${city}&units=metric&appid=${API_KEY}`);
if(!weatherResponse.ok){
throw new Error("City not found");
}
const weatherData=await weatherResponse.json();
const forecastResponse=await fetch(`${FORECAST_URL}?q=${city}&units=metric&appid=${API_KEY}`);
const forecastData=await forecastResponse.json();
hideLoading();
updateCurrentWeather(weatherData);
updateHighlights(weatherData);
updateHourlyForecast(forecastData);
updateWeeklyForecast(forecastData);
changeBackground(weatherData.weather[0].main);
localStorage.setItem("lastCity",city);
}
catch(error){
showError(error.message);
}
}


searchBtn.addEventListener("click",()=>{
const city=cityInput.value.trim();
if(city===""){
showError("Please enter a city name");
return;
}
fetchWeather(city);
});

cityInput.addEventListener("keydown",e=>{
if(e.key==="Enter"){
searchBtn.click();
}
});


window.addEventListener("load",()=>{
const lastCity=localStorage.getItem("lastCity");
if(lastCity){
fetchWeather(lastCity);
}else{
noData.classList.remove("hidden");
}
});

function updateCurrentWeather(data){
const weatherMain=data.weather[0].main;
const icon=iconMap[weatherMain]||"clear";
cityTxt.textContent=data.name+", "+data.sys.country;
dateTxt.textContent=formatDate();
tempTxt.textContent=Math.round(data.main.temp)+"°C";
conditionTxt.textContent=data.weather[0].description.replace(/\b\w/g,c=>c.toUpperCase());
feelsLike.textContent="Feels Like "+Math.round(data.main.feels_like)+"°C";
weatherImg.src=`./assets/weather/${icon}.svg`;
weatherImg.alt=weatherMain;
}

function updateHighlights(data){
humidityValue.textContent=data.main.humidity+"%";
windValue.textContent=(data.wind.speed*3.6).toFixed(1)+" km/h";
pressureValue.textContent=data.main.pressure+" hPa";
visibilityValue.textContent=(data.visibility/1000).toFixed(1)+" km";
uvValue.textContent="--";
const sunrise=new Date(data.sys.sunrise*1000);
sunriseValue.textContent=sunrise.toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});
}

function changeBackground(weather){
document.body.classList.remove("sunny","cloudy","rainy","thunder","snow","mist");
switch(weather){
case"Clear":
document.body.classList.add("sunny");
break;
case"Clouds":
document.body.classList.add("cloudy");
break;
case"Rain":
case"Drizzle":
document.body.classList.add("rainy");
break;
case"Thunderstorm":
document.body.classList.add("thunder");
break;
case"Snow":
document.body.classList.add("snow");
break;
case"Mist":
case"Smoke":
case"Haze":
case"Fog":
case"Dust":
case"Sand":
case"Ash":
document.body.classList.add("mist");
break;
default:
document.body.classList.add("sunny");
}
}

function getWeatherIcon(weather){
return iconMap[weather]||"clear";
}

function capitalize(text){
return text.replace(/\b\w/g,c=>c.toUpperCase());
}

function kelvinToCelsius(temp){
return Math.round(temp);
}

function formatTime(date){
return new Date(date).toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});
}

function formatDay(date){
return new Date(date).toLocaleDateString([],{
weekday:"short"
});
}

function clearContainers(){
hourlyContainer.innerHTML="";
forecastContainer.innerHTML="";
}

function hideEmptyScreens(){
noData.classList.add("hidden");
errorContainer.classList.add("hidden");
}

function displayWeather(data,forecast){
hideLoading();
hideEmptyScreens();
clearContainers();
updateCurrentWeather(data);
updateHighlights(data);
updateHourlyForecast(forecast);
updateWeeklyForecast(forecast);
changeBackground(data.weather[0].main);
}

async function fetchByCoordinates(lat,lon){
try{
showLoading();
const weatherResponse=await fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
const weatherData=await weatherResponse.json();
const forecastResponse=await fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
const forecastData=await forecastResponse.json();
displayWeather(weatherData,forecastData);
}
catch(error){
showError("Unable to fetch weather data.");
}
}

function updateHourlyForecast(data){
hourlyContainer.innerHTML="";
const hourlyData=data.list.slice(0,8);
hourlyData.forEach(item=>{
const weather=item.weather[0].main;
const icon=getWeatherIcon(weather);
const time=new Date(item.dt*1000).toLocaleTimeString([],{
hour:"numeric",
hour12:true
});
const temp=Math.round(item.main.temp);
const card=document.createElement("div");
card.className="hourly-item";
card.innerHTML=`
<h5>${time}</h5>
<img src="./assets/weather/${icon}.svg" alt="${weather}">
<h4>${temp}°C</h4>
<p>${capitalize(item.weather[0].description)}</p>
`;
hourlyContainer.appendChild(card);
});
}

function updateWeeklyForecast(data){
forecastContainer.innerHTML="";
const dailyForecast={};
data.list.forEach(item=>{
const date=new Date(item.dt*1000).toLocaleDateString();
if(!dailyForecast[date]){
dailyForecast[date]=item;
}
});
const forecastArray=Object.values(dailyForecast).slice(1,6);
forecastArray.forEach(item=>{
const weather=item.weather[0].main;
const icon=getWeatherIcon(weather);
const day=new Date(item.dt*1000).toLocaleDateString([],{
weekday:"long"
});
const temp=Math.round(item.main.temp);
const card=document.createElement("div");
card.className="forecast-item";
card.innerHTML=`
<div class="forecast-left">
<img src="./assets/weather/${icon}.svg" alt="${weather}">
<div>
<div class="forecast-day">${day}</div>
<div class="forecast-condition">${capitalize(item.weather[0].description)}</div>
</div>
</div>
<div class="forecast-temp">${temp}°C</div>
`;
forecastContainer.appendChild(card);
});
}

function createHourlyCard(time,icon,temp,condition){
const card=document.createElement("div");
card.className="hourly-item";
card.innerHTML=`
<h5>${time}</h5>
<img src="./assets/weather/${icon}.svg">
<h4>${temp}°C</h4>
<p>${condition}</p>
`;
return card;
}

function createForecastCard(day,icon,temp,condition){
const card=document.createElement("div");
card.className="forecast-item";
card.innerHTML=`
<div class="forecast-left">
<img src="./assets/weather/${icon}.svg">
<div>
<div class="forecast-day">${day}</div>
<div class="forecast-condition">${condition}</div>
</div>
</div>
<div class="forecast-temp">${temp}°C</div>
`;
return card;
}

function getCurrentTime(){
return new Date().toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
});
}

function getCurrentDate(){
return new Date().toLocaleDateString([],{
weekday:"long",
day:"numeric",
month:"long",
year:"numeric"
});
}

function updateDateTime(){
dateTxt.textContent=getCurrentDate()+" • "+getCurrentTime();
}

setInterval(updateDateTime,60000);

function animateCards(){
document.querySelectorAll(".highlight-card,.hourly-item,.forecast-item").forEach((card,index)=>{
card.style.opacity="0";
card.style.transform="translateY(30px)";
setTimeout(()=>{
card.style.transition=".6s ease";
card.style.opacity="1";
card.style.transform="translateY(0)";
},index*100);
});
}

function refreshUI(weatherData,forecastData){
updateCurrentWeather(weatherData);
updateHighlights(weatherData);
updateHourlyForecast(forecastData);
updateWeeklyForecast(forecastData);
animateCards();
changeBackground(weatherData.weather[0].main);
}

function detectLocation(){
if(!navigator.geolocation){
const lastCity=localStorage.getItem("lastCity");
if(lastCity){
fetchWeather(lastCity);
}else{
fetchWeather("Delhi");
}
return;
}
navigator.geolocation.getCurrentPosition(async(position)=>{
const lat=position.coords.latitude;
const lon=position.coords.longitude;
fetchByCoordinates(lat,lon);
},()=>{
const lastCity=localStorage.getItem("lastCity");
if(lastCity){
fetchWeather(lastCity);
}else{
fetchWeather("Delhi");
}
});
}

function createRainEffect(){
const oldRain=document.querySelector(".rain");
if(oldRain) oldRain.remove();
if(!document.body.classList.contains("rainy")) return;
const rain=document.createElement("div");
rain.className="rain";
for(let i=0;i<120;i++){
const drop=document.createElement("span");
drop.style.left=Math.random()*100+"%";
drop.style.animationDuration=(0.5+Math.random())+"s";
drop.style.animationDelay=Math.random()*2+"s";
rain.appendChild(drop);
}
document.body.appendChild(rain);
}

function createSnowEffect(){
const oldSnow=document.querySelector(".snow-effect");
if(oldSnow) oldSnow.remove();
if(!document.body.classList.contains("snow")) return;
const snow=document.createElement("div");
snow.className="snow-effect";
for(let i=0;i<80;i++){
const flake=document.createElement("span");
flake.style.left=Math.random()*100+"%";
flake.style.width=(4+Math.random()*8)+"px";
flake.style.height=flake.style.width;
flake.style.animationDuration=(4+Math.random()*6)+"s";
flake.style.animationDelay=Math.random()*5+"s";
snow.appendChild(flake);
}
document.body.appendChild(snow);
}

function applyWeatherEffects(){
createRainEffect();
createSnowEffect();
}

window.addEventListener("online",()=>{
const city=localStorage.getItem("lastCity")||"Delhi";
fetchWeather(city);
});

window.addEventListener("offline",()=>{
showError("No internet connection.");
});

cityInput.addEventListener("focus",()=>{
cityInput.parentElement.classList.add("active");
});

cityInput.addEventListener("blur",()=>{
cityInput.parentElement.classList.remove("active");
});

document.addEventListener("visibilitychange",()=>{
if(!document.hidden){
const city=localStorage.getItem("lastCity");
if(city){
fetchWeather(city);
}
}
});

window.addEventListener("load",()=>{
updateDateTime();
detectLocation();
});

document.querySelectorAll(".highlight-card").forEach(card=>{
card.addEventListener("mouseenter",()=>{
card.style.transform="translateY(-8px) scale(1.03)";
});
card.addEventListener("mouseleave",()=>{
card.style.transform="";
});
});

document.querySelectorAll(".weather-card,.highlights,.hourly-section,.forecast-section").forEach(card=>{
card.addEventListener("mousemove",e=>{
const rect=card.getBoundingClientRect();
const x=e.clientX-rect.left;
const y=e.clientY-rect.top;
card.style.setProperty("--x",x+"px");
card.style.setProperty("--y",y+"px");
});
});

if(localStorage.getItem("lastCity")){
fetchWeather(localStorage.getItem("lastCity"));
}else{
detectLocation();
}