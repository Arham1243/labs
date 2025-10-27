import { vi } from 'vitest';
import * as AnnouncementService from '@/modules/administration/services/Announcement.service';

export const searchAnnouncementMock = () =>
    vi.spyOn(AnnouncementService, 'search').mockResolvedValue({
        data: {
            data: [
                {
                    id: '789395253214175232',
                    start_at: '2025-07-29 10:45:13',
                    end_at: '2025-07-29 12:40:59',
                    portals: ['insured', 'service_provider', 'client'],
                    type: 'critical',
                    message:
                        '<p> asda sda das das dsad  asda sda das das dsad asda sda das das dsad asda sda das das dsad asda sda das das dsad</p>',
                    status: 'inactive',
                    is_expired: false
                }
            ],
            links: {
                first: 'https://api.qa.horus.guardme.dev/api/v1/announcements/search?page=1',
                last: 'https://api.qa.horus.guardme.dev/api/v1/announcements/search?page=1',
                prev: null,
                next: null
            },
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                links: [
                    {
                        url: null,
                        label: '&laquo; Previous',
                        active: false
                    },
                    {
                        url: 'https://api.qa.horus.guardme.dev/api/v1/announcements/search?page=1',
                        label: '1',
                        active: true
                    },
                    {
                        url: null,
                        label: 'Next &raquo;',
                        active: false
                    }
                ],
                path: 'https://api.qa.horus.guardme.dev/api/v1/announcements/search',
                per_page: 10,
                to: 1,
                total: 1
            }
        }
    });
