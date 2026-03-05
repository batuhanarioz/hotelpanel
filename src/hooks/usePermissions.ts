"use client";

import { useHotel } from "@/app/context/HotelContext";
import { Permission, DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions";
import { useMemo } from "react";

export function usePermissions() {
    const { userRole, isSuperAdmin } = useHotel();

    const checkPermission = useMemo(() => (permission: Permission) => {
        if (isSuperAdmin) return true;
        if (!userRole) return false;

        const rolePermissions = DEFAULT_ROLE_PERMISSIONS[userRole] || [];
        return rolePermissions.includes(permission);
    }, [userRole, isSuperAdmin]);

    return {
        checkPermission,
        userRole,
        isSuperAdmin
    };
}
