"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useMrDogStore, worldToOutfit } from "./store";
import { useStore as useAppStore } from "@/state/store";
import { MrDogChat } from "./MrDogChat";
import { getLenis } from "@/motion/clock";

export function MrDogSheet() {
  // Mobile Mr Dog is a dedicated section (/mr-dog), just like Home and Events.
  // The full-screen overlay sheet is disabled so it never traps or overlays the app shell.
  return null;
}
