/* global jQuery, handle, $, api */
'use strict';

//const ITEMS_URL = '/movies';
const MOVIES_URL = '/movies';
const RECIPES_URL = '/recipes';

const renderPage = function (store) {
  if (store.demo) {
    $('.view').css('background-color', 'gray');
    $('#' + store.view).css('background-color', 'white');
  } else {
    //console.log(store);
    $('.view').hide();
    $('#' + store.view).show();
  }
};

const renderResults = function (store) {
  //console.log(store);
  const listItems = store.list.map((item) => {
    //console.log(item);
    return `<li id="${item._id}">
                <a href="${item._id}" class="detail">
                <div>
                  <img src="${item.poster}" height="200" alt="${item.title}"
                </div>
                <!-- <div class="titleText">${item.title}</div> -->
                </a>
            </li>`;
  });
  $('#result').empty().append('<ul>').find('ul').append(listItems);
};

const renderEdit = function (store) {
  const el = $('#edit');
  const item = store.item;
  el.find('[name=title]').val(item.Title);
  el.find('[name=content]').val(item.comment);
};

const renderDetail = function (store) {
  console.log('renderDetail called');
  const el = $('#detail');
  store.movieId = store.item._id;
  const item = store.item;

  store.movieData.movieImgURL = item.poster;
  store.movieData.movieName = item.title;

  //console.log(store);
  //make a call to Yelp with zip and cuisine
  const searchZip = store.zip;
  const searchCuisine = item.pairedCuisine;
  const recommendationString = `We recommend the following <span class="highlight">${searchCuisine}</span> restaurants near you. Please select one:`;

  $.ajax({                      //used $.ajax because $.getJSON doesn't allow you to add headers (even though we had to move the Yelp API call server-side due to CORS issue)
    method: 'GET',
    url: `/yelp/search?zip=${searchZip}&cuisine=${searchCuisine}`
  })
    .done(function (response) {
      //console.log(response);
      const restaurants = response;
      restaurants.forEach(restaurant => {
        //
        const name = restaurant.name;
        const yelpId = restaurant.id;
        let address = restaurant.location.display_address[0];
        address = address + ', ' + restaurant.location.display_address[1];
        const img = restaurant.image_url;
        const price = restaurant.price;
        const rating = restaurant.rating;
        const yelpURL = restaurant.url;

        const HTML = `
        <div class="showRestaurant">
        <input type="radio" name="restaurantPick" class="restaurantPick" value="${yelpId}" required/>
          <div class="restImg">
            <img src="${img}" height="200" />
          </div>
          <div class="restDetails">
          <h3>${name}</h3>
          <p>${address}</p>
          <p>Price Scale: ${price}</p>
          <p>Yelp Rating: ${rating}</p>
          <p><a href="${yelpURL}" target="_blank">View ${name} on Yelp</a></p>
        </div>
        </div>
        `;

        $('#edit').css('display', 'block');
        $('.restaurant').append(HTML);
        //
      });
    })
    .fail(function () {
      console.log('error');
    });

  el.find('.title').text(item.title);
  el.find('.recommendation').html(recommendationString);
};

const handleSearch = function (event) {
  event.preventDefault();
  const store = event.data;
  const el = $(event.target);
  const title = el.find('[name=title]').val();
  var query;
  if (title) {
    query = {
      title: el.find('[name=title]').val()
    };
  }
  api.search(query)
    .then(response => {
      store.list = response;
      renderResults(store);

      store.view = 'search';
      renderPage(store);
    }).catch(err => {
      console.error(err);
    });
};

const handleCreate = function (event) {
  event.preventDefault();
  const store = event.data;
  const el = $(event.target);

  const document = {
    firstName: el.find('[name=firstName]').val(),
    email: el.find('[name=email]').val(),
    zip: el.find('[name=zip]').val()
  };

  api.create(document)
    .then(response => {
      //console.log(response);
      store.item = response;
      store.recipeData.recipeId = response._id;
      store.zip = response.zip;
      store.list = null; //invalidate cached list results
      //console.log(store);
      // renderDetail(store);
      // store.view = 'search';
      // renderPage(store);
      $('#search').trigger('submit');
    }).catch(err => {
      console.error(err);
    });
};

const handleUpdate = function (event) {
  event.preventDefault();
  const store = event.data;
  const el = $('#edit').find('input:checked');
  //console.log(el);

  const choice = el.val();
  store.restaurantData.restaurantImgURL = el.next().find('img').attr('src');
  store.restaurantData.restaurantName = el.parent().find('.restDetails').find('h3').text();
  //console.log(store.restaurantData.restaurantName);

  const document = {
    id: store.recipeData.recipeId,
    movieId: store.movieId,   //this is the movie number, not the
    restaurantId: choice
  };

  store.recipeData = document;

  // const document = {
  //   id: store.item.id,
  //   restaurantId: choice,
  //   rating: 'hot'
  // };
  api.update(document)      //this refers to the method created fetch.js (line 76)
    .then(response => {
      //console.log(response);
      store.item = response;
      store.list = null; //invalidate cached list results
      console.log('line 184');
      //renderDetail(store);
      store.view = 'itsADate';
      renderPage(store);
    }).catch(err => {
      console.error(err);
    });

  showFinalRecipe(store);
};

const showFinalRecipe = function (store) {
  
  api.confirm(store.recipeData.id)
    .then(response => {
      console.log(response);
      const movieImgURL = store.movieData.movieImgURL;
      const movieName = store.movieData.movieName;
      const restaurantImgURL = store.restaurantData.restaurantImgURL;
      const restaurantName = store.restaurantData.restaurantName;

      const recipeHTML = `
    <div class="imgMovie">
      <img src="${movieImgURL}" width="200" height="295" alt="${movieName}">
      <h3>${movieName}</h3>
    </div>
    <div class="imgRestaurant">
      <img src="${restaurantImgURL}" width="200" height="295" alt="${restaurantName}">
      <h3>${restaurantName}</h3>
    </div>
    `;
      const postStr = $.post('recipes', {id: store.recipeData.id});
      const nextStepsHTML = `
      <p>If this looks good, schedule below and we'll email you at <a href="mailto:${response.email}">${response.email}</a> two days after your date night to see if it was a winning recipe.</p>
      <form action="#">
        Select date night:
        <input type="month" name="year_week">
        <input class="btnPicker" type="submit">
      </form>
      <p>Not loving it? No problem. Just <span id="delete">cancel it</span> and try again</a>.</p>
      `;

      $('.success').html(`<h1>${response.firstName}, here's your Date Night Recipe</h1>`);
      $('.dateSchedule').html(recipeHTML);
      $('.nextSteps').html(nextStepsHTML);
      console.log(store);
    })
    .catch(err => {
      console.log(err);
    });
};

const handleDetails = function (event) {
  event.preventDefault();
  const store = event.data;
  const el = $(event.target);

  const id = el.closest('li').attr('id');
  api.details(id)
    .then(response => {
      store.item = response;
      console.log('line 251');
      renderDetail(store);

      store.view = 'detail';
      renderPage(store);

    }).catch(err => {
      store.error = err;
    });
};

// const handleRemove = function (event) {
//   event.preventDefault();
//   const store = event.data;
//   const id = store.item.id;

//   api.remove(id, store.token)
//     .then(() => {
//       store.list = null; //invalidate cached list results
//       return handleSearch(event);
//     }).catch(err => {
//       console.error(err);
//     });
// };

const handleDelete = function (event) {
  event.preventDefault();
  const store = event.data;
  const id = store.recipeData.id;

  api.remove(id)
    .then(() => {
      store.list = null; //invalidate cached list results
      store.view = 'create';
      renderPage(store);
      //return handleSearch(event);
    }).catch(err => {
      console.error(err);
    });
};


const handleViewCreate = function (event) {
  event.preventDefault();
  const store = event.data;
  store.view = 'create';
  renderPage(store);
};
const handleViewList = function (event) {
  event.preventDefault();
  const store = event.data;
  if (!store.list) {
    handleSearch(event);
    return;
  }
  store.view = 'search';
  renderPage(store);
};
const handleViewEdit = function (event) {
  event.preventDefault();
  const store = event.data;
  renderEdit(store);

  store.view = 'edit';
  renderPage(store);
};

//on document ready bind events
jQuery(function ($) {

  const STORE = {
    demo: false,        // display in demo mode true | false
    view: 'list',       // current view: list | details | create | edit 
    query: {},          // search query values
    list: null,         // search result - array of objects (documents)
    item: null,         // currently selected document
    recipeData: {},     // stores the user's recipe id 
    movieData: {},
    restaurantData: {}
  };


  $('#create').on('submit', STORE, handleCreate);
  $('#search').on('submit', STORE, handleSearch);
  $('#edit').on('submit', STORE, handleUpdate);

  $('body').on('click', '#delete', STORE, handleDelete);

  $('#result').on('click', '.detail', STORE, handleDetails);
  //$('#detail').on('click', '.remove', STORE, handleRemove);
  $('#detail').on('click', '.edit', STORE, handleViewEdit);

  $(document).on('click', '.viewCreate', STORE, handleViewCreate);
  $(document).on('click', '.viewList', STORE, handleViewList);

  // start app by triggering a search
  // $('#search').trigger('submit');

});
