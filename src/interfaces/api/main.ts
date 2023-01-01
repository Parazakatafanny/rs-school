interface ServerResponse {
    status: 'ok' | 'error';
}

export interface Article {
    source: {
        id: number;
        name: string;
    };
    author: string;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    content: string;
}

export interface ResponseEverything extends ServerResponse {
    totalResults: number;
    articles: Article[];
}

export interface ResponseSource extends ServerResponse {
    sources: Source[];
}

export interface Source {
    id: string;
    name: string;
}