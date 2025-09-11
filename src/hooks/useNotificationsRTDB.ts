"use client";
import { useContext } from "react";
import { NotificationsContext } from "@/context/NotificationsContext";
export function useNotificationsRTDB() {
  return useContext(NotificationsContext);
}
