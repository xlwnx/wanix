import { countryNameMap } from './config.js';

export function getRatingClass(rating) {
    if (rating < 3.0) return 'rating-red';
    if (rating <= 7.0) return 'rating-yellow';
    return 'rating-green';
}

export function getCountryName(code) {
    return countryNameMap[code] || code;
}

export function scrollRow(id, direction) {
    const row = document.getElementById(id);
    const scrollAmount = row.clientWidth * 0.8;
    if (direction === 'left') {
        row.scrollLeft -= scrollAmount;
    } else {
        row.scrollLeft += scrollAmount;
    }
}
