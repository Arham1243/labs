import { describe, expect, it } from 'vitest';
import { PaginationOptions, SortFilterOptions } from '@/config';

describe('PaginationOptions', () => {
    it('should initialize with default values', () => {
        const pagination = new PaginationOptions();

        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(10);
        expect(pagination.rowsPerPageOptions).toEqual([10, 15, 20, 30, 50]);
    });

    it('should initialize with custom values', () => {
        const pagination = new PaginationOptions(2, 20, [5, 10, 20]);

        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(20);
        expect(pagination.rowsPerPageOptions).toEqual([5, 10, 20]);
    });

    it('should return correct page parameters', () => {
        const pagination = new PaginationOptions(3, 15);
        const params = pagination.getPageParams();

        expect(params).toEqual({
            page: 3,
            limit: 15
        });
    });

    it('should reset page parameters', () => {
        const pagination = new PaginationOptions(3, 15);
        pagination.resetPageParams();

        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(15); // limit should remain unchanged
    });

    it('should update page parameters from event', () => {
        const pagination = new PaginationOptions();
        const event = {
            page: 2, // PrimeVue uses 0-based indexing
            rows: 20
        };

        pagination.updatePageParams(event);

        expect(pagination.page).toBe(3); // Should be event.page + 1
        expect(pagination.limit).toBe(20);
    });
});

describe('SortFilterOptions', () => {
    it('should initialize with default values', () => {
        const sortFilter = new SortFilterOptions();

        expect(sortFilter.search).toBe('');
        expect(sortFilter.sort).toEqual([]);
        expect(sortFilter.filters).toEqual([]);
    });

    it('should initialize with custom values', () => {
        const search = 'test';
        const sort = [{ field: 'name', direction: 'asc' }];
        const filters = [{ field: 'status', operator: '=', value: 'active' }];

        const sortFilter = new SortFilterOptions(search, sort, filters);

        expect(sortFilter.search).toBe(search);
        expect(sortFilter.sort).toEqual(sort);
        expect(sortFilter.filters).toEqual(filters);
    });

    it('should return correct sort and filter parameters', () => {
        const search = 'test';
        const sort = [{ field: 'name', direction: 'asc' }];
        const filters = [{ field: 'status', operator: '=', value: 'active' }];

        const sortFilter = new SortFilterOptions(search, sort, filters);
        const params = sortFilter.getSortFilters();

        expect(params).toEqual({
            search: {
                value: search
            },
            sort,
            filters
        });
    });

    it('should reset sort and filter parameters', () => {
        const search = 'test';
        const sort = [{ field: 'name', direction: 'asc' }];
        const filters = [{ field: 'status', operator: '=', value: 'active' }];

        const sortFilter = new SortFilterOptions(search, sort, filters);
        sortFilter.resetSortFilters();

        expect(sortFilter.search).toBe('');
        expect(sortFilter.sort).toEqual([]);
        expect(sortFilter.filters).toEqual([]);
    });

    it('should update search parameter', () => {
        const sortFilter = new SortFilterOptions();
        const newSearch = 'updated search';

        sortFilter.updateSearch(newSearch);

        expect(sortFilter.search).toBe(newSearch);
    });

    it('should update sort parameters from multiSortMeta event', () => {
        const sortFilter = new SortFilterOptions();
        const event = {
            multiSortMeta: [
                { field: 'name', order: 1 }, // 1 = ascending in PrimeVue
                { field: 'date', order: -1 } // -1 = descending in PrimeVue
            ]
        };

        sortFilter.updateSortFilters(event);

        expect(sortFilter.sort).toEqual([
            { field: 'name', direction: 'asc' },
            { field: 'date', direction: 'desc' }
        ]);
    });

    it('should update sort parameters from sortField event', () => {
        const sortFilter = new SortFilterOptions();
        const event = {
            sortField: 'name',
            sortOrder: 1 // 1 = ascending in PrimeVue
        };

        sortFilter.updateSortFilters(event);

        expect(sortFilter.sort).toEqual([{ field: 'name', direction: 'asc' }]);
    });

    it('should handle special fields (max_days, min_days) in sort', () => {
        const sortFilter = new SortFilterOptions();
        const event = {
            sortField: 'max_days',
            sortOrder: -1 // -1 = descending in PrimeVue
        };

        sortFilter.updateSortFilters(event);

        expect(sortFilter.sort).toEqual([
            { field: 'max_days_by_unit_term', direction: 'desc' }
        ]);
    });

    it('should clear sort when event has no sort information', () => {
        const sortFilter = new SortFilterOptions('', [
            { field: 'name', direction: 'asc' }
        ]);
        const event = {};

        sortFilter.updateSortFilters(event);

        expect(sortFilter.sort).toEqual([]);
    });

    it('should update type filter', () => {
        const sortFilter = new SortFilterOptions();

        sortFilter.updateTypeFilter('active');

        expect(sortFilter.filters).toEqual([
            { field: 'type', operator: '=', value: 'active' }
        ]);
    });

    it('should clear filters when type filter is "all"', () => {
        const sortFilter = new SortFilterOptions(
            '',
            [],
            [{ field: 'type', operator: '=', value: 'active' }]
        );

        sortFilter.updateTypeFilter('all');

        expect(sortFilter.filters).toEqual([]);
    });

    it('should update filters with new field', () => {
        const sortFilter = new SortFilterOptions();

        sortFilter.updateFilters('status', 'active');

        expect(sortFilter.filters).toEqual([
            { field: 'status', operator: '=', value: 'active' }
        ]);
    });

    it('should update existing filter', () => {
        const sortFilter = new SortFilterOptions(
            '',
            [],
            [{ field: 'status', operator: '=', value: 'pending' }]
        );

        sortFilter.updateFilters('status', 'active');

        expect(sortFilter.filters).toEqual([
            { field: 'status', operator: '=', value: 'active' }
        ]);
    });

    it('should update filter with custom operator', () => {
        const sortFilter = new SortFilterOptions();

        sortFilter.updateFilters('age', 18, '>');

        expect(sortFilter.filters).toEqual([
            { field: 'age', operator: '>', value: 18 }
        ]);
    });
});
