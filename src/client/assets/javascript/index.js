// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
  track_id: undefined,
  player_id: undefined,
  race_id: undefined,
};

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  onPageLoad();
  setupClickHandlers();
});

async function onPageLoad() {
  try {
    getTracks().then((tracks) => {
      const html = renderTrackCards(tracks);
      renderAt("#tracks", html);
    });

    getRacers().then((racers) => {
      const html = renderRacerCars(racers);
      renderAt("#racers", html);
    });
  } catch (error) {
    console.log("Problem getting tracks and racers ::", error.message);
    console.error(error);
  }
}

function setupClickHandlers() {
  document.addEventListener(
    "click",
    function (event) {
      const { target } = event;

      // Race track form field
      if (target.matches(".card.track")) {
        handleSelectTrack(target); // done
      }

      // Podracer form field
      if (target.matches(".card.podracer")) {
        handleSelectPodRacer(target);
      }

      // Submit create race form
      if (target.matches("#submit-create-race")) {
        event.preventDefault();

        // start race
        handleCreateRace();
      }

      // Handle acceleration click
      if (target.matches("#gas-peddle")) {
        handleAccelerate(target);
      }
    },
    false
  );
}

async function delay(ms) {
  try {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  } catch (error) {
    console.log("an error shouldn't be possible here");
    console.log(error);
  }
}
// ^ PROVIDED CODE ^ DO NOT REMOVE
const setupRaceDetails = async () => {
  const { track_id, player_id } = store; // TODO - Get player_id and track_id from the store

  try {
    const data = await fetch("http://localhost:8000/api/races", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        track_id: parseInt(track_id),
        player_id: parseInt(player_id),
      }),
    });
    const result = await data.json();
    const { ID } = result;
    console.log("here", ID);
    store.race_id = parseInt(ID) === 0 ? 1 : parseInt(ID) - 1; // TODO - update the store with the race id, edge case is if 0 don't subtract
    return result;
  } catch (err) {
    console.log(err);
  }
};
// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
  // render starting UI

  let raceDetails = await setupRaceDetails(); //TODO - invoke the API call to create the race, then save the result
  renderAt("#race", renderRaceStartView(raceDetails.Track, raceDetails.Cars));
  await runCountdown(); // TODO - call the async function runCountdown
  // TODO - call the async function startRace
  await startRace(store.race_id);

  // TODO - call the async function runRace

  runRace(store.race_id);
}

// Update leader board if not done!
const updateLeaderBoard = (res) => {
  if (res.status === "in-progress") {
    renderAt("#leaderBoard", raceProgress(res.positions));
    return "not";
  } else {
    updateFinalResults(res);
    return "done";
  }
};

const updateFinalResults = (res) => {
  renderAt("#race", resultsView(res.positions));
  return "done";
};

function runRace(raceID) {
  return new Promise((resolve) => {
    // TODO - use Javascript's built in setInterval method to get race info every 500ms
    const currentRace = setInterval(() => {
      getRace(raceID)
        .then((d) => updateLeaderBoard(d))
        .then((res) => {
          if (res === "done") {
            resolve();
            clearInterval(currentRace);
          }
        });

      // .then(raceDone(data))
    }, 500);
    // clearInterval(currentRace)
    /* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:
		renderAt('#leaderBoard', raceProgress(res.positions))
	*/
    /* 
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
    // resolve("done");
  }).catch((e) => console.log(e));
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      // TODO - use Javascript's built in setInterval method to count down once per second
      const timerInterval = setInterval(() => {
        if (timer === 0) {
          let h2 = document.querySelector("h2");
          h2.parentNode.removeChild(h2);

          let nums = document.getElementById("big-numbers");
          nums.parentNode.removeChild(nums);
          resolve();
          clearInterval(timerInterval);
        } else {
          // run this DOM manipulation to decrement the countdown for the user
          timer--;
          document.getElementById("big-numbers").innerHTML = timer;
        }
      }, 1000);
    });
  } catch (error) {
    console.log(error);
  }
}

function handleSelectPodRacer(target) {
  // remove class selected from all racer options
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // TODO - save the selected racer to the store
  store["player_id"] = target.id; // done
}

function handleSelectTrack(target) {
  // remove class selected from all track options
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  // add class selected to current target
  target.classList.add("selected");

  // TODO - save the selected track id to the store
  store.track_id = target.id; // done
}

function handleAccelerate() {
  console.log("accelerate button clicked");
  // TODO - Invoke the API call to accelerate
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
  if (!racers.length) {
    return `
			<h4>Loading Racers...</4>
		`;
  }

  const results = racers.map(renderRacerCard).join("");

  return `
		<ul id="racers">
			${results}
		</ul>
	`;
}

function renderRacerCard(racer) {
  const { id, driver_name, top_speed, acceleration, handling } = racer;

  return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`;
}

function renderTrackCards(tracks) {
  if (!tracks.length) {
    return `
			<h4>Loading Tracks...</4>
		`;
  }

  const results = tracks.map(renderTrackCard).join("");

  return `
		<ul id="tracks">
			${results}
		</ul>
	`;
}

function renderTrackCard(track) {
  const { id, name } = track;

  return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`;
}

function renderCountdown(count) {
  return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`;
}

function renderRaceStartView(track, racers) {
  return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>
			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`;
}

function resultsView(positions) {
  positions.sort((a, b) => (a.final_position > b.final_position ? 1 : -1));

  return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`;
}

function raceProgress(positions) {
  let userPlayer = positions.find((e) => e.id == store.player_id);
  userPlayer.driver_name += " (you)";

  positions = positions.sort((a, b) => (a.segment > b.segment ? -1 : 1));
  let count = 1;

  const results = positions.map((p) => {
    return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`;
  });

  return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`;
}

function renderAt(element, html) {
  const node = document.querySelector(element);

  node.innerHTML = html;
}

// ^ Provided code ^ do not remove

// API CALLS ------------------------------------------------

const SERVER = "http://localhost:8000";

function defaultFetchOpts() {
  return {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": SERVER,
    },
  };
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints

/**
 *
 * @returns all the tracks from the API
 */
function getTracks() {
  const options = {
    type: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(`${SERVER}/api/tracks`, options)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}
/**
 *
 * @returns all the  racers that are available.
 */
function getRacers() {
  const options = {
    type: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(`${SERVER}/api/cars`, options)
    .then((data) => data.json())
    .catch(
      (error) =>
        new Error("No racers availble at the moment check back later....")
    );
}

function createRace(player_id, track_id) {
  player_id = parseInt(player_id);
  track_id = parseInt(track_id);
  const body = { player_id, track_id };

  return fetch(`${SERVER}/api/races`, {
    method: "POST",
    ...defaultFetchOpts(),
    dataType: "jsonp",
    body: JSON.stringify(body),
  }).catch((err) => console.log("Problem with createRace request::", err));
}

function getRace(id) {
  // GET request to `${SERVER}/api/races/${id}`
  return fetch(`${SERVER}/api/races/${id}`, {
    method: "GET",
    ...defaultFetchOpts(),
  })
    .then((data) => data.json())
    .catch((error) => console.log("Problem with createRace request::", error));
}

async function startRace(id) {
  try {
    const race = await fetch(`${SERVER}/api/races/${id}/start`, {
      method: "POST",
      ...defaultFetchOpts(),
    });
  } catch (error) {
    console.log("Problem with getRace request::", error);
  }
}

function accelerate(id) {
  // POST request to `${SERVER}/api/races/${id}/accelerate`
  // options parameter provided as defaultFetchOpts
  // no body or datatype needed for this request
}
