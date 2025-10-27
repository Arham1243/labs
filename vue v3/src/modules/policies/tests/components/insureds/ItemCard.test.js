import { render, screen } from '@testing-library/vue';
import ItemCard from '@/modules/policies/components/insureds/ItemCard.vue';
import { expect, test } from 'vitest';

test('renders title and subtitle', () => {
    render(ItemCard, {
        props: {
            title: 'Policy # 6084-1032833L',
            subtitle: 'Nov 22, 2024 to Jan 31, 2025'
        }
    });

    expect(screen.getByText('Policy # 6084-1032833L')).toBeTruthy();
    expect(screen.getByText('Nov 22, 2024 to Jan 31, 2025')).toBeTruthy();
});

test('renders status tag with correct severity', () => {
    render(ItemCard, {
        props: {
            title: 'Non-insurance product # 98765',
            status: 'ACTIVE',
            statusSeverity: 'success'
        }
    });

    expect(screen.getByText('ACTIVE')).toBeTruthy();
});

test('renders details when provided', () => {
    render(ItemCard, {
        props: {
            title: 'Jane Doe',
            subtitle: 'Dependant',
            detailsLeft: 'DOB: March 15, 2010',
            detailsRight: 'Covered under Policy # 6084-1032833L'
        }
    });

    expect(screen.getByText('DOB: March 15, 2010')).toBeTruthy();
    expect(
        screen.getByText('Covered under Policy # 6084-1032833L')
    ).toBeTruthy();
});

test('renders title as a button link when "link" prop is provided', () => {
    render(ItemCard, {
        props: {
            title: 'Policy # 6084-1032833L',
            link: '/policy/6084-1032833L'
        }
    });

    const link = screen.getByRole('button', { name: 'Policy # 6084-1032833L' });
    expect(link).toBeTruthy();
});

test('does not render status tag if no status is provided', () => {
    render(ItemCard, {
        props: {
            title: 'Policy # 6084-1032833L'
        }
    });

    expect(screen.queryByText('ACTIVE')).toBeNull();
});
