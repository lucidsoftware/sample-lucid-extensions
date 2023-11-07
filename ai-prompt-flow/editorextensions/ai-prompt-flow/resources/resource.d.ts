declare module '*.html' {
    const content: string;
    export default content;
}

declare module '*.json' {
    const content: Record<string, string>;
    export default content;
}
