const CurrencyRates = require('../models/currencyRate');
const Currency = require('../models/currency'); 

const getCurrencyById = async (req, res) => {
    const { id } = req.params;  // Assuming you're passing the currency ID as a URL parameter

    try {
        // Find the currency by its ObjectId
        const currency = await Currency.findById(id);

        // If the currency is not found, return a 404 error
        if (!currency) {
            return res.status(404).json({ message: 'Currency not found.' });
        }

        // Return the found currency object as JSON
        // console.log("backend", currency);
        res.status(200).json(currency);
    } catch (error) {
        console.error('Error fetching currency by ID:', error);
        res.status(500).json({ message: 'Error fetching currency.' });
    }
};

// Example method to fetch exchange rates
const getExchangeRate = async (req, res) => {
        const { base, target } = req.body;
    
        try {
            let baseCurrency;
            
            // Fetch the base and target currencies by their ObjectId
            if (base === 'withEGP'){
                baseCurrency = await Currency.findOne({ code: 'EGP' });
            } else{
                baseCurrency = await Currency.findById(base);
            }
            const targetCurrency = await Currency.findById(target);
    
            if (!baseCurrency || !targetCurrency) {
                return res.status(400).json({ message: 'Currency not found.' });
            }
    
            // Get the 'code' from the found Currency documents
            const baseCode = baseCurrency.code;
            const targetCode = targetCurrency.code;
    
            // Fetch the latest currency rates from the database
            const latestRates = await CurrencyRates.findOne().sort({ lastUpdated: -1 });
    
            if (!latestRates) {
                return res.status(404).json({ message: 'Exchange rates not available.' });
            }
    
            // Get the rates for base and target currencies
            const baseRate = latestRates.rates.get(baseCode);
            const targetRate = latestRates.rates.get(targetCode);
    
            if (!baseRate || !targetRate) {
                return res.status(404).json({ message: 'Exchange rate not available for one or both currencies.' });
            }
    
            // Calculate the exchange rate
            const exchangeRate = targetRate / baseRate;
    
            res.json({
                base: baseCode,
                target: targetCode,
                conversion_rate: exchangeRate,
                lastUpdated: latestRates.lastUpdated
            });
    
        } catch (error) {
            console.error('Error calculating exchange rate:', error);
            res.status(500).json({ message: 'Error calculating exchange rate.' });
        }
};

const getSupportedCurrencies = async (req, res) => {
    try {
        // Fetch all currencies from the database
        const currencies = await Currency.find();

        // Check if any currencies are available in the database
        if (!currencies || currencies.length === 0) {
            return res.status(404).json({ message: 'No currencies found in the database.' });
        }

        // Return the currencies to the frontend
        res.status(200).json(currencies);
    } catch (error) {
        console.error('Error fetching currencies from the database:', error);
        res.status(500).json({ message: 'Error fetching currencies from the database.' });
    }
};

module.exports = {
    // populateCurrencies,
    getExchangeRate,
    getCurrencyById,
    getSupportedCurrencies,
};


// const predefinedCurrencies = [
//     { code: "AED", name: "United Arab Emirates Dirham", symbol: "د.إ" },
//     { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
//     { code: "ALL", name: "Albanian Lek", symbol: "L" },
//     { code: "AMD", name: "Armenian Dram", symbol: "֏" },
//     { code: "ANG", name: "Netherlands Antillean Guilder", symbol: "ƒ" },
//     { code: "AOA", name: "Angolan Kwanza", symbol: "Kz" },
//     { code: "ARS", name: "Argentine Peso", symbol: "$" },
//     { code: "AUD", name: "Australian Dollar", symbol: "$" },
//     { code: "AWG", name: "Aruban Florin", symbol: "ƒ" },
//     { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
//     { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark", symbol: "KM" },
//     { code: "BBD", name: "Barbadian Dollar", symbol: "$" },
//     { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
//     { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
//     { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
//     { code: "BIF", name: "Burundian Franc", symbol: "Fr" },
//     { code: "BMD", name: "Bermudian Dollar", symbol: "$" },
//     { code: "BND", name: "Brunei Dollar", symbol: "$" },
//     { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs." },
//     { code: "BRL", name: "Brazilian Real", symbol: "R$" },
//     { code: "BSD", name: "Bahamian Dollar", symbol: "$" },
//     { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu." },
//     { code: "BWP", name: "Botswana Pula", symbol: "P" },
//     { code: "BYN", name: "Belarusian Ruble", symbol: "Br" },
//     { code: "BZD", name: "Belize Dollar", symbol: "$" },
//     { code: "CAD", name: "Canadian Dollar", symbol: "$" },
//     { code: "CDF", name: "Congolese Franc", symbol: "Fr" },
//     { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
//     { code: "CLP", name: "Chilean Peso", symbol: "$" },
//     { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
//     { code: "COP", name: "Colombian Peso", symbol: "$" },
//     { code: "CRC", name: "Costa Rican Colón", symbol: "₡" },
//     { code: "CUP", name: "Cuban Peso", symbol: "₱" },
//     { code: "CVE", name: "Cape Verdean Escudo", symbol: "$" },
//     { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
//     { code: "DJF", name: "Djiboutian Franc", symbol: "Fr" },
//     { code: "DKK", name: "Danish Krone", symbol: "kr" },
//     { code: "DOP", name: "Dominican Peso", symbol: "$" },
//     { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" },
//     { code: "EGP", name: "Egyptian Pound", symbol: "£" },
//     { code: "ERN", name: "Eritrean Nakfa", symbol: "Nkf" },
//     { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
//     { code: "EUR", name: "Euro", symbol: "€" },
//     { code: "FJD", name: "Fijian Dollar", symbol: "$" },
//     { code: "FKP", name: "Falkland Islands Pound", symbol: "£" },
//     { code: "FOK", name: "Faroese Króna", symbol: "kr" },
//     { code: "GBP", name: "British Pound Sterling", symbol: "£" },
//     { code: "GEL", name: "Georgian Lari", symbol: "₾" },
//     { code: "GGP", name: "Guernsey Pound", symbol: "£" },
//     { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
//     { code: "GIP", name: "Gibraltar Pound", symbol: "£" },
//     { code: "GMD", name: "Gambian Dalasi", symbol: "D" },
//     { code: "GNF", name: "Guinean Franc", symbol: "Fr" },
//     { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
//     { code: "GYD", name: "Guyanese Dollar", symbol: "$" },
//     { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
//     { code: "HNL", name: "Honduran Lempira", symbol: "L" },
//     { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
//     { code: "HTG", name: "Haitian Gourde", symbol: "G" },
//     { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
//     { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
//     { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
//     { code: "IMP", name: "Isle of Man Pound", symbol: "£" },
//     { code: "INR", name: "Indian Rupee", symbol: "₹" },
//     { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
//     { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
//     { code: "ISK", name: "Icelandic Króna", symbol: "kr" },
//     { code: "JEP", name: "Jersey Pound", symbol: "£" },
//     { code: "JMD", name: "Jamaican Dollar", symbol: "$" },
//     { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
//     { code: "JPY", name: "Japanese Yen", symbol: "¥" },
//     { code: "KES", name: "Kenyan Shilling", symbol: "Sh" },
//     { code: "KGS", name: "Kyrgyzstani Som", symbol: "с" },
//     { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
//     { code: "KID", name: "Kiribati Dollar", symbol: "$" },
//     { code: "KMF", name: "Comorian Franc", symbol: "Fr" },
//     { code: "KRW", name: "South Korean Won", symbol: "₩" },
//     { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
//     { code: "KYD", name: "Cayman Islands Dollar", symbol: "$" },
//     { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
//     { code: "LAK", name: "Lao Kip", symbol: "₭" },
//     { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
//     { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
//     { code: "LRD", name: "Liberian Dollar", symbol: "$" },
//     { code: "LSL", name: "Lesotho Loti", symbol: "L" },
//     { code: "LYD", name: "Libyan Dinar", symbol: "ل.د" },
//     { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
//     { code: "MDL", name: "Moldovan Leu", symbol: "L" },
//     { code: "MGA", name: "Malagasy Ariary", symbol: "Ar" },
//     { code: "MKD", name: "Macedonian Denar", symbol: "ден" },
//     { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
//     { code: "MNT", name: "Mongolian Tögrög", symbol: "₮" },
//     { code: "MOP", name: "Macanese Pataca", symbol: "P" },
//     { code: "MRU", name: "Mauritanian Ouguiya", symbol: "UM" },
//     { code: "MUR", name: "Mauritian Rupee", symbol: "₨" },
//     { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf" },
//     { code: "MWK", name: "Malawian Kwacha", symbol: "MK" },
//     { code: "MXN", name: "Mexican Peso", symbol: "$" },
//     { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
//     { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
//     { code: "NAD", name: "Namibian Dollar", symbol: "$" },
//     { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
//     { code: "NIO", name: "Nicaraguan Córdoba", symbol: "C$" },
//     { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
//     { code: "NPR", name: "Nepalese Rupee", symbol: "Rs" },
//     { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
//     { code: "OMR", name: "Omani Rial", symbol: "ر.ع." },
//     { code: "PAB", name: "Panamanian Balboa", symbol: "B/." },
//     { code: "PEN", name: "Peruvian Sol", symbol: "S/." },
//     { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
//     { code: "PHP", name: "Philippine Peso", symbol: "₱" },
//     { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
//     { code: "PLN", name: "Polish Złoty", symbol: "zł" },
//     { code: "PYG", name: "Paraguayan Guaraní", symbol: "₲" },
//     { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
//     { code: "RON", name: "Romanian Leu", symbol: "lei" },
//     { code: "RSD", name: "Serbian Dinar", symbol: "дин." },
//     { code: "RUB", name: "Russian Ruble", symbol: "₽" },
//     { code: "RWF", name: "Rwandan Franc", symbol: "Fr" },
//     { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
//     { code: "SBD", name: "Solomon Islands Dollar", symbol: "$" },
//     { code: "SCR", name: "Seychellois Rupee", symbol: "₨" },
//     { code: "SDG", name: "Sudanese Pound", symbol: "£" },
//     { code: "SEK", name: "Swedish Krona", symbol: "kr" },
//     { code: "SGD", name: "Singapore Dollar", symbol: "$" },
//     { code: "SHP", name: "Saint Helena Pound", symbol: "£" },
//     { code: "SLE", name: "Sierra Leonean Leone", symbol: "Le" },
//     { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le" },
//     { code: "SOS", name: "Somali Shilling", symbol: "Sh" },
//     { code: "SRD", name: "Surinamese Dollar", symbol: "$" },
//     { code: "SSP", name: "South Sudanese Pound", symbol: "£" },
//     { code: "STN", name: "São Tomé and Príncipe Dobra", symbol: "Db" },
//     { code: "SYP", name: "Syrian Pound", symbol: "£" },
//     { code: "SZL", name: "Eswatini Lilangeni", symbol: "L" },
//     { code: "THB", name: "Thai Baht", symbol: "฿" },
//     { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ" },
//     { code: "TMT", name: "Turkmenistani Manat", symbol: "m" },
//     { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
//     { code: "TOP", name: "Tongan Paʻanga", symbol: "T$" },
//     { code: "TRY", name: "Turkish Lira", symbol: "₺" },
//     { code: "TTD", name: "Trinidad and Tobago Dollar", symbol: "$" },
//     { code: "TVD", name: "Tuvaluan Dollar", symbol: "$" },
//     { code: "TWD", name: "New Taiwan Dollar", symbol: "$" },
//     { code: "TZS", name: "Tanzanian Shilling", symbol: "Sh" },
//     { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
//     { code: "UGX", name: "Ugandan Shilling", symbol: "Sh" },
//     { code: "USD", name: "United States Dollar", symbol: "$" },
//     { code: "UYU", name: "Uruguayan Peso", symbol: "$" },
//     { code: "UZS", name: "Uzbekistani Soʻm", symbol: "сўм" },
//     { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs." },
//     { code: "VND", name: "Vietnamese Đồng", symbol: "₫" },
//     { code: "VUV", name: "Vanuatu Vatu", symbol: "Vt" },
//     { code: "WST", name: "Samoan Tālā", symbol: "T" },
//     { code: "XAF", name: "Central African CFA Franc", symbol: "Fr" },
//     { code: "XCD", name: "East Caribbean Dollar", symbol: "$" },
//     { code: "XOF", name: "West African CFA Franc", symbol: "Fr" },
//     { code: "XPF", name: "CFP Franc", symbol: "Fr" },
//     { code: "YER", name: "Yemeni Rial", symbol: "﷼" },
//     { code: "ZAR", name: "South African Rand", symbol: "R" },
//     { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" },
//     { code: "ZWL", name: "Zimbabwean Dollar", symbol: "$" }
// ];

// const populateCurrencies = async (req, res) => {
//     try {
//         // Fetch the supported currencies from the API
//         const response = await axios.get(`${BASE_URL}/${API_KEY}/codes`);
//         const { supported_codes } = response.data;

//         // Iterate through the currencies from the API
//         for (const [code, name] of supported_codes) {
//             // Find the matching currency in your predefined array
//             const predefinedCurrency = predefinedCurrencies.find(c => c.code === code);

//             // If found, use the predefined symbol, otherwise leave it empty or set a default
//             const symbol = predefinedCurrency ? predefinedCurrency.symbol : '';

//             // Check if the currency already exists in the database
//             let currencyExists = await Currency.findOne({ code });
//             if (!currencyExists) {
//                 // Create a new currency document
//                 const newCurrency = new Currency({
//                     code,
//                     name,
//                     symbol
//                 });

//                 // Save the new currency to the database
//                 await newCurrency.save();
//             }
//         }

//         res.status(200).json({ message: 'Currencies populated successfully.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error populating currencies.' });
//     }
// };