<template>
    <v-card color="white" flat class="pt-3 pb-2">
        <app-table-title :title="getTitle" :has-pagination="showPagination" :page-type="pageType" page-link="/txs">
            <template v-if="!isHome && !isBlock" #update>
                <app-new-update :text="$t('message.update.txs')" :update-count="newMinedTransfers" :hide-count="true" @reload="setPage(0, true)" />
            </template>
            <template v-if="showPagination && !initialLoad" #pagination>
                <app-paginate
                    v-if="isBlock"
                    :total="totalPages"
                    :current-page="index"
                    :has-input="isBlock"
                    :has-first="isBlock"
                    :has-last="isBlock"
                    @newPage="setPage"
                />
                <app-paginate-has-more v-else :has-more="hasMore" :current-page="index" :loading="loading" @newPage="setPage" /> </template
        ></app-table-title>
        <table-txs :max-items="maxItems" :index="index" :is-loading="loading" :table-message="message" :txs-data="transactions" :is-scroll-view="isHome" />
<!--        <v-layout-->
<!--            v-if="showPagination && !initialLoad"-->
<!--            :justify-end="$vuetify.breakpoint.mdAndUp"-->
<!--            :justify-center="$vuetify.breakpoint.smAndDown"-->
<!--            row-->
<!--            class="pb-1 pr-3 pl-2"-->
<!--        >-->
<!--            <app-paginate-->
<!--                v-if="isBlock"-->
<!--                :total="totalPages"-->
<!--                :current-page="index"-->
<!--                :has-input="isBlock"-->
<!--                :has-first="isBlock"-->
<!--                :has-last="isBlock"-->
<!--                @newPage="setPage"-->
<!--            />-->
<!--            <app-paginate-has-more v-else :has-more="hasMore" :current-page="index" :loading="loading" @newPage="setPage" />-->
<!--        </v-layout>-->
    </v-card>
</template>

<script lang="ts">
import AppTableTitle from '@app/core/components/ui/AppTableTitle.vue'
import AppPaginate from '@app/core/components/ui/AppPaginate.vue'
import AppPaginateHasMore from '@app/core/components/ui/AppPaginateHasMore.vue'
import AppNewUpdate from '@app/core/components/ui/AppNewUpdate.vue'
import TableTxs from '@app/modules/txs/components/TableTxs.vue'
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import BN from 'bignumber.js'
import { getBlockTransfers, getAllTxs, newTransfersCompleteFeed, getTransactions, newTransactions } from './queryTransfers.graphql'
import {
    getBlockTransfers_getBlockTransfers as TypeBlockTransfers,
    getBlockTransfers_getBlockTransfers_transfers as TypeTransfers,
    allEthTransactionCids_allEthTransactionCids as TypeEthTransaction,
    NodesTransaction
} from './apolloTypes/getBlockTransfers'
import { newTransfersCompleteFeed as TypeTransfersSubscribtion } from './apolloTypes/newTransfersCompleteFeed'
import { getAllTxs_getAllEthTransfers as AllTxType } from './apolloTypes/getAllTxs'
import { TransferType } from '@app/apollo/global/globalTypes'
import { ErrorMessageBlock } from '@app/modules/blocks/models/ErrorMessagesForBlock'
import { excpInvariantViolation } from '@app/apollo/exceptions/errorExceptions'
import { decodeTransactionData } from '@vulcanize/eth-watcher-ts/dist/utils'

@Component({
    components: {
        AppTableTitle,
        AppPaginate,
        AppPaginateHasMore,
        AppNewUpdate,
        TableTxs
    },
    apollo: {
        allEthTransactionCids: {
            query: getTransactions,
            fetchPolicy: 'network-only',
            // skip() {
            //     return this.skipBlockTxs
            // },
            variables() {
                return {
                    last: this.maxItems,
                    before: null
                }
            },
            result({ data }) {
                if (data && data.allEthTransactionCids && data.allEthTransactionCids.nodes) {
                    this.allEthTransactionCids.nodes = data.allEthTransactionCids.nodes.map(node => {
                        const decodedData = decodeTransactionData(node.ethHeaderCidByHeaderId.blockByMhKey.data)
                        return {...node, ...decodedData}
                    })
                    this.totalPages = Math.ceil(data.allEthTransactionCids.totalCount / this.maxItems)
                    this.emitErrorState(false)
                    this.initialLoad = false
                }
            },
            error(error) {
                this.emitErrorState(true)
            }
        },
        // getAllEthTransfers: {
        //     query: getAllTxs,
        //     fetchPolicy: 'network-only',
        //     variables() {
        //         return {
        //             _limit: this.maxItems,
        //             _nextKey: null
        //         }
        //     },
        //     skip() {
        //         return this.isBlock
        //     },
        //     result({ data }) {
        //         if (data && data.getAllEthTransfers && data.getAllEthTransfers.transfers) {
        //             this.initialLoad = false
        //             this.emitErrorState(false)
        //         } else {
        //             this.emitErrorState(true)
        //         }
        //     },
        //     error(error) {
        //         this.emitErrorState(true)
        //     }
        // },
        $subscribe: {
            newTransactions: {
                query: newTransactions,
                // skip() {
                //     return this.isBlock
                // },
                result({ data }) {
                    if (data.listen.query.allEthTransactionCids.nodes.length) {
                        if (this.isHome) {
                            const variables = {
                                last: this.maxItems,
                                before: null
                            }
                            this.$apollo.queries.allEthTransactionCids.refetch(variables)
                            this.emitErrorState(false)
                        } else {
                            this.newMinedTransfers++
                        }
                    }
                },
                error(error) {
                    this.emitErrorState(error)
                }
            }
        }
    }
})
export default class BlockTxs extends Vue {
    @Prop(Number) maxItems!: number
    @Prop({ type: String, default: 'home' }) pageType!: string
    @Prop(String) blockRef?: string
    @Prop({ type: Boolean, default: false }) isMined!: boolean

    initialLoad = true
    // getBlockTransfers!: TypeBlockTransfers
    allEthTransactionCids!: TypeEthTransaction
    getAllEthTransfers!: AllTxType
    index = 0
    totalPages = 0
    isEnd = 0
    newMinedTransfers = 0
    hasError = false

    get transactions(): NodesTransaction[] | [] {
        // if (this.isBlock && this.getBlockTransfers && this.getBlockTransfers.transfers !== null) {
        //     return this.getBlockTransfers.transfers
        // }
        // if (!this.isBlock && this.getAllEthTransfers && this.getAllEthTransfers.transfers !== null) {
        //     return this.getAllEthTransfers.transfers
        // }
        // if (!this.isBlock && this.EthTransactions && this.getAllEthTransfers.transfers !== null) {
        //     return this.getAllEthTransfers.transfers
        // }
        return (this.allEthTransactionCids || {}).nodes || []
    }

    get message(): string {
        if (this.loading) {
            return ''
        }
        if (this.isBlock && this.transactions.length === 0) {
            return `${this.$t('message.tx.no-in-block')}`
        }
        return ''
    }

    get isHome(): boolean {
        return this.pageType === 'home'
    }

    get isBlock(): boolean {
        return this.pageType === 'blockDetails'
    }
    get skipBlockTxs(): boolean {
        return !(this.isBlock && this.isMined)
    }

    get getTitle(): string {
        return this.isBlock ? `${this.$t('block.txs')}` : `${this.$tc('tx.last', 1)}`
    }
    get showPagination(): boolean {
        // if (this.isHome) {
        //     return false
        // }
        // if (this.isBlock) {
        //     return this.totalPages > 1
        // }
        //
        // return this.hasMore
        return !this.isHome
    }

    get loading(): boolean {
        if (this.hasError) {
            return true
        }
        if (this.isBlock || this.isHome) {
            return this.initialLoad || this.$apollo.queries.allEthTransactionCids.loading
        }
        return this.$apollo.queries.allEthTransactionCids.loading
    }
    get hasMore(): boolean {
        if (!this.isHome && !this.isBlock) {
            return this.allEthTransactionCids ? this.allEthTransactionCids.pageInfo.hasPreviousPage : false
        }
        return false
    }

    /**
     * Sets page number and reset value and emit
     * @param page {Number}
     * @param reset {Boolean}
     */
    async setPage(page: number, reset: boolean = false): Promise<boolean> {
        try {
            if (reset) {
                this.isEnd = 0
                if (!this.isHome && !this.isBlock) {
                    this.newMinedTransfers = 0
                }
                const variables = {
                    last: this.maxItems,
                    before: null
                }
                await this.$apollo.queries.allEthTransactionCids.refetch(variables)
            } else {
                if (!this.isBlock && page > this.isEnd && this.hasMore) {
                    await this.$apollo.queries.allEthTransactionCids.fetchMore({
                        variables: {
                            last: this.maxItems,
                            before: this.allEthTransactionCids.pageInfo.startCursor
                        },
                        updateQuery: (previousResult, { fetchMoreResult }) => {
                            this.isEnd = page
                            this.index = page
                            const newT = fetchMoreResult.allEthTransactionCids.nodes
                            const prevT = previousResult.allEthTransactionCids.nodes
                            return {
                                ...previousResult,
                                allEthTransactionCids: {
                                    __typename: previousResult.allEthTransactionCids.__typename,
                                    pageInfo: fetchMoreResult.allEthTransactionCids.pageInfo,
                                    nodes: [...prevT, ...newT],
                                }
                            }
                        }
                    })
                }
            }

            this.index = page
            return true
        } catch (e) {
            const newE = JSON.stringify(e)
            if (!newE.toLowerCase().includes(excpInvariantViolation)) {
                throw new Error(newE)
            }
            return false
        }
    }
    /**
     * Emit error to Sentry
     * @param val {Boolean}
     */
    emitErrorState(val: boolean): void {
        this.hasError = val
        this.$emit('errorTxs', this.hasError, ErrorMessageBlock.blockTxs)
    }

    // @Watch('allEthTransactionCids')
    // onEthTransactionsChanged(newVal: string, oldVal: string) {
    //     console.log('allEthTransactionCids WATCH ', newVal)
    //     if (newVal !== oldVal) {
    //         this.initialLoad = true
    //         this.hasError = false
    //     }
    // }
}
</script>
<style scoped lang="css">
.tx-filter-select-container {
    border: solid 1px #efefef;
    padding-top: 1px;
}
.tx-status {
    min-width: 60px;
}
</style>
