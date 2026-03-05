"use client";

import { createContext, useContext } from "react";
import type { UserRole, WorkingHours } from "@/types/database";
import { DEFAULT_WORKING_HOURS } from "@/constants/days";

export interface HotelContextValue {
  hotelId: string | null;
  hotelName: string | null;
  hotelSlug: string | null;
  userRole: UserRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean; // ADMIN veya SUPER_ADMIN
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  department: string | null;
  isActive: boolean;
  financialLimit: number | null;
  workingHours: WorkingHours;
  workingHoursOverrides: { date: string; open: string; close: string; is_closed: boolean; note?: string }[];
  planId: string | null;
  credits: number;
  trialEndsAt: string | null;
  automationsEnabled: boolean;
  n8nWorkflowId: string | null;
  n8nWorkflows: Array<{ id: string; name: string; visible?: boolean; enabled: boolean; time?: string; day?: string }>;
  defaultCurrency: string;
}

const defaultValue: HotelContextValue = {
  hotelId: null,
  hotelName: null,
  hotelSlug: null,
  userRole: null,
  isSuperAdmin: false,
  isAdmin: false,
  userId: null,
  userName: null,
  userEmail: null,
  department: null,
  isActive: true,
  financialLimit: null,
  workingHours: DEFAULT_WORKING_HOURS,
  workingHoursOverrides: [],
  planId: null,
  credits: 0,
  trialEndsAt: null,
  automationsEnabled: false,
  n8nWorkflowId: null,
  n8nWorkflows: [],
  defaultCurrency: 'TRY',
};

export const HotelContext = createContext<HotelContextValue>(defaultValue);

export function useHotel() {
  return useContext(HotelContext);
}
