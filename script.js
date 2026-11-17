// MovieStream interactions
const tracks = document.querySelectorAll('.carousel-shell');

tracks.forEach((shell) => {
  const track = shell.querySelector('.movie-track');
  const prev = shell.querySelector('.carousel-arrow.prev');
  const next = shell.querySelector('.carousel-arrow.next');

  // Move by approximately one card each time an arrow is clicked.
  const moveByCard = (direction) => {
    const card = track.querySelector('.movie-card');
    const gap = parseFloat(getComputedStyle(track).gap) || 14;
    const distance = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  prev.addEventListener('click', () => moveByCard(-1));
  next.addEventListener('click', () => moveByCard(1));
});

// Hover preview videos. They start muted because browsers block autoplay with sound.
const cards = document.querySelectorAll('.movie-card');
function stopPreview(card) {
  const video = card.querySelector('.preview-video');
  video.pause();
  video.currentTime = 0;
  card.classList.remove('previewing');
  const soundButton = card.querySelector('.sound-toggle');
  if (soundButton) soundButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  video.muted = true;
}

cards.forEach((card) => {
  const video = card.querySelector('.preview-video');
  const soundButton = card.querySelector('.sound-toggle');
  const trailerUrl = card.dataset.trailer;

  card.addEventListener('mouseenter', async () => {
    if (!trailerUrl) return;
    // Set source only when needed to avoid downloading every video on page load.
    if (!video.src) video.src = trailerUrl;
    card.classList.add('previewing');
    try { await video.play(); } catch (error) {
      // If autoplay is blocked, the poster remains visible until the user clicks Play.
      card.classList.remove('previewing');
    }
  });

  card.addEventListener('mouseleave', () => stopPreview(card));

  if (soundButton) {
    soundButton.addEventListener('click', async (event) => {
      event.stopPropagation();
      if (!video.src) video.src = trailerUrl;
      card.classList.add('previewing');
      try {
        await video.play();
        video.muted = !video.muted;
        soundButton.innerHTML = video.muted
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
      } catch (error) {
        alert('This preview could not be played. Check the video URL.');
      }
    });
  }
});

// Trailer modal: clicking Play opens the selected card's preview in a larger player.
const trailerModalElement = document.getElementById('trailerModal');
const trailerModal = new bootstrap.Modal(trailerModalElement);
const modalVideo = document.getElementById('modalVideo');
const trailerTitle = document.getElementById('trailerTitle');

document.querySelectorAll('.play-card').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.movie-card');
    modalVideo.src = card.dataset.trailer;
    modalVideo.muted = false;
    trailerTitle.textContent = `${card.dataset.title} — Preview`;
    trailerModal.show();
    modalVideo.play().catch(() => {
      // User can press play in the modal if the browser blocks playback.
    });
  });
});

trailerModalElement.addEventListener('hidden.bs.modal', () => {
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  modalVideo.load();
});

// More-info buttons open a Bootstrap modal populated from the selected card.
const detailsModalElement = document.getElementById('detailsModal');
const detailsModal = new bootstrap.Modal(detailsModalElement);
document.querySelectorAll('.more-info').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.movie-card');
    document.getElementById('detailsTitle').textContent = card.dataset.title;
    detailsModalElement.querySelector('.modal-body').innerHTML = `
      <p class="match">Recommended for you</p>
      <p>${card.dataset.genre} · ${card.dataset.duration}</p>
      <p>${card.dataset.description}</p>
      <p class="muted small">This is sample movie information for your demo project.</p>`;
    detailsModal.show();
  });
});

// My List: add and remove movie titles in this browser session.
const savedMovies = new Set();
const savedContainer = document.getElementById('savedMovies');
function renderSavedMovies() {
  if (savedMovies.size === 0) {
    savedContainer.innerHTML = '<p class="empty-list">Your list is empty for now.</p>';
    return;
  }
  savedContainer.innerHTML = [...savedMovies].map(title => `
    <div class="saved-chip"><span>${title}</span><button type="button" data-remove="${title}" aria-label="Remove ${title}"><i class="fa-solid fa-xmark"></i></button></div>
  `).join('');
}
document.querySelectorAll('.add-list').forEach((button) => {
  button.addEventListener('click', () => {
    const title = button.closest('.movie-card').dataset.title;
    savedMovies.has(title) ? savedMovies.delete(title) : savedMovies.add(title);
    button.innerHTML = savedMovies.has(title)
      ? '<i class="fa-solid fa-check"></i>'
      : '<i class="fa-solid fa-plus"></i>';
    renderSavedMovies();
  });
});
savedContainer.addEventListener('click', (event) => {
  const removeButton = event.target.closest('[data-remove]');
  if (!removeButton) return;
  const title = removeButton.dataset.remove;
  savedMovies.delete(title);
  document.querySelectorAll('.movie-card').forEach(card => {
    if (card.dataset.title === title) card.querySelector('.add-list').innerHTML = '<i class="fa-solid fa-plus"></i>';
  });
  renderSavedMovies();
});

// Search filters cards by title as the user types.
const searchInput = document.getElementById('searchInput');
document.getElementById('searchToggle').addEventListener('click', () => {
  searchInput.classList.toggle('open');
  if (searchInput.classList.contains('open')) searchInput.focus();
});
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  cards.forEach(card => {
    card.style.display = card.dataset.title.toLowerCase().includes(query) ? '' : 'none';
  });
});

// Hero Play button opens the featured details/trailer placeholder.
document.getElementById('heroPlay').addEventListener('click', () => {
  trailerTitle.textContent = 'The Dark Horizon — Preview';
  modalVideo.src = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
  modalVideo.muted = false;
  trailerModal.show();
  modalVideo.play().catch(() => {});
});
