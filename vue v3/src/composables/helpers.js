import { getCurrentInstance } from 'vue';

export const useHelpers = () => {
    const vm = getCurrentInstance();
    return vm.appContext.config.globalProperties.$helpers;
};
