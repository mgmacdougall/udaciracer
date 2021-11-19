# Welcome to the One and only UdaciRacer Simulation Game

## Project Overview

The project is a learning project for asynchronous code dealing with promises, async/await interacting with to '3rd' party API.

There was some basic code for the front end for rendering front end, none of the calls to the backend were supplied and that was where I had to develop the logic to POST and GET results.  

Along with the asynchronous code handing a state 'store' to manage state change throughout the application.

Finally, there was an Express server supplied to serve the static portions of the web page and routing.

There are three components to the application:
1. The front end where all the promise/async code exists. 

2. An Express server that acts to server the web pages for the application.

3. The '3rd' party API that contains the logic for taking API calls from the front-end code.

# Component details

## Front End Work Completed (Personal work completed)
There was starter code supplied CSS, HTML and component rendering, the code I had to complete for this project was to make all the API and supporting functions to make the race program functional.
All the code changes were completed in the following: `src/client/assets/javascript/index.js`

The successful completion of the project involved the following:
1. Create a count down timer called 'runCountdown' to complete the following:
  - Create a new Promise to wrap the timer
  - Create a named 'interval' used later with 'clearInterval'
  - Create a the 'setInterval' to wait one second, and count down from 3 to 0
  - Upon completion of the countdown:  
        -- use 'removeChild' to remove the count down timer elements from the DOM
        -- resolve the promise
        -- use 'clearInterval' to clear the named interval

1.  Use the web 'fetch' interface to complete the following calls:
  - return the results all the tracks from the `api/tracks` route in json format. The cards are created using the json returned from the call.
  - GET all the racers for building out the racer cards using the `api/cars` route in json format. 
  - use a POST request to initialize a race using the `api/races` route.
  - GET all the information on the current race in progress `api/races/${id}` end point.
  - Start the race using an async version of Fetch for the race currently being run by using an async version POST request version of 'fetch' to the `api/races/${id}/start` end point.
  - Created an accelerate method that to track the number status after the UI button is clicked on the front end using the `api/races/${id}/accelerate` end point with promise based 'fetch'

3. Front end work completed to interact with the 'fetch' calls and render the results:
  - handleCreateRace: async function that manages creating the car by making an async POST request to the `/api/races`.
    -- parsing the resulting data, setting the 'store' track_id, player_id, and race_id for state.
    -- make the information from the state store to create the start view.
    -- execute the count down.
    -- start the race using race_id stored in state.
    -- run the race using the race_id stored in state.
  - updateLeaderBoard: updates the leader board. 
    -- If the res.status is 'finished' then the game is over & updateLeaderBoard calls updateFinalResults with the results.  Finally returning 'done' to the 'runRace' function. 
    -- If the res.status is not 'finished' then renderAt renders the results of the raceProgress with the positon.
  - runRace: a Promise based function that executes the following:
    -- creates a named interval that will update every 500ms.  
    -- executes the 'getRace' api call. And based on the results:
      -- calls updateLeaderBoard to render the results
      -- if the result from updateLeaderBoard comes back as 'done' then the interval is cleared, and the promise resolves.
  - 'runCountdown' was created to complete the following:
    -- Create a new Promise to wrap the timer
    -- Create a named 'interval' to be used later with 'clearInterval'
    -- Create a the 'setInterval' to wait one second, and count down from 3 to 0
    -- When completed the runCountdown will:  
        -- use 'removeChild' to remove the count down timer elements from the DOM
        -- resolve the promise
        -- use 'clearInterval' to clear the named interval

## Game Mechanics:
The game mechanics are this: you select a player and track, the game begins, and you accelerate your racer by clicking an acceleration button. As you accelerate so do the other players and the leaderboard live-updates as players change position on the track. The final view is a results page displaying the players' rankings.

The game has three main views:

1. The form to create a race

2. The race progress view (this includes the live-updating leaderboard and acceleration button)

3. The race results view

## 3rd Party API (Provided)
The 3rd party API was provided with little instructions on how to interact and make the calls to and receive data from POST and GET requests.

The internals of the API were hidden, to emulate what could be expected when dealing with a real API.

The only information provided where the following calls:

[GET] `api/tracks`
List of all tracks

- id: number (1)
- name: string ("Track 1")
- segments: number[]([87,47,29,31,78,25,80,76,60,14....])

[GET] `api/cars`
List of all cars

- id: number (3)
- driver_name: string ("Racer 1")
- top_speed: number (500)
- acceleration: number (10)
- handling: number (10)

[GET] `api/races/${id}`
Information about a single race

- status: RaceStatus ("unstarted" | "in-progress" | "finished")
- positions object[] ([{ car: object, final_position: number (omitted if empty), speed: number, segment: number}])

[POST] `api/races`
Create a race

- id: number
- track: string
- player_id: number
- cars: Cars[] (array of cars in the race)
- results: Cars[] (array of cars in the position they finished, available if the race is finished)

[POST] `api/races/${id}/start`
Begin a race
- Returns nothing

[POST] `api/races/${id}/accelerate`
Accelerate a car
- Returns nothing
## Starter Code (Provided)

The following were supplied by the course:

1. An API. The API is provided in the form of a binary held in the bin folder. You never need to open the binary file, as there are no edits you can make to it. Your work will be 100% in the front end.

2. HTML Views. The focus of this course is not UI development or styling practice, so we have already provided you with pieces of UI, all you have to do is call them at the right times.

### Start the Server

The game engine has been compiled down to a binary so that you can run it on any system. Because of this, you cannot edit the API in any way, it is just a black box that we interact with via the API endpoints.

The program was developed on Windows and to get the API Server running the following must be set  at the command line.  Copy and paste these in a Command Prompt:
set Data_FILE=./data.json
set ORIGIN_ALLOWED=http://localhost:3000
start ./bin/server

Note that this process will use your terminal tab, so you will have to open a new tab and navigate back to the project root to start the front end.
### Start the Frontend

First, run your preference of `npm install && npm start` or `yarn && yarn start` at the root of this project. Then you should be able to access http://localhost:3000.
