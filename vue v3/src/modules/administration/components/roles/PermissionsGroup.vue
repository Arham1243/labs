<script setup>
import { ref, computed, onBeforeMount, watch } from 'vue';
import {
    usePermissionStore,
    useRoleStore
} from '@/modules/administration/stores';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useEventsBus from '@/composables/event-bus';

const { t } = useI18n();
const router = useRouter();
const permissionStore = usePermissionStore();
const roleStore = useRoleStore();

const loading = ref(false);
const busy = ref(false);
const permissions = ref([]);
const selectedPermissions = ref([]);
const currentRoleId = roleStore.currentRole.id;
const toggles = ref([]);
const idCountMap = {};
const missingDependencies = ref(null);
const { emit } = useEventsBus();

onBeforeMount(async () => {
    await getItems();
    await getRolePermissions();
    initializeToggles();
});

watch(
    () => selectedPermissions.value,
    (newVal) => {
        updateToggles();
        disabledDependsPermissions(newVal);
    },
    { deep: true }
);

const initializeToggles = () => {
    toggles.value = permissions.value.reduce((acc, permission) => {
        const { category } = permission.meta;
        if (!acc[category]) {
            acc[category] = { fullAdmin: false, viewOnly: false };
        }
        return acc;
    }, {});

    updateToggles();
};

const updateToggles = () => {
    Object.keys(toggles.value).forEach((category) => {
        const groupPermissions =
            groupedPermissions.value.find(
                (group) => group.category === category
            )?.permissions || [];

        const allPermissionsChecked = groupPermissions.every((permission) => {
            const createChecked =
                !permission.create ||
                selectedPermissions.value.includes(permission.create.id);
            const updateChecked =
                !permission.update ||
                selectedPermissions.value.includes(permission.update.id);
            const viewChecked =
                !permission.view ||
                selectedPermissions.value.includes(permission.view.id);
            const deleteChecked =
                !permission.delete ||
                selectedPermissions.value.includes(permission.delete.id);
            return (
                createChecked && updateChecked && viewChecked && deleteChecked
            );
        });

        const allViewPermissionsChecked = groupPermissions.every(
            (permission) => {
                return (
                    !permission.view ||
                    selectedPermissions.value.includes(permission.view.id)
                );
            }
        );

        const anyPermissionChecked = groupPermissions.some((permission) => {
            const createChecked =
                permission.create &&
                selectedPermissions.value.includes(permission.create.id);
            const updateChecked =
                permission.update &&
                selectedPermissions.value.includes(permission.update.id);
            const deleteChecked =
                permission.delete &&
                selectedPermissions.value.includes(permission.delete.id);
            return createChecked || updateChecked || deleteChecked;
        });

        toggles.value[category].fullAdmin = allPermissionsChecked;
        toggles.value[category].viewOnly =
            allViewPermissionsChecked && !anyPermissionChecked;
    });
};

const disabledDependsPermissions = (permissionIds) => {
    Object.keys(idCountMap).forEach((key) => delete idCountMap[key]);

    permissionIds.forEach((permissionId) => {
        const dependencyIds = getDependencyIds(permissionId);
        dependencyIds.forEach((dependencyId) => {
            if (!idCountMap[dependencyId]) {
                idCountMap[dependencyId] = 0;
            }
            idCountMap[dependencyId]++;
        });
    });
};

const getItems = async () => {
    try {
        loading.value = true;
        const payload = {
            filters: [
                {
                    field: 'type',
                    operator: '=',
                    value: roleStore.currentRole.type
                }
            ]
        };
        const res = await permissionStore.getPermissions(payload);
        permissions.value = res.data;
    } finally {
        loading.value = false;
    }
};

const isDependencyMissing = (id, name) => {
    if (!name || !missingDependencies.value) return false;

    if (selectedPermissions.value.includes(id)) {
        return false;
    }

    for (const dependencyGroup of missingDependencies.value) {
        for (const permissions of Object.values(dependencyGroup)) {
            if (permissions.includes(name)) {
                return true;
            }
        }
    }

    return false;
};

const getRolePermissions = async () => {
    try {
        loading.value = true;
        const res = await permissionStore.getRolePermissions(currentRoleId);
        selectedPermissions.value = res.data.map((permission) => permission.id);
        disabledDependsPermissions(selectedPermissions.value);
    } finally {
        loading.value = false;
    }
};

const groupedPermissions = computed(() => {
    const groups = {};
    permissions.value.forEach((permission) => {
        const { category, group } = permission.meta;
        if (!groups[category]) {
            groups[category] = {};
        }
        if (!groups[category][group]) {
            groups[category][group] = {
                name: group,
                create: null,
                view: null,
                update: null,
                delete: null
            };
        }
        if (permission.name.includes('create')) {
            groups[category][group].create = permission;
        } else if (permission.name.includes('view')) {
            groups[category][group].view = permission;
        } else if (permission.name.includes('update')) {
            groups[category][group].update = permission;
        } else if (permission.name.includes('delete')) {
            groups[category][group].delete = permission;
        }
    });
    return Object.entries(groups).map(([category, groupPermissions]) => ({
        category,
        permissions: Object.values(groupPermissions)
    }));
});

const activeIndexes = computed(() => {
    const grouped = groupedPermissions.value;
    return grouped ? Object.keys(grouped).map((_, index) => index) : [];
});

const goBack = () => {
    router.push({ name: 'Roles' });
};

const savePermissions = async () => {
    try {
        busy.value = true;
        await permissionStore.savePermissions(currentRoleId, {
            resources: selectedPermissions.value
        });
        await getItems();
        missingDependencies.value = [];
        emit('reloadMenu');
    } catch (error) {
        if (
            error.status === 422 &&
            error.response.data.errors.missing_dependencies
        ) {
            missingDependencies.value =
                error.response.data.errors.missing_dependencies;
        }
    } finally {
        busy.value = false;
    }
};

const getDependencyIds = (id) => {
    const permission = permissions.value.find((perm) => perm.id === id);
    const dependencyIds = [];

    if (permission) {
        const dependencies = permission.meta.depends_on;
        dependencies.forEach((depName) => {
            const depPermission = permissions.value.find(
                (perm) => perm.name === depName
            );
            if (depPermission) {
                dependencyIds.push(depPermission.id);
            }
        });
    }

    return dependencyIds;
};

const checkIfCreatePermission = (id) => {
    const permission = permissions.value.find((perm) => perm.id === id);
    return permission && permission.name.includes('create');
};

const getPermissionByName = (name) => {
    const permission = permissions.value.find((perm) => perm.name === name);
    return permission;
};
const getPermissionsName = (permissionsIds) => {
    const names = [];
    permissionsIds.forEach((id) => {
        const permission = permissions.value.find((perm) => perm.id === id);
        if (permission) {
            names.push(permission.name);
        }
    });
    return names;
};
const getViewPermission = (id) => {
    const permission = permissions.value.find((perm) => perm.id === id);
    const permissionName = permission.name;
    const viewPermissionName = permissionName.replace('create', 'view');
    const viewPermission = getPermissionByName(viewPermissionName);
    return viewPermission;
};

const checkIfDeletePermissionChecked = (id) => {
    const permission = permissions.value.find((perm) => perm.id === id);
    if (!permission) return false;

    const permissionName = permission.name || '';
    const deletePermissionName = permissionName.replace('create', 'delete');
    const deletePermission = getPermissionByName(deletePermissionName);
    if (!deletePermission) return false;

    return selectedPermissions.value.includes(deletePermission.id);
};

const checkIfUpdateAndCreatePermissionChecked = (id) => {
    const permission = permissions.value.find((perm) => perm.id === id);
    const permissionName = permission.name;
    const updatePermissionName = permissionName.replace('delete', 'update');
    const createPermissionName = permissionName.replace('delete', 'create');
    const updatePermission = getPermissionByName(updatePermissionName);
    const createPermission = getPermissionByName(createPermissionName);
    return (
        selectedPermissions.value.includes(updatePermission.id) &&
        selectedPermissions.value.includes(createPermission.id)
    );
};

const checkIfUpdateAndCreateHasViewDependency = (id) => {
    const permission = permissions.value.find((perm) => perm.id === id);
    const permissionName = permission.name;
    const updatePermissionName = permissionName.replace('create', 'update');
    const updatePermission = getPermissionByName(updatePermissionName);
    const createPermission = getPermissionByName(permissionName);
    const createDependencyIds = getDependencyIds(createPermission.id);
    const updateDependencyIds = getDependencyIds(updatePermission.id);
    const viewPermission = getViewPermission(createPermission.id);
    return (
        selectedPermissions.value.includes(updatePermission.id) &&
        selectedPermissions.value.includes(viewPermission.id) &&
        createDependencyIds.includes(viewPermission.id) &&
        updateDependencyIds.includes(viewPermission.id)
    );
};

const filterOnlyViewPermissions = (ids) => {
    const viewPermissions = [];
    ids.forEach((permission) => {
        const viewPermission = permissions.value.find(
            (perm) => perm.id === permission
        );
        if (viewPermission && viewPermission.name.includes('view')) {
            viewPermissions.push(permission);
        }
    });
    return viewPermissions;
};

const permissionChanges = (id, action) => {
    const idArray = Array.isArray(id) ? id : [id];
    let updateViewPermission = null;

    const allDependencyIds = [];
    let change = false;

    updateViewPermission = getViewPermission(id);
    if (
        checkIfCreatePermission(id) &&
        checkIfUpdateAndCreateHasViewDependency(id)
    ) {
        if (checkIfUpdateAndCreatePermissionChecked(id)) {
            let dependencyIds = getDependencyIds(id);
            filterOnlyViewPermissions(dependencyIds).forEach((dependencyId) => {
                if (!checkIfDeletePermissionChecked(id)) {
                    idCountMap[dependencyId] = 2;
                } else {
                    idCountMap[dependencyId] = 3;
                }
            });
        } else {
            idCountMap[updateViewPermission.id]++;
        }
    }
    const addedPermissions = idArray.filter(
        (id) => !permissions.value.includes(id)
    );

    if (addedPermissions.length > 0) {
        addedPermissions.forEach((addedId) => {
            const dependencyIds = getDependencyIds(addedId);
            if (dependencyIds.length > 0) {
                allDependencyIds.push(...dependencyIds);
                change = true;
            }
        });
    }

    if (change) {
        allDependencyIds.forEach((id) => {
            if (!idCountMap[id]) {
                idCountMap[id] = 0;
            }
        });

        if (action === 'add') {
            allDependencyIds.forEach((id) => {
                idCountMap[id]++;
            });
            handleDependencies(allDependencyIds, 'add');
        } else if (action === 'remove') {
            allDependencyIds.forEach((id) => {
                if (idCountMap[id] > 0) {
                    idCountMap[id]--;
                }
            });
        }
    }
};

const handleDependencies = (dependencyIds, action) => {
    const allDependencyIds = [...dependencyIds];
    dependencyIds.forEach((dependencyId) => {
        allDependencyIds.push(...getDependencyIds(dependencyId));
    });

    if (action === 'add') {
        allDependencyIds.forEach((id) => {
            selectedPermissions.value.push(id);
        });
    } else {
        allDependencyIds.forEach((id) => {
            if (idCountMap[id] < 1 && selectedPermissions.value.includes(id)) {
                selectedPermissions.value = selectedPermissions.value.filter(
                    (selectedId) => selectedId !== id
                );
            }
        });
    }
};

const toggleFullAdmin = (group) => {
    const category = group.category;
    const wasFullAdmin = toggles.value[category].fullAdmin;
    toggles.value[category].fullAdmin = !wasFullAdmin;
    toggles.value[category].viewOnly = false;

    const allIds = [];
    let allDependencyIds = [];

    group.permissions.forEach((permission) => {
        const permissionIds = [];
        if (permission.create && permission.create.id) {
            permissionIds.push(permission.create.id);
        }
        if (permission.update && permission.update.id) {
            permissionIds.push(permission.update.id);
        }
        if (permission.view && permission.view.id) {
            permissionIds.push(permission.view.id);
        }
        if (permission.delete && permission.delete.id) {
            permissionIds.push(permission.delete.id);
        }
        permissionIds.forEach((id) => {
            if (id && !allIds.includes(id)) {
                allDependencyIds = allDependencyIds.concat(
                    getDependencyIds(id)
                );
                allIds.push(id);
            }
        });
    });
    if (toggles.value[category].fullAdmin) {
        allIds.forEach((id) => {
            if (id && !selectedPermissions.value.includes(id)) {
                selectedPermissions.value.push(id);
            }
        });
        disabledDependsPermissions(allIds);
        handleDependencies(allDependencyIds, 'add');
    } else {
        allIds.forEach((id) => {
            if (id) {
                selectedPermissions.value = selectedPermissions.value.filter(
                    (selectedId) => selectedId !== id
                );
            }
        });
        allDependencyIds.forEach((dependency) => {
            delete idCountMap[dependency];
        });
        handleDependencies(allDependencyIds, 'remove');
    }
};

const toggleViewOnly = (group) => {
    const category = group.category;
    const wasViewOnly = toggles.value[category].viewOnly;
    toggles.value[category].viewOnly = !wasViewOnly;
    toggles.value[category].fullAdmin = false;

    const allIds = [];
    let allDependencyIds = [];

    group.permissions.forEach((permission) => {
        const viewId = permission.view?.id;
        const otherIds = [
            permission.create?.id,
            permission.update?.id,
            permission.delete?.id
        ].filter(Boolean);

        if (toggles.value[category].viewOnly) {
            if (viewId && !allIds.includes(viewId)) {
                const dependencies = getDependencyIds(viewId);
                allDependencyIds = [...allDependencyIds, ...dependencies];
                allIds.push(viewId);
            }

            if (viewId && !selectedPermissions.value.includes(viewId)) {
                selectedPermissions.value.push(viewId);
                allDependencyIds.forEach((dependency) => {
                    if (!selectedPermissions.value.includes(dependency)) {
                        selectedPermissions.value.push(dependency);
                    }
                });
            }

            selectedPermissions.value = selectedPermissions.value.filter(
                (id) => !otherIds.includes(id)
            );

            console.log(allDependencyIds);

            disabledDependsPermissions([viewId]);
        } else {
            if (viewId) {
                selectedPermissions.value = selectedPermissions.value.filter(
                    (id) => id !== viewId
                );
            }
            allDependencyIds.forEach((dependency) => {
                selectedPermissions.value = selectedPermissions.value.filter(
                    (id) => id !== dependency
                );
                delete idCountMap[dependency];
            });
        }
    });
};

const togglePermission = (id, type, group) => {
    const index = selectedPermissions.value.indexOf(id);
    const permission = permissions.value.find((perm) => perm.id === id);

    if (index === -1) {
        selectedPermissions.value.push(id);

        if (type !== 'view' && permission.view?.id) {
            if (!selectedPermissions.value.includes(permission.view.id)) {
                selectedPermissions.value.push(permission.view.id);
            }
        }

        permissionChanges(id, 'add');

        if (type !== 'view') {
            toggles.value[group.category].viewOnly = false;
        }

        const allPermissionsInGroup = group.permissions
            .map((perm) => {
                const { create, update, view, delete: deletePermission } = perm;
                return [
                    create?.id,
                    update?.id,
                    view?.id,
                    deletePermission?.id
                ].filter(Boolean);
            })
            .flat();

        const allPermissionsSelected = allPermissionsInGroup.every((permId) =>
            selectedPermissions.value.includes(permId)
        );

        if (allPermissionsSelected) {
            toggles.value[group.category].fullAdmin = true;
        }
    } else {
        permissionChanges(id, 'remove');

        selectedPermissions.value = selectedPermissions.value.filter(
            (selectedId) => selectedId !== id
        );

        if (type === 'view' && toggles.value[group.category].viewOnly) {
            toggles.value[group.category].viewOnly = false;
        }

        const allPermissionsInGroup = group.permissions
            .map((perm) => {
                const { create, update, view, delete: deletePermission } = perm;
                return [
                    create?.id,
                    update?.id,
                    view?.id,
                    deletePermission?.id
                ].filter(Boolean);
            })
            .flat();

        const allPermissionsSelected = allPermissionsInGroup.every((permId) =>
            selectedPermissions.value.includes(permId)
        );

        if (!allPermissionsSelected) {
            toggles.value[group.category].fullAdmin = false;
        }
    }

    const allViewPermissions = group.permissions
        .map((perm) => perm.view?.id)
        .filter(Boolean);

    const onlyViewSelected = selectedPermissions.value.every((selectedId) =>
        allViewPermissions.includes(selectedId)
    );

    if (!onlyViewSelected) {
        toggles.value[group.category].viewOnly = false;
    } else if (
        allViewPermissions.every((viewId) =>
            selectedPermissions.value.includes(viewId)
        )
    ) {
        toggles.value[group.category].viewOnly = true;
    }
};
</script>

<template>
    <div class="accordions-wrapper accordions-wrapper--permission my-5">
        <Loader v-if="loading" />
        <div v-else>
            <div v-if="groupedPermissions.length > 0">
                <Accordion
                    :multiple="true"
                    :activeIndex="activeIndexes"
                    expandIcon="pi pi-chevron-right font-medium"
                    collapseIcon="pi pi-chevron-down font-medium"
                >
                    <AccordionTab
                        v-for="group in groupedPermissions"
                        :key="group.category"
                    >
                        <template #header>
                            <div
                                class="flex align-items-center justify-content-between w-full"
                            >
                                <div
                                    class="pl-2 font-bold text-color text-xl capitalize"
                                >
                                    {{ group.category }}
                                </div>
                                <div class="flex align-items-center gap-7">
                                    <div class="flex align-items-center gap-3">
                                        <InputSwitch
                                            id="full_admin"
                                            :model-value="
                                                toggles[group.category]
                                                    ?.fullAdmin
                                            "
                                            @click="
                                                toggleFullAdmin(group);
                                                $event.stopPropagation();
                                            "
                                        />
                                        <span>{{
                                            t('permissions.full_admin')
                                        }}</span>
                                    </div>
                                    <div class="flex align-items-center gap-3">
                                        <InputSwitch
                                            id="view_only"
                                            :model-value="
                                                toggles[group.category]
                                                    ?.viewOnly
                                            "
                                            @click="
                                                toggleViewOnly(group);
                                                $event.stopPropagation();
                                            "
                                        />
                                        <span>{{
                                            t('permissions.view_only')
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <BaseTable
                            :value="group.permissions"
                            :paginator="false"
                        >
                            <Column
                                :field="`name`"
                                class="w-5"
                                :header="t('common.permission')"
                            >
                                <template #body="{ data }">
                                    <div class="text-600">{{ data.name }}</div>
                                </template>
                            </Column>

                            <Column :header="t('common.create')">
                                <template #body="{ data }">
                                    <div class="pl-2">
                                        <InputField
                                            :class="{
                                                'p-invalid':
                                                    isDependencyMissing(
                                                        data.create?.id,
                                                        data.create?.name
                                                    )
                                            }"
                                            :disabled="
                                                idCountMap[data.create?.id] &&
                                                idCountMap[data.create?.id] > 0
                                            "
                                            v-if="data.create?.id"
                                            :id="`create-checkbox-${data.create?.id}`"
                                            variant="checkbox"
                                            binary
                                            :model-value="
                                                selectedPermissions.includes(
                                                    data.create?.id
                                                )
                                            "
                                            @change="
                                                togglePermission(
                                                    data.create?.id,
                                                    'create',
                                                    group
                                                )
                                            "
                                        />
                                    </div>
                                </template>
                            </Column>

                            <Column :header="t('common.update')">
                                <template #body="{ data }">
                                    <div class="pl-2">
                                        <InputField
                                            :class="{
                                                'p-invalid':
                                                    isDependencyMissing(
                                                        data.update?.id,
                                                        data.update?.name
                                                    )
                                            }"
                                            :disabled="
                                                idCountMap[data.update?.id] &&
                                                idCountMap[data.update?.id] > 0
                                            "
                                            v-if="data.update?.id"
                                            :id="`update-checkbox-${data.update?.id}`"
                                            variant="checkbox"
                                            binary
                                            :model-value="
                                                selectedPermissions.includes(
                                                    data.update?.id
                                                )
                                            "
                                            @change="
                                                togglePermission(
                                                    data.update?.id,
                                                    'update',
                                                    group
                                                )
                                            "
                                        />
                                    </div>
                                </template>
                            </Column>

                            <Column :header="t('common.view')">
                                <template #body="{ data }">
                                    <div class="pl-2">
                                        <InputField
                                            :class="{
                                                'p-invalid':
                                                    isDependencyMissing(
                                                        data.view?.id,
                                                        data.view?.name
                                                    )
                                            }"
                                            :disabled="
                                                idCountMap[data.view?.id] &&
                                                idCountMap[data.view?.id] > 0
                                            "
                                            v-if="data.view?.id"
                                            :id="`view-checkbox-${data.view?.id}`"
                                            variant="checkbox"
                                            binary
                                            :model-value="
                                                selectedPermissions.includes(
                                                    data.view?.id
                                                )
                                            "
                                            @change="
                                                togglePermission(
                                                    data.view?.id,
                                                    'view',
                                                    group
                                                )
                                            "
                                        />
                                    </div>
                                </template>
                            </Column>

                            <Column :header="t('common.delete')">
                                <template #body="{ data }">
                                    <div class="pl-2">
                                        <InputField
                                            :class="{
                                                'p-invalid':
                                                    isDependencyMissing(
                                                        data.delete?.id,
                                                        data.delete?.name
                                                    )
                                            }"
                                            :disabled="
                                                idCountMap[data.delete?.id] &&
                                                idCountMap[data.delete?.id] > 0
                                            "
                                            v-if="data.delete?.id"
                                            :id="`delete-checkbox-${data.delete?.id}`"
                                            variant="checkbox"
                                            binary
                                            :model-value="
                                                selectedPermissions.includes(
                                                    data.delete?.id
                                                )
                                            "
                                            @change="
                                                togglePermission(
                                                    data.delete?.id,
                                                    'delete',
                                                    group
                                                )
                                            "
                                        />
                                    </div>
                                </template>
                            </Column>
                        </BaseTable>
                    </AccordionTab>
                </Accordion>

                <div
                    class="flex align-items-center justify-content-between mt-7"
                >
                    <Button
                        :label="t('buttons.cancel')"
                        outlined
                        class="no-underline"
                        @click="goBack"
                    />
                    <Button
                        :label="t('buttons.save')"
                        iconPos="right"
                        @click="savePermissions"
                        :loading="busy"
                    />
                </div>
            </div>
            <div v-else>
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.permissions').toLowerCase()
                    })
                }}
            </div>
        </div>
    </div>
</template>
