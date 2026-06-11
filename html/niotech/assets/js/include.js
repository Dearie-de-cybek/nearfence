/**
 * HTML partial loader.
 * Fetches all [data-include] elements, replaces them with their partial content,
 * then dynamically injects main.js so plugins initialise after the full DOM exists.
 *
 * NOTE: requires a local server (e.g. VS Code Live Server) — fetch() does not
 * work over the file:// protocol due to browser CORS restrictions.
 */
(async function () {
    const placeholders = Array.from(document.querySelectorAll('[data-include]'));

    await Promise.all(
        placeholders.map(async function (el) {
            const src = el.getAttribute('data-include');
            try {
                const res = await fetch(src);
                if (!res.ok) throw new Error('HTTP ' + res.status + ' loading ' + src);
                const html = await res.text();
                el.outerHTML = html;
            } catch (err) {
                console.error('[include.js]', err);
                el.outerHTML = '<!-- partial failed to load: ' + src + ' -->';
            }
        })
    );

    // All partials are now in the DOM — load main.js so jQuery plugins find their elements.
    const script = document.createElement('script');
    script.src = 'assets/js/main.js';
    // main.js uses $(window).on('load') for the preloader, but window.load already fired
    // by the time we inject the script. Re-fire it after main.js executes so the
    // preloader dismissal handler actually runs.
    script.onload = function () {
        window.dispatchEvent(new Event('load'));
    };
    document.body.appendChild(script);
})();
