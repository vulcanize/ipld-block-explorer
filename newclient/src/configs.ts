declare global {
  interface Window {
    configs:any;
  }
}

const configs = {
    APOLLO_HTTP: window.configs && window.configs.VUE_APP_HTTP_LINK || process.env.VUE_APP_HTTP_LINK,
    APOLLO_WS: window.configs && window.configs.VUE_APP_WS_CLIENT || process.env.VUE_APP_WS_CLIENT,
    OPENSEA: window.configs && window.configs.VUE_APP_OPENSEA_API || process.env.VUE_APP_OPENSEA_API,
    NODE_ENV: process.env.NODE_ENV,
    VERSION: process.env.VERSION,
    ROUTER_MODE: process.env.ROUTER_MODE || 'history'
}

console.log(configs, window.configs);
export default configs
