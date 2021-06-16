<template>
    <!--
    =====================================================================================
      TX DETAILS LIST
    =====================================================================================
    -->
    <v-layout row wrap justify-start class="mb-4">
        <v-flex xs12>
            <app-details-list :title="title" :details="txDetails" :is-loading="isLoading" :max-items="7">
                <template v-if="!isLoading" #title>
                    <tx-details-title :status="status" />
                </template>
            </app-details-list>
        </v-flex>
    </v-layout>
</template>

<script lang="ts">
import AppDetailsList from '@app/core/components/ui/AppDetailsList.vue'
import TxDetailsTitle from '@app/modules/txs/components/TxDetailsTitle.vue'
import { Detail } from '@app/core/components/props'
import { Mixins, Component, Prop } from 'vue-property-decorator'
import { getTransactionByHash, transactionEvent, getEthTransactionByHash } from './txDetails.graphql'
import { TxDetails as TxDetailsType } from './apolloTypes/TxDetails'
import { NumberFormatMixin } from '@app/core/components/mixins/number-format.mixin'
import { FormattedNumber } from '@app/core/helper/number-format-helper'
import BN from 'bignumber.js'
import { ErrorMessageTx, TxStatus } from '@app/modules/txs/models/ErrorMessagesForTx'
import { FormattedNumberUnit } from '@app/core/helper/number-format-helper'
import { excpTxDoNotExists } from '@app/apollo/exceptions/errorExceptions'
import { decodeTransactionData, decodeReceiptData } from '@vulcanize/eth-watcher-ts/dist/utils'

@Component({
    components: {
        AppDetailsList,
        TxDetailsTitle
    },
    apollo: {
        // transaction: {
        //     query: getEthTransactionByHash,
        //     variables() {
        //         return { hash: this.txRef }
        //     },
        //     fetchPolicy: 'cache-and-network',
        //     update: data => data.getEthTransactionByHash,
        //     result({ data }) {
        //         console.log('Result: ', data)
        //         if (data && data.getEthTransactionByHash) {
        //             // if (!this.isReplaced && this.txStatus === 'pending' && !this.subscribed) {
        //             //     this.startSubscription()
        //             // }
        //             this.getEthTransactionByHash = data.ethTransactionCidByHash.nodes[0]
        //             this.emitErrorState(false)
        //         }
        //     },
        //     error(error) {
        //         const newError = JSON.stringify(error.message)
        //         if (newError.toLowerCase().includes(excpTxDoNotExists)) {
        //             this.emitErrorState(true, true)
        //         } else {
        //             this.emitErrorState(true)
        //         }
        //     }
        // },
        ethTransactionCidByHash: {
            query: getEthTransactionByHash,
            variables() {
                return { hash: this.txRef }
            },
            fetchPolicy: 'network-only',
            update: data => data.ethTransactionCidByHash,
            result({ data }) {
                if (data && data.ethTransactionCidByHash && data.ethTransactionCidByHash.nodes[0]) {
                    const { blockByMhKey, ethHeaderCidByHeaderId, receiptCidByTxId, ...others } = data.ethTransactionCidByHash.nodes[0]
                    const decodedData = decodeTransactionData(blockByMhKey.data)
                    const decodedReceipt = decodeReceiptData(receiptCidByTxId.blockByMhKey.data)
                    this.ethTransaction = {
                        ...ethHeaderCidByHeaderId,
                        ...decodedData,
                        ...decodedReceipt,
                        ...others,
                        contractAddress: receiptCidByTxId.contract
                    }
                    this.emitErrorState(false)
                } else {
                    this.emitErrorState(true, true)
                }
            },
            error(error) {
                const newError = JSON.stringify(error.message)
                if (newError.toLowerCase().includes(excpTxDoNotExists)) {
                    this.emitErrorState(true, true)
                } else {
                    this.emitErrorState(true)
                }
            }
        }
    }
})
export default class TxDetails extends Mixins(NumberFormatMixin) {
    @Prop({ type: String }) txRef!: string
    hasError = false
    transaction!: TxDetailsType
    ethTransactionCidByHash!: TxDetailsType
    ethTransaction!: TxDetailsType
    subscribed = false

    /**
     * Create properly-formatted title from tokenDetails
     *
     * @return {String} - Title for details list
     */
    get title(): string {
        return this.$i18n.t('tx.detail').toString()
    }

    /**
     * Properly format the Details[] array for the details table.
     * If the data hasn't been loaded yet, then only include the titles in the details.
     */
    get txDetails(): Detail[] {
        const tx = this.ethTransaction
        const isContractCreation = !!tx && !!tx.contractAddress
        return [
            'block.number',
            'common.hash',
            'common.nonce',
            'common.timestmp',
            'tx.from',
            isContractCreation ? 'contract.creation' : 'tx.to',
            'common.amount',
            'tx.fee',
            'gas.limit',
            'gas.used',
            'gas.price',
            'tx.status',
            'tx.input'
        ].map(label => {
            const row: Detail = { title: this.$i18n.t(label) }
            if (this.isLoading) {
                return row
            }
            switch (label) {
                case 'block.number':
                    row.detail = tx.blockNumber || '-'
                    break
                case 'common.hash':
                    row.detail = tx.txHash
                    row.copy = true
                    row.mono = true
                    break
                case 'common.nonce':
                    row.detail = this.nonce
                    break
                case 'common.timestmp':
                    row.detail = '-'
                    if (tx.timestamp) {
                        row.detail = new Date(tx.timestamp * 1e3).toLocaleString()
                    }
                    break
                case 'tx.from':
                    row.detail = tx.src
                    row.copy = true
                    row.mono = true
                    row.toChecksum = true
                    break
                case 'tx.to':
                    row.detail = `0x${tx.to}`
                    row.copy = true
                    row.mono = true
                    row.toChecksum = true
                    break
                case 'contract.creation':
                    row.detail = tx.contractAddress
                    row.copy = true
                    row.mono = true
                    row.toChecksum = true
                    break
                case 'common.amount':
                    row.detail = `${this.txAmount.value} ${this.$t(`common.${this.txAmount.unit}`)}`
                    break
                case 'tx.fee':
                    row.detail = `${this.txFee.value} ${this.$t(`common.${this.txFee.unit}`)}`
                    break
                case 'gas.limit':
                    row.detail = this.formatNumber(new BN(tx.gas || 0, 16).toNumber())
                    break
                case 'gas.used':
                    row.detail = this.formatNumber(new BN(tx.gasUsed || 0, 16).toNumber())
                    break
                case 'gas.price':
                    row.detail = `${this.gasPrice.value} ${this.$t(`common.${this.gasPrice.unit}`)}`
                    break
                case 'tx.status':
                    row.detail = this.$i18n.t(this.status).toString()
                    break
                case 'tx.input':
                    row.txInput = [ `0x${tx.input}` ]
                    break
            }
            return row
        })
    }

    /**
     * Determines whether or not the tx object has been loaded/populated.
     *
     * @return {Boolean}
     */
    get isLoading(): boolean | undefined {
        return this.$apollo.queries.ethTransactionCidByHash.loading || this.hasError
    }
    /**
     * Formats the transaction value to ETH.
     *
     * @return {FormattedNumber}
     */
    get txAmount(): FormattedNumber {
        return this.formatVariableUnitEthValue(new BN(this.ethTransaction.value, 16))
    }
    /**
     * Formats the gas price value to gwei.
     *
     * @return {FormattedNumber}
     */
    get gasPrice(): FormattedNumber {
        return this.formatNonVariableGWeiValue(new BN(this.ethTransaction.gasPrice))
    }

    /**
     * Gets the formated nonce.
     *
     * @return {String}
     */
    get nonce(): string {
        return this.formatNumber(new BN(this.ethTransaction.nonce, 16))
    }

    /**
     * Gets the tx status.
     *
     * @return {String}
     */
    get status(): string {
        if (!this.ethTransaction || this.ethTransaction.status === undefined) {
            return ''
        }
        if (this.isReplaced) {
            return TxStatus.replaced
        }
        switch (this.ethTransaction.status) {
            case '00':
                return TxStatus.failed
            case '01':
                return TxStatus.success
            default:
                return TxStatus.pending
        }
    }

    get isReplaced(): boolean {
        return this.ethTransaction && Boolean(this.ethTransaction.replacedBy).valueOf()
    }

    /**
     * Calculate the transaction fee.
     *
     * @return {FormattedNumber}
     */
    get txFee(): FormattedNumber {
        if (this.ethTransaction && this.ethTransaction.gas && this.ethTransaction.gasPrice) {
            // const price = new BN(this.ethTransaction.gasPrice)
            // const used = new BN(this.ethTransaction.gas)
            // const fee = price.times(used)
            // return this.formatVariableUnitEthValue(fee)
            const fee = new BN(this.ethTransaction.gasPrice, 16).multipliedBy(new BN(this.ethTransaction.gas, 16))
            return this.formatVariableUnitEthValue(fee)
        }
        // if (!this.isReplaced && this.txStatus === 'pending') {
        //     // const fee = new BN(this.transaction.gas).multipliedBy(this.transaction.gasPrice)
        //     return 'this.formatVariableUnitEthValue(fee)'
        // }
        return { value: '0', unit: FormattedNumberUnit.ETH }
    }

    /**
     * Start apollo subscription
     */
    startSubscription(): void {
        // console.log('Subscription ', this)
        // const _hash = this.transaction.hash
        // const observer = this.$apollo.subscribe({
        //     query: transactionEvent,
        //     variables: {
        //         hash: _hash
        //     }
        // })
        // const a = observer.subscribe({
        //     next: data => {
        //         a.unsubscribe()
        //         this.$apollo.queries.transaction.refetch()
        //     },
        //     error: error => {
        //         this.emitErrorState(true)
        //     }
        // })
    }
    /**
     * Emit error to Sentry
     * @param val {Boolean}
     * @param hashNotFound {Boolean}
     */
    emitErrorState(val: boolean, hashNotFound: boolean = false): void {
        this.hasError = val
        const mess = hashNotFound ? ErrorMessageTx.notFound : ErrorMessageTx.details
        this.$emit('errorDetails', this.hasError, mess)
    }

    // TODO Figure out if we stil need this
    // get inputFormatted(): string[] {
    //     if (!this.transaction) {
    //         return ['0x']
    //     }

    //     const methodId = this.transaction.input
    //     if (!methodId) {
    //         return ['0x']
    //     }

    //     const methodFormatted = `${this.$i18n.t('tx.method')}: ${methodId}`

    //     const inputFunction = this.transaction.inputFunction

    //     if (inputFunction) {
    //         return [`${this.$i18n.t('tx.func')}: ${inputFunction}`, methodFormatted]
    //     }

    //     return [methodFormatted]
    // }
}
</script>
