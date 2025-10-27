import AxiosService from '@/services/Axios.service';
import { BASE_URL } from '@/modules/claims/utils';

export const searchInvoices = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/invoices/search`, payload, {
        params
    });
};

export const getInvoiceItems = (id, params) => {
    return AxiosService.get(`${BASE_URL}/invoices/${id}/items`, {
        params
    });
};

export const getInvoiceDetails = (id) => {
    return AxiosService.get(`${BASE_URL}/invoices/${id}/details`);
};

export const getInvoiceOverdueSummary = () => {
    return AxiosService.get(`${BASE_URL}/invoices/overdue-amount-summary`);
};

export const getInvoiceStatusCounts = () => {
    return AxiosService.get(`${BASE_URL}/invoices/status-counts`);
};

export const getAllClients = () => {
    // return AxiosService.post(`${BASE_URL}/clients/all`, {}, {});
    // TODO: replace with actual API implementation
    const data = {
        data: [
            {
                id: '758599594941763584',
                name: 'tempora dolorem vero',
                business_units: [
                    {
                        id: '758599594962735104',
                        name: 'quis recusandae et',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595067592704',
                name: 'doloremque voluptate fugit',
                business_units: [
                    {
                        id: '758599595084369920',
                        name: 'id et cum',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595176644608',
                name: 'ullam vero vero',
                business_units: [
                    {
                        id: '758599595197616128',
                        name: 'esse sunt quia',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595298279424',
                name: 'eaque optio eaque',
                business_units: [
                    {
                        id: '758599595315056640',
                        name: 'sed autem soluta',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595411525632',
                name: 'provident qui minima',
                business_units: [
                    {
                        id: '758599595432497152',
                        name: 'occaecati saepe aperiam',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595541549056',
                name: 'rerum modi repellat',
                business_units: [
                    {
                        id: '758599595558326272',
                        name: 'voluptatem repellat dolores',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595667378176',
                name: 'aut laborum officiis',
                business_units: [
                    {
                        id: '758599595700932608',
                        name: 'reprehenderit corporis odio',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595814178816',
                name: 'dolorem ullam maxime',
                business_units: [
                    {
                        id: '758599595835150336',
                        name: 'iusto sequi doloribus',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599595940007936',
                name: 'nihil debitis alias',
                business_units: [
                    {
                        id: '758599595960979456',
                        name: 'atque reiciendis non',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599596065837056',
                name: 'consectetur quis porro',
                business_units: [
                    {
                        id: '758599596095197184',
                        name: 'enim non doloremque',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599596225220608',
                name: 'nihil saepe alias',
                business_units: [
                    {
                        id: '758599596258775040',
                        name: 'voluptate beatae eos',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599596409769984',
                name: 'sit veritatis numquam',
                business_units: [
                    {
                        id: '758599596460101632',
                        name: 'iusto praesentium repudiandae',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599596590125056',
                name: 'quasi dolore molestias',
                business_units: [
                    {
                        id: '758599596611096576',
                        name: 'et sunt rerum',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599596707565568',
                name: 'quidem mollitia laudantium',
                business_units: [
                    {
                        id: '758599596728537088',
                        name: 'in nesciunt illo',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599596845977600',
                name: 'perferendis veritatis est',
                business_units: [
                    {
                        id: '758599596887920640',
                        name: 'quaerat error reiciendis',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599597173133312',
                name: 'id magni tempore',
                business_units: [
                    {
                        id: '758599597223464960',
                        name: 'consequatur nobis incidunt',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599597449957376',
                name: 'in nihil id',
                business_units: [
                    {
                        id: '758599597475123200',
                        name: 'repellat ullam blanditiis',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599597579980800',
                name: 'sint quia ut',
                business_units: [
                    {
                        id: '758599597605146624',
                        name: 'temporibus velit ducimus',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599597701615616',
                name: 'nihil illo id',
                business_units: [
                    {
                        id: '758599597726781440',
                        name: 'qui voluptatem architecto',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599597844221952',
                name: 'molestiae quo dolor',
                business_units: [
                    {
                        id: '758599597873582080',
                        name: 'qui commodi similique',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599597991022592',
                name: 'doloremque enim corporis',
                business_units: [
                    {
                        id: '758599598007799808',
                        name: 'sit tenetur nobis',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599598146211840',
                name: 'et iure velit',
                business_units: [
                    {
                        id: '758599598171377664',
                        name: 'labore voluptatem nisi',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599598276235264',
                name: 'et dolorum perspiciatis',
                business_units: [
                    {
                        id: '758599598297206784',
                        name: 'fugit et qui',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599598406258688',
                name: 'qui dolor et',
                business_units: [
                    {
                        id: '758599598423035904',
                        name: 'possimus voluptatem vel',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758599598532087808',
                name: 'est sed eos',
                business_units: [
                    {
                        id: '758599598561447936',
                        name: 'explicabo libero quis',
                        status: 'draft'
                    }
                ]
            },
            {
                id: '758600859987255296',
                name: 'Cambridge University',
                business_units: [
                    {
                        id: '758631799797166080',
                        name: 'Cambridge Campus',
                        status: 'active'
                    }
                ]
            },
            {
                id: '758633752632840192',
                name: 'qui occaecati placeat',
                business_units: [
                    {
                        id: '758633752670588928',
                        name: 'molestias ea error',
                        status: 'draft'
                    }
                ]
            }
        ]
    };
    return data;
};

export const voidInvoice = ({ invoiceId, void_reason }) => {
    return AxiosService.post(`${BASE_URL}/invoices/${invoiceId}/void`, {
        void_reason
    });
};

export const recordPayment = (payload, invoiceId) => {
    return AxiosService.post(
        `${BASE_URL}/invoices/${invoiceId}/record-payment`,
        payload
    );
};

export const exportInvoices = (payload) => {
    return AxiosService.post(`${BASE_URL}/invoices/export`, payload);
};
