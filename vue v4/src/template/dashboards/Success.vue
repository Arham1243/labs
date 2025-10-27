<template>
    <div class="p-card p-12">
        <h2>Payment Successful</h2>

        <div v-if="loading" class="loader">
            <ProgressSpinner />
            <p>Verifying your payment...</p>
        </div>

        <div v-else-if="verified">
            <Message severity="success">
                Your payment has been verified successfully!
            </Message>
        </div>

        <div v-else>
            <Message severity="warn">Unable to verify the payment.</Message>
        </div>

        <Button label="Go to Dashboard" @click="goToDashboard" class="p-mt-3" />
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AxiosService from '@/services/Axios.service';
import { useRouter, useRoute } from 'vue-router';

export default {
    setup() {
        const loading = ref(true);
        const verified = ref(false);
        const router = useRouter();
        const route = useRoute();

        // Function to get all URL parameters as an object
        const getUrlParams = () => {
            const params = new URLSearchParams(window.location.search);
            const paramObj = {};
            params.forEach((value, key) => {
                paramObj[key] = value;
            });
            return paramObj;
        };

        onMounted(async () => {
            try {
                const params = getUrlParams(); // Get all URL params
                params.app_id = route.params.appId;
                const response = await AxiosService.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/v1/apps/payment/${
                        params.app_id
                    }/capture`,
                    params
                );

                if (response.status === 200) {
                    verified.value = true;
                }
            } catch (error) {
                console.error('Verification failed:', error);
            } finally {
                loading.value = false;
            }
        });

        const goToDashboard = () => {
            router.push('/');
        };

        return { loading, verified, goToDashboard };
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
