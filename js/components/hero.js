import { BACKDROP_URL } from '../config.js';
import { fetchData } from '../api.js';
import { getRatingClass, getCountryName } from '../utils.js';

export async function renderHero(app, items) {
    app.trendingItems = items;
    const heroSection = document.createElement('section');
    heroSection.id = 'hero-display';
    app.container.appendChild(heroSection);
    await updateHero(app);

    app.heroTimer = setInterval(() => {
        app.heroIndex = (app.heroIndex + 1) % app.trendingItems.length;
        updateHero(app);
    }, 20000);
}

export async function updateHero(app) {
    const item = app.trendingItems[app.heroIndex];
    if (!item) return;

    const type = item.media_type || (item.title ? 'movie' : 'tv');
    const detail = await fetchData(`/${type}/${item.id}?append_to_response=videos,release_dates,content_ratings`);

    const year = (detail.release_date || detail.first_air_date || '').split('-')[0];
    const country = getCountryName(detail.origin_country?.[0] || detail.production_countries?.[0]?.iso_3166_1 || 'US');

    let certification = 'NR';
    if (type === 'movie') {
        const certData = detail.release_dates?.results.find(r => r.iso_3166_1 === 'US') || detail.release_dates?.results[0];
        certification = certData?.release_dates[0]?.certification || 'NR';
    } else {
        const certData = detail.content_ratings?.results.find(r => r.iso_3166_1 === 'US') || detail.content_ratings?.results[0];
        certification = certData?.rating || 'NR';
    }

    let duration = '';
    if (type === 'movie' && detail.runtime) {
        const h = Math.floor(detail.runtime / 60);
        const m = detail.runtime % 60;
        duration = `${h}h ${m}m`;
    } else if (type === 'tv') {
        duration = `${detail.number_of_seasons} Seasons`;
    }

    const genres = detail.genres.slice(0, 3).map(g => g.name).join(', ');
    const trailer = detail.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const videoId = trailer ? trailer.key : '';

    const heroEl = document.getElementById('hero-display');
    if (!heroEl) return;

    heroEl.innerHTML = `
        <div class="hero">
            <div class="hero-video-container">
                ${videoId ? `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&vq=hd1080" frameborder="0"></iframe>`
            : `<div style="background:url('${BACKDROP_URL}${item.backdrop_path}') center/cover; width:100%; height:100%;"></div>`}
            </div>
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1 class="hero-title">${item.title || item.name}</h1>
                <div class="hero-meta">
                    <span class="cert">${certification}</span>
                    <span class="${getRatingClass(item.vote_average)}">${item.vote_average.toFixed(1)} Rating</span>
                    <span>${year}</span>
                    <span>${country}</span>
                    <span>${duration}</span>
                    <span>${genres}</span>
                </div>
                <p class="hero-desc">${item.overview}</p>
                <div class="hero-buttons">
                    <button class="btn btn-play" id="hero-play-btn"><i class="fas fa-play"></i> Play</button>
                    <button class="btn btn-info" id="hero-info-btn"><i class="fas fa-info-circle"></i> More Info</button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('hero-play-btn').onclick = () => app.loadDetailPage(type, item.id);
    document.getElementById('hero-info-btn').onclick = () => app.loadDetailPage(type, item.id);

    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('active');
    }, 100);
}
