<script setup>
import Logo from '@/assets/images/auth-logo.png';
</script>

<template>
    <div
        class="w-screen h-screen flex items-center justify-center bg-[#00225a] overflow-x-hidden pb-4"
    >
        <div class="w-full max-w-[470px]">
            <div class="text-center mb-4 pb-1">
                <img
                    :src="Logo"
                    width="230"
                    class="inline-block"
                    data-testid="company-logo"
                />
            </div>
            <div
                class="bg-white rounded-lg text-gray-800 px-[3.25rem] py-[3.5rem]"
            >
                <router-view />
            </div>
        </div>
        <Toast />
    </div>
</template>
