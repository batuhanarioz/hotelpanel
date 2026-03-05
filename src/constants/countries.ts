export interface Country {
    code: string;
    flag: string;
    name: string;
    dial_code: string;
}

export const COUNTRIES: Country[] = [
    { code: "TR", flag: "🇹🇷", name: "Türkiye", dial_code: "+90" },
    { code: "DE", flag: "🇩🇪", name: "Almanya", dial_code: "+49" },
    { code: "US", flag: "🇺🇸", name: "ABD", dial_code: "+1" },
    { code: "GB", flag: "🇬🇧", name: "İngiltere", dial_code: "+44" },
    { code: "RU", flag: "🇷🇺", name: "Rusya", dial_code: "+7" },
    { code: "AZ", flag: "🇦🇿", name: "Azerbaycan", dial_code: "+994" },
    { code: "FR", flag: "🇫🇷", name: "Fransa", dial_code: "+33" },
    { code: "IT", flag: "🇮🇹", name: "İtalya", dial_code: "+39" },
    { code: "SA", flag: "🇸🇦", name: "S. Arabistan", dial_code: "+966" },
    { code: "AE", flag: "🇦🇪", name: "Birleşik Arap Emirlikleri", dial_code: "+971" },
    { code: "IQ", flag: "🇮🇶", name: "Irak", dial_code: "+964" },
    { code: "QA", flag: "🇶🇦", name: "Katar", dial_code: "+974" },
    { code: "EG", flag: "🇪🇬", name: "Mısır", dial_code: "+20" },
    { code: "SY", flag: "🇸🇾", name: "Suriye", dial_code: "+963" },
    { code: "IR", flag: "🇮🇷", name: "İran", dial_code: "+98" },
    { code: "BE", flag: "🇧🇪", name: "Belçika", dial_code: "+32" },
    { code: "NL", flag: "🇳🇱", name: "Hollanda", dial_code: "+31" },
    { code: "CH", flag: "🇨🇭", name: "İsviçre", dial_code: "+41" },
    { code: "AT", flag: "🇦🇹", name: "Avusturya", dial_code: "+43" },
    { code: "UA", flag: "🇺🇦", name: "Ukrayna", dial_code: "+380" },
];
