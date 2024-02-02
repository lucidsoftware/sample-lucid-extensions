const ASANA_COLOR_MAP: {[x: string]: {r: number; g: number; b: number} | undefined} = {
    'aqua': {'r': 32, 'g': 170, 'b': 234},
    'blue': {'r': 65, 'g': 134, 'b': 224},
    'blue-green': {'r': 55, 'g': 197, 'b': 171},
    'cool-gray': {'r': 141, 'g': 163, 'b': 166},
    'dark-blue': {'r': 60, 'g': 104, 'b': 187},
    'dark-brown': {'r': 236, 'g': 196, 'b': 44},
    'dark-green': {'r': 102, 'g': 210, 'b': 115},
    'dark-orange': {'r': 249, 'g': 98, 'b': 55},
    'dark-pink': {'r': 232, 'g': 79, 'b': 156},
    'dark-purple': {'r': 123, 'g': 111, 'b': 237},
    'dark-red': {'r': 229, 'g': 59, 'b': 82},
    'dark-teal': {'r': 50, 'g': 169, 'b': 232},
    'dark-warm-gray': {'r': 73, 'g': 60, 'b': 61},
    'green': {'r': 98, 'g': 210, 'b': 111},
    'hot-pink': {'r': 235, 'g': 89, 'b': 163},
    'indigo': {'r': 122, 'g': 111, 'b': 240},
    'light-blue': {'r': 72, 'g': 134, 'b': 221},
    'light-green': {'r': 165, 'g': 207, 'b': 63},
    'light-orange': {'r': 250, 'g': 154, 'b': 39},
    'light-pink': {'r': 225, 'g': 99, 'b': 225},
    'light-purple': {'r': 169, 'g': 98, 'b': 224},
    'light-red': {'r': 250, 'g': 145, 'b': 174},
    'light-teal': {'r': 66, 'g': 196, 'b': 171},
    'light-warm-gray': {'r': 141, 'g': 163, 'b': 166},
    'light-yellow': {'r': 255, 'g': 237, 'b': 164},
    'magenta': {'r': 229, 'g': 108, 'b': 229},
    // 'none': {'r': 255, 'g': 255, 'b': 255},
    'orange': {'r': 253, 'g': 97, 'b': 44},
    'pink': {'r': 252, 'g': 145, 'b': 173},
    'purple': {'r': 170, 'g': 98, 'b': 227},
    'red': {'r': 233, 'g': 68, 'b': 90},
    'yellow': {'r': 238, 'g': 195, 'b': 0},
    'yellow-green': {'r': 164, 'g': 207, 'b': 48},
    'yellow-orange': {'r': 253, 'g': 154, 'b': 0},
};

export function componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}

export function rgbToHex({r, g, b}: {r: number; g: number; b: number}): string {
    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// TODO: do as a real color (SerializedColorObject)
export function lucidColor(asanaColorName: string | undefined): string | undefined {
    if (asanaColorName) {
        const rgb = ASANA_COLOR_MAP[asanaColorName];
        if (rgb) {
            return rgbToHex(rgb);
        }
    }
    return undefined;
}
