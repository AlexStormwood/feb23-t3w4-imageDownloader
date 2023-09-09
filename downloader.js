// Sychronous library for doing file IO 
// Check if directory exists
const fs = require("node:fs");

// Asynchronous, making a directory can take time
// but we do want to wait for this to finish 
const {mkdir} = require("node:fs/promises");

// Streaming data, safer than traditional file saving/downloading/etc 
// This is synchronous, so we wait and it IS blocking
const { Readable } = require("node:stream");

// Wait for streaming to finish, this can take time so it should be a promise
// but shouldn't be blocking, so it's a promise instead of async 
const {finished} = require("node:stream/promises");


// Node file & directory path helper system 
// /folder/folder/filename.png 
// \folder\folder\filename.png 
const path = require("node:path");


function downloadPokemonPicture(targetId = getRandomPokemonId()){
	return new Promise(async (resolve, reject)  => {

		try {

			// Step 1: get the image URL 
			let newUrl = await getPokemonPictureUrl(targetId); 

			// Step 1b: Get the Pokemon name 
			let pokemonName = await fetch("https://pokeapi.co/api/v2/pokemon/" + targetId).then(async (response) => {
				return await response.json();
			}).then(json => {
				return json.name;
			})

			// Step 2: do the download 
			let savedFileLocation = await savePokemonPictureToDisk(newUrl, `${pokemonName}-${targetId}.png`, "storage");
			// return savedFileLocation;
			resolve(savedFileLocation);

		} catch (error) {
			reject(error);
		}

	});
}

// Generate a random number or use a user-provided number
function getRandomPokemonId(){
	return Math.floor(Math.random() * 1010) + 1
}

// Retrieve Pokemon data for that number
// Retrieve the image URL from that Pokemon data 
async function getPokemonPictureUrl(targetId = getRandomPokemonId()){

	// Retrieve the API data
	let response = await fetch("https://pokeapi.co/api/v2/pokemon/" + targetId).catch(error => {
		throw new Error("API failure.");
	});

	if (response.status == "404"){
		throw new Error("API did not have data for the requested ID.");
	}

	// Convert the response into usable JSON 
	let data = await response.json().catch(error => {
		throw new Error("API did not return valid JSON.");
	}); 

	// Not optimised, it makes unnecessary variables
	// let imageUrl = data.sprites.other["official-artwork"].front_default;
	// return imageUrl;

	// More-optimised, no extra junk variables
	return data.sprites.other["official-artwork"].front_default;
}


// Download that image and save it to the computer 
// Return the downloaded image's file path 
async function savePokemonPictureToDisk(targetUrl, targetDownloadFilename, targetDownloadDirectory = "."){
	// Fetch request to the image URL 
	let imageData = await fetch(targetUrl).catch((error) => {
		throw new Error("Image failed to download.");
	});

	// Check if target directory exists
	if (!fs.existsSync(targetDownloadDirectory)){
		// Make a directory if we need to
		await mkdir(targetDownloadDirectory);
	}

	// Create a JS-friendly file path
	let fullFileDestination = path.join(targetDownloadDirectory, targetDownloadFilename);
	// someFolder, CoolPokemon.png 
	// /someFolder/CoolPokemon.png 
	// \someFolder\CoolPokemon.png 

	// Stream the image from the fetch to the computer 
	let fileDownloadStream = fs.createWriteStream(fullFileDestination);

	//    get data as bytes from the web request --- pipe the bytes into the hard drive 
	await finished(Readable.fromWeb(imageData.body).pipe(fileDownloadStream)).catch(error => {
		throw new Error("Failed to save content to disk.");
	});

	// Return the saved image location 
	return fullFileDestination;
}


module.exports = {
	downloadPokemonPicture,
	savePokemonPictureToDisk,
	getPokemonPictureUrl,
	getRandomPokemonId
}