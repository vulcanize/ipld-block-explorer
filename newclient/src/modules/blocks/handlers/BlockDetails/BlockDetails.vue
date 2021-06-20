<template>
    <!--
    =====================================================================================
      DETAILS LIST
    =====================================================================================
    -->
    <v-layout row wrap justify-start class="mb-4">
        <v-flex xs12>
            <app-details-list :details="blockDetails" :is-loading="loading" :max-items="9" :is-block="true" class="mb-4">
                <template #title>
                    <block-details-title
                        :next-block="nextBlock"
                        :prev-block="previousBlock"
                        :uncles="uncleHashes"
                        :loading="loading"
                        :is-subscribed="subscribed"
                    />
                    <v-divider class="lineGrey" />
                </template>
            </app-details-list>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import AppDetailsList from '@app/core/components/ui/AppDetailsList.vue'
import BlockDetailsTitle from '@app/modules/blocks/components/BlockDetailsTitle.vue'
import { Detail, Crumb } from '@app/core/components/props'
import { eth } from '@app/core/helper'
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { NumberFormatMixin } from '@app/core/components/mixins/number-format.mixin'
import { getBlockByNumber, getBlockByHash, getLastBlockNumber, getHeaderByNumber } from './blockDetails.graphql'
import { HeaderDetails as HeaderDetailsType } from './apolloTypes/BlockDetails'
import { getLastBlockNumber_getLatestBlockInfo as lastBlockType } from './apolloTypes/getLastBlockNumber'
import { FormattedNumber } from '@app/core/helper/number-format-helper'
import { NewBlockSubscription } from '@app/modules/blocks/NewBlockSubscription/newBlockSubscription.mixin'
import BN from 'bignumber.js'
import { ErrorMessageBlock } from '@app/modules/blocks/models/ErrorMessagesForBlock'
import newBlockFeed from '../../NewBlockSubscription/newBlockFeed.graphql'
import { excpBlockNotMined } from '@app/apollo/exceptions/errorExceptions'
import { decodeHeaderData, decodeExtra } from '@vulcanize/eth-watcher-ts/dist/utils'

@Component({
    components: {
        AppDetailsList,
        BlockDetailsTitle
    },
    apollo: {
        header: {
            query() {
                return this.isHash ? getBlockByHash : getHeaderByNumber
            },
            // fetchPolicy: 'network-only',
            variables() {
                return { blockRef: this.isHash ? this.blockRef : parseInt(this.blockRef) }
            },
            // skip() {
            //     return this.subscribed
            // },
            update: data => data.getBlockByHash || data.getHeaderById,
            result({ data }) {
                if (data.ethHeaderCidByBlockNumber && data.ethHeaderCidByBlockNumber.nodes.length) {
                    const block = data.ethHeaderCidByBlockNumber.nodes[0]
                    const uncle = block.uncleCidsByHeaderId.nodes || []
                    const trans = block.ethTransactionCidsByHeaderId.nodes || []

                    const _obj = decodeHeaderData(block.blockByMhKey.data)
                    const headerSize: number = block.blockByMhKey.data.slice(2).length / 2
                    const unclesSize: number = uncle.reduce((sz, { blockByMhKey: { data } }) => sz + data.slice(2).length / 2, 0)
                    const txheadsSize: number = trans.reduce((sz, { blockByMhKey: { data } }) => sz + data.slice(2).length / 2, 0)
                    const transactionsCount = trans.totalCount

                    this.header = { ...block, ..._obj, transactionsCount, size: headerSize + unclesSize + txheadsSize }
                }
                if (this.header) {
                    if (this.isHash) {
                        this.emitBlockNumber()
                    }
                    this.$emit('isMined', true)
                    this.emitErrorState(false)
                }
            },
            error(error) {
                const newError = JSON.stringify(error.message)
                if (newError.toLowerCase().includes(excpBlockNotMined) && !this.isHash && !this.subscribed) {
                    this.startSubscription()
                } else {
                    this.emitErrorState(true)
                }
            }
        },
        // getLatestBlockInfo: {
        //     query: getLastBlockNumber,
        //     fetchPolicy: 'cache-and-network'
        // }
    }
})
export default class BlockDetails extends Mixins(NumberFormatMixin, NewBlockSubscription) {
    @Prop({ type: String }) blockRef!: number
    @Prop({ type: Boolean, default: false }) isHash!: boolean

    hasError = false
    syncing: undefined
    header!: HeaderDetailsType
    getLatestBlockInfo!: lastBlockType
    skipDetailsFetch = false
    subscribed = false

    get loading(): boolean | undefined {
        return this.hasError ? this.hasError : this.$apollo.queries.header.loading // || this.subscribed
    }

    get uncleHashes(): (string | null)[] {
        return []
    }

    get blockDetails(): Detail[] {
        let details: Detail[]
        if (this.loading) {
            details = [
                {
                    title: this.$i18n.t('common.height')
                },
                {
                    title: this.$i18n.t('common.hash')
                },
                {
                    title: this.$i18n.t('block.p-hash')
                },
                {
                  title: this.$i18n.t('common.timestmp')
                },
                {
                  title: this.$i18n.t('miner.total-rewards')
                },
                {
                    title: this.$i18n.t('miner.name')
                },
                {
                    title: this.$i18n.t('uncle.reward')
                },
                {
                    title: this.$i18n.tc('tx.name', 2)
                },
                {
                    title: this.$i18n.t('diff.name')
                }
            ]
        } else {
          details = [
                {
                    title: this.$i18n.t('common.height'),
                    detail: this.header.blockNumber
                },
                {
                    title: this.$i18n.t('block.cid'),
                    detail: this.header.cid,
                    copy: true,
                    mono: true
                },
                {
                    title: this.$i18n.t('common.hash'),
                    detail: this.header.blockHash,
                    copy: true,
                    mono: true
                },
                {
                    title: this.$i18n.t('block.p-hash'),
                    detail: this.header.parentHash!,
                    // link: `/block/hash/${'this.block.parentHash'}`,
                    copy: true,
                    mono: true
                },
                {
                    title: this.$i18n.t('common.timestmp'),
                    detail: this.header.time
                },
                {
                  title: this.$i18n.t('miner.name'),
                  detail: this.header.address,
                  // link: `/address/${this.header.address}`,
                  // copy: true,
                  // mono: true,
                  // toChecksum: true
                },
                {
                  title: this.$i18n.t('miner.total-rewards'),
                  detail: `${this.rewards.value} ${this.rewards.unit}`,
                  tooltip: `${this.rewards.tooltipText} ${this.$i18n.t('common.eth')}` || undefined
                },
                {
                    title: this.$i18n.tc('tx.fee', 2),
                    detail: '-', // `${this.transactionFees.value} ${this.transactionFees.unit}`,
                    // tooltip: '', // this.transactionFees.tooltipText ? `${this.transactionFees.tooltipText} ${this.$i18n.t('common.eth')}` : undefined
                },

                {
                    title: this.$i18n.t('uncle.reward'),
                    detail: '-', // `${this.uncleRewards.value} ${this.uncleRewards.unit}`,
                    // tooltip: '', // this.uncleRewards.tooltipText ? `${this.uncleRewards.tooltipText} ${this.$i18n.t('common.eth')}` : undefined
                },
                {
                    title: this.$i18n.tc('tx.name', 2),
                    detail: this.header.transactionsCount, // this.transactionsCount
                },
                {
                    title: this.$i18n.t('diff.name'),
                    detail: this.formatNumber(new BN(this.header.difficulty).toNumber()),
                },
                {
                    title: this.$i18n.t('diff.total'),
                    detail: this.formatNumber(new BN(this.header.td).toNumber())
                },
                {
                    title: this.$i18n.t('common.size'),
                    detail: `${this.formatNumber(new BN(this.header.size).toNumber())} Byte`,
                },
                {
                    title: this.$i18n.t('common.nonce'),
                    detail: this.formatNumber(new BN(this.header.nonce).toNumber())
                },
                {
                    title: this.$i18n.t('block.state-root'),
                    detail: this.header.stateRoot,
                    mono: true
                },
                {
                    title: this.$i18n.t('block.data'),
                    txInput: [
                        decodeExtra(this.header.extra),
                        `(Hex: ${this.header.extra})`
                    ],
                    mono: true
                },

                {
                    title: this.$i18n.t('gas.limit'),
                    detail: this.formatNumber(new BN(this.header.gasLimit, 16))
                },
                {
                    title: this.$i18n.t('gas.used'),
                    detail: this.formatNumber(new BN(this.header.gasUsed, 16))
                },
                {
                    title: this.$i18n.t('block.logs'),
                    detail: '-', // this.block.logsBloom,
                    // mono: true
                },
                {
                    title: this.$i18n.t('tx.root'),
                    detail: this.header.txRoot, // td = transaction?,
                    // mono: true
                },
                {
                    title: this.$i18n.t('block.rcpt-root'),
                    detail: this.header.receiptRoot,
                    mono: true
                },
                {
                    title: `${this.$i18n.tc('uncle.name', 2)} ${this.$i18n.t('common.sha')}`,
                    detail: `0x${this.header.uncleHash}`, // this.block.sha3Uncles,
                    mono: true
                }
            ]
        }
        return details
    }
    get rewards(): FormattedNumber {
      return this.formatVariableUnitEthValue(new BN(this.header.reward))
    }
    get uncleRewards(): FormattedNumber | string {
        return 'this.formatVariableUnitEthValue(new BN(this.header.summary.rewards.uncles))'
    }
    // get transactionFees(): FormattedNumber | string {
    //     // return this.formatVariableUnitEthValue(new BN(this.header.gasLimit, 16).multipliedBy(new BN(this.header.gasUsed)))
    //     // return 'this.formatVariableUnitEthValue(new BN(this.header.summary.rewards.txFees))'
    // }
    get transactionsCount(): string {
        // const failed = this.block.summary.txFail ? 1 : 2
        // const failedString = this.block.summary.txFail > 0 ? `, ${this.formatNumber(this.header.summary.txFail)} ${this.$tc('tx.failed', failed)}` : ''
        return '' // `${this.formatNumber(this.block.summary.txCount)} ${failedString}`
    }
    get lastBlock(): number | undefined {
        if (!this.$apollo.queries.getLatestBlockInfo.loading) {
            const latestBlockNum = this.getLatestBlockInfo ? this.getLatestBlockInfo.number : undefined
            return this.newBlockNumber ? this.newBlockNumber : latestBlockNum
        }
        return undefined
    }
    get nextBlock(): String | null {
        // const next = this.header ? this.header.summary.number + 1 : -1
        // if (this.lastBlock && this.lastBlock >= next) {
        //     return `/block/number/${next}`
        // }
        return ''
    }

    get previousBlock(): string {
        // const prev = this.block ? this.block.summary.number - 1 : -1
        // if (prev >= 0) {
        //     return `/block/number/${prev}`
        // }
        return ''
    }

    /**
     * Method to start subscription
     */
    startSubscription(): void {
        // this.subscribed = true
        // const observer = this.$apollo.subscribe({
        //     query: newBlockFeed
        // })
        // const a = observer.subscribe({
        //     next: data => {
        //         if (new BN(data.data.newBlockFeed.number).isGreaterThanOrEqualTo(new BN(this.blockRef))) {
        //             a.unsubscribe()
        //             this.subscribed = false
        //         }
        //     },
        //     error: error => {
        //         this.emitErrorState(true)
        //     }
        // })
    }

    /**
     * Emits error to Sentry
     * @param val {Boolean}
     */
    emitErrorState(val: boolean): void {
        this.hasError = val
        this.$emit('errorDetails', this.hasError, ErrorMessageBlock.details)
    }
    /**
     * Emits setBlockNumber to parent
     */
    emitBlockNumber(): void {
        // this.$emit('setBlockNumber', this.header.reward)
    }
}
</script>
