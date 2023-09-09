const {
	getPokemonPictureUrl
} = require("../downloader");

describe("Retrieve a Pokemon URL", () => {
	// if id is 25, URL should be:
	// https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png
	let expectedImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
	let expectedJsonData = {
		sprites: {
			other: {
				'official-artwork': {
					front_default: expectedImageUrl
				}
			}
		}
	}

	global.fetch = jest.fn(() => {
		console.log("Fetch has been replaced with a Jest mock!");
		return new Promise((resolve, reject) => {
			resolve({
				json: () => {
					return Promise.resolve(expectedJsonData);
				}
			});
		})
	})

	test("If given an ID of 25, url is expected correct URL", async () => {
		let result = await getPokemonPictureUrl(25);

		expect(result).toEqual(expectedImageUrl);

	})

})