"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SmartOpsDashboardPage() {
    const { slug } = useParams();
    const router = useRouter();

    useEffect(() => {
        // Smart Operations has been merged into the main Dashboard
        router.replace(`/${slug}`);
    }, [slug, router]);

    return null;
}
