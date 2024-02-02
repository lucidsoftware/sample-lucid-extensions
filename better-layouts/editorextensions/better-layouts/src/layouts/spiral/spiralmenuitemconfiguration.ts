import {MenuItemConfiguration} from '../../utils';
import {layoutSelectedItemsInSpiral} from './spirallayout';

export const SpiralMenuItemConfiguration: MenuItemConfiguration = {
    label: 'Spiral',
    action: (viewport) => layoutSelectedItemsInSpiral({type: 'spiral'}, viewport),
    visibleAction: 'multipleItemsSelected',
}
