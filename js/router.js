import { renderHero } from './components/hero.js';
import { createRow } from './components/row.js';
import { fetchData } from './api.js';

export async function router(app, page) {
    clearInterval(app.heroTimer);
    app.lastPage = page;
    document.getElementById('search-results').classList.add('hidden');
    document.getElementById('navLinks').classList.remove('active');
    document.getElementById('menuToggle').classList.remove('fa-times');

    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${page}`);
    if (activeNav) activeNav.classList.add('active');

    app.container.classList.add('page-exit');
    await new Promise(r => setTimeout(r, 400));

    app.container.innerHTML = '';
    app.container.classList.remove('page-exit');
    app.container.classList.add('page-enter');

    if (page === 'home') await renderHome(app);
    else if (page === 'movies') await renderCategory(app, 'movie');
    else if (page === 'tvshows') await renderCategory(app, 'tv');

    setTimeout(() => app.container.classList.remove('page-enter'), 600);
}

async function renderHome(app) {
    const data = await fetchData('/trending/all/day');
    await renderHero(app, data.results.slice(0, 10));

    await createRow(app, 'Trending Today', '/trending/all/day');
    await createRow(app, 'Trending This Week', '/trending/all/week');
    await createRow(app, 'Popular on Streaming', '/movie/popular');
    await createRow(app, 'Popular on TV', '/tv/popular');
    await createRow(app, 'Popular for Rent', '/discover/movie?with_watch_monetization_types=rent&watch_region=US');
    await createRow(app, 'Popular in Theaters', '/movie/now_playing');
}

async function renderCategory(app, type) {
    const data = await fetchData(`/${type}/popular`);
    await renderHero(app, data.results.slice(0, 10));

    if (type === 'movie') {
        await createRow(app, 'Popular Movies', '/movie/popular');
        await createRow(app, 'Now Playing', '/movie/now_playing');
        await createRow(app, 'Upcoming', '/movie/upcoming');
        await createRow(app, 'Top Rated', '/movie/top_rated');
    } else {
        await createRow(app, `Popular TV Shows`, `/tv/popular`);
        await createRow(app, 'Airing Today', '/tv/airing_today');
        await createRow(app, 'On TV', '/tv/on_the_air');
        await createRow(app, 'Top Rated', '/tv/top_rated');
    }
}
