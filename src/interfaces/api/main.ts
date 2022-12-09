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

export interface ResponseEverything {
    status: string;
    totalResults: number;
    articles: Article[];
}

export interface ResponseSource {
    status: 'ok' | 'error';
    sources: Source[];
}

export interface Source {
    id: string;
    name: string;
}