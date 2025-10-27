import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ScopeService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useScopeStore = defineStore('ScopeStore', () => {
    const { t } = useI18n();
    const globalStore = useGlobalStore();

    const search = (entity, entity_id, action) => {
        return globalStore.actionWrapper(async () => {
            const res = await ScopeService.search(entity, entity_id, action);
            return res.data;
        });
    };

    const sync = (entity, entity_id, mode, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ScopeService.sync(
                entity,
                entity_id,
                mode,
                payload
            );
            if (mode === 'attach') {
                globalStore.showSuccess(
                    t('notifications.scopes_attached', {
                        entity: t(`scopes.${entity.replace('-', '_')}`)
                    }),
                    t('notifications.scopes_attached_detail')
                );
            } else if (mode === 'detach') {
                {
                    globalStore.showSuccess(
                        t('notifications.scopes_detached', {
                            entity: t(`scopes.${entity.replace('-', '_')}`)
                        }),
                        t('notifications.scopes_detached_detail')
                    );
                }
            }

            return res.data;
        });
    };

    return {
        search,
        sync
    };
});
