// Import from the refactored modules
import { setupTextEditHook } from "./textEditHandler";
import { setupMenus } from "./menuSetup";
import { setupLineDragHandler } from "./lineDragHandler";

// Initialize the extension
setupTextEditHook();
setupMenus();
setupLineDragHandler();
