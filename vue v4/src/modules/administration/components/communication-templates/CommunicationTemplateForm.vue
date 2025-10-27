<script setup>
import { ref, computed, onBeforeMount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Quill from 'quill';
import { useCommunicationTemplateStore } from '@/modules/administration/stores';
import {
    communicationTemplateTypes,
    communicationTemplateLangs
} from '@/config/enums';

const props = defineProps({ mode: { type: String, required: true } });
const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const communicationTemplateStore = useCommunicationTemplateStore();

const busy = ref(false);
const loading = ref(false);
const modules = ref([]);
const eventOptions = ref([]);
const placeholders = ref([]);
const templateErrors = ref([]);
const communicationTemplateId = ref(route.params.id);
const quillInstances = {};
let focusedTarget = { type: null, key: null };

const formData = ref({
    type: '',
    module: '',
    event: '',
    languages: ['en'],
    subject: { en: '' },
    body: { en: '' },
    status: 'active'
});

/* --- Quill Variable Blot --- */
const Embed = Quill.import('blots/embed');
class VariableBlot extends Embed {
    static blotName = 'variable';
    static tagName = 'span';
    static className = 'email-variable';

    static create(value) {
        const node = super.create();
        // Handle both object format {key, name} and existing node
        if (typeof value === 'object' && value.key) {
            node.dataset.variable = value.key;
            node.dataset.label = value.name;
            node.innerHTML = `
          <span class="email-variable__text">${value.name}</span>
          <span class="email-variable__remove pi pi-times-circle"></span>
        `;
        }
        return node;
    }

    static value(node) {
        // Return the object format so Quill can recreate the blot properly
        return {
            key: node.dataset.variable,
            name: node.dataset.label
        };
    }

    static formats(node) {
        // Tell Quill how to read the value from existing HTML
        return {
            key: node.dataset.variable,
            name: node.dataset.label
        };
    }
}
Quill.register(VariableBlot);

const activeLangs = computed(() =>
    communicationTemplateLangs.filter((l) =>
        formData.value.languages.includes(l.value)
    )
);

const formattedTemplateBodies = computed(() => {
    const res = {};
    for (const lang of activeLangs.value) {
        const div = document.createElement('div');
        div.innerHTML = formData.value.body[lang.value];
        div.querySelectorAll('.email-variable').forEach((el) => {
            el.replaceWith(`{{${el.dataset.variable}}}`);
        });
        res[lang.value] = div.innerHTML;
    }
    return res;
});

const formattedTemplateSubjects = computed(() => {
    const res = {};
    for (const lang of activeLangs.value) {
        const div = document.createElement('div');
        div.innerHTML = formData.value.subject[lang.value];
        div.querySelectorAll('.email-variable').forEach((el) => {
            el.replaceWith(`{{${el.dataset.variable}}}`);
        });
        res[lang.value] = div.textContent.trim().replace(/\u00A0/g, ' ');
    }
    return res;
});

onBeforeMount(async () => {
    if (props.mode === 'edit') await getItem();
    else await getConfigs();
});

const parsePlaceholders = (text, action) => {
    const regex = /\{\{(\w+)\}\}/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex)
            action('text', text.slice(lastIndex, match.index));
        action('var', match[1]);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) action('text', text.slice(lastIndex));
};

const createChip = (placeholder) => {
    const chip = document.createElement('span');
    chip.contentEditable = 'false';
    chip.dataset.variable = placeholder.key;
    chip.className = 'email-variable';
    chip.innerHTML = `
    <span>
      <span class="email-variable__text">${placeholder.name}</span>
      <span class="email-variable__remove pi pi-times-circle"></span>
    </span>
  `;
    return chip;
};

const onEditorLoad = (langKey, e) => {
    const quill = e.instance;
    quillInstances[langKey] = quill;

    quill.on('selection-change', (range) => {
        if (range) focusedTarget = { type: 'editor', key: langKey };
    });

    quill.on('text-change', () => {
        formData.value.body[langKey] = quill.root.innerHTML;
    });

    quill.root.addEventListener('click', (ev) => {
        if (ev.target.classList.contains('email-variable__remove')) {
            const blot = Quill.find(ev.target.closest('.email-variable'));
            if (blot) quill.deleteText(quill.getIndex(blot), 1, 'user');
        }
    });
};

/* --- Variable Insertion --- */
const insertVariable = (langKey, variable) => {
    if (focusedTarget.type === 'editor' && focusedTarget.key === langKey) {
        const quill = quillInstances[langKey];
        if (!quill) return;
        const sel = quill.getSelection();
        quill.insertEmbed(
            sel?.index ?? quill.getLength(),
            'variable',
            variable,
            'user'
        );
        quill.setSelection((sel?.index ?? 0) + 1);
    } else if (
        focusedTarget.type === 'subject' &&
        focusedTarget.key === langKey
    ) {
        const el = document.getElementById(`subject-${langKey}`);
        if (!el) return;
        const chip = createChip(variable);
        const sel = window.getSelection();
        if (sel?.rangeCount && el.contains(sel.anchorNode)) {
            const range = sel.getRangeAt(0);
            range.insertNode(chip);
            range.collapse(false);
        } else el.appendChild(chip);
        updateSubjectModel(langKey);
    }
};

/* --- Subject Handling --- */
const onFocusSubject = (key) => (focusedTarget = { type: 'subject', key });
const onSubjectInput = (key) => updateSubjectModel(key);
const onClickSubject = (e, key) => {
    if (e.target.classList.contains('email-variable__remove')) {
        e.target.closest('.email-variable')?.remove();
        updateSubjectModel(key);
    }
};

const updateSubjectModel = (langKey) => {
    const el = document.getElementById(`subject-${langKey}`);
    if (!el) return;
    formData.value.subject[langKey] = Array.from(el.childNodes)
        .map((node) =>
            node.nodeType === Node.TEXT_NODE
                ? node.textContent
                : node.dataset?.variable
                  ? `{{${node.dataset.variable}}}`
                  : ''
        )
        .join('');
};

const toggleLanguage = (lang, enabled) => {
    const langs = formData.value.languages;
    if (enabled && !langs.includes(lang)) {
        langs.push(lang);
        formData.value.subject[lang] = '';
        formData.value.body[lang] = '';
    } else if (!enabled && lang !== 'en') {
        formData.value.languages = langs.filter((l) => l !== lang);
        delete formData.value.subject[lang];
        delete formData.value.body[lang];
    }
};

const onModuleChange = () => {
    const module = modules.value.find((m) => m.value === formData.value.module);
    eventOptions.value = module?.events || [];
    formData.value.event = null;
    placeholders.value = [];
};

const onEventChange = () => {
    const module = modules.value.find((m) => m.value === formData.value.module);
    const event = module?.events.find((e) => e.value === formData.value.event);
    placeholders.value = event?.placeholders || [];
};

const pushRoute = (name) => {
    router.push({ name });
};

const populateSubjects = async () => {
    await nextTick();
    formData.value.languages.forEach((lang) => {
        const el = document.getElementById(`subject-${lang}`);
        if (!el) return;
        el.innerHTML = '';
        parsePlaceholders(formData.value.subject[lang] || '', (type, val) => {
            if (type === 'text') el.appendChild(document.createTextNode(val));
            else {
                const ph = placeholders.value.find((p) => p.key === val);
                el.appendChild(
                    ph ? createChip(ph) : document.createTextNode(`{{${val}}}`)
                );
            }
        });
    });
};

const populateBodyForLanguage = (lang, quill) => {
    if (!quill || !formData.value.body[lang]) return;

    let bodyHtml = formData.value.body[lang];

    if (!bodyHtml.trim()) return;

    const regex = /\{\{(\w+)\}\}/g;
    bodyHtml = bodyHtml.replace(regex, (match, key) => {
        const ph = placeholders.value.find((p) => p.key === key);
        if (ph) {
            return `<span class="email-variable" data-variable="${ph.key}" data-label="${ph.name}"><span class="email-variable__text">${ph.name}</span><span class="email-variable__remove pi pi-times-circle"></span></span>`;
        }
        return match;
    });

    try {
        quill.clipboard.dangerouslyPasteHTML(bodyHtml, 'silent');
    } catch (err) {
        console.error('Error populating Quill editor:', err);
    }
};

const populateBodies = async () => {
    await nextTick();
    await new Promise((r) => setTimeout(r, 300));

    formData.value.languages.forEach((lang) => {
        const quill = quillInstances[lang];
        if (quill) {
            populateBodyForLanguage(lang, quill);
        }
    });
};

const save = async () => {
    const payload = {
        ...formData.value,
        subject: formattedTemplateSubjects.value,
        body: formattedTemplateBodies.value
    };
    try {
        busy.value = true;
        if (props.mode === 'new')
            await communicationTemplateStore.create(payload);
        else
            await communicationTemplateStore.update(
                communicationTemplateId.value,
                payload
            );
        pushRoute('Communication Templates');
    } catch (err) {
        templateErrors.value = err.response?.data?.errors || [];
    } finally {
        busy.value = false;
    }
};

const formatTemplateConfigs = (events) => {
    const map = {};
    for (const e of events) {
        const { module_key, module_name, key, name, placeholders } = e;
        if (!map[module_key])
            map[module_key] = {
                label: module_name,
                value: module_key,
                events: []
            };
        map[module_key].events.push({ label: name, value: key, placeholders });
    }
    return Object.values(map);
};

const populateFields = () => {
    const mod = modules.value.find((m) => m.value === formData.value.module);
    if (!mod) return;
    eventOptions.value = mod.events;
    const ev = mod.events.find((e) => e.value === formData.value.event);
    placeholders.value = ev?.placeholders || [];
};

const getConfigs = async () => {
    loading.value = true;
    try {
        const res = await communicationTemplateStore.getConfigs();
        modules.value = formatTemplateConfigs(res?.data?.events || []);
    } finally {
        loading.value = false;
    }
};

const getItem = async () => {
    if (!communicationTemplateId.value) return;
    loading.value = true;
    try {
        await getConfigs();
        const res = await communicationTemplateStore.getItem(
            communicationTemplateId.value
        );
        Object.assign(formData.value, res?.data);
        populateFields();
        await populateSubjects();
    } finally {
        loading.value = false;
        await nextTick();
        await populateBodies();
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <template v-else>
        <div class="quater-screen flex flex-col gap-4 justify-between">
            <Card>
                <template #content>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-4">
                            <label class="block mb-2" for="module">{{
                                $t('communication_templates.module')
                            }}</label>
                            <InputField
                                filter
                                v-model="formData.module"
                                :options="modules"
                                :placeholder="$t('common.select')"
                                optionValue="value"
                                optionLabel="label"
                                class="w-full"
                                id="module"
                                   variant="select"
                                @change="onModuleChange"
                            />
                        </div>
                        <div class="col-span-4">
                            <label class="block mb-2" for="event">{{
                                $t('communication_templates.event')
                            }}</label>
                            <InputField
                                filter
                                v-model="formData.event"
                                :options="eventOptions"
                                :placeholder="$t('common.select')"
                                optionValue="value"
                                optionLabel="label"
                                class="w-full"
                                id="event"
                                   variant="select"
                                @change="onEventChange"
                                :disabled="!formData.module"
                            />
                        </div>
                        <div class="col-span-4">
                            <label class="block mb-2" for="type">{{
                                $t('common.type')
                            }}</label>
                            <InputField
                                v-model="formData.type"
                                :options="communicationTemplateTypes"
                                :placeholder="$t('common.select')"
                                optionValue="value"
                                optionLabel="label"
                                class="w-full"
                                id="type"
                                   variant="select"
                            />
                        </div>

                        <div class="col-span-12 mt-3 mb-0">
                            <label class="block font-bold mb-3">{{
                                $t('communication_templates.included_languages')
                            }}</label>
                            <div class="flex items-center gap-4">
                                <div
                                    v-for="lang in communicationTemplateLangs"
                                    :key="lang.key"
                                    class="flex items-center gap-2 mb-2"
                                >
                                    <ToggleSwitch
                                        :model-value="
                                            formData.languages.includes(
                                                lang.value
                                            )
                                        "
                                        @update:model-value="
                                            (enabled) =>
                                                toggleLanguage(
                                                    lang.value,
                                                    enabled
                                                )
                                        "
                                    />
                                    <span>{{ lang.label }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
            <Card v-for="lang in activeLangs" :key="lang.value">
                <template #content>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-9">
                            <div class="mb-5">
                                <label class="block mb-2"
                                    >{{
                                        t('communication_templates.subject')
                                    }}
                                    - {{ lang.label }}</label
                                >
                                <div
                                    :id="`subject-${lang.value}`"
                                    class="p-inputtext subject-field"
                                    contenteditable="true"
                                    @focus="onFocusSubject(lang.value)"
                                    @input="onSubjectInput(lang.value)"
                                    @click="onClickSubject($event, lang.value)"
                                ></div>
                                <small
                                    v-for="(error, index) in templateErrors[
                                        `subject.${lang.value}`
                                    ]"
                                    :key="index"
                                    class="p-error block"
                                    :class="{
                                        'mb-2':
                                            index ===
                                            templateErrors[
                                                `subject.${lang.value}`
                                            ].length -
                                                1
                                    }"
                                    data-testid="validation-error"
                                >
                                    {{ error }}
                                </small>
                            </div>
                            <div class="mb-0">
                                <label class="block mb-2"
                                    >{{ t('communication_templates.body') }} -
                                    {{ lang.label }}</label
                                >
                                <Editor
                                    @load="(e) => onEditorLoad(lang.value, e)"
                                    editorStyle="height: 160px"
                                    :pt="{
                                        formats: { class: 'mr-1' },
                                        color: { class: 'hidden' },
                                        background: { class: 'hidden' },
                                        clean: { class: 'hidden' },
                                        select: { class: 'hidden' }
                                    }"
                                />
                                <small
                                    v-for="(error, index) in templateErrors[
                                        `body.${lang.value}`
                                    ]"
                                    :key="index"
                                    class="p-error block"
                                    :class="{
                                        'mb-2':
                                            index ===
                                            templateErrors[`body.${lang.value}`]
                                                .length -
                                                1
                                    }"
                                    data-testid="validation-error"
                                >
                                    {{ error }}
                                </small>
                            </div>
                        </div>
                        <div class="col-span-3 mb-0 pt-2">
                            <Accordion value="0" class="placeholder-accordion">
                                <AccordionPanel value="0">
                                    <AccordionHeader>
                                        {{
                                            t(
                                                'communication_templates.placeholder_fields'
                                            )
                                        }}
                                    </AccordionHeader>
                                    <AccordionContent>
                                        <ul
                                            v-if="placeholders.length"
                                            class="placeholder-list list-none p-0 m-0"
                                        >
                                            <li
                                                v-for="placeholder in placeholders"
                                                :key="placeholder.key"
                                                @mousedown.prevent="
                                                    insertVariable(
                                                        lang.value,
                                                        placeholder
                                                    )
                                                "
                                                class="placeholder-list__item flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition"
                                            >
                                                <div
                                                    class="icon flex justify-center items-center rounded-full bg-gray-100 w-8 h-8"
                                                >
                                                    <i
                                                        class="pi pi-code text-gray-600"
                                                    ></i>
                                                </div>
                                                <div
                                                    class="name text-base text-gray-800"
                                                >
                                                    {{ placeholder.name }}
                                                </div>
                                            </li>
                                        </ul>

                                        <div
                                            v-else
                                            class="text-center text-sm mt-2 text-gray-500"
                                        >
                                            <template
                                                v-if="
                                                    !formData.module ||
                                                    !formData.event
                                                "
                                            >
                                                {{
                                                    $t(
                                                        'communication_templates.select_module_and_event_to_see_placeholders'
                                                    )
                                                }}
                                            </template>
                                            <template v-else>
                                                {{
                                                    $t(
                                                        'communication_templates.no_placeholders_available_for_this_event'
                                                    )
                                                }}
                                            </template>
                                        </div>
                                    </AccordionContent>
                                </AccordionPanel>
                            </Accordion>
                        </div>
                    </div>
                </template>
            </Card>

            <Card>
                <template #content>
                    <div class="flex items-center justify-between">
                        <Button
                            data-testid="cancel-button"
                            :label="t('buttons.cancel')"
                            class="p-button-outlined"
                            @click="pushRoute('Communication Templates')"
                        />
                        <Button
                            data-testid="save-button"
                            :label="t('buttons.save')"
                            iconPos="right"
                            @click="save"
                            :loading="busy"
                        />
                    </div>
                </template>
            </Card>
        </div>
    </template>
</template>
<style>
.placeholder-accordion :is(.p-accordionheader, .p-accordioncontent-content) {
    background: #f7f9f8 !important;
}
.placeholder-accordion .p-accordioncontent-content {
    padding: 0.85rem 0.75rem;
    height: 255px;
    overflow-y: auto;
}
.placeholder-accordion .p-accordion-header-text {
    font-weight: 800;
    font-size: 1.1rem;
}
.placeholder-list__item {
    margin-bottom: 1.25rem;
    background: #fff;
    padding: 0.6rem 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    cursor: pointer;
}
.placeholder-list__item .icon {
    width: 1.5rem;
    aspect-ratio: 1 / 1;
    color: #0a4d8d;
    background: #eef4f6;
}
.placeholder-list__item .icon i {
    font-size: 13px;
}
span.email-variable {
    width: fit-content;
    display: inline-block;
}
.email-variable > span {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background-color: #e2e8f0;
    color: #1e293b;
    border-radius: 16px;
    font-weight: 400 !important;
    padding: 0.3rem 0.75rem;
    font-size: 0.9rem;
}
.email-variable__remove {
    cursor: pointer;
    font-size: 0.95rem;
}
.subject-field:focus {
    outline: none;
    box-shadow: 0 0 0 0.2rem #c7d2fe !important;
    border-color: #14377d !important;
}
</style>
