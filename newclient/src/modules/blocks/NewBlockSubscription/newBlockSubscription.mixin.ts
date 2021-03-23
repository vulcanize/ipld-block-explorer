import { Component, Vue } from 'vue-property-decorator'
import newBlockFeed from './newBlockFeed.graphql'
import { newBlockFeed_newBlockFeed as newBlockFeedType } from './apolloTypes/newBlockFeed'

@Component({
    apollo: {
        $subscribe: {
            addressEvent: {
                query: newBlockFeed,
                result({ data }) {
                    this.hasNewBlockUpdateError = false
                    const number = data.listen.query.allHeaderCidsV2.nodes.length
                    const timestamp = data.listen.query.allHeaderCidsV2.nodes[0].timestamp
                    this.newBlock = {
                        number, timestamp, miner: null, txCount: null
                    }
                },
                error() {
                    this.hasNewBlockUpdateError = true
                }
            }
        }
    }
})
export class NewBlockSubscription extends Vue {
    newBlock: newBlockFeedType | null = null
    hasNewBlockUpdateError = false

    get newBlockNumber(): number | undefined {
        return this.newBlock ? this.newBlock.number : undefined
    }
    get newTxs(): number | undefined {
        return this.newBlock ? this.newBlock.txCount : undefined
    }
}
