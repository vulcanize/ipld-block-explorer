const configs = {
    APOLLO_HTTP: process.env.VUE_APP_HTTP_LINK || 'http://192.168.0.102:5000/graphql', // 'https://api.ethvm.com', // http://localhost:5000
    APOLLO_WS: process.env.VUE_APP_WS_CLIENT || 'ws://192.168.0.102:5000/graphql', // 'wss://apiws.ethvm.com', // wss://localhost:5020
    OPENSEA: process.env.VUE_APP_OPENSEA_API || '', // 'https://nft.mewapi.io',
    NODE_ENV: process.env.NODE_ENV,
    VERSION: process.env.VERSION,
    ROUTER_MODE: process.env.ROUTER_MODE || 'history'
}
export default configs
