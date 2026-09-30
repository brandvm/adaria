import Lenis from "lenis";
import { initAdaria } from "./runtime.js";

// Capture this script's versioned directory before any async initialization.
const assetBase = new URL(".", document.currentScript?.src || document.baseURI).href;
initAdaria(Lenis, assetBase);
