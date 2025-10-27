<template>
    <Card class="payment-card">
        <template #title>
            <h2>Select Payment Gateway</h2>
        </template>

        <template #content>
            <div class="payment-options">
                <div class="p-field-radiobutton">
                    <RadioButton
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        v-model="selectedGateway"
                    />
                    <label for="paypal" class="pl-2">PayPal</label>
                </div>

                <div class="p-field-radiobutton">
                    <RadioButton
                        id="chase"
                        name="paymentMethod"
                        value="chase"
                        v-model="selectedGateway"
                    />
                    <label for="chase" class="pl-2">Chase</label>
                </div>
            </div>

            <div class="button-container">
                <Button
                    :label="loading ? 'Processing...' : 'Submit'"
                    :disabled="loading"
                    @click="submitPayment"
                    class="p-mt-3"
                />
            </div>

            <div v-if="loading" class="loader">
                <ProgressSpinner
                    style="width: 50px; height: 50px"
                    strokeWidth="4"
                />
                <p>Redirecting to payment gateway...</p>
            </div>
        </template>
    </Card>
</template>

<script>
import { ref } from 'vue';
import AxiosService from '@/services/Axios.service';

export default {
    setup() {
        const selectedGateway = ref(null);
        const loading = ref(false);

        const submitPayment = async () => {
            if (!selectedGateway.value) {
                alert('Please select a payment method');
                return;
            }

            loading.value = true; // Show loading spinner

            try {
                const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
                const response = await AxiosService.post(
                    `${BASE_URL}/apps/payment/${selectedGateway.value}/order`
                );

                const data = response.data.data.redirect_params;

                if (data?.form_action) {
                    if (data.form_method === 'GET') {
                        window.location.href = data.form_action;
                        return;
                    }

                    const form = document.createElement('form');
                    form.method = data.form_method;
                    form.action = data.form_action;

                    Object.keys(data.form_fields).forEach((key) => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = key;
                        input.value = data.form_fields[key];
                        form.appendChild(input);
                    });

                    document.body.appendChild(form);
                    form.submit();
                } else {
                    console.error('Invalid response from server', data);
                }
            } catch (error) {
                console.error('Error fetching redirect data:', error);
            } finally {
                loading.value = false; // Hide loading spinner
            }
        };

        return { selectedGateway, submitPayment, loading };
    }
};
</script>

<style scoped>
.payment-card {
    max-width: 420px;
    margin: auto;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.payment-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
}

.button-container {
    margin-top: 16px;
}

.loader {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}
</style>
