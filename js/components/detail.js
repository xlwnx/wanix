import { BACKDROP_URL, IMG_URL } from '../config.js';
import { fetchData } from '../api.js';
import { getRatingClass, getCountryName, scrollRow } from '../utils.js';

export async function loadDetailPage(app, type, id) {
    clearInterval(app.heroTimer);
    window.scrollTo(0, 0);

    app.container.classList.add('page-exit');
    await new Promise(r => setTimeout(r, 400));

    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('searchInput').value = '';

    app.container.innerHTML = '<div style="padding:100px; text-align:center;">FETCHING...</div>';
    app.container.classList.remove('page-exit');
    app.container.classList.add('page-enter');

    const detail = await fetchData(`/${type}/${id}?append_to_response=videos,credits,release_dates,content_ratings`);

    const year = (detail.release_date || detail.first_air_date || '').split('-')[0];
    const trailer = detail.videos.results.find(v => v.type === 'Trailer') || detail.videos.results[0];

    let certification = 'NR';
    if (type === 'movie') {
        const certData = detail.release_dates.results.find(r => r.iso_3166_1 === 'US') || detail.release_dates.results[0];
        certification = certData?.release_dates[0]?.certification || 'NR';
    } else {
        const certData = detail.content_ratings.results.find(r => r.iso_3166_1 === 'US') || detail.content_ratings.results[0];
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

    const country = getCountryName(detail.origin_country?.[0] || detail.production_countries?.[0]?.iso_3166_1 || 'US');

    app.container.innerHTML = `
        <div class="detail-container">
            <div class="player-back-btn" id="detail-back-btn" title="Back">
                <i class="fas fa-arrow-left"></i>
            </div>
            <section class="hero active" style="height: 70vh;">
                <div class="hero-video-container">
                    ${trailer ? `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&vq=hd1080" frameborder="0"></iframe>` : `<div style="background:url('${BACKDROP_URL}${detail.backdrop_path}') center/cover; width:100%; height:100%;"></div>`}
                </div>
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title" style="opacity:1; transform:none;">${detail.title || detail.name}</h1>
                    <div class="hero-meta" style="opacity:1; transform:none;">
                        <span class="cert">${certification}</span>
                        <span class="${getRatingClass(detail.vote_average)}">${detail.vote_average.toFixed(1)} Rating</span>
                        <span>${year}</span>
                        <span>${country}</span>
                        <span>${duration}</span>
                        <span>${detail.genres.map(g => g.name).join(', ')}</span>
                    </div>
                    <div class="hero-buttons" style="opacity:1; transform:none; margin-top:20px;">
                         <button class="btn btn-play" id="watch-now-btn">WATCH NOW</button>
                         <button class="btn btn-info" id="detail-info-back-btn">BACK</button>
                    </div>
                </div>
            </section>

            <section class="detail-info-section">
                <div class="info-box">
                    ${detail.tagline ? `<p class="tagline">${detail.tagline}</p>` : ''}
                    <h3>OVERVIEW</h3>
                    <p>${detail.overview || 'N/A'}</p>
                </div>
                <div class="info-box">
                    <h3>PRODUCTION INFO</h3>
                    <div class="info-grid">
                        <div class="production-item"><b>DIRECTOR</b> <span>${detail.credits.crew.find(c => c.job === 'Director')?.name || 'N/A'}</span></div>
                        <div class="production-item"><b>STUDIO</b> <span>${detail.production_companies[0]?.name || 'N/A'}</span></div>
                    </div>
                </div>
            </section>

            <section class="cast-row">
                <h3>TOP BILLED CAST</h3>
                <div class="row-container">
                    <button class="slider-btn slider-btn-left" id="cast-left">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="cast-container row-posters" id="cast-scroll">
                        ${detail.credits.cast.slice(0, 15).map(c => `
                            <div class="cast-card">
                                <img class="cast-img" src="${c.profile_path ? IMG_URL + c.profile_path : 'https://via.placeholder.com/150'}" alt="">
                                <span class="cast-real-name">${c.name}</span>
                                <span class="cast-char-name">${c.character}</span>
                            </div>
                        `).join('')}
                    </div>
                    <button class="slider-btn slider-btn-right" id="cast-right">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </section>
        </div>
    `;

    document.getElementById('detail-back-btn').onclick = () => app.router(app.lastPage || 'home');
    document.getElementById('detail-info-back-btn').onclick = () => app.router(app.lastPage || 'home');
    document.getElementById('watch-now-btn').onclick = () => app.playRealVideo(type, id);
    document.getElementById('cast-left').onclick = () => scrollRow('cast-scroll', 'left');
    document.getElementById('cast-right').onclick = () => scrollRow('cast-scroll', 'right');

    setTimeout(() => app.container.classList.remove('page-enter'), 600);
}
