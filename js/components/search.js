import { IMG_URL, genreMap } from '../config.js';
import { fetchData } from '../api.js';
import { getRatingClass } from '../utils.js';

export function toggleSearch() {
    const bar = document.getElementById('searchBar');
    bar.classList.toggle('active');
    if (bar.classList.contains('active')) document.getElementById('searchInput').focus();
}

export async function handleSearch(app, query) {
    const resultsPanel = document.getElementById('search-results');
    if (query.length < 2) { resultsPanel.classList.add('hidden'); return; }

    const data = await fetchData(`/search/multi?query=${query}`);
    resultsPanel.classList.remove('hidden');
    resultsPanel.innerHTML = data.results.slice(0, 8).map(item => {
        const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
        const gName = item.genre_ids ? genreMap[item.genre_ids[0]] || 'Featured' : 'Featured';
        const rating = item.vote_average ? item.vote_average.toFixed(1) : '0.0';
        const rClass = getRatingClass(item.vote_average || 0);
        const typeLabel = item.media_type === 'movie' ? 'MOVIE' : (item.media_type === 'tv' ? 'TV SHOWS' : 'PERSON');

        if (item.media_type === 'person') return '';

        return `
            <div class="search-item" data-type="${item.media_type}" data-id="${item.id}">
                <img src="${item.poster_path ? IMG_URL + item.poster_path : 'https://via.placeholder.com/50x75'}" alt="">
                <div class="search-info">
                    <h4>${item.title || item.name}</h4>
                    <p>
                        <span class="search-type-badge">${typeLabel}</span>
                        <span class="search-meta-item"><i class="fas fa-calendar-alt"></i> ${year}</span>
                        <span>•</span>
                        <span class="search-meta-item">${gName}</span>
                        <span>•</span>
                        <span class="search-rating-mini ${rClass}"><i class="fas fa-star"></i> ${rating}</span>
                    </p>
                </div>
            </div>
        `;
    }).join('');

    resultsPanel.querySelectorAll('.search-item').forEach(item => {
        item.onclick = () => app.loadDetailPage(item.dataset.type, item.dataset.id);
    });
}
