import { API_KEY, BASE_URL } from './config.js';

export async function fetchData(url) {
    const res = await fetch(`${BASE_URL}${url}${url.includes('?') ? '&' : '?'}api_key=${API_KEY}`);
    return await res.json();
}
