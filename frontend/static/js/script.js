// Importing necessary libraries
import axios from 'axios';

// Function to handle note editing
async function editNote(note, feature, value) {
	try {
		const response = await axios.post('/note_editing', {
			note,
			feature,
			value,
		});
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

// Function to handle instrument options
async function getInstrumentOptions(instrument, genre, language, vocalStyle, artistStyle) {
	try {
		const response = await axios.post('/instrument_options', {
			instrument,
			genre,
			language,
			vocalStyle,
			artistStyle,
		});
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

// Function to handle vocals to instrument conversion
async function convertVocalsToInstrument(vocals, instrument) {
	try {
		const response = await axios.post('/vocals_to_instrument', {
			vocals,
			instrument,
		});
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

// Function to handle noise reduction
async function reduceNoise(audio) {
	try {
		const response = await axios.post('/noise_reduction', {
			audio,
		});
		console.log(response.data);
	} catch (error) {
		console.error(error);
	}
}

// Example usage:
editNote({ pitch: 0, volume: 0, duration: 0, start_time: 0, end_time: 0 }, 'pitch_bend', 2);
getInstrumentOptions('piano', 'pop', 'english', 'male', 'ariana-grande');
convertVocalsToInstrument('vocals.wav', 'piano');
reduceNoise('audio.wav');

$(document).ready(function () {
	// Initialize Tooltip
	$('[data-toggle="tooltip"]').tooltip();

	// Add smooth scrolling to all links in navbar + footer link
	$(".navbar a, footer a[href='#myPage']").on('click', function (event) {

		// Make sure this.hash has a value before overriding default behavior
		if (this.hash !== "") {

			// Prevent default anchor click behavior
			event.preventDefault();

			// Store hash
			var hash = this.hash;

			// Using jQuery's animate() method to add smooth page scroll
			// The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 900, function () {

				// Add hash (#) to URL when done scrolling (default click behavior)
				window.location.hash = hash;
			});
		} // End if
	});
})