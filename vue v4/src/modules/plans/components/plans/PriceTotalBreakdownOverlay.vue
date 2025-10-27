<script setup>
import { useHelpers } from '@/composables/index.js';

const props = defineProps({
    price: Object
});

const helpers = useHelpers();
</script>

<template>
    <div>
        <div class="formgrid grid row-gap-2">
            <div class="col-8 font-semibold">Net Price</div>
            <div class="col-4">{{ helpers.moneyFormat(price.net_price) }}</div>
            <div class="col-8 font-semibold">
                Net Comm ({{ price.net_price_commission_percent }}%)
            </div>
            <div class="col-4">
                {{
                    helpers.moneyFormat(
                        price.net_price *
                            (price.net_price_commission_percent / 100)
                    )
                }}
            </div>
            <divider class="mx-2 my-2" />
            <div class="col-8 font-semibold">Sale Price</div>
            <div class="col-4">{{ helpers.moneyFormat(price.sale_price) }}</div>
            <div class="col-8 font-semibold">
                Sale Comm ({{ price.sale_price_commission_percent }}%)
            </div>
            <div class="col-4">
                {{
                    helpers.moneyFormat(
                        price.sale_price *
                            (price.sale_price_commission_percent / 100)
                    )
                }}
            </div>
            <div class="col-8 font-semibold">Subtotal</div>
            <div class="col-4">
                {{ helpers.moneyFormat(price.sale_price_subtotal) }}
            </div>
            <template v-for="tax in price.taxes">
                <div class="col-8 font-semibold py-1">
                    {{ tax.tax_type }} ({{ tax.tax_percentage }}%)
                </div>
                <div class="col-4">
                    {{ helpers.moneyFormat(tax.sale_price_tax_amount) }}
                </div>
            </template>
            <divider class="mx-2 my-2" />
            <div class="col-8 font-semibold">Total</div>
            <div class="col-4 font-semibold">
                {{ helpers.moneyFormat(price.sale_price_total) }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
