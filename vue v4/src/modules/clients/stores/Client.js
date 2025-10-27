import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useGlobalStore } from '@/stores';
import { ClientService } from '@/modules/clients/services';
import lodash from 'lodash';

export const useClientStore = defineStore('ClientStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    //Clients

    const currentClient = ref();
    const setCurrentClient = (value) => {
        currentClient.value = value;
    };

    const searchClients = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.searchClients(payload, params);
            return res.data;
        });
    };

    const getClients = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getClients(params);
            return res.data;
        });
    };

    const getClient = (id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getClient(id, params);
            setCurrentClient(res?.data?.data);
            return res.data;
        });
    };

    const createClient = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.createClient(payload);
            globalStore.showSuccess(
                t('notifications.client_created'),
                payload.create_default_business_unit
                    ? t('notifications.client_with_bu_created_detail')
                    : t('notifications.client_created_detail')
            );
            return res.data;
        });
    };

    const updateClient = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.updateClient(id, payload);
            globalStore.showSuccess(
                t('notifications.client_updated'),
                payload.create_default_business_unit
                    ? t('notifications.client_updated_with_bu_created_detail')
                    : t('notifications.client_updated_detail')
            );
            return res.data;
        });
    };

    const batchUpdateClients = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.batchUpdateClients(payload);
            globalStore.showSuccess(
                t('notifications.clients_updated'),
                t('notifications.clients_updated_detail')
            );
            return res.data;
        });
    };

    const publishClient = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const data = { ...payload, status: 'active' };
            const res = await ClientService.updateClient(id, data);
            globalStore.showSuccess(
                t('notifications.client_published'),
                t('notifications.client_published_detail', {
                    item: payload.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const deleteClient = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.deleteClient(id);
            globalStore.showSuccess(
                t('notifications.client_deleted'),
                t('notifications.client_deleted_details')
            );
            return res.data;
        });
    };

    //Holdings

    const currentHolding = ref();
    const setCurrentHolding = (value) => {
        currentHolding.value = value;
    };

    const searchHoldings = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.searchHoldings(payload, params);
            return res.data;
        });
    };

    const getHoldings = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getHoldings(params);
            return res.data;
        });
    };

    const getHolding = (id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getHolding(id, params);
            return res.data;
        });
    };

    const createHolding = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.createHolding(payload);
            globalStore.showSuccess(
                t('notifications.holding_created'),
                t('notifications.holding_created_detail')
            );
            return res.data;
        });
    };

    const updateHolding = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.updateHolding(id, payload);
            globalStore.showSuccess(
                t('notifications.holding_updated'),
                t('notifications.holding_updated_detail')
            );
            return res.data;
        });
    };

    const publishHolding = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const data = { ...payload, status: 'active' };
            const res = await ClientService.updateHolding(id, data);
            globalStore.showSuccess(
                t('notifications.holding_published'),
                t('notifications.holding_published_detail', {
                    item: payload.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const deleteHolding = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.deleteHolding(id);
            globalStore.showSuccess(
                t('notifications.holding_deleted'),
                t('notifications.holding_deleted_details')
            );
            return res.data;
        });
    };

    //Client Sectors

    const searchClientSectors = (payload, params) => {
        payload.filters = [
            ...(payload?.filters ?? []),
            { field: 'status', operator: '=', value: 'active' }
        ];
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.searchClientSectors(
                payload,
                params
            );
            return res.data;
        });
    };

    //Business Units

    const currentBusinessUnit = ref();
    const setCurrentBusinessUnit = (value) => {
        currentBusinessUnit.value = value;
    };

    const searchBusinessUnits = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.searchBusinessUnits(
                payload,
                params
            );
            return res.data;
        });
    };

    const getBusinessUnits = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getBusinessUnits(params);
            return res.data;
        });
    };

    const getBusinessUnit = (id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getBusinessUnit(id, params);
            return res.data;
        });
    };

    const createBusinessUnit = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.createBusinessUnit(payload);
            globalStore.showSuccess(
                t('notifications.business_unit_created'),
                t('notifications.business_unit_created_detail')
            );
            return res.data;
        });
    };

    const updateBusinessUnit = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.updateBusinessUnit(id, payload);
            globalStore.showSuccess(
                t('notifications.business_unit_updated'),
                t('notifications.business_unit_updated_detail')
            );
            return res.data;
        });
    };

    const publishBusinessUnit = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const data = { ...payload, status: 'active' };
            const res = await ClientService.updateBusinessUnit(id, data);
            globalStore.showSuccess(
                t('notifications.business_unit_published'),
                t('notifications.business_unit_published_detail', {
                    item: payload.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const deleteBusinessUnit = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.deleteBusinessUnit(id);
            globalStore.showSuccess(
                t('notifications.business_unit_deleted'),
                t('notifications.business_unit_deleted_details')
            );
            return res.data;
        });
    };

    const attachNonInsuranceProductToBusinessUnit = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await ClientService.attachNonInsuranceProductToBusinessUnit(
                    id,
                    payload
                );
            globalStore.showSuccess(
                t('notifications.business_unit_updated'),
                t(
                    'notifications.non_insurance_product_attached_to_business_unit'
                )
            );
            return res.data;
        });
    };

    //Billing Detail

    const createBillingDetail = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.createBillingDetail(payload);
            globalStore.showSuccess(
                t('notifications.billing_detail_created'),
                t('notifications.billing_detail_created_detail')
            );
            return res.data;
        });
    };

    const updateBillingDetail = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.updateBillingDetail(id, payload);
            globalStore.showSuccess(
                t('notifications.billing_detail_updated'),
                t('notifications.billing_detail_updated_detail')
            );
            return res.data;
        });
    };

    //Contacts

    const createContact = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.createContact(payload);
            globalStore.showSuccess(
                t('notifications.contact_created'),
                t('notifications.contact_created_detail')
            );
            return res.data;
        });
    };

    const updateContact = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.updateContact(id, payload);
            globalStore.showSuccess(
                t('notifications.contact_updated'),
                t('notifications.contact_updated_detail')
            );
            return res.data;
        });
    };

    const deleteContact = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientService.deleteContact(id);
            globalStore.showSuccess(
                t('notifications.contact_deleted'),
                t('notifications.contact_deleted_detail')
            );
            return res.data;
        });
    };

    const getContactTypes = (payload = {}) => {
        payload.filters = [
            ...(payload?.filters ?? []),
            { field: 'status', value: 'active' }
        ];

        return globalStore.actionWrapper(async () => {
            const res = await ClientService.getContactTypes(payload);
            return res.data;
        });
    };

    const showName = (contact, isTruncate) => {
        let fullname = [];
        if (contact.first_name) {
            fullname.push(contact.first_name);
        }
        if (contact.last_name) {
            fullname.push(contact.last_name);
        }

        if (!isTruncate) {
            return fullname.join(' ');
        }

        return lodash.truncate(fullname.join(' '));
    };

    return {
        currentClient,
        setCurrentClient,
        currentBusinessUnit,
        setCurrentBusinessUnit,
        currentHolding,
        setCurrentHolding,

        searchHoldings,
        getHoldings,
        getHolding,
        createHolding,
        updateHolding,
        publishHolding,
        deleteHolding,

        searchClients,
        getClients,
        getClient,
        createClient,
        updateClient,
        batchUpdateClients,
        publishClient,
        deleteClient,

        searchBusinessUnits,
        getBusinessUnits,
        getBusinessUnit,
        createBusinessUnit,
        updateBusinessUnit,
        publishBusinessUnit,
        deleteBusinessUnit,
        attachNonInsuranceProductToBusinessUnit,

        searchClientSectors,

        createBillingDetail,
        updateBillingDetail,

        createContact,
        updateContact,
        deleteContact,
        getContactTypes,
        showName
    };
});
