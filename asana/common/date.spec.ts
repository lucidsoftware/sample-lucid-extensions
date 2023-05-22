import 'jasmine';
import {convertDueAtToDateonly} from './date';

describe('Import modal', () => {
    // timezone list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
    describe('in Utah timezone', () => {
        let prevTZ: string | undefined;

        beforeAll(() => {
            prevTZ = process.env['TZ'];
            process.env['TZ'] = 'America/Denver';
        });

        it('correctly converts task.due_at into a dateonly', async () => {
            const sept30_530PM = '2777-09-30T23:30:00.000Z';
            const sept30_630PM = '2777-10-01T00:30:00.000Z';

            const sept30_1130PM = '2777-10-01T05:30:00.000Z';
            const oct1_1230AM = '2777-10-01T06:30:00.000Z';

            const oct1_530PM = '2777-10-01T23:30:00.000Z';
            const oct1_630PM = '2777-10-02T00:30:00.000Z';

            expect(convertDueAtToDateonly(sept30_530PM)).toBe('2777-09-30');
            expect(convertDueAtToDateonly(sept30_630PM)).toBe('2777-09-30');

            expect(convertDueAtToDateonly(sept30_1130PM)).toBe('2777-09-30');
            expect(convertDueAtToDateonly(oct1_1230AM)).toBe('2777-10-01');

            expect(convertDueAtToDateonly(oct1_530PM)).toBe('2777-10-01');
            expect(convertDueAtToDateonly(oct1_630PM)).toBe('2777-10-01');
        });

        afterAll(() => {
            process.env['TZ'] = prevTZ;
        });
    });

    describe('in GMT timezone', () => {
        let prevTZ: string | undefined;

        beforeAll(() => {
            prevTZ = process.env['TZ'];
            process.env['TZ'] = 'Etc/UTC';
        });
        it('correctly converts task.due_at into a dateonly', async () => {
            const sept30_1130PM = '2777-09-30T23:30:00.000Z';
            const oct1_1230AM = '2777-10-01T00:30:00.000Z';

            const oct1_530AM = '2777-10-01T05:30:00.000Z';
            const oct1_630AM = '2777-10-01T06:30:00.000Z';

            const oct1_1130PM = '2777-10-01T23:30:00.000Z';
            const oct2_1230AM = '2777-10-02T00:30:00.000Z';

            expect(convertDueAtToDateonly(sept30_1130PM)).toBe('2777-09-30');
            expect(convertDueAtToDateonly(oct1_1230AM)).toBe('2777-10-01');

            expect(convertDueAtToDateonly(oct1_530AM)).toBe('2777-10-01');
            expect(convertDueAtToDateonly(oct1_630AM)).toBe('2777-10-01');

            expect(convertDueAtToDateonly(oct1_1130PM)).toBe('2777-10-01');
            expect(convertDueAtToDateonly(oct2_1230AM)).toBe('2777-10-02');
        });

        afterAll(() => {
            process.env['TZ'] = prevTZ;
        });
    });
});
