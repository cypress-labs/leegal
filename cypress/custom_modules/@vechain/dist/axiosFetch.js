class AxiosFetch {
  constructor(config) {
    this.baseURL = config?.baseURL || '';
    this.timeout = config?.timeout || 0;
    this.defaults = {
      baseURL: this.baseURL,
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      transformRequest: [data => JSON.stringify(data)],
      transformResponse: [data => JSON.parse(data)],
      paramsSerializer: params =>
        Object.keys(params)
          .map(
            key =>
              `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
          )
          .join('&'),
      timeout: this.timeout,
      withCredentials: false,
      responseType: 'json',
      validateStatus: status => status >= 200 && status < 300,
      maxRedirects: 5,
      decompress: true,
    };
  }

  create(config) {
    const instance = new AxiosFetch(this.defaults);
    return Object.assign(instance, config);
  }

  request(config) {
    const mergedConfig = {...this.defaults, ...config};
    const url = this.buildUrl(mergedConfig);
    const options = this.buildOptions(mergedConfig);

    return fetch(url, options).then(response =>
      this.handleResponse(response, mergedConfig),
    );
  }

  get(url, config) {
    return this.request({...config, method: 'get', url});
  }

  delete(url, config) {
    return this.request({...config, method: 'delete', url});
  }

  head(url, config) {
    return this.request({...config, method: 'head', url});
  }

  options(url, config) {
    return this.request({...config, method: 'options', url});
  }

  post(url, data, config) {
    return this.request({...config, method: 'post', url, data});
  }

  put(url, data, config) {
    return this.request({...config, method: 'put', url, data});
  }

  patch(url, data, config) {
    return this.request({...config, method: 'patch', url, data});
  }

  getUri(config) {
    return this.buildUrl(config);
  }

  buildUrl(config) {
    const {baseURL, url, params} = config;
    const absoluteUrl = url.startsWith('http') ? url : baseURL + url;
    return absoluteUrl;
    //const queryString = this.buildQueryString(params);
    //return queryString ? `${absoluteUrl}?${queryString}` : absoluteUrl;
  }

  buildOptions(config) {
    const {
      method,
      headers,
      data,
      timeout,
      withCredentials,
      responseType,
      decompress,
    } = config;

    const options = {
      method,
      headers,
      timeout,
      credentials: withCredentials ? 'include' : 'omit',
      compress: decompress,
    };

    if (['post', 'put', 'patch'].includes(method)) {
      options.body = data;
    }

    return options;
  }

  buildQueryString(params) {
    return params ? this.defaults.paramsSerializer(params) : '';
  }

  handleResponse(response, config) {
    const {transformResponse, validateStatus} = config;
    return response.text().then(data => {
      if (!validateStatus(response.status)) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return transformResponse.reduce(
        (result, transformer) => transformer(result),
        data,
      );
    });
  }
}

module.exports = AxiosFetch;
