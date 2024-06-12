import {MenuItemConfiguration} from '../../utils';
import {layoutSelectedItemsInCircle} from './circlelayout';

export const CircleMenuItemConfiguration: MenuItemConfiguration = {
    label: 'Circle',
    action: (viewport) => layoutSelectedItemsInCircle({type: 'circle'}, viewport),
    visibleAction: 'multipleItemsSelected',
}
