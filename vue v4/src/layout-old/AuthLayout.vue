<script setup>
import Logo from '@/assets/images/auth-logo.png';
</script>

<template>
    <div
        class="w-screen h-screen flex justify-center items-center auth-bg"
    >
        <div class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 w-full justify-center">
            <div class="auth-wrapper">
                <div class="text-center mb-12">
                    <img
                        :src="Logo"
                        width="230"
                        class="logo"
                        data-testid="company-logo"
                    />
                </div>
                <div class="auth-box bg-white rounded-lg text-color">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
    <Toast></Toast>
</template>

<style scoped>
.auth-bg {
    background-color: #00225a;
}
.auth-wrapper {
    width: 470px;
}

.auth-box {
    padding: 3.5rem 3.25rem;
}
</style>
