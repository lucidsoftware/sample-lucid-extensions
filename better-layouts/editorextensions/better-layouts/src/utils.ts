import {isBoolean, isNullish, isNumber, ItemProxy, Point, Viewport} from 'lucid-extension-sdk';

export type MenuItemConfiguration = {
    label: string;
    action: (viewport: Viewport) => void;
    visibleAction: string;
}

export type SliderConfiguration = {
    min: number;
    max: number;
    step: number;
}

export const getAverageBoundingBox = (items: ItemProxy[]) => {
    const totalBox = getTotalBox(items);
    totalBox.w /= items.length;
    totalBox.h /= items.length;
    return totalBox;
}

export const getTotalBox = (items: ItemProxy[]) => {
    return items.reduce((total, item) => {
        const box = item.getBoundingBox();
        return {
            w: total.w + box.w,
            h: total.h + box.h,
        };
    }, {
        w: 0,
        h: 0,
    });
}

export const getCenterOfViewport = (viewport: Viewport) => {
    const {x, y, w, h} = viewport.getVisibleRect();
    return {
        x: x + w / 2,
        y: y + h / 2,
    };
}

export const getCoordinatesOnLine = (startPoint: Point, endPoint: Point, numPoints: number) => {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: startPoint.x + i * ((endPoint.x - startPoint.x) / numPoints),
            y: startPoint.y + i * ((endPoint.y - startPoint.y) / numPoints),
        });
    }
    return points;
}

export const distributeItemsToPoints = (items: ItemProxy[], points: Point[]) => {
    items.forEach((item, index) => {
        if (index < points.length) {
            const box = item.getBoundingBox();
            box.x = points[index].x - box.w / 2;
            box.y = points[index].y - box.h / 2;
            item.setBoundingBox(box);
        }
    });
}

export type CircleLayoutOptions = {
    radius?: number;
    type: 'circle'
}

export function isCircleLayoutOptions(options: any): options is CircleLayoutOptions {
    return options.type === 'circle' && (isNumber(options.radius) || isNullish(options.radius));
}

export type TriangleLayoutOptions = {
    type: 'triangle'
    sideLength?: number;
}

export function isTriangleLayoutOptions(options: any): options is TriangleLayoutOptions {
    return options.type === 'triangle' && (isNumber(options.sideLength) || isNullish(options.sideLength));
}

export type SpiralLayoutOptions = {
    type: 'spiral'
    spacing?: number;
    radius?: number;
    clockwise?: boolean;
}

export function isSpiralLayoutOptions(options: any): options is SpiralLayoutOptions {
    return options.type === 'spiral'
           && (isNumber(options.spacing) || isNullish(options.spacing))
           && (isNumber(options.radius) || isNullish(options.radius))
           && (isBoolean(options.clockwise)|| isNullish(options.clockwise));
}
