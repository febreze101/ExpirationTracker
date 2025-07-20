import JSZip from "jszip";
import Papa from "papaparse";
import { parseCSV } from "./fileParser";


export async function importDbFromZip(file, handleTableData, setError) {
    const zip = await JSZip.loadAsync(file);

    // Loop through each file in the zip
    for (const fileName in zip.files) {
        if (fileName.endsWith('.csv')) {
            const tableName = fileName.replace('.csv', '')
            const csvString = await zip.files[fileName].async('string')

            Papa.parse(csvString,
                {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        handleTableData(tableName, results.data);
                    },
                    error: (err) => {
                        setError(`Failed to parse ${fileName}: ${err.message}`);
                    }
                }
            )
        }
    }
}