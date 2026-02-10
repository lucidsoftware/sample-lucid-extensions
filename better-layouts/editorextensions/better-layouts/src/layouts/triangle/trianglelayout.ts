import {EditorClient, Viewport} from 'lucid-extension-sdk';
import {distributeItemsToPoints, getAverageBoundingBox, getCenterOfViewport, getCoordinatesOnLine, MenuItemConfiguration, TriangleLayoutOptions} from '../../utils';

export const layoutSelectedItemsInTriangle = (triangeLayoutOptions: TriangleLayoutOptions, viewport: Viewport) => {
    const selectedItems = viewport.getSelectedItems(true);
    const {x, y} = getCenterOfViewport(viewport);
    const averageBox = getAverageBoundingBox(selectedItems);
    const boxDiagonal = Math.sqrt(averageBox.w**2 + averageBox.h**2);
    const triangleBase = triangeLayoutOptions.sideLength !== undefined ?
        triangeLayoutOptions.sideLength:
        Math.ceil(3 * Math.sqrt(selectedItems.length) * boxDiagonal);
    const triangleHeight = Math.sqrt(3) / 2 * triangleBase;
    const pointsPerSide = Math.ceil(selectedItems.length/3);
    const topOfTriangleY = y - triangleHeight / 2;
    
    const topPoint = {
        x,
        y: topOfTriangleY,
    }
    const leftPoint = {
        x: x - triangleBase / 2,
        y: topOfTriangleY + triangleHeight,
    }
    const rightPoint = {
        x: x + triangleBase / 2,
        y: topOfTriangleY + triangleHeight,
    }
    
    const bottomPoints = getCoordinatesOnLine(leftPoint, rightPoint, pointsPerSide);
    const rightSidePoints = getCoordinatesOnLine(rightPoint, topPoint, pointsPerSide);
    const leftSidePoints = getCoordinatesOnLine(topPoint, leftPoint, pointsPerSide);
    const points = [...bottomPoints, ...leftSidePoints, ...rightSidePoints];
    
    distributeItemsToPoints(selectedItems, points);
}

