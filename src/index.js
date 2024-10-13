// Fetch movie details for ID 1
fetch('http://localhost:3000/films/1')
  .then(response => response.json())
  .then(data => {
    // rocessed data is then passed to the updateMovieDetails function to update the movie information on the page.
    updateMovieDetails(data);

    // Fetch and populate the film list
    fetch('http://localhost:3000/films')
      .then(response => response.json())
      .then(data => populateFilmList(data));
  });

// Function to update movie details ( fetched movie data as an argument.)
function updateMovieDetails(movieData) {
  $('#poster').attr('src', movieData.poster);
  $('#title').text(movieData.title);
  $('#runtime').text(`${movieData.runtime} minutes`);
  $('#film-info').text(movieData.description);
  $('#showtime').text(movieData.showtime);
  $('#ticket-num').text(movieData.capacity - movieData.tickets_sold);

  // Disable the "Buy Ticket" button if there are no tickets left
  if (movieData.capacity - movieData.tickets_sold === 0) {
    $('#buy-ticket').text('Sold Out').attr('disabled', true);
  }
}

// Function to populate the film list
function populateFilmList(movies) {
  const filmList = $('#films');  //films is the container of the movie list
  filmList.empty(); // Clear existing list

  movies.forEach(movie => { //iterates through the movies array:
    // Create the list item for each movie
    const filmItem = $('<li class="film item">');
    //Store the movie ID as data (data-film-id) on the list item for later use.
   // Sets the list item text content to the movie title.
    filmItem.data('film-id', movie.id);
    filmItem.text(movie.title);
    // Create the delete button and append it to the list item
    filmItem.append('<button class="delete-film">X</button>');
    filmList.append(filmItem);
  });
}

// Event listener for the "Buy Ticket" button
$('#buy-ticket').click(function() {
  const ticketsAvailable = parseInt($('#ticket-num').text());

  if (ticketsAvailable > 0) {
    const filmId = 1; // Ensure correct movie ID is used

    // Fetch the current movie details to get the latest `tickets_sold`
    fetch(`http://localhost:3000/films/${filmId}`)
      .then(response => response.json())
      .then(movieData => {
        const currentTicketsSold = movieData.tickets_sold;
        const updatedTicketsSold = currentTicketsSold + 1; // Increment tickets sold

        // Send the updated number of tickets sold to the backend
        fetch(`http://localhost:3000/films/${filmId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tickets_sold: updatedTicketsSold }),
        })
          .then(response => response.json())
          .then(updatedMovieData => {
            const updatedAvailableTickets = updatedMovieData.capacity - updatedMovieData.tickets_sold;
            $('#ticket-num').text(updatedAvailableTickets);

            // If no tickets are left, update the button to "Sold Out"
            if (updatedAvailableTickets === 0) {
              $('#buy-ticket').text('Sold Out').attr('disabled', true);
            }
          })
          .catch(error => {
            console.error('Error updating tickets:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching movie details:', error);
      });
  } else {
    alert("Tickets are sold out!");
  }
});

// Event listener for the "Delete Film" button (if applicable)
$(document).on('click', '.delete-film', function() {
  const filmId = $(this).parent().data('film-id'); // Get the film ID from the list item

  fetch(`http://localhost:3000/films/${filmId}`, {
    method: 'DELETE',
  })
    .then(response => {
      if (response.ok) {
        // If the DELETE request is successful, remove the film from the UI
        $(this).parent().remove();
      } else {
        console.error('Error deleting film:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Error deleting film:', error);
    });
});

// **Feature 1: Search Functionality**
$('#search-button').click(function() {
  const searchTerm = $('#search-input').val().toLowerCase();
  
  // Fetch all films and filter by search term
  fetch('http://localhost:3000/films')
    .then(response => response.json())
    .then(data => {
      const filteredMovies = data.filter(movie => movie.title.toLowerCase().includes(searchTerm));
      populateFilmList(filteredMovies); // Update the list with filtered movies
    })
    .catch(error => {
      console.error('Error fetching film list:', error);
    });
});

// **Feature 2: Add New Film**
$('#add-film-button').click(function() {
  const newFilm = {
    title: $('#new-film-title').val(),
    poster: $('#new-film-poster').val(),
    runtime: $('#new-film-runtime').val(),
    description: $('#new-film-description').val(),
    showtime: $('#new-film-showtime').val(),
    capacity: $('#new-film-capacity').val(),
    tickets_sold: 0, // New film starts with 0 tickets sold
  };

  // Send the new film to the backend
  fetch('http://localhost:3000/films', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newFilm),
  })
    .then(response => response.json())
    .then(data => {
      populateFilmList([...$('#films li').map((_, item) => $(item).text()), data]); // Add new film to the list
      $('#new-film-title').val(''); // Clear the input fields
      $('#new-film-poster').val('');
      $('#new-film-runtime').val('');
      $('#new-film-description').val('');
      $('#new-film-showtime').val('');
      $('#new-film-capacity').val('');
    })
    .catch(error => {
      console.error('Error adding new film:', error);
    });
});
