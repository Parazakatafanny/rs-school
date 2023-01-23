type Params = { [name: string]: string | number | null };

export default function constructURL(baseURL: string, params: Params): string {
  let url = baseURL;

  Object.entries(params).forEach(([key, value], idx) => {
    if (idx === 0) {
      url += `?${key}=${value}`;
    } else {
      url += `&${key}=${value}`;
    }
  });

  return url;
}
