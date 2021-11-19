// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
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
        handleCreateRace().catch((err) => console.log("Error creating race", err));
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
  const { track_id, player_id } = store; 

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
    store.race_id = parseInt(ID) - 1;
    return result;
  } catch (err) {
    console.log(err);
  }
};
async function handleCreateRace() {
  const raceDetails = await setupRaceDetails(); 
  renderAt("#race", renderRaceStartView(raceDetails.Track, raceDetails.Cars));
  await runCountdown(); 
  await startRace(store.race_id);
  runRace(store.race_id);
}

const updateLeaderBoard = (res) => {
  if (res.status === "finished") {
    updateFinalResults(res);
    return "done";
  } else {
    renderAt("#leaderBoard", raceProgress(res.positions));
    return "not";
  }
};

const updateFinalResults = (res) => {
  renderAt("#race", resultsView(res.positions));
  return "done";
};

function runRace(raceID) {
  return new Promise((resolve) => {
    const currentRace = setInterval(() => {
      getRace(raceID)
        .then((d) => updateLeaderBoard(d))
        .then((res) => {
          if (res === "done") {
            resolve();
            clearInterval(currentRace);
          }
        });
    }, 500);
  }).catch((e) => console.log(e));
}

async function runCountdown() {
  try {
    // wait for the DOM to load
    await delay(1000);
    let timer = 3;

    return new Promise((resolve) => {
      const timerInterval = setInterval(() => {
        if (timer === 0) {
          const h2 = document.querySelector("h2");
          h2.parentNode.removeChild(h2);

          const nums = document.getElementById("big-numbers");
          nums.parentNode.removeChild(nums);
          resolve();
          clearInterval(timerInterval);
        } else {
          timer--;
          document.getElementById("big-numbers").innerHTML = timer;
        }
      }, 1000);
    });
  } catch (error) {
    console.log("Error encountered setting timer ", error);
  }
}

function handleSelectPodRacer(target) {
  const selected = document.querySelector("#racers .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  target.classList.add("selected");

  store["player_id"] = target.id; 
}

function handleSelectTrack(target) {
  const selected = document.querySelector("#tracks .selected");
  if (selected) {
    selected.classList.remove("selected");
  }

  target.classList.add("selected");

  store.track_id = target.id; // done
}

function handleAccelerate() {
  console.log("accelerate button clicked");
  accelerate(store.race_id);
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
  const userPlayer = positions.find((e) => e.id == store.player_id);
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


function getTracks() {
  const options = {
    type: "GET",
    ...defaultFetchOpts(),
  };
  return fetch(`${SERVER}/api/tracks`, options)
    .then((res) => res.json())
    .catch((err) => console.log(err));
}

function getRacers() {
  const options = {
    type: "GET",
    ...defaultFetchOpts(),
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
    return race;
  } catch (error) {
    console.log("Problem with getRace request::", error);
  }
}

function accelerate(id) {
  return fetch(`${SERVER}/api/races/${id}/accelerate`, {
    method: "POST",
    ...defaultFetchOpts(),
  }).catch((err) => console.log(err));
}
