<template>
    <div class="p-card p-4">
        <h2>Payment Canceled</h2>

        <div v-if="loading" class="loader">
            <ProgressSpinner />
            <p>Canceling your payment...</p>
        </div>

        <div v-else>
            <Message severity="error"
                >Your payment was canceled or failed.
            </Message>
        </div>

        <Button label="Try Again" @click="retryPayment" class="p-mt-3" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AxiosService from '@/services/Axios.service';
import { useRoute, useRouter } from 'vue-router';

export default {
    setup() {
        const loading = ref(true);
        const router = useRouter();

        onMounted(async () => {
            loading.value = false;
        });

        const retryPayment = () => {
            router.push('/payments'); // Redirect back to home
        };

        return { loading, retryPayment };
    }
};
</script>

<style scoped>
.p-card {
    max-width: 400px;
    margin: auto;
    text-align: center;
}

.loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}
</style>
