<script setup>
import { ref } from 'vue';

import AppSubMenu from './AppSubMenu.vue';

const model = ref([
    {
        label: 'Dashboards',
        icon: 'pi pi-home',
        items: [
            {
                label: 'E-Commerce',
                icon: 'pi pi-fw pi-home',
                to: '/template/'
            },
            {
                label: 'Banking',
                icon: 'pi pi-fw pi-image',
                to: '/template/dashboard-banking'
            }
        ]
    },
    {
        label: 'Apps',
        icon: 'pi pi-th-large',
        items: [
            {
                label: 'Blog',
                icon: 'pi pi-fw pi-comment',
                items: [
                    {
                        label: 'List',
                        icon: 'pi pi-fw pi-image',
                        to: '/template/apps/blog/list'
                    },
                    {
                        label: 'Detail',
                        icon: 'pi pi-fw pi-list',
                        to: '/template/apps/blog/detail'
                    },
                    {
                        label: 'Edit',
                        icon: 'pi pi-fw pi-pencil',
                        to: '/template/apps/blog/edit'
                    }
                ]
            },
            {
                label: 'Calendar',
                icon: 'pi pi-fw pi-calendar',
                to: '/template/apps/calendar'
            },
            {
                label: 'Chat',
                icon: 'pi pi-fw pi-comments',
                to: '/template/apps/chat'
            },
            {
                label: 'Files',
                icon: 'pi pi-fw pi-folder',
                to: '/template/apps/files'
            },
            {
                label: 'Mail',
                icon: 'pi pi-fw pi-envelope',
                items: [
                    {
                        label: 'Inbox',
                        icon: 'pi pi-fw pi-inbox',
                        to: '/template/apps/mail/inbox'
                    },
                    {
                        label: 'Compose',
                        icon: 'pi pi-fw pi-pencil',
                        to: '/template/apps/mail/compose'
                    },
                    {
                        label: 'Detail',
                        icon: 'pi pi-fw pi-comment',
                        to: '/template/apps/mail/detail/1000'
                    }
                ]
            },
            {
                label: 'Task List',
                icon: 'pi pi-fw pi-check-square',
                to: '/template/apps/tasklist'
            }
        ]
    },
    {
        label: 'UI Kit',
        icon: 'pi pi-fw pi-star-fill',
        items: [
            {
                label: 'Form Layout',
                icon: 'pi pi-fw pi-id-card',
                to: '/template/uikit/formlayout'
            },
            {
                label: 'Input',
                icon: 'pi pi-fw pi-check-square',
                to: '/template/uikit/input'
            },
            {
                label: 'Float Label',
                icon: 'pi pi-fw pi-bookmark',
                to: '/template/uikit/floatlabel'
            },
            {
                label: 'Invalid State',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '/template/uikit/invalidstate'
            },
            {
                label: 'Button',
                icon: 'pi pi-fw pi-box',
                to: '/template/uikit/button'
            },
            {
                label: 'Table',
                icon: 'pi pi-fw pi-table',
                to: '/template/uikit/table'
            },
            {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                to: '/template/uikit/list'
            },
            {
                label: 'Tree',
                icon: 'pi pi-fw pi-share-alt',
                to: '/template/uikit/tree'
            },
            {
                label: 'Panel',
                icon: 'pi pi-fw pi-tablet',
                to: '/template/uikit/panel'
            },
            {
                label: 'Overlay',
                icon: 'pi pi-fw pi-clone',
                to: '/template/uikit/overlay'
            },
            {
                label: 'Media',
                icon: 'pi pi-fw pi-image',
                to: '/template/uikit/media'
            },
            {
                label: 'Menu',
                icon: 'pi pi-fw pi-bars',
                to: '/template/uikit/menu'
            },
            {
                label: 'Message',
                icon: 'pi pi-fw pi-comment',
                to: '/template/uikit/message'
            },
            {
                label: 'File',
                icon: 'pi pi-fw pi-file',
                to: '/template/uikit/file'
            },
            {
                label: 'Chart',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/template/uikit/charts'
            },
            {
                label: 'Misc',
                icon: 'pi pi-fw pi-circle-off',
                to: '/template/uikit/misc'
            }
        ]
    },
    {
        label: 'Prime Blocks',
        icon: 'pi pi-fw pi-prime',
        items: [
            {
                label: 'Free Blocks',
                icon: 'pi pi-fw pi-eye',
                to: '/template/blocks'
            },
            {
                label: 'All Blocks',
                icon: 'pi pi-fw pi-globe',
                url: 'https://www.primefaces.org/primeblocks-react',
                target: '_blank'
            }
        ]
    },
    {
        label: 'Utilities',
        icon: 'pi pi-fw pi-compass',
        items: [
            {
                label: 'PrimeIcons',
                icon: 'pi pi-fw pi-prime',
                to: '/template/utilities/icons'
            },
            {
                label: 'Colors',
                icon: 'pi pi-fw pi-palette',
                to: '/template/utilities/colors'
            },
            {
                label: 'PrimeFlex',
                icon: 'pi pi-fw pi-desktop',
                url: 'https://www.primefaces.org/primeflex/',
                target: '_blank'
            },
            {
                label: 'Figma',
                icon: 'pi pi-fw pi-pencil',
                url: 'https://www.figma.com/file/zQOW0XBXdCTqODzEOqwBtt/Preview-%7C-Apollo-2022?node-id=335%3A21768&t=69qVULK1NqM8pmnE-1',
                target: '_blank'
            }
        ]
    },
    {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Landing',
                icon: 'pi pi-fw pi-globe',
                to: '/template/landing'
            },
            {
                label: 'Auth',
                icon: 'pi pi-fw pi-user',
                items: [
                    {
                        label: 'Login',
                        icon: 'pi pi-fw pi-sign-in',
                        to: '/template/auth/login'
                    },
                    {
                        label: 'Error',
                        icon: 'pi pi-fw pi-times-circle',
                        to: '/template/auth/error'
                    },
                    {
                        label: 'Access Denied',
                        icon: 'pi pi-fw pi-lock',
                        to: '/template/auth/access'
                    },
                    {
                        label: 'Register',
                        icon: 'pi pi-fw pi-user-plus',
                        to: '/template/auth/register'
                    },
                    {
                        label: 'Forgot Password',
                        icon: 'pi pi-fw pi-question',
                        to: '/template/auth/forgotpassword'
                    },
                    {
                        label: 'New Password',
                        icon: 'pi pi-fw pi-cog',
                        to: '/template/auth/newpassword'
                    },
                    {
                        label: 'Verification',
                        icon: 'pi pi-fw pi-envelope',
                        to: '/template/auth/verification'
                    },
                    {
                        label: 'Lock Screen',
                        icon: 'pi pi-fw pi-eye-slash',
                        to: '/template/auth/lockscreen'
                    }
                ]
            },
            {
                label: 'Crud',
                icon: 'pi pi-fw pi-pencil',
                to: '/template/pages/crud'
            },
            {
                label: 'Timeline',
                icon: 'pi pi-fw pi-calendar',
                to: '/template/pages/timeline'
            },
            {
                label: 'Invoice',
                icon: 'pi pi-fw pi-dollar',
                to: '/template/pages/invoice'
            },
            {
                label: 'About Us',
                icon: 'pi pi-fw pi-user',
                to: '/template/pages/aboutus'
            },
            {
                label: 'Help',
                icon: 'pi pi-fw pi-question-circle',
                to: '/template/pages/help'
            },
            {
                label: 'Not Found',
                icon: 'pi pi-fw pi-exclamation-circle',
                to: '/template/pages/notfound'
            },
            {
                label: 'Empty',
                icon: 'pi pi-fw pi-circle-off',
                to: '/template/pages/empty'
            },
            {
                label: 'FAQ',
                icon: 'pi pi-fw pi-question',
                to: '/template/pages/faq'
            },
            {
                label: 'Contact Us',
                icon: 'pi pi-fw pi-phone',
                to: '/template/pages/contact'
            }
        ]
    },
    {
        label: 'E-Commerce',
        icon: 'pi pi-fw pi-wallet',
        items: [
            {
                label: 'Product Overview',
                icon: 'pi pi-fw pi-image',
                to: '/template/ecommerce/product-overview'
            },
            {
                label: 'Product List',
                icon: 'pi pi-fw pi-list',
                to: '/template/ecommerce/product-list'
            },
            {
                label: 'New Product',
                icon: 'pi pi-fw pi-plus',
                to: '/template/ecommerce/new-product'
            },
            {
                label: 'Shopping Cart',
                icon: 'pi pi-fw pi-shopping-cart',
                to: '/template/ecommerce/shopping-cart'
            },
            {
                label: 'Checkout Form',
                icon: 'pi pi-fw pi-check-square',
                to: '/template/ecommerce/checkout-form'
            },
            {
                label: 'Order History',
                icon: 'pi pi-fw pi-history',
                to: '/template/ecommerce/order-history'
            },
            {
                label: 'Order Summary',
                icon: 'pi pi-fw pi-file',
                to: '/template/ecommerce/order-summary'
            }
        ]
    },
    {
        label: 'User Management',
        icon: 'pi pi-fw pi-user',
        items: [
            {
                label: 'List',
                icon: 'pi pi-fw pi-list',
                to: '/template/profile/list'
            },
            {
                label: 'Create',
                icon: 'pi pi-fw pi-plus',
                to: '/template/profile/create'
            }
        ]
    },
    {
        label: 'Hierarchy',
        icon: 'pi pi-fw pi-align-left',
        items: [
            {
                label: 'Submenu 1',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Submenu 1.1',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 1.1.1',
                                icon: 'pi pi-fw pi-align-left'
                            },
                            {
                                label: 'Submenu 1.1.2',
                                icon: 'pi pi-fw pi-align-left'
                            },
                            {
                                label: 'Submenu 1.1.3',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    },
                    {
                        label: 'Submenu 1.2',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 1.2.1',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Submenu 2',
                icon: 'pi pi-fw pi-align-left',
                items: [
                    {
                        label: 'Submenu 2.1',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 2.1.1',
                                icon: 'pi pi-fw pi-align-left'
                            },
                            {
                                label: 'Submenu 2.1.2',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2.2',
                        icon: 'pi pi-fw pi-align-left',
                        items: [
                            {
                                label: 'Submenu 2.2.1',
                                icon: 'pi pi-fw pi-align-left'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        label: 'Start',
        icon: 'pi pi-fw pi-download',
        items: [
            {
                label: 'Buy Now',
                icon: 'pi pi-fw pi-shopping-cart',
                url: 'https://www.primefaces.org/store'
            },
            {
                label: 'Documentation',
                icon: 'pi pi-fw pi-info-circle',
                to: '/template/documentation'
            }
        ]
    }
]);
</script>

<template>
    <AppSubMenu :model="model" />
</template>

<style lang="scss" scoped></style>
