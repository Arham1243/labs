import * as XLSX from 'xlsx';

onmessage = function (event) {
    const file = event.data;
    const reader = new FileReader();

    reader.onload = (e) => {
        let workbook;
        try {
            workbook = XLSX.read(e.target.result, {
                type: 'binary',
                cellDates: false
            });
        } catch (e) {
            postMessage({ error: 'Failed to read file: ' + e.message });
            return;
        }

        try {
            const data = {};
            workbook.SheetNames.forEach((sheet) => {
                const sheetRef = workbook.Sheets[sheet]['!ref'];
                if (!sheetRef) {
                    data[sheet] = [];
                    return;
                }

                const range =
                    'A1:AM6000' + XLSX.utils.decode_range(sheetRef).e.r;
                data[sheet] = XLSX.utils
                    .sheet_to_row_object_array(workbook.Sheets[sheet], {
                        defval: '',
                        range,
                        cellDates: false,
                        raw: true
                    })
                    .filter((obj) => {
                        const nonEmptyCount = Object.values(obj).filter(
                            (value) => value !== ''
                        ).length;

                        return nonEmptyCount >= 2;
                    });
            });

            postMessage({ data, sheets: workbook.SheetNames });
        } catch (e) {
            console.log('Parse Error', e);
            postMessage({ error: 'Failed to parse file: ' + e.message });
        }
    };

    reader.onerror = function (e) {
        console.log('Read Error', e);
        postMessage({ error: 'Failed to read file: ' + e.message });
    };

    reader.readAsBinaryString(file);
};
