import { DataProxy, DocumentProxy, EditorClient, Menu, Viewport } from "lucid-extension-sdk";

// Initialize core client objects
export const client = new EditorClient();
export const menu = new Menu(client);
export const dataProxy = new DataProxy(client);
export const documentProxy = new DocumentProxy(client);
export const viewport = new Viewport(client);

// Log a message when the extension is loaded
console.log("Data Connector Example extension loaded successfully!");
console.log("You can find the 'Get Folder ID' option in both the main menu and the context menu (right-click).");
