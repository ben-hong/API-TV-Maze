"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
// ADD: Remove placeholder & make request to TVMaze search shows API.
  let getRequest = await axios.get(`http://api.tvmaze.com/search/shows`, {
    params: {
      q: term
    }
  })

  let showData = getRequest.data;
  let showList = [];
  for (let data of showData) {
    let showSearchObj = data.show;
    let {id, name, summary, image} = showSearchObj;
    if (image === null) {
      image = 'https://tinyurl.com/tv-missing';
    } else {
      image = image.medium;
    }
    showList.push({id, name, summary, image});
  }

  return showList;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image}
              alt=https://tinyurl.com/tv-missing
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  let episodeRequest = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodeData = episodeRequest.data;
  let episodeArr =[];
  for (let num of episodeData){
    let {id, name, season, number} = num;
    episodeArr.push({id, name, season, number});
  }
  console.log(episodeArr);
  return episodeArr;
}


/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
  for (let episode of episodes){
    $("#episodesList").append(`<li>${episode.name}(season ${episode.season}, number ${episode.number})</li>`);
  }
}

$showsList.on("click", ".btn", async (e) => {
  $("#episodesList").empty();
  $episodesArea.show();
  let id = $(e.target).closest(".Show").data().showId;
  let episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
})
