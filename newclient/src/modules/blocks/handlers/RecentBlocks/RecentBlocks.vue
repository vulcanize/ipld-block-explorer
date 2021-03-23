<template>
    <v-card color="white" flat class="pt-3 pb-3">
        <app-table-title :title="getTitle" :has-pagination="showPagination" :page-type="pageType" page-link="/blocks">
            <template v-if="!isHome" #update>
                <notice-new-block @reload="setPage(0, true)" />
            </template>
            <template v-if="showPagination && !initialLoad" #pagination>
                <app-paginate
                    :total="totalPages"
                    :current-page="currentPage"
                    :has-input="false"
                    :has-first="true"
                    :has-last="true"
                    @newPage="setPage"
                /> </template
        ></app-table-title>
        <table-blocks :max-items="maxItems" :index="index" :is-loading="loading" :table-message="message" :block-data="blocks" :is-scroll-view="isHome" />
        <v-layout
            v-if="showPagination && !initialLoad"
            :justify-end="$vuetify.breakpoint.mdAndUp"
            :justify-center="$vuetify.breakpoint.smAndDown"
            row
            class="pb-1 pr-3 pl-2"
        >
            <app-paginate
                :total="totalPages"
                :current-page="currentPage"
                :has-input="true"
                :has-first="true"
                :has-last="true"
                @newPage="setPage"
            />
        </v-layout>
    </v-card>
</template>

<script lang="ts">
import AppTableTitle from '@app/core/components/ui/AppTableTitle.vue'
import TableBlocks from '@app/modules/blocks/components/TableBlocks.vue'
import AppPaginate from '@app/core/components/ui/AppPaginate.vue'
import NoticeNewBlock from '@app/modules/blocks/components/NoticeNewBlock.vue'
import { Component, Prop, Watch, Vue } from 'vue-property-decorator'
import BN from 'bignumber.js'
import { getBlocksArrayByNumber, newBlockTable, allHeaders, AllBlocks, newBlocks } from './recentBlocks.graphql'
import { allEthHeaderCids_allEthHeaderCids as TypeHeaders, EthHeaderCidsBlock } from './apolloTypes/getBlocksArrayByNumber'
import { ErrorMessageBlock } from '@app/modules/blocks/models/ErrorMessagesForBlock'
import { excpInvariantViolation } from '@app/apollo/exceptions/errorExceptions'

interface BlockMap {
    [key: number]: EthHeaderCidsBlock
}

@Component({
    components: {
        AppTableTitle,
        AppPaginate,
        NoticeNewBlock,
        TableBlocks
    },
    apollo: {
        allHeaderCidsV2: {
            // query: allHeaders,
            query: AllBlocks,
            variables() {
                return {
                    limit: this.maxItems,
                    fromBlock: null,
                }
            },
            fetchPolicy: 'network-only',
            // subscribeToMore: [
            //     {
            //         document: newBlockTable,fromBlock
            //         updateQuery: (previousResult, { subscriptionData }) => {
            //             try {
            //                 if (previousResult && subscriptionData.data.newBlockFeed) {
            //                     const prevB = previousResult.getBlocksArrayByNumber
            //                     const newB = subscriptionData.data.newBlockFeed
            //                     newB.txFail = 0
            //                     const index = prevB.findIndex(block => block.number === newB.number)
            //                     if (index != -1) {
            //                         prevB[index] = newB
            //                         return previousResult
            //                     }
            //                     return {
            //                         __typename: 'BlockSummary',
            //                         getBlocksArrayByNumber: [newB, ...prevB]
            //                     }
            //                 }
            //             } catch (error) {
            //                 throw error
            //             }
            //         }
            //     }
            // ],
            subscribeToMore: [
                {
                    document: newBlocks,
                    updateQuery: (previousResult, { subscriptionData }) => {
                        try {
                            if (previousResult && subscriptionData.data.listen.query.allHeaderCidsV2) {
                                const prevB = previousResult.allHeaderCidsV2.nodes
                                const [newB] = subscriptionData.data.listen.query.allHeaderCidsV2.nodes
                                newB.txFail = 0
                                const index = prevB.findIndex(block => block.blockNumber === newB.blockNumber)
                                if (index != -1) {
                                    prevB[index] = newB
                                    return previousResult
                                }
                                return {
                                    __typename: 'EthHeaderCidsConnection',
                                    ...subscriptionData.data.listen.query,
                                    allHeaderCidsV2: {
                                        ...subscriptionData.data.listen.query.allHeaderCidsV2,
                                        nodes: [newB, ...prevB]
                                    }
                                }
                            }
                        } catch (error) {
                            throw error
                        }
                    }
                }
            ],

            result({ data }) {
                if (data && data.allHeaderCidsV2 && data.allHeaderCidsV2.nodes) {
                    this.emitErrorState(false)
                    if (this.initialLoad) {
                        this.startBlock = data.allHeaderCidsV2.nodes[0].blockNumber
                        this.index = 0
                        this.totalPages = Math.ceil(data.allHeaderCidsV2.totalCount / this.maxItems)
                        this.initialLoad = false
                    }
                    // if (this.pageType === 'home') {
                    //     if (this.getBlocksArrayByNumber[0].number - this.getBlocksArrayByNumber[1].number > 1) {
                    //         this.$apollo.queries.getBlocksArrayByNumber.refetch()
                    //     }
                    // }
                }
            },
            error(error) {
                this.initialLoad = true
                this.emitErrorState(error)
            }
        }
    }
})
export default class RecentBlocks extends Vue {
    @Prop(Number) maxItems!: number
    @Prop({ type: String, default: 'home' }) pageType!: string
    initialLoad = true
    hasError = false
    syncing?: boolean = false
    allHeaderCidsV2!: TypeHeaders
    indexedBlocks: BlockMap = {}
    index = 0
    totalPages = 0
    startBlock!: number
    get blocks(): EthHeaderCidsBlock[] | any {
        if (this.indexedBlocks && this.indexedBlocks[this.index]) {
            return this.indexedBlocks[this.index]
        }
        return (this.allHeaderCidsV2 || {}).nodes || []
    }

    get message() {
        return ''
    }

    get getTitle(): string {
        const titles = {
            blocks: this.$i18n.t('block.last'),
            address: this.$i18n.t('block.mined'),
            home: this.$i18n.t('block.last')
        }
        return titles[this.pageType]
    }
    get loading(): boolean {
        if (this.hasError) {
            return true
        }
        if (this.isHome) {
            return this.initialLoad
        }
        return this.$apollo.queries.allHeaderCidsV2.loading
    }
    get isHome(): boolean {
        return this.pageType === 'home'
    }
    get currentPage(): number {
        return this.index
    }
    get showPagination(): boolean {
        return !this.initialLoad && !this.isHome && this.startBlock - this.maxItems > 0
    }
    async setPage(page: number, reset: boolean = false): Promise<boolean> {
        try {
            this.index = page
            if (reset) {
                this.indexedBlocks = {}
                this.initialLoad = true
                const variables = {
                    limit: this.maxItems,
                    fromBlock: null,
                }
                await this.$apollo.queries.allHeaderCidsV2.refetch(variables)
            } else {
                const lastIndex = ((this.allHeaderCidsV2 || {}).nodes || []).length - 1
                const from = this.allHeaderCidsV2.nodes[lastIndex].blockNumber || 0
                if (from && !this.indexedBlocks[this.index]) {
                    await this.$apollo.queries.allHeaderCidsV2.fetchMore({
                        variables: {
                            fromBlock: from,
                            limit: this.maxItems
                        },
                        updateQuery: (previousResult, { fetchMoreResult }) => {
                            return fetchMoreResult
                        }
                    })
                }
            }
            return true
        } catch (e) {
            const newE = JSON.stringify(e)
            if (!newE.toLowerCase().includes(excpInvariantViolation)) {
                throw new Error(newE)
            }
            return false
        }
    }
    emitErrorState(val: boolean): void {
        this.hasError = val
        this.$emit('errorBlocksList', this.hasError, ErrorMessageBlock.list)
    }
    @Watch('allHeaderCidsV2', { deep: true })
    onAllHeaderCidsV2Changed(val: TypeHeaders, oldVal: TypeHeaders) {
        if ((val || {}).nodes != (oldVal || {}).nodes) {
            this.$set(this.indexedBlocks, this.index, val.nodes)
        }
    }
    mounted() {
        if (!this.isHome) {
            this.$apollo.skipAllSubscriptions = true
        }
    }
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
