import { BlockProxy, DocumentProxy, EditorClient, Menu, MenuType, PageProxy, TextMarkupNames, Viewport } from 'lucid-extension-sdk';
import { CalendarSettingsModal } from './calendarsettingsmodal';

const client = new EditorClient();
const menu = new Menu(client);
const viewport = new Viewport(client);
const document = new DocumentProxy(client);

client.registerAction('createAnnualCalendar', () => {
    const modal = new CalendarSettingsModal(client);
    modal.show();
});

menu.addMenuItem({
    label: 'Create Annual Calendar',
    action: 'createAnnualCalendar',
    menuType: MenuType.Main,
});

async function init() {
    await client.loadBlockClasses(['DefaultTableBlock']);
}

init();


type CalendarColor = {
    title: string,
    days: string
};

type Month = {
    index: number,
    name: string,
    headerColor: CalendarColor,
};


// CALENDAR FORMATTING
/**
 * To get a color from a designed month in a Lucid doc
 * 1. Open console
 * 2. Select designed monthly calendar in Lucid
 * 3. Run in console: copy({title: client.inspector.getAllProperties()["CellFill_0,0"], days: client.inspector.getAllProperties()["CellFill_1,0"]})
 * 
 */
const COLORS: { [key: string]: CalendarColor } = {
    purple: {
        title: '#9391ffff',
        days: '#dedeffff'
    },
    blue: {
        title: "#6db1ffff",
        days: "#cfe4ffff"
    },
    pink: {
        title: "#ff80dfff",
        days: "#ffd6f5ff"
    },
    teal: {
        title: "#00c2a8ff",
        days: "#b8f5edff"
    }
};


const TEXT_COLOR_PRIMARY = '#333333ff'; // almost-black
const TEXT_COLOR_SECONDARY = '#b2b9baff'; // light gray
const TEXT_FONT_SIZE_MONTH_NAME = 24;
const TEXT_FONT_SIZE_DAY_NAME = 18;
const TEXT_FONT_FAMILY = 'Liberation Sans';
const LINE_COLOR = '#e2e2e2ff';

const TABLE_COLUMNS = 7;
const CELL_WIDTH = 405;
const CELL_HEIGHT = 340;
const TITLE_HEIGHT = 122;
const PADDING_BETWEEN_MONTHS = 160;
const TABLE_WIDTH = CELL_WIDTH * TABLE_COLUMNS;
const TABLE_HEIGHT = (TITLE_HEIGHT * 2) + (CELL_HEIGHT * 6); // 2 rows of labels (month & days), 6 rows of dates


//CALENDAR GENERATION
function drawMonth(page: PageProxy, month: Month, year: number, daysOfWeek: string[], x: number, y: number) {
    const table = page.addBlock({
        className: 'DefaultTableBlock',
        boundingBox: { x, y, w: TABLE_WIDTH, h: TABLE_HEIGHT },
        lineWidth: 4,
        properties: {
            "InsetMargin": 20,
            "LineColor": LINE_COLOR,
            "TextAlign": "center",
            "TextVAlign": "middle",
            ColWidths: Array(TABLE_COLUMNS).fill(CELL_WIDTH),
            RowHeights: [TITLE_HEIGHT, TITLE_HEIGHT, ...Array(6).fill(CELL_HEIGHT)],
            "CellFill_0,0": month.headerColor.title,
            "CellSize_0,0": { "w": TABLE_COLUMNS, "h": 1 },
            "CellFill_1,0": month.headerColor.days,
            "CellFill_1,1": month.headerColor.days,
            "CellFill_1,2": month.headerColor.days,
            "CellFill_1,3": month.headerColor.days,
            "CellFill_1,4": month.headerColor.days,
            "CellFill_1,5": month.headerColor.days,
            "CellFill_1,6": month.headerColor.days,
        }
    });

    table.textAreas.set('Cell_0,0', month.name);
    table.textStyles.set('Cell_0,0', {
        [TextMarkupNames.Bold]: true,
        [TextMarkupNames.Size]: TEXT_FONT_SIZE_MONTH_NAME,
        [TextMarkupNames.Color]: TEXT_COLOR_PRIMARY,
        [TextMarkupNames.HAlign]: 'center',
    });

    for (let i = 0; i < daysOfWeek.length; i++) {
        let textId = `Cell_1,${i}`;
        table.textAreas.set(textId, daysOfWeek[i]);
        table.textStyles.set(textId, {
            [TextMarkupNames.Bold]: true,
            [TextMarkupNames.Size]: TEXT_FONT_SIZE_DAY_NAME,
            [TextMarkupNames.Color]: TEXT_COLOR_PRIMARY,
            [TextMarkupNames.HAlign]: 'center',
            [TextMarkupNames.Family]: TEXT_FONT_FAMILY
        });
    }

    //dates around current month
    let firstDayOfCurrentMonth = new Date(year, month.index, 1).getDay();
    let daysInCurrentMonth = new Date(year, month.index + 1, 0).getDate(); //0-th index gives you the last day of the previous month
    let endOfLastMonth = new Date(year, month.index, 0).getDate();

    for (let i = 0; i < (daysOfWeek.length * 6); i++) {
        let textId = `Cell_${2 + Math.floor(i / 7)},${i % 7}`;
        table.properties.set(`${textId}_VAlign`, 'top');

        let isCurrentMonth = false;
        let date = 0;

        if (i < firstDayOfCurrentMonth) {
            date = endOfLastMonth - ((firstDayOfCurrentMonth - 1) - i);
        } else if (i < (firstDayOfCurrentMonth + daysInCurrentMonth)) {
            isCurrentMonth = true;
            date = (i + 1) - firstDayOfCurrentMonth;
        } else {
            date = (i + 1) - (firstDayOfCurrentMonth + daysInCurrentMonth);
        }

        table.textAreas.set(textId, date.toString());
        table.textStyles.set(textId, {
            [TextMarkupNames.Size]: TEXT_FONT_SIZE_DAY_NAME,
            [TextMarkupNames.Color]: isCurrentMonth ? TEXT_COLOR_PRIMARY : TEXT_COLOR_SECONDARY,
            [TextMarkupNames.HAlign]: 'left',
            [TextMarkupNames.Family]: TEXT_FONT_FAMILY
        });
    }
}

export function createAnnualCalendar(year: number, monthNames: string[], days: string[]) {
    let page = viewport.getCurrentPage();

    let months: Month[] = monthNames.map((name, index) => {
        let headerColor;
        if (index < 3) {
            headerColor = COLORS.purple;
        } else if (index < 6) {
            headerColor = COLORS.blue;
        } else if (index < 9) {
            headerColor = COLORS.pink;
        } else {
            headerColor = COLORS.teal;
        }
        return {
            index,
            name,
            headerColor
        };
    });

    if (page) {
        for (let currentMonth of months) {
            let x = (currentMonth.index % 3) * (TABLE_WIDTH + PADDING_BETWEEN_MONTHS);
            let y = Math.floor(currentMonth.index / 3) * (TABLE_HEIGHT + PADDING_BETWEEN_MONTHS);
            drawMonth(page, currentMonth, year, days, x, y);
        }
    }
}
