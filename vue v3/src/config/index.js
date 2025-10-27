export class PaginationOptions {
    constructor(page = 1, limit = 10, options = [10, 15, 20, 30, 50]) {
        this.page = page;
        this.limit = limit;
        this.rowsPerPageOptions = options;
    }

    getPageParams = () => {
        return {
            page: this.page,
            limit: this.limit
        };
    };

    resetPageParams = () => {
        this.page = 1;
    };

    updatePageParams = (event) => {
        this.page = event.page + 1;
        this.limit = event.rows;
    };
}

export class SortFilterOptions {
    constructor(search = '', sort = [], filters = []) {
        this.search = search;
        this.sort = sort;
        this.filters = filters;
    }

    getSortFilters = () => {
        return {
            search: {
                value: this.search
            },
            sort: this.sort,
            filters: this.filters
        };
    };

    resetSortFilters = () => {
        this.search = '';
        this.sort = [];
        this.filters = [];
    };

    updateSearch = (search) => {
        this.search = search;
    };

    updateSortFilters = (event) => {
        if (event && event.multiSortMeta && event.multiSortMeta.length) {
            this.sort = event.multiSortMeta.map((item) => {
                return {
                    field: item.field,
                    direction: item.order == 1 ? 'asc' : 'desc'
                };
            });
        } else if (event && event.sortField) {
            if (['max_days', 'min_days'].includes(event.sortField)) {
                event.sortField += '_by_unit_term';
            }
            this.sort = [
                {
                    field: event.sortField,
                    direction: event.sortOrder == 1 ? 'asc' : 'desc'
                }
            ];
        } else this.sort = [];
    };

    updateTypeFilter = (selectedType) => {
        if (selectedType && selectedType !== 'all') {
            this.filters = [
                { field: 'type', operator: '=', value: selectedType }
            ];
        } else {
            this.filters = [];
        }
    };

    updateFilters = (field, value, operator = '=') => {
        const existingFilterIndex = this.filters.findIndex(
            (filter) => filter.field === field
        );

        if (existingFilterIndex !== -1) {
            this.filters[existingFilterIndex] = { field, operator, value };
        } else {
            this.filters.push({ field, operator, value });
        }
    };
}

export * from './enums';
