<script setup>
import Logo from '@/assets/images/auth-logo.png';
import GlassImage from '@/assets/images/glass.png';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
    window.location.href = '/';
};
</script>

<template>
    <div
        class="w-screen h-screen flex justify-content-center align-items-center primary-bg"
    >
        <div class="w-full grid p-fluid justify-content-center">
            <div class="col-fixed" style="width: 54%">
                <div class="text-center mb-3">
                    <img
                        :src="Logo"
                        width="230"
                        class="logo"
                        data-testid="company-logo"
                    />
                </div>
                <div
                    class="w-full error-box bg-white border-round-lg text-color"
                >
                    <div class="p-fluid grid w-full">
                        <div class="sm:col-12 lg:col-5 p-0">
                            <div class="circle-image pl-6">
                                <img
                                    :src="GlassImage"
                                    width="190"
                                    class="logo"
                                    data-testid="glass-image"
                                />
                            </div>
                        </div>
                        <div class="sm:col-12 lg:col-7 p-0">
                            <div class="content">
                                <div
                                    data-testid="error-code"
                                    class="text-6xl font-bold line-height-1"
                                >
                                    404
                                </div>
                                <div
                                    data-testid="error-text"
                                    class="text-xl font-semibold uppercase my-3"
                                >
                                    {{ $t('errors.error_404_title') }}
                                </div>
                                <div data-testid="error-message">
                                    {{ $t('errors.error_404_message') }}
                                </div>
                                <Button
                                    data-testid="back-button"
                                    :label="$t('errors.error_action_go_home')"
                                    class="p-button-outlined w-18rem"
                                    @click="goHome"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
body .error-box {
    padding: 6rem 3rem 4.75rem;
}
.primary-bg {
    background: #012765;
}
.p-button-outlined {
    margin-top: 2.75rem;
}
</style>
