enum Status {
  'OK' = 200,
  'Created' = 201,
  'Bad request' = 400,
  'Not Found' = 404,
}

export type RespObject = {
  endpoint: string;
  gueryParams: Record<string, string | number>;
};

class Loader {
  private baseLink: string;

  constructor(baseLink: string) {
    this.baseLink = baseLink;
  }

  public async delete(
    options: RespObject
  ) {

    try {
      const method = 'DeLETE';

      const response = await fetch(this.makeUrl(options), { method });
      const checkRespose: Response = Loader.errorHandler(response, Status.OK);

      if (checkRespose) {
        return true
      }
    } catch {
      (err: Error) => console.error(err);
    }
  }

  public async put(
    options: RespObject,
    headers: Record<string, string>,
    body: string
  ) {

    try {
      const method = 'PUT';

      const response = await fetch(this.makeUrl(options), { method, headers, body});
      const checkRespose: Response = Loader.errorHandler(response, Status.OK);

      if (checkRespose) {
        return true
      }
    } catch {
      (err: Error) => console.error(err);
    }
  }

  public async patch<Data>(
    options: RespObject,
    headers: Record<string, string>,
    body?: string
  ) {

    try {
      const method = 'PATCH';

      const response = await fetch(this.makeUrl(options), { method, headers, body});
      const checkRespose: Response = Loader.errorHandler(response, Status.OK);

      if (checkRespose) {
        const data = response.json() as Promise<Data>;
        return data
      }
    } catch {
      (err: Error) => console.error(err);
    }
  }

  public async post(
    options: RespObject,
    headers: Record<string, string>,
    body: string
  ) {

    try {
      const method = 'POST';

      const response = await fetch(this.makeUrl(options), { method, headers, body});
      const checkRespose: Response = Loader.errorHandler(response, Status.Created);

      if (checkRespose) {
        return true
      }
    } catch {
      (err: Error) => console.error(err);
    }
  }

  public async postAll(
    options: RespObject,
    headers: Record<string, string>,
    bodyArray: string[]
  ) {

    try {
      const result = await Promise.all(bodyArray.map(item => 
        this.post(options, headers, item)
      ))

      return true
    } catch {
      (err: Error) => console.error(err);
    }
  }

  public async get<Data>(
      options: RespObject,
  ) {
    try {
      const method = 'GET';
      const response = await fetch(this.makeUrl(options), { method });
      const checkRespose: Response = Loader.errorHandler(response, Status.OK);

      if (checkRespose) {
        const data = response.json() as Promise<Data>;
        return data
      }
    } catch {
      (err: Error) => console.error(err);
    }
  }

  public async getHeaderValue(options: RespObject, headersName: string) {
    try {
      const method = 'GET';
      const response = await fetch(this.makeUrl(options), { method });
      const checkRespose: Response = Loader.errorHandler(response, Status.OK);

      if (checkRespose) {
        return  response.headers.get(headersName)

      }
    } catch {
      (err: Error) => console.error(err);
    }
  }

  private static errorHandler(res: Response, status: number): Response {
    if (!(res.status === status)) {
      if (res.status === Status['Not Found']) {
        console.log(
          `Sorry, but there is ${res.status} error: ${res.statusText}`,
        );
      }

      throw Error(res.statusText);
    }

    return res;
  }

  private makeUrl(options: RespObject): string {
    const { endpoint, gueryParams } = options

    let url = `${this.baseLink}${endpoint}?`;

    Object.keys(gueryParams).forEach((key) => {
      gueryParams[key] && (url += `${key}=${gueryParams[key]}&`);
    });

    return url.slice(0, -1);
  }
}

export default Loader;
