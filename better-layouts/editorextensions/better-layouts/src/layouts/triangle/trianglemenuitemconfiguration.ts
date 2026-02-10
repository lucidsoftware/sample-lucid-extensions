import {MenuItemConfiguration} from '../../utils';
import {layoutSelectedItemsInTriangle} from './trianglelayout';

export const TriangleMenuItemConfiguration: MenuItemConfiguration = {
    label: 'Triangle',
    action: (viewport) => layoutSelectedItemsInTriangle({type: 'triangle'}, viewport),
    visibleAction: 'multipleItemsSelected',
}
