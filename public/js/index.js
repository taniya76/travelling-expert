// Get user location and date input on  submit
const getCity = () => {

  let city = document.getElementById('city').value;

  city = city.toLowerCase();
  city = city[0].toUpperCase() + city.slice(1);

  // console.log(city);

  return city;
}

const getTripStart = () => {

  const date = document.getElementById('date_start').value.split('-');

  return date.join('/');
}

const getTripEnd = () => {
  const date = document.getElementById('date_end').value.split('-');

  return date.join('/');
}

const countdown = (start, end) => {

  const tripStart = Date.parse(start);
  const tripEnd = Date.parse(end);

  const countdown = tripEnd - tripStart;

  const daysLeft = Math.ceil(countdown / 86400000);

  // console.log(daysLeft);

  return daysLeft;
}


const geonamesUrl = 'http://api.geonames.org/';
const geonamesKey = 'stamay';
const geonamesQuery = 'searchJSON?formatted=true&q=';

const darkSkyURL = 'https://api.darksky.net/forecast/';
const darkSkyKey = 'a44b6a01155bc9391c311378b6f5bcee';

const pixabayURL = 'https://pixabay.com/api/?key=';
const pixabayKey = '13922659-0b80b0f115dd3a353e0647b73';



async function getGeoLocation(location) {
  const endpoint = geonamesUrl + geonamesQuery + location + '&username=' + geonamesKey + '&style=full';
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const location = {};
      const jsonRes = await response.json();

      location.latitude = jsonRes.geonames[0].lat;
      location.longitude = jsonRes.geonames[0].lng;
      location.countryCode = jsonRes.geonames[0].countryCode;

      // console.log(location);
      return location;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getWeatherForecast(latitude, longitude) {
  const endpoint = darkSkyURL + darkSkyKey + `/${latitude}, ${longitude}`;
  try {
    var url1='/forecast';
    const response = await fetch(url1,
      {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: endpoint })
      });
    if (response.ok) {
      const jsonRes = await response.json();
      // console.log(jsonRes);
      return jsonRes;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getImageURL(city, country) {
  const queryCity = `&q=${city}&image_type=photo&pretty=true&category=places`;
  const queryCountry = `&q=${country}&image_type=photo&pretty=true&category=places`

  const cityEndpoint = pixabayURL + pixabayKey + queryCity;
  const countryEndpoint = pixabayURL + pixabayKey + queryCountry;
  try {
    let response = await fetch(cityEndpoint);
    if (response.ok) {
      let jsonRes = await response.json();
      if (jsonRes.totalHits === 0) {
        // If not, display pictures for the country
        response = await fetch(countryEndpoint);
        if (response.ok) {
          jsonRes = await response.json();
          return jsonRes.hits[0].largeImageURL;
        }
      }
      return jsonRes.hits[0].largeImageURL;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getCountryInfo(countryCode) {
  const endpoint = `https://restcountries.eu/rest/v2/alpha/${countryCode}`
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const jsonRes = await response.json();
      // console.log(jsonRes);
      return jsonRes;
    }
  } catch (error) {
    console.log(error);
  }
}



const getTripDate = (date) => {

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const tripDate = new Date(date);
  const tripDateText = `${days[tripDate.getDay()]}, ${months[tripDate.getMonth()]} ${tripDate.getDate()}, ${tripDate.getFullYear()}`;

  return tripDateText;
}

const getWeatherInfo = (weatherForecast, daysLeft, date) => {

  const weather = {
    temperature: 0,
    summary: '',
    forecastTemp: 0,
    forecastSummary: ''
  };

  weather.temperature = weatherForecast.currently.temperature;
  weather.summary = weatherForecast.currently.summary;

  date = Date.parse(date);
  /**
    * Daily forecast returns forecasts for 8 days.
    * Go through the array to match the correct day
    */
  for (let i = 0; i < weatherForecast.daily.data.length; i++) {
    if (date >= weatherForecast.daily.data[i].time) {
      weather.forecastTemp = weatherForecast.daily.data[i].temperatureHigh;
      weather.forecastSummary = weatherForecast.daily.data[i].summary;
      break;
    }
  }
  return weather;
}

const showModal = (trip) => {

  document.querySelector('.caption').style.display = 'none';

  $('#tripModal').modal({
    keyboard: false
  })

  document.querySelector('.trip_title').innerHTML = `<img src="${trip.countryFlag}" class="flag"> ${trip.city}, ${trip.country}`;

  // Display location, dates and the duration
  document.querySelectorAll('.media_heading')[0].innerText = `${trip.city}, ${trip.country}`;

  //
  const tripStart = getTripDate(trip.start);
  const tripEnd = getTripDate(trip.end);
  document.querySelectorAll('.media_heading')[1].innerText = tripStart;
  document.querySelectorAll('.media_heading')[2].innerText = tripEnd;

  document.querySelectorAll('.media_heading')[3].innerText = `${countdown(trip.start, trip.end)} days`;

  // Display trip images
  // const imageURL = await getTripImageURL(images);
  document.querySelector('.images').setAttribute('src', trip.image);

  // Display the days left to trip
  const daysLeft = countdown(new Date(), trip.start);
  document.querySelector('.trip_countdown').innerText = `Your trip to ${trip.city} is ${daysLeft} days away`;

  // Display weather info
  const weather = getWeatherInfo(trip.weatherForecast, daysLeft, tripStart);

  if (daysLeft < 7) {
    document.querySelector('.trip_weather').innerHTML = `<p class="mt-1">The current weather:</p>
                                                       <p class="mt-1">${weather.temperature}&deg;F</p>
                                                       <p class="mt-1">${weather.summary}</p>`;
  } else {
    document.querySelector('.trip_weather').innerHTML = `<p class="mt-1">Weather forecast for then:</p>
                                                       <p class="mt-1">${weather.forecastTemp}&deg;F</p>
                                                       <p class="mt-1">${weather.forecastSummary}</p>`;
  }

}

const displayTrip = (trip) => {

  document.querySelector('.caption').style.display = 'block';
  document.querySelector('.caption').style.top = '5vh';


  const tripStart = getTripDate(trip.start);
  const tripEnd = getTripDate(trip.end);
  const daysLeft = countdown(new Date(), trip.start);
  const weather = getWeatherInfo(trip.weatherForecast, daysLeft, tripStart);

  const section = document.createElement('section');
  section.classList.add('trips');

  const div = document.createElement('div');
 
  div.innerHTML = `
  <div class="card mb-3" style="max-width: 768px; margin: 0 auto">
    <div class="row no-gutters">
      <div class="col-md-4">
        <img src="${trip.image}" class="card-img" alt="Picture of Travel Destination">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h3 class="card-title trip_title"><img src="${trip.countryFlag}" class="flag"> ${trip.city}, ${trip.country}</h3>
          <h6 class="mt-0">Departure: ${tripStart}</h6>
          <h6 class="mt-0">Return: ${tripEnd}</h6>
          <h6 class="mt-0">Duration: ${countdown(trip.start, trip.end)} days</h6>
          <span class="trip_countdown">Your trip to ${trip.city} is ${daysLeft} days away</span>
          <p>The current weather:</p>
          <p>${weather.temperature}&deg;F</p>
          <p>${weather.summary}</p>
        </div>
        <button type="button" class="btn btn-secondary del" name="${trip.city}">delete</button>
      </div>
     
    </div>
  </div>`;

  section.appendChild(div);
  document.querySelector('.hero').appendChild(section);
}






let itemsArray = localStorage.getItem('items')
  ? JSON.parse(localStorage.getItem('items'))
  : [];

window.localStorage.setItem('items', JSON.stringify(itemsArray))

const trip = {};

//display all the trips which are saved in local storage
itemsArray.forEach((item) => {
  document.getElementsByClassName("clear")[0].style.display = 'block';
  displayTrip(item)
})
/* Button handle functions */

const handleSearch = async (e) => {
  e.preventDefault();

  trip.city = getCity();
  trip.start = getTripStart();
  trip.end = getTripEnd();

  const geoLocation = await getGeoLocation(trip.city);

  trip.latitude = geoLocation.latitude;
  trip.longitude = geoLocation.longitude;
  trip.countryCode = geoLocation.countryCode;

  trip.weatherForecast = await getWeatherForecast(geoLocation.latitude, geoLocation.longitude);

  const countryInfo = await getCountryInfo(trip.countryCode);

  trip.country = countryInfo.name;
  trip.countryFlag = countryInfo.flag;

  trip.image = await getImageURL(trip.city, trip.country);

  // console.log(trip);

  showModal(trip);
}

const handleSave = async (e) => {
  e.preventDefault();

  try {
    const url = '/save'
    const response = await fetch(url,
      {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trip: trip })
      });
    if (response.ok) {
      const jsonRes = await response.json();
      itemsArray.push(jsonRes)
      localStorage.setItem('items', JSON.stringify(itemsArray))
      $('#tripModal').modal('toggle');
      document.getElementsByClassName("clear")[0].style.display = 'block';
      displayTrip(jsonRes);
      window.location.reload(true);
      return jsonRes;
    }
  } catch (error) {
    console.log(error);
  }
}

const handleCancel = (e) => {
  e.preventDefault();
  $('#tripModal').modal('toggle');
  document.querySelector('.caption').style.display = 'block';
}


/* Add event listeners */
document.getElementById('button_search').addEventListener('click', handleSearch);

document.querySelector('.trip_save').addEventListener('click', handleSave)

document.querySelectorAll('.trip_cancel').forEach(element => {
  element.addEventListener('click', handleCancel);
});

//someone wants to delete all the trips
document.getElementsByClassName("clear")[0].addEventListener('click', function () {
  localStorage.clear()
  document.getElementsByClassName("clear")[0].style.display = 'none';
  window.location.reload(true)
})
//if we want to delete a particular trip
var numberOfButtons = document.querySelectorAll(".del").length;

for (var i = 0; i < numberOfButtons; i++) {
  document.querySelectorAll(".del")[i].addEventListener("click", function () {

    var newarray = [];
    for (var j = 0; j < itemsArray.length; j++) {
      if (itemsArray[j].city != this.name) {
        newarray.push(itemsArray[j]);
      }
    }
    window.localStorage.setItem('items', JSON.stringify(newarray))
    itemsArray = newarray;
    window.location.reload(true)
  })
}
