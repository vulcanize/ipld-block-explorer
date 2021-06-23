<template>
    <v-container pa-0>
        <v-layout d-block>
            <v-flex xs12 hidden-md-and-up>
                <div class="table-row-mobile">
                    <v-layout grid-list-xs row wrap align-center justify-start fill-height class="pt-3 pb-3 pr-4 pl-4">
                      <v-flex xs6 pa-1>
                        <router-link :to="`/block/number/${block.blockNumber}`" class="black--text font-weight-medium pb-1"
                        >{{ $t('block.number') }} {{ _block.blockNumber }}</router-link
                        >
                      </v-flex>
                      <v-flex xs6 pr-44>
                        <v-layout row justify-end>
                          <p class="black--text align-center pl-2">
                            {{ _block.totalTx }} {{ $tc('tx.name-short', 2) }}
                            <app-tooltip v-if="_block.txFail > 0" :text="txTooltipText" />
                          </p>
                        </v-layout>
                      </v-flex>
                      <v-flex xs2 pa-1>
                        <p class="info--text psmall">{{ $t('common.age') }}:</p>
                      </v-flex>
                      <v-flex xs10 pa-1>
                        <app-time-ago :timestamp="_block.timestamp" />
                      </v-flex>
                      <v-flex xs2 pa-1>
                        <p class="info--text psmall pr-1">{{ $t('miner.name') }}:</p>
                      </v-flex>
                      <v-flex xs10 pa-1>
                        <app-transform-hash :hash="_block.miner | toChecksum" :italic="true" :link="`/address/${_block.miner}`" />
                      </v-flex>
                        <v-flex xs2 pa-1>
                            <p class="info--text psmall">{{ $t('miner.reward-short') }}:</p>
                        </v-flex>
                      <v-flex xs10 pa-1>
                        <p class="black--text align-center pl-2">
                          {{ _block.reward.value }}
                          <app-tooltip v-if="_block.reward.tooltipText" :text="`${_block.reward.tooltipText} ${$t('common.eth')}`" />
                        </p>
                      </v-flex>
                    </v-layout>
                </div>
            </v-flex>
            <v-flex hidden-sm-and-down sm12>
                <v-layout grid-list-xs row wrap align-center justify-start fill-height pl-3 pr-2 pt-2 pb-1>
                    <v-flex sm1>
                        <router-link :to="`/block/number/${block.blockNumber}`" class="black--text pb-1">{{ _block.blockNumber }}</router-link>
                    </v-flex>
                    <v-flex sm5>
                        <v-layout row pb-2>
                            <p class="info--text pr-1">{{ 'CID: ' }}</p>{{ _block.cid }}
<!--                            <app-transform-hash :hash="_block.name | toChecksum" :italic="true" :link="`/address/${_block.name}`" />-->
                        </v-layout>
                        <v-layout row>
                            <p class="info--text psmall pr-2">{{ 'Hash: '}}</p>{{ _block.blockHash }}
<!--                            <app-time-ago :timestamp="_block.name" />-->
                        </v-layout>
                    </v-flex>
                    <v-spacer hidden-xl-only />
<!--                    <v-flex sm2>-->
<!--                        <p class="pr-1">-->
<!--                            {{ _block.cid }}-->
<!--&lt;!&ndash;                            <app-tooltip v-if="_block.blockTimestamp > 0" :text="txTooltipText" />&ndash;&gt;-->
<!--                        </p>-->
<!--                    </v-flex>-->
                    <v-flex sm2>
                        <p class="black--text align-center mb-0">
                            {{ _block.reward.value }}
                          <app-tooltip v-if="_block.reward.tooltipText" :text="`${_block.reward.tooltipText} ${$t('common.eth')}`" />
                        </p>
                    </v-flex>
                </v-layout>
                <v-divider class="mb-2 mt-2" />
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator'
import AppTransformHash from '@app/core/components/ui/AppTransformHash.vue'
import { NumberFormatMixin } from '@app/core/components/mixins/number-format.mixin'
import AppTimeAgo from '@app/core/components/ui/AppTimeAgo.vue'
import { decodeHeaderData } from '@vulcanize/eth-watcher-ts/dist/utils'

import BN from 'bignumber.js'

import AppTooltip from '@app/core/components/ui/AppTooltip.vue'

@Component({
    components: {
        AppTooltip,
        AppTransformHash,
        AppTimeAgo
    }
})
export default class TableBlocksRow extends Mixins(NumberFormatMixin) {
    @Prop(Object) block!: any
    get _block(): any {
        const decodedDat = decodeHeaderData(this.block.blockByMhKey.data)
        return {
            id: this.block.id,
            blockHash: this.block.blockHash,
            blockNumber: this.block.blockNumber,
            cid: this.block.cid,
            reward: this.formatNonVariableEthValue(new BN(this.block.reward)),
            miner: decodedDat.address,
            address: decodedDat.address,
            // number: this.formatNumber(this.block.number),
            // miner: this.block.miner,
            // rewards: this.formatNonVariableEthValue(new BN(this.block.rewards.total)),
            timestamp: decodedDat.time, // new Date(this.block.timestamp * 1e3),
            totalTx: 'totalTx', // this.formatNumber(this.block.txCount),
            txFail: 'txFail', // 'this.formatNumber(this.block.txFail)',
            // txSuccess: this.formatNumber(this.block.txCount - this.block.txFail)
        }
    }
    get txTooltipText(): string {
        return this._block.address
    }
    /**
     * Called when translation is success
     * @returns {Number}
     */
    sucessTransalate(): number {
        return this._block && this._block.address
    }
    /**
     * Called when translation is fails
     * @returns {Number}
     */
    failedTranslate(): number {
        return this.block && this._block.address
    }
}
</script>

<style scoped lang="css">
.table-row-mobile {
    border: 1px solid #b4bfd2;
}

p {
    margin-bottom: 0px;
    padding-bottom: 0px;
}
.arrow {
    position: relative;
}

.line {
    border-left: 1px solid #b4bfd2;
    border-bottom: 1px solid #b4bfd2;
    height: 50px;
    width: 105%;
    position: absolute;
    margin-left: 2px;
    margin-bottom: 10px;
}
</style>
