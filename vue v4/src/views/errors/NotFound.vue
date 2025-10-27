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
        class="w-screen h-screen flex justify-center items-center bg-[#012765] overflow-hidden"
    >
        <div class="w-full flex justify-center px-4">
            <div class="w-full max-w-[54%]">
                <div class="text-center mb-6">
                    <img
                        :src="Logo"
                        width="230"
                        class="logo mx-auto"
                        data-testid="company-logo"
                    />
                </div>
                <div class="w-full bg-white rounded-lg text-gray-900 error-box">
                    <div class="grid grid-cols-12 gap-6 w-full">
                        <div class="col-span-12 lg:col-span-5 p-0">
                            <div
                                class="flex justify-center lg:justify-start pl-0 lg:pl-12"
                            >
                                <img
                                    :src="GlassImage"
                                    width="190"
                                    class="logo"
                                    data-testid="glass-image"
                                />
                            </div>
                        </div>
                        <div class="col-span-12 lg:col-span-7 p-0">
                            <div class="flex flex-col">
                                <div
                                    data-testid="error-code"
                                    class="text-5xl font-bold leading-none"
                                >
                                    404
                                </div>
                                <div
                                    data-testid="error-text"
                                    class="text-xl font-semibold uppercase my-4"
                                >
                                    {{ $t('errors.error_404_title') }}
                                </div>
                                <div data-testid="error-message" class="mb-12">
                                    {{ $t('errors.error_404_message') }}
                                </div>
                                <Button
                                    data-testid="back-button"
                                    :label="$t('errors.error_action_go_home')"
                                    outlined
                                    class="w-72"
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
    padding: 5rem 3rem 4.75rem;
}
</style>
