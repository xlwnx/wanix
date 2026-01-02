import { fetchData } from '../api.js';

export function showPlayerNotice(app, type, id, s = 1, e = 1) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="notice-modal">
            <div class="notice-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <h2>Streaming Notice</h2>
            <div class="notice-content">
                <div class="notice-item">
                    <i class="fas fa-ad"></i>
                    <div>
                        <h4>Ads & Popups Warning</h4>
                        <p>This player may contain ads and several popups. If an ad appears, simply close it and return to the player. Using an <b>Ad-Blocker</b> extension is highly recommended for the best experience.</p>
                    </div>
                </div>
                <div class="notice-item">
                    <i class="fas fa-bolt"></i>
                    <div>
                        <h4>Lag or Buffering solutions</h4>
                        <p>If you experience buffering, we recommend using a <b>VPN</b>, <b>Best DNS (e.g., 1.1.1.1, 8.8.8.8, etc.)</b>, or <b>Cloudflare WARP</b> to ensure a smooth playback.</p>
                    </div>
                </div>
                <div class="notice-item">
                    <i class="fas fa-sync-alt"></i>
                    <div>
                        <h4>Connection Issues</h4>
                        <p>If the player fails to load properly, please try to <b>Reload</b> the page or press <b>Ctrl + F5</b> on your keyboard.</p>
                    </div>
                </div>
            </div>
            <button class="btn-proceed" id="closeNotice">OK</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeNotice').onclick = () => {
        modal.remove();
        startVideo(app, type, id, s, e);
    };
}

export async function startVideo(app, type, id, s = 1, e = 1) {
    app.container.classList.add('page-exit');
    await new Promise(r => setTimeout(r, 400));

    let url = type === 'movie' ? `https://vidsrc.wtf/api/1/movie/?id=${id}` : `https://vidsrc.wtf/api/1/tv/?id=${id}&s=${s}&e=${e}`;

    let controlsHTML = '';
    if (type === 'tv') {
        const detail = await fetchData(`/tv/${id}`);
        const seasonDetail = await fetchData(`/tv/${id}/season/${s}`);

        controlsHTML = `
            <div class="player-controls">
                <select id="season-select">
                    ${detail.seasons.filter(sn => sn.season_number > 0).map(season => `
                        <option value="${season.season_number}" ${season.season_number == s ? 'selected' : ''}>Season ${season.season_number}</option>
                    `).join('')}
                </select>
                <select id="episode-select">
                    ${seasonDetail.episodes.map(ep => `
                        <option value="${ep.episode_number}" ${ep.episode_number == e ? 'selected' : ''}>Episode ${ep.episode_number}</option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    app.container.innerHTML = `
        <div class="player-wrapper">
            <div class="player-back-btn" id="player-back-btn" title="Back to Details">
                <i class="fas fa-arrow-left"></i>
            </div>
            ${controlsHTML}
            <iframe src="${url}" frameborder="0" allowfullscreen></iframe>
        </div>
    `;

    document.getElementById('player-back-btn').onclick = () => app.loadDetailPage(type, id);
    if (type === 'tv') {
        document.getElementById('season-select').onchange = (e) => startVideo(app, 'tv', id, e.target.value, 1);
        document.getElementById('episode-select').onchange = (e) => startVideo(app, 'tv', id, s, e.target.value);
    }

    app.container.classList.remove('page-exit');
    app.container.classList.add('page-enter');
    setTimeout(() => app.container.classList.remove('page-enter'), 600);
}
