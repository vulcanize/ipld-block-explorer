declare global {
  interface Window {
    configs:any;
  }
}
let isPoa;
if (window.configs) {
  if (typeof window.configs.VUE_APP_IS_POA_NETWORK == "boolean") {
    isPoa = window.configs.VUE_APP_IS_POA_NETWORK;
  }
} else {
  const envValue = process.env.VUE_APP_IS_POA_NETWORK;
  const value = envValue ? envValue.toLowerCase() : "";

  isPoa = ["true", "1"].indexOf(value as string) >= 0;
}

const configs = {
    APOLLO_HTTP: window.configs && window.configs.VUE_APP_HTTP_LINK || process.env.VUE_APP_HTTP_LINK,
    APOLLO_WS: window.configs && window.configs.VUE_APP_WS_CLIENT || process.env.VUE_APP_WS_CLIENT,
    OPENSEA: window.configs && window.configs.VUE_APP_OPENSEA_API || process.env.VUE_APP_OPENSEA_API,
    IS_POA_NETWORK: isPoa,
    NODE_ENV: process.env.NODE_ENV,
    VERSION: process.env.VERSION,
    ROUTER_MODE: process.env.ROUTER_MODE || 'history'
}

export default configs
