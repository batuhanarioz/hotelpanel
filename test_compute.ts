import { computeFolioFinances, FolioItem } from "./src/hooks/useFolio";

const items: FolioItem[] = [
    {
        "id": "ec754370-6a1d-495f-888f-58e35b2bf40a",
        "type": "room_charge",
        "amount": 5000,
        "source": "system",
        "currency": "TRY",
        "metadata": {},
        "created_at": "2026-03-04T23:42:55.004059+00:00",
        "created_by": "System",
        "description": "5 Gecelik Konaklama",
    },
    {
        "id": "eb25994f-41ca-436e-ab21-6fca75e841b2",
        "type": "payment",
        "amount": 3000,
        "source": "ui",
        "currency": "TRY",
        "metadata": {
            "payment_method": "CREDIT_CARD"
        },
        "created_at": "2026-03-04T23:42:55.290209+00:00",
        "created_by": "System",
        "description": "Ön ödeme - kredi kartı",
    }
];

const result = computeFolioFinances(items);
console.log(JSON.stringify(result, null, 2));
