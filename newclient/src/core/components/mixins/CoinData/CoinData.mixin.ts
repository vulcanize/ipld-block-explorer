import { Component, Vue } from 'vue-property-decorator'
import { getAllContracts, getLatestPrices } from './getLatestPrices.graphql'
import { getAllContracts_getAllContracts as ContractsType } from './apolloTypes/getLatestPrices'

const ETHER_ID = 'ethereum'

@Component({
    apollo: {
      allContracts: {
            query: getAllContracts,
            // fetchPolicy: 'cache-and-network',
            // pollInterval: 300000,
            // update: data => {
            //     return data.getLatestPrices
            // },
            // skip() {
            //     return this.isRopsten
            // },
            result({ data, ...other }) {
              console.log('getAllContracts ', data, other)
                if (data && data.getAllContracts.node && data.getAllContracts.node.length > 0) {
                    this.getAllContracts = data.getAllContracts.node
                    // data.getAllContracts.node.forEach((token, index) => {
                    //     if (token.id === ETHER_ID) {
                    //         this.etherPrice = token.current_price
                    //     } else if (this.hasData(token)) {
                    //         this.tokensMarketInfo.set(token.contract.toLowerCase(), token)
                    //     } else {
                    //         this.getLatestPrices.splice(index, 1)
                    //     }
                    // })
                    this.isLoadingTokensMarketData = false
                }
                // this.isLoadingTokensMarketData = false
            }
        }
    }
})
export class CoinData extends Vue {
    isRopsten: boolean = false
    // getLatestPrices!: TokenMarketData[]
    // tokensMarketInfo = new Map<string, TokenMarketData>()
    getAllContracts!: ContractsType[]
    tokensMarketInfo = new Map<string, ContractsType>()
    isLoadingTokensMarketData = true
    etherPrice: number = 0

    get ethPrice(): number | undefined {
        return this.isLoadingTokensMarketData || this.etherPrice === 0 ? undefined : this.etherPrice
    }

    /**
     * Fetch EthereumTokens
     * @returns {Array} TokenMarketData or {Boolean}
     */
    getEthereumTokens(): ContractsType[] | false {
        return false
    }
    /**
     * Generate ethereum token map
     * @param contract String[]
     * @returns {Map} TokenMarketData or {Boolean}
     */
    getEthereumTokensMap(contracts: string[]): Map<string, ContractsType> | false {
        // if (!this.isLoadingTokensMarketData) {
        //     const requestMarketInfo = new Map<string, ContractsType>()
        //     contracts.forEach(contract => {
        //         const token = this.tokensMarketInfo.get(contract.toLowerCase())
        //         if (token && token.contract) {
        //             requestMarketInfo.set(token.contract.toLowerCase(), token)
        //         }
        //     })
        //     if (requestMarketInfo.size > 0) {
        //         return requestMarketInfo
        //     }
        // }
        return false
    }
    /**
     * Generate ethereum tokens by contract
     * @param contract String[]
     * @returns {Map} TokenMarketData or {Boolean}
     */
    getEthereumTokenByContract(contract: string): ContractsType | false {
        // if (!this.isLoadingTokensMarketData) {
        //     const token = this.tokensMarketInfo.get(contract.toLowerCase())
        //     if (token) {
        //         return token
        //     }
        // }
        return false
    }
    /**
     * Check if token has data
     * @param token TokenMarketData
     * @returns {Boolean}
     */
    hasData(token: ContractsType): boolean {
        // if (token.contract === null || token.current_price === null || token.market_cap === null || token.total_supply === null) {
        //     return false
        // }
        return true
    }
}
