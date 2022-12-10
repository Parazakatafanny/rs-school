import Loader from './loader';

class AppLoader extends Loader {
    constructor() {
        super('https://newsapi-redirect-production.up.railway.app/', {
            apiKey: 'a5d3372c283f4b278a6251263e1d8223', // получите свой ключ https://newsapi.org/
        });
    }
}

export default AppLoader;
