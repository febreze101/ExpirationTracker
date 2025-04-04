import Papa from "papaparse";
import * as XLSX from "xlsx";

const START_DATE = 25569;

export const parseCSV = (file, handleNewData, setError) => {
    Papa.parse(file, {
        complete: (results) => {
            console.log("Parsed CSV data:", results.data);
            handleNewData(results.data);
        },
        header: true, // Use the first row as headers
        skipEmptyLines: true, // Skip empty lines in the CSV
        error: (err) => {
            console.error("Error parsing CSV:", err);
            setError("Failed to parse the CSV file");
        },
    });
}

export const parseExcel = (file, handleNewData, setError) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

            // Format the data to handle dates
            const dateFormattedData = jsonData.map((row) => {
                return row.map((cell) => {
                    // If the cell is a date, convert it to a Javascript date obj
                    if (typeof cell === "number" && cell >= START_DATE) {
                        // Excel date format starts from 25569, which is equivalent to January 1, 1970
                        return new Date((cell - START_DATE) * 86400 * 1000);
                    }
                    return cell;
                });
            });

            if (dateFormattedData.length === 0) {
                setError("No data found in the Excel file");
                throw new Error("No data found in the Excel file");
            }

            // Convert array of arrays to an array of objects
            const header = jsonData[0]; // The first row will be the header
            if (!header || header.length === 0) {
                setError("No headers found in the Excel file");
                throw new Error("No headers found in the Excel file");
            }
            const dataRows = dateFormattedData.slice(1); // The rest are data rows

            const finalFormattedData = dataRows.filter(row => {
                return row.some(cell => {
                    if (cell === null || cell === undefined) return false;
                    if (typeof cell === 'string' && cell.trim() === '') return false;
                    return true;
                });
            })
                .map((row) => {
                    return header.reduce((obj, headerKey, index) => {

                        obj[headerKey] = row[index];
                        return obj
                    }, {});
                });

            console.log("Parsed Excel data:", finalFormattedData);

            handleNewData(finalFormattedData);
            setError(null)
        } catch (error) {
            setError("Error reading or parsing the Excel file: ", error)
            console.error("Error parsing Excel file: ", error)
        }
    };

    reader.onerror = () => {
        setError("Error reading the file.");
        console.error("Error reading file.");
    };

    reader.readAsArrayBuffer(file);
};
