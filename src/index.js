import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

let lightbox = new SimpleLightbox('.gallery a');
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');

searchForm.addEventListener('submit', onSearchInput);
loadMore.addEventListener('click', onBtnNextPage);
let page = 1;
let searchQuery = '';

async function apiFetch(searchQuery, page = 1) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY_API = '34448730-0e1e80ad14723c69fac822871';
  try {
    const fetchResponse = await axios.get(
      `${BASE_URL}?key=${KEY_API}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    const response = await fetchResponse.data;

    return response;
  } catch (error) {
    throw new Error(error.statusText);
  }
}

async function onSearchInput(event) {
  event.preventDefault();
  const inputSearch = event.currentTarget;
  searchQuery = inputSearch.elements.searchQuery.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.failure('An empty input field. Please fill it up');
    return;
  }

  loadMore.classList.add('hidden');
  gallery.innerHTML = '';

  try {
    const allImages = await apiFetch(searchQuery, page);
    const images = allImages.hits.length;

    if (!images) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    const totalHits = allImages.totalHits;
    if (totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    cardsCreate(allImages);
    loadMore.classList.remove('hidden');
    if (page * 40 > totalHits) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch {
    catchErrorInfo();
  }
}

function cardsCreate(data) {
  const create = data.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
 <a href="${largeImageURL}"> <img src="${webformatURL}" alt="${tags}" loading="lazy" width ="360"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes <br>${likes}</b>
    </p>
    <p class="info-item">
      <b>Views <br>${views}</b>
    </p>
    <p class="info-item">
      <b>Comments</b> <br><b>${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads <br>${downloads}</b>
    </p>
  </div></div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', create);
  lightbox.refresh();
}

async function onBtnNextPage() {
  page += 1;
  try {
    const data = await apiFetch(searchQuery, page);

    cardsCreate(data);

    setTimeout(() => {
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }, 1000);

    if (page * 40 > data.totalHits) {
      Notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      loadMore.classList.add('hidden');
    }
  } catch {
    catchErrorInfo();
  }
}

function catchErrorInfo() {
  Notiflix.Notify.failure(
    'Oops, something went wrong. There are no images matching your request. Please try it again.'
  );
}
