import pinia from '../stores';
import router from '../routes';
import { i18n, loadAndAddLocaleMessages } from './i18n';
import utils from '../utils';
import { abilitiesPlugin } from '@casl/vue';
import { ability } from '@/plugins/ability'; // the global ability instance
import '@/assets/tailwind.css';

export * from './i18n'; // To expose i18n outside modules

import 'vue-tel-input/vue-tel-input.css';
import '@/assets/styles.scss';
import '@vue-js-cron/light/dist/light.css';

import VueTelInput from 'vue-tel-input';
import CronLighPlugin from '@vue-js-cron/light';

// Prime Vue services
import PrimeVue from 'primevue/config';
import DialogService from 'primevue/dialogservice';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import AppPreset from './app-preset'

// Prime Vue Directives
import Ripple from 'primevue/ripple';
import Tooltip from 'primevue/tooltip';
import OverlayBadge from 'primevue/overlaybadge';
import StyleClass from 'primevue/styleclass';

// Prime Vue Components
import AutoComplete from 'primevue/autocomplete';
import Accordion from 'primevue/accordion';
// import AccordionTab from 'primevue/accordiontab';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Badge from 'primevue/badge';
import BlockUI from 'primevue/blockui';
import Button from 'primevue/button';
import Breadcrumb from 'primevue/breadcrumb';
import PrimeDatePicker from 'primevue/datepicker';
import Card from 'primevue/card';
import Chart from 'primevue/chart';
import CascadeSelect from 'primevue/cascadeselect';
import Carousel from 'primevue/carousel';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
// import Chips from 'primevue/chips';
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import ContextMenu from 'primevue/contextmenu';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
// import DataViewLayoutOptions from 'primevue/dataviewlayoutoptions';
import DeferredContent from 'primevue/deferredcontent';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dock from 'primevue/dock';
import Select from 'primevue/select';
import DynamicDialog from 'primevue/dynamicdialog';
import Editor from 'primevue/editor';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';

import Galleria from 'primevue/galleria';
import Image from 'primevue/image';
import InlineMessage from 'primevue/inlinemessage';
import Inplace from 'primevue/inplace';
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from 'primevue/inputtext';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import Knob from 'primevue/knob';
import Listbox from 'primevue/listbox';
import MegaMenu from 'primevue/megamenu';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import OrderList from 'primevue/orderlist';
import OrganizationChart from 'primevue/organizationchart';
import Popover from 'primevue/popover';
import Paginator from 'primevue/paginator';
import Panel from 'primevue/panel';
import PanelMenu from 'primevue/panelmenu';
import Password from 'primevue/password';
import PickList from 'primevue/picklist';
import ProgressBar from 'primevue/progressbar';
import ProgressSpinner from 'primevue/progressspinner';
import Rating from 'primevue/rating';
import RadioButton from 'primevue/radiobutton';
import Row from 'primevue/row';
import SelectButton from 'primevue/selectbutton';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import Slider from 'primevue/slider';
import Drawer from 'primevue/drawer';
import SpeedDial from 'primevue/speeddial';
import SplitButton from 'primevue/splitbutton';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Steps from 'primevue/steps';
import TabMenu from 'primevue/tabmenu';
import TieredMenu from 'primevue/tieredmenu';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
// import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Terminal from 'primevue/terminal';
import Timeline from 'primevue/timeline';
import ToggleButton from 'primevue/togglebutton';
import Tree from 'primevue/tree';
import TreeSelect from 'primevue/treeselect';
import TreeTable from 'primevue/treetable';
// import TriStateCheckbox from 'primevue/tristatecheckbox';
import VirtualScroller from 'primevue/virtualscroller';

// Custom components
import Loader from '@/components/common/Loader.vue';
import Search from '@/components/common/Search.vue';
import Header from '@/components/common/Header.vue';
import BaseTable from '@/components/common/BaseTable.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import ConfirmWarning from '@/components/common/ConfirmWarning.vue';
import BlockViewer from '@/components/BlockViewer.vue';
import Confirmation from '@/components/common/Confirmation.vue';
import InputField from '@/components/common/InputField.vue';
import DatePicker from '@/components/common/DatePicker.vue';
import DatePickerV2 from '@/components/common/DatePickerV2.vue';
import LocaleField from '@/components/common/LocaleField.vue';
import ApiAutocomplete from '@/components/common/ApiAutocomplete.vue';
import ImportDialog from '@/components/common/ImportDialog.vue';
import ApiDropdown from '@/components/common/ApiDropdown.vue';
import ApiMultiselect from '@/components/common/ApiMultiselect.vue';
import SelectableIconButton from '@/components/common/SelectableIconButton.vue';

export function registerPlugins(app) {
    app.use(i18n);
    app.use(utils);
    app.use(pinia);
    app.use(router);

    app.use(PrimeVue, {
        theme: {
            preset: AppPreset,
            options: {
                darkModeSelector: '.app-dark'
            }
        },
        ripple: true
    });
    app.use(ToastService);
    app.use(DialogService);
    app.use(ConfirmationService);
    app.use(VueTelInput);
    app.use(CronLighPlugin);
    app.use(abilitiesPlugin, ability, {
        useGlobalProperties: true
    });

    app.directive('tooltip', Tooltip);
    app.component('OverlayBadge', OverlayBadge);
    app.directive('ripple', Ripple);
    app.directive('styleclass', StyleClass);

    app.component('Accordion', Accordion);
    // app.component('AccordionTab', AccordionTab);
    app.component('AutoComplete', AutoComplete);
    app.component('Avatar', Avatar);
    app.component('AvatarGroup', AvatarGroup);
    app.component('Badge', Badge);
    app.component('BlockUI', BlockUI);
    app.component('Breadcrumb', Breadcrumb);
    app.component('Button', Button);
    app.component('DatePicker', PrimeDatePicker);
    app.component('Card', Card);
    app.component('Chart', Chart);
    app.component('Carousel', Carousel);
    app.component('CascadeSelect', CascadeSelect);
    app.component('Checkbox', Checkbox);
    app.component('Chip', Chip);
    // app.component('Chips', Chips);
    app.component('ColorPicker', ColorPicker);
    app.component('Column', Column);
    app.component('ColumnGroup', ColumnGroup);
    app.component('ConfirmDialog', ConfirmDialog);
    app.component('ConfirmPopup', ConfirmPopup);
    app.component('ContextMenu', ContextMenu);
    app.component('DataTable', DataTable);
    app.component('DataView', DataView);
    // app.component('DataViewLayoutOptions', DataViewLayoutOptions);
    app.component('DeferredContent', DeferredContent);
    app.component('Dialog', Dialog);
    app.component('Divider', Divider);
    app.component('Dock', Dock);
    app.component('Select', Select);
    app.component('DynamicDialog', DynamicDialog);
    app.component('Editor', Editor);
    app.component('Fieldset', Fieldset);
    app.component('FileUpload', FileUpload);
    app.component('Galleria', Galleria);
    app.component('Image', Image);
    app.component('InlineMessage', InlineMessage);
    app.component('Inplace', Inplace);
    app.component('InputMask', InputMask);
    app.component('InputNumber', InputNumber);
    app.component('ToggleSwitch', ToggleSwitch);
    app.component('InputText', InputText);
    app.component('Knob', Knob);
    app.component('Listbox', Listbox);
    app.component('MegaMenu', MegaMenu);
    app.component('Menu', Menu);
    app.component('Menubar', Menubar);
    app.component('Message', Message);
    app.component('MultiSelect', MultiSelect);
    app.component('OrderList', OrderList);
    app.component('OrganizationChart', OrganizationChart);
    app.component('Popover', Popover);
    app.component('Paginator', Paginator);
    app.component('Panel', Panel);
    app.component('PanelMenu', PanelMenu);
    app.component('Password', Password);
    app.component('PickList', PickList);
    app.component('ProgressBar', ProgressBar);
    app.component('ProgressSpinner', ProgressSpinner);
    app.component('RadioButton', RadioButton);
    app.component('Rating', Rating);
    app.component('Row', Row);
    app.component('SelectButton', SelectButton);
    app.component('ScrollPanel', ScrollPanel);
    app.component('ScrollTop', ScrollTop);
    app.component('Slider', Slider);
    app.component('Drawer', Drawer);
    app.component('Skeleton', Skeleton);
    app.component('SpeedDial', SpeedDial);
    app.component('SplitButton', SplitButton);
    app.component('Splitter', Splitter);
    app.component('SplitterPanel', SplitterPanel);
    app.component('Steps', Steps);
    app.component('TabMenu', TabMenu);
    // app.component('TabView', TabView);
    app.component('TabPanel', TabPanel);
    app.component('Tag', Tag);
    app.component('Textarea', Textarea);
    app.component('Terminal', Terminal);
    app.component('TieredMenu', TieredMenu);
    app.component('Timeline', Timeline);
    app.component('Toast', Toast);
    app.component('Toolbar', Toolbar);
    app.component('ToggleButton', ToggleButton);
    app.component('Tree', Tree);
    app.component('TreeSelect', TreeSelect);
    app.component('TreeTable', TreeTable);
    // app.component('TriStateCheckbox', TriStateCheckbox);
    app.component('VirtualScroller', VirtualScroller);

    app.component('Loader', Loader);
    app.component('Search', Search);
    app.component('Header', Header);
    app.component('BaseTable', BaseTable);
    app.component('StatusTag', StatusTag);
    app.component('ConfirmWarning', ConfirmWarning);
    app.component('BlockViewer', BlockViewer);
    app.component('Confirmation', Confirmation);
    app.component('InputField', InputField);
    app.component('CustomDatePicker', DatePicker);
    app.component('DatePickerV2', DatePickerV2);
    app.component('LocaleField', LocaleField);
    app.component('ApiAutocomplete', ApiAutocomplete);
    app.component('ImportDialog', ImportDialog);
    app.component('ApiDropdown', ApiDropdown);
    app.component('ApiMultiselect', ApiMultiselect);
    app.component('SelectableIconButton', SelectableIconButton);
}

const directives = {
    ripple: Ripple,
    tooltip: Tooltip,
    styleclass: StyleClass
};

// Define the components array
const components = {
    Accordion,
    // AccordionTab,
    AutoComplete,
    Avatar,
    AvatarGroup,
    Badge,
    BlockUI,
    Breadcrumb,
    Button,
    // Calendar,
    Card,
    Chart,
    Carousel,
    CascadeSelect,
    Checkbox,
    Chip,
    // Chips,
    ColorPicker,
    Column,
    ColumnGroup,
    ConfirmDialog,
    ConfirmPopup,
    ContextMenu,
    DataTable,
    DataView,
    // DataViewLayoutOptions,
    DeferredContent,
    Dialog,
    Divider,
    Dock,
    Select,
    DynamicDialog,
    Editor,
    Fieldset,
    FileUpload,
    Galleria,
    Image,
    InlineMessage,
    Inplace,
    InputMask,
    InputNumber,
    ToggleSwitch,
    InputText,
    Knob,
    Listbox,
    MegaMenu,
    Menu,
    Menubar,
    Message,
    MultiSelect,
    OrderList,
    OrganizationChart,
    Popover,
    Paginator,
    Panel,
    PanelMenu,
    Password,
    PickList,
    ProgressBar,
    ProgressSpinner,
    RadioButton,
    Rating,
    Row,
    SelectButton,
    ScrollPanel,
    ScrollTop,
    Slider,
    Drawer,
    Skeleton,
    SpeedDial,
    SplitButton,
    Splitter,
    SplitterPanel,
    Steps,
    TabMenu,
    // TabView,
    TabPanel,
    Tag,
    Textarea,
    Terminal,
    TieredMenu,
    Timeline,
    Toast,
    Toolbar,
    ToggleButton,
    Tree,
    TreeSelect,
    TreeTable,
    // TriStateCheckbox,
    VirtualScroller,
    Loader,
    Search,
    Header,
    BaseTable,
    StatusTag,
    ConfirmWarning,
    BlockViewer,
    Confirmation,
    InputField,
    PrimeDatePicker,
    DatePickerV2,
    LocaleField,
    ApiAutocomplete,
    ImportDialog,
    ApiDropdown,
    ApiMultiselect,
    SelectableIconButton
};

const plugins = [
    i18n,
    utils,
    pinia,
    router,
    PrimeVue,
    ToastService,
    DialogService,
    ConfirmationService,
    VueTelInput,
    CronLighPlugin,
    [
        abilitiesPlugin,
        ability,
        {
            useGlobalProperties: true
        }
    ]
];

export { directives, components, plugins };
