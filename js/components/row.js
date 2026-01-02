import { IMG_URL, genreMap } from '../config.js';
import { fetchData } from '../api.js';
import { getRatingClass, scrollRow } from '../utils.js';

export async function createRow(app, title, endpoint) {
    const data = await fetchData(endpoint);
    const row = document.createElement('div');
    row.className = 'row';

    const rowId = `row-${Math.random().toString(36).substr(2, 9)}`;

    row.innerHTML = `
        <h2>${title}</h2>
        <div class="row-container">
            <button class="slider-btn slider-btn-left" id="left-${rowId}">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="row-posters" id="${rowId}">
                ${data.results.map(item => {
        const type = item.title ? 'movie' : 'tv';
        const rClass = getRatingClass(item.vote_average);
        const year = (item.release_date || item.first_air_date || '').split('-')[0] || 'N/A';
        const genre = item.genre_ids ? genreMap[item.genre_ids[0]] || 'Movie' : 'Movie';

        return `
                        <div class="movie-card" data-type="${type}" data-id="${item.id}">
                            <img class="card-img" src="${IMG_URL}${item.poster_path}" alt="${item.title || item.name}">
                            <div class="card-title">${item.title || item.name}</div>
                            <div class="card-meta">
                                <div class="card-rating ${rClass}"><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</div>
                                <span>•</span>
                                <span>${year}</span>
                                <span>•</span>
                                <span>${genre}</span>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
            <button class="slider-btn slider-btn-right" id="right-${rowId}">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    app.container.appendChild(row);

    // Add Events
    document.getElementById(`left-${rowId}`).onclick = () => scrollRow(rowId, 'left');
    document.getElementById(`right-${rowId}`).onclick = () => scrollRow(rowId, 'right');

    row.querySelectorAll('.movie-card').forEach(card => {
        card.onclick = () => app.loadDetailPage(card.dataset.type, card.dataset.id);
    });
}
