import { createPinia } from 'pinia';

export * from '@/stores/Common';
export * from './Orders';
export * from './Policies';
export * from './SmartFilter';
export * from './Insureds';
export * from './Carts';

export default createPinia();
