const CONFIG = {
   PATHS: ['index', 'home', 'about', 'blogs'], 
   LINKS: [
        {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com'
        },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com'
        },
        {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap'
        },

        // preload all.js
        {
            rel: 'preload',
            href: '../../all/all.css',
            as: 'style'
        }
    ]
}

export default CONFIG