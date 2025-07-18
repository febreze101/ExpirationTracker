import Papa from "papaparse";
import { supabase } from "../supabaseClient";

const EXPECTED_COLUMNS = [
    'Item Name',
    'GL Code',
    'Catalog',
    'Category',
    'Cost',
    'Price'
]

const REQUIRED_COLUMNS = [
    'Item Name',
    'Stock',
    'Cost',
    'Price'
]

export const parseCSV = (file, setError) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            setError("No file provided for parsing");
            return;
        }
        console.log("Parsing CSV file:", file.name);
        Papa.parse(file, {
            header: true, // Use the first row as headers
            skipEmptyLines: true, // Skip empty lines in the CSV
            error: (err) => {
                console.error("Error parsing CSV:", err);
                setError("Failed to parse the CSV file");
            },
            complete: (results) => {
                try {
                    const rawData = results.data;

                    if (rawData.length === 0) {
                        setError("No data found in the CSV file");
                        throw new Error("No data found in the CSV file");
                    }
                    // check required columns
                    const headers = Object.keys(rawData[0]);
                    const missingRequiredColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
                    if (missingRequiredColumns.length > 0) {
                        setError(`Missing required columns: ${missingRequiredColumns.join(', ')}`);
                        throw new Error(`Missing required columns: ${missingRequiredColumns.join(', ')}`);
                    }

                    const cleanedData = rawData.map((item) => {
                        const cleanedItem = {};

                        // Check if the first row contains the expected headers
                        EXPECTED_COLUMNS.forEach((key) => {
                            let value = item[key] ?? "";

                            if (typeof value === 'string') {
                                value = value.trim();
                            }

                            // Cast number fields
                            if (['Stock'].includes(key) && value !== "") {
                                // Ensure Stock is a number
                                value = parseInt(value, 10);
                            } else if (['Cost', 'Price'].includes(key)) {
                                if (value === '') {
                                    value = 0;
                                }
                                value = parseFloat(value);
                            }
                            cleanedItem[key] = value;
                        })
                        return cleanedItem;
                    });

                    console.log("Parsed and Cleaned CSV data:", cleanedData);
                    setError(null);
                    resolve(cleanedData);
                } catch (error) {
                    console.error("Error parsing CSV:", error);
                    setError("Failed to parse the CSV file");
                    reject(error);
                }
            }
        })

    })
}

const getReferenceMap = async (tableName, col) => {
    const { data, error } = await supabase.from(tableName).select(`id, ${col}`);

    if (error) {
        console.error(`Error retrieving data from ${tableName}:`, error);
        throw new Error(`Failed to retrieve data from ${tableName}`);
    }

    return new Map(data.map(entry => [entry[col]?.trim(), entry.id]));
}

export const uploadToServer = async (cleanedData) => {
    showAlert("Attempting to upload data to server...");
    if (!cleanedData || cleanedData.length === 0) {
        throw new Error("No data to upload");
    }

    try {
        const [glCodesMap, catalogsMap, categoriesMap] = await Promise.all([
            getReferenceMap('inventory_gl_codes', 'gl_code'),
            getReferenceMap('inventory_catalogs', 'catalog_type'),
            getReferenceMap('inventory_categories', 'category')
        ])

        console.log('GL Codes Map:', glCodesMap);
        console.log('Catalogs Map:', catalogsMap);
        console.log('Categories Map:', categoriesMap);

        const inventoryData = cleanedData.map(item => {
            return {
                item_name: item['Item Name']?.trim(),
                gl_code_id: glCodesMap.get(item['GL Code']?.trim()) || null,
                catalog_id: catalogsMap.get(item['Catalog']?.trim()) || null,
                category_id: categoriesMap.get(item['Category']?.trim()) || null,
                cost: item['Cost'],
                price: item['Price'],
                workspace_id: '554bac75-a8fd-4170-9336-b1541009a15e',
                num_dates_set: 0,
                date_set: false,
            }
        })

        console.log("Inventory Data to Upload:", inventoryData[0]);

        const { data, error } = await supabase
            .from('inventory')
            .insert(inventoryData)

        if (error) {
            console.error("Insert error:", error);
        } else {
            console.log("Data successfully uploaded:", data);
            showAlert("Data successfully uploaded to the server.");
        }

    } catch (error) {
        console.error("Error retrieving reference data:", error);
        throw new Error("Failed to retrieve reference data");
    }
}