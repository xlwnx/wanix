import { router } from './router.js';
import { handleSearch, toggleSearch } from './components/search.js';
import { loadDetailPage } from './components/detail.js';
import { showPlayerNotice } from './components/player.js';

const app = {
    trendingItems: [],
    heroIndex: 0,
    heroTimer: null,
    container: null,
    lastPage: 'home',

    init: function () {
        this.container = document.getElementById('app-container');
        this.handleSplash();
        this.router('home');
        this.initEvents();
    },

    initEvents: function () {
        window.onscroll = () => document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);

        document.getElementById('menuToggle').onclick = () => {
            document.getElementById('navLinks').classList.toggle('active');
            document.getElementById('menuToggle').classList.toggle('fa-times');
        };

        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));

        document.addEventListener('click', (e) => {
            const searchGroup = document.getElementById('searchGroup');
            const navLinks = document.getElementById('navLinks');
            const menuToggle = document.getElementById('menuToggle');

            if (!searchGroup.contains(e.target)) {
                document.getElementById('search-results').classList.add('hidden');
            }
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('fa-times');
            }
        });

        // Global functions for inline onclick (if any left, though I replaced most)
        window.app = {
            toggleSearch: () => toggleSearch(),
            router: (page) => this.router(page)
        };
    },

    router: function (page) {
        return router(this, page);
    },

    handleSearch: function (query) {
        return handleSearch(this, query);
    },

    loadDetailPage: function (type, id) {
        return loadDetailPage(this, type, id);
    },

    playRealVideo: function (type, id, s = 1, e = 1) {
        return showPlayerNotice(this, type, id, s, e);
    },

    handleSplash: function () {
        const splash = document.getElementById('splash-screen');
        const splashLogo = document.getElementById('splashLogo');
        const targetLogo = document.querySelector('.navbar .logo');

        if (!splash || !splashLogo || !targetLogo) return;

        targetLogo.style.opacity = '0';

        setTimeout(() => {
            const targetRect = targetLogo.getBoundingClientRect();

            splashLogo.style.top = targetRect.top + 'px';
            splashLogo.style.left = targetRect.left + 'px';
            splashLogo.style.fontSize = '2rem';
            splashLogo.style.letterSpacing = '-1px';
            splashLogo.style.transform = 'translate(0, 0)';

            setTimeout(() => {
                splash.classList.add('fade-out');
                targetLogo.style.opacity = '1';
                setTimeout(() => splash.remove(), 800);
            }, 1200);
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
