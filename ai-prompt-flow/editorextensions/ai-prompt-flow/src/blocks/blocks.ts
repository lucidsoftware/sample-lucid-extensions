import {
    BlockProxy,
    Box,
    combinedBoundingBox,
    CustomBlockProxy,
    EditorClient,
    GetItemsAtSearchType,
    GroupProxy,
    isInstanceOf,
    isNumber,
    isString,
    ItemProxy,
    LineProxy,
    PageProxy,
    TextMarkupNames,
} from 'lucid-extension-sdk';
import {
    TableBlockProxy,
    TableCellProxy,
    TableRowProxy,
} from 'lucid-extension-sdk/document/blockclasses/tableblockproxy';
import {AIExample} from '../executor/aiexample';
import {
    AiBlock,
    AiBlockType,
    SerializedExamplesBlock,
    SerializedOutputBlock,
    SerializedSystemPrompt,
    SerializedUserPrompt,
    SerializedVariablesTable,
} from './serializedblocks';

const interpolationRegex = /\$\{(.*?)\}/g;

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function interpolatePromptSegments(
    text: string,
    block: CustomBlockProxy,
    additionalValues: Map<string, string> = new Map(),
): string {
    const availableSegments = new Map<string, string>();
    const allSegmentNames = new Set<string>();
    const missing = new Set<string>();

    for (const segment of block.getPage().allBlocks.values()) {
        if (segment instanceof PromptSegmentBlock) {
            availableSegments.set(segment.getSegmentName(), segment.getPromptText());
            allSegmentNames.add(segment.getSegmentName());
        }
    }

    for (const [name, value] of additionalValues) {
        availableSegments.set(name, value);
        allSegmentNames.add(name);
    }

    //Allow each interpolation to happen exactly once to prevent a circular dependency.
    const attemptInterpolations = (): boolean => {
        const matches = new Set(text.match(interpolationRegex));
        let found = false;
        for (const bracketedName of matches) {
            const name = bracketedName.substring(2, bracketedName.length - 1);
            const segment = availableSegments.get(name);
            if (segment !== undefined) {
                text = text.replace(new RegExp(escapeRegExp(bracketedName), 'g'), segment);
                availableSegments.delete(name);
                found = true;
            } else if (!allSegmentNames.has(name)) {
                missing.add(name);
            }
        }
        return found;
    };

    while (attemptInterpolations()) {}

    if (missing.size > 0) {
        console.warn('Possibly missing prompt segments', [...missing]);
    }

    return text;
}

/**
 * Must be called 'scratchboard' because the first published versions have
 * 'scratchboard' as the library name. The shape library must be named
 * 'scratchboard' in order to allow older versions of these blocks to be loaded
 * properly, which means these versions must also be registered with the same
 * library name.
 */
const LibraryName = 'scratchboard';

export class SystemPromptBlock extends CustomBlockProxy implements AiBlock {
    public static library = LibraryName;
    public static shape = 'system-prompt';
    public aiBlockType = AiBlockType.SystemPrompt;

    public getPromptText() {
        return interpolatePromptSegments(
            this.getRawPromptText(),
            this,
            new Map([['PriorResponse', this.getUpstreamResponse()]]),
        );
    }

    public getRawPromptText() {
        const taName = this.getStencilTextAreaName('SystemPromptContent');
        if (!taName) {
            return '';
        }
        return this.textAreas.get(taName);
    }

    public setPromptText(text: string) {
        const taName = this.getStencilTextAreaName('SystemPromptContent');
        if (taName) {
            this.textAreas.set(taName, text);
        }
    }

    public getExamples() {
        const examples: AIExample[] = [];

        const tables = this.getConnectedLines()
            .map((line) => line.getUpstreamConnection())
            .filter(isInstanceOf(TableBlockProxy))
            .filter((table) => table.shapeData.get('isSampleInput'));

        for (const table of tables) {
            for (const row of table.getRows().slice(2)) {
                const [user, assistant] = row.getCells().map((cell) => cell.getText());
                if (isString(user) && isString(assistant) && assistant.length > 0) {
                    examples.push({user, assistant});
                }
            }
        }
        return examples;
    }

    public getModelName(): string {
        const model = this.shapeData.get('Model');
        if (isString(model)) {
            return model;
        }
        return '';
    }

    public setModelName(model: string) {
        this.shapeData.set('Model', model);
    }

    public getUserPrompts(): UserPromptBlock[] {
        return this.getConnectedLines()
            .map((line) => line.getDownstreamConnection())
            .filter(isInstanceOf(UserPromptBlock));
    }

    public getUpstreamResponse(): string {
        const response = this.getConnectedLines()
            .map((line) => line.getUpstreamConnection())
            .filter(isInstanceOf(ResponseBlock))
            .map((response) => response.getResponseText());
        if (response.length > 1) {
            console.warn('Multiple upstream responses found for system prompt');
        }
        return response[0] ?? '';
    }

    public toJSON(): SerializedSystemPrompt {
        return {
            'id': this.id,
            'block-type': AiBlockType.SystemPrompt,
            'count-of-user-prompts': this.getUserPrompts().length,
            'system-prompt': this.getRawPromptText(),
            'model': this.getModelName(),
        };
    }
}

export class PromptSegmentBlock extends CustomBlockProxy implements AiBlock {
    public static library = LibraryName;
    public static shape = 'prompt-segment';
    public aiBlockType = AiBlockType.PromptSegment;

    /**
     * Unlike SystemPromptBlock and UserPromptBlock, this does not perform any interpolation.
     * This allows us to do recursive interpolation of segments in `interpolateValues` without
     * the risk of a circular dependency.
     */
    public getPromptText() {
        const taName = this.getStencilTextAreaName('PromptSegmentContent');
        if (!taName) {
            return '';
        }
        return this.textAreas.get(taName);
    }

    public setPromptText(text: string, stencilTextAreaName: string = 'PromptSegmentContent') {
        const taName = this.getStencilTextAreaName(stencilTextAreaName);
        if (taName) {
            this.textAreas.set(taName, text);
        }
    }

    public getSegmentName() {
        const taName = this.getStencilTextAreaName('SegmentName');
        if (!taName) {
            return '';
        }
        return this.textAreas.get(taName);
    }

    public setSegmentName(name: string) {
        this.setPromptText(name, 'SegmentName');
    }

    public toJSON() {
        return {
            'id': this.id,
            'block-type': AiBlockType.PromptSegment,
            'segment-name': this.getSegmentName(),
            'segment-value': this.getPromptText(),
        };
    }
}

export class UserPromptBlock extends CustomBlockProxy implements AiBlock {
    public static library = LibraryName;
    public static shape = 'user-prompt';
    public aiBlockType = AiBlockType.UserPrompt;

    public getPromptText(variables?: VariablesTableBlock) {
        let prompt = this.getPromptTextWithoutUserVariables();
        if (variables) {
            prompt = variables.interpolateInto(prompt);
        }

        //If there are other shapes on top, append a simple flowchart JSON to the text.
        const page = this.getPage();
        const contained = page
            .findItems(this.getBoundingBox(), GetItemsAtSearchType.Contained)
            .filter((item) => item.id !== this.id);
        if (contained.length > 0) {
            if (prompt != '') {
                prompt += '\n\n';
            }
            prompt += page.getLLMContextForItems(contained).prompt;
        }

        return prompt;
    }

    /** Gets the prompt text after interpolating prompt segments but before interpolating user
     * variables. */
    public getPromptTextWithoutUserVariables() {
        return interpolatePromptSegments(
            this.getRawPromptText(),
            this,
            new Map([['PriorResponse', this.getUpstreamResponse()]]),
        );
    }

    public getRawPromptText() {
        const taName = this.getStencilTextAreaName('UserPromptContent');
        if (!taName) {
            return '';
        }
        return this.textAreas.get(taName);
    }

    public setPromptText(text: string) {
        const taName = this.getStencilTextAreaName('UserPromptContent');
        if (taName) {
            this.textAreas.set(taName, text);
        }
    }

    /**
     * @returns All the remaining ${variable} names remaining after interpolating
     * prompt segments.
     */
    public getNeededUserVariables() {
        return [...new Set(this.getPromptText().match(interpolationRegex))];
    }

    public getSystemPrompt(): SystemPromptBlock | undefined {
        return this.getConnectedLines()
            .map((line) => line.getUpstreamConnection())
            .filter(isInstanceOf(SystemPromptBlock))[0];
    }

    public getVariableTables(): VariablesTableBlock[] {
        return this.getConnectedLines()
            .map((line) => line.getDownstreamConnection())
            .filter(isInstanceOf(TableBlockProxy))
            .filter((table) => table.shapeData.get('isVariables'))
            .map((table) => new VariablesTableBlock(table.id, this.client));
    }

    public getResponseBlock(): ResponseBlock | undefined {
        return this.getConnectedLines()
            .map((line) => line.getDownstreamConnection())
            .filter(isInstanceOf(ResponseBlock))[0];
    }

    public getUpstreamResponse(): string {
        return this.getSystemPrompt()?.getUpstreamResponse() ?? '';
    }

    public toJSON(): SerializedUserPrompt {
        return {
            'id': this.id,
            'block-type': AiBlockType.UserPrompt,
            'system-prompt': this.getSystemPrompt()?.getPromptText(), // TODO pick a standard for sending raw vs interpolated prompts
            'user-prompt': this.getRawPromptText(),
            'model-used': this.getSystemPrompt()?.getModelName(),
        };
    }
}

export class ResponseBlock extends CustomBlockProxy implements AiBlock {
    public static library = LibraryName;
    public static shape = 'response';
    public aiBlockType = AiBlockType.Output;
    public toJSON(): SerializedOutputBlock {
        return {
            'id': this.id,
            'block-type': AiBlockType.Output,
            'model-used': this.getResponseModel(),
            'system-prompt': this.getSystemPrompt(),
            'user-prompt': this.getUserPrompt(),
            'output': this.getResponseText(),
            'timestamp': this.getResponseTime(),
        };
    }

    public getResponseText() {
        return this.getShapeDataString('ResponseContent') ?? '';
    }

    public setResponseText(text: string) {
        this.shapeData.set('ResponseContent', text);
    }

    public setResponseModel(model: string) {
        this.shapeData.set('ModelUsed', model);
    }

    private getShapeDataString(key: string): string | undefined {
        const data = this.shapeData.get(key);
        return isString(data) ? data : undefined;
    }

    private getResponseModel(): string | undefined {
        return this.getShapeDataString('ModelUsed');
    }

    private getSystemPrompt(): string | undefined {
        return this.getShapeDataString('SystemPrompt');
    }

    private getUserPrompt(): string | undefined {
        return this.getShapeDataString('UserPrompt');
    }

    private getResponseTime(): number | undefined {
        const responseTime = this.shapeData.get('CreatedAt');
        return isNumber(responseTime) ? responseTime : undefined;
    }

    public getDownstreamSystemBlocks(): SystemPromptBlock[] {
        return this.getConnectedLines()
            .map((line) => line.getDownstreamConnection())
            .filter(isInstanceOf(SystemPromptBlock));
    }

    public autoResize() {
        const name = this.getStencilTextAreaName('ResponseContent') || '';
        const boundingBox = this.getBoundingBox();
        //516 comes from the 564 response block width in the library.manifest, minus 48 for the two margins.
        const size = this.measureText(name, Math.max(516, boundingBox.w - 48));
        //Then 48 is left + right margins in the response.shape
        const width = Math.max(size.w + 48, boundingBox.w);
        //96 is top + bottom margins in the response.shape
        const height = Math.max(size.h + 96, boundingBox.h);
        this.setBoundingBox({
            x: boundingBox.x - (width - boundingBox.w) / 2,
            y: boundingBox.y,
            w: width,
            h: height,
        });
    }
}

export function nearestBlock<T extends BlockProxy>(
    page: PageProxy,
    sourceBB: Box,
    acceptTarget: (block: BlockProxy) => block is T,
) {
    let minSize = Number.MAX_VALUE;
    let nearest: T | undefined;

    for (const [id, block] of page.blocks) {
        if (acceptTarget(block)) {
            const combined = combinedBoundingBox([sourceBB, block.getBoundingBox()]);
            const size = combined.w + combined.h;
            if (size < minSize) {
                minSize = size;
                nearest = block;
            }
        }
    }

    return nearest;
}

export function nearestSystemPromptBlock(page: PageProxy, sourceBB: Box) {
    return nearestBlock(page, sourceBB, isInstanceOf(SystemPromptBlock));
}

export function nearestUserPromptBlock(page: PageProxy, sourceBB: Box) {
    return nearestBlock(page, sourceBB, isInstanceOf(UserPromptBlock));
}

export class VariablesTableBlock extends TableBlockProxy implements AiBlock {
    public aiBlockType = AiBlockType.VariablesTable;
    public static canBeVariablesTableBlock(block: unknown): block is TableBlockProxy {
        return block instanceof TableBlockProxy && !!block.shapeData.get('isVariables');
    }
    private readonly numHeaderRows = 2;
    constructor(id: string, client: EditorClient) {
        super(id, client);

        if (!VariablesTableBlock.canBeVariablesTableBlock(this)) {
            throw new Error('Not a Variables block');
        }
    }

    public getUserPrompt(): UserPromptBlock | undefined {
        return this.getConnectedLines()
            .map((line) => line.getUpstreamConnection())
            .filter(isInstanceOf(UserPromptBlock))[0];
    }

    public getResponseBlock(): ResponseBlock | undefined {
        return this.getConnectedLines()
            .map((line) => line.getDownstreamConnection())
            .filter(isInstanceOf(ResponseBlock))[0];
    }

    public getVariables() {
        return new Map(
            this.getRows()
                .slice(this.numHeaderRows)
                .map((row) => {
                    let {key: name, value, valueCell} = getKeyValuePairFromRow(row);

                    //If there are other shapes on top, append a simple flowchart JSON to the text.
                    const contained = this.getPage()
                        .findItems(valueCell.getBoundingBox(), GetItemsAtSearchType.Contained)
                        .filter((item) => item.id !== this.id);
                    if (contained.length > 0) {
                        const documentState = this.getDocumentState(name, contained);
                        if (value != '') {
                            value += '\n\n';
                        }
                        value += documentState;
                    }

                    return [name, value];
                }),
        );
    }

    private getDocumentState(name: string, contained: (BlockProxy | LineProxy | GroupProxy)[]) {
        return this.getPage().getLLMContextForItems(contained).prompt;
    }

    public interpolateInto(prompt: string): string {
        for (const [name, value] of this.getVariables()) {
            prompt = interpolateInto(prompt, name, value);
        }
        return prompt;
    }

    public toJSON(): SerializedVariablesTable {
        return {
            'id': this.id,
            'block-type': AiBlockType.VariablesTable,
            // We don't use getVariables because we don't want to include the blocks, and we want to
            // allow duplicates
            'variables': this.getRows()
                .slice(this.numHeaderRows)
                .map((row) => {
                    const {key: name, value} = getKeyValuePairFromRow(row);
                    return [name, value];
                }),
        };
    }

    public setVariableName(name: string, index: number) {
        const {keyCell: nameCell} = getKeyValuePairFromTable(index + this.numHeaderRows, this);
        nameCell.setText(name);
    }

    public setVariableValue(value: string, index: number) {
        const {valueCell} = getKeyValuePairFromTable(index + this.numHeaderRows, this);
        valueCell.setText(value);
    }

    public addVariable() {
        addRow(this);
    }

    public deleteVariable(editableRow: number) {
        this.deleteRow(editableRow + this.numHeaderRows);
    }
}

export class SampleBlock extends TableBlockProxy implements AiBlock {
    public aiBlockType = AiBlockType.Examples;
    public static canBeSampleBlock(block: unknown): block is TableBlockProxy {
        return block instanceof TableBlockProxy && !!block.shapeData.get('isSampleInput');
    }
    private readonly numHeaderRows = 2;
    constructor(id: string, client: EditorClient) {
        super(id, client);
        if (!SampleBlock.canBeSampleBlock(this)) {
            throw new Error('Not a sample block');
        }
    }

    private getSystemPrompt() {
        const systemPrompt = this.getConnectedLines()
            .map((line) => line.getDownstreamConnection())
            .filter(isInstanceOf(SystemPromptBlock))[0];

        return systemPrompt?.getPromptText();
    }

    public toJSON(): SerializedExamplesBlock {
        const examples: [string, string][] = this.getRows()
            .slice(this.numHeaderRows)
            .map((row) => {
                const {key: name, value} = getKeyValuePairFromRow(row);
                return [name, value];
            });
        return {
            'id': this.id,
            'block-type': AiBlockType.Examples,
            'examples': examples,
            'system-prompt': this.getSystemPrompt(),
        };
    }

    public setUser(text: string, index: number) {
        const {keyCell: nameCell} = getKeyValuePairFromTable(index + this.numHeaderRows, this);
        nameCell.setText(text);
    }

    public setResponse(text: string, index: number) {
        const {valueCell} = getKeyValuePairFromTable(index + this.numHeaderRows, this);
        valueCell.setText(text);
    }

    public addSample() {
        addRow(this);
    }

    public deleteSample(editableRow: number) {
        this.deleteRow(editableRow + this.numHeaderRows);
    }
}

function addRow(table: TableBlockProxy, index: number = table.getRows().length - 1) {
    const {keyCell: cell} = getKeyValuePairFromTable(index, table);
    const currentStyles = cell.getTextStyle();
    const newRow = table.addRow(cell, false);
    for (const newCell of newRow.getCells()) {
        // See https://lucidsoftware.slack.com/archives/C01BTPAMZNJ/p1695334462696559
        // tl;dr is that getTextStyle returns the size in px, but setTextStyle expects it in points
        newCell.setTextStyle({
            ...currentStyles,
            [TextMarkupNames.Size]: currentStyles[TextMarkupNames.Size] / 2.22222222222222,
        });
    }
}

export function getKeyValuePairFromRow(row: TableRowProxy): {
    key: string;
    keyCell: TableCellProxy;
    value: string;
    valueCell: TableCellProxy;
} {
    const keyCell = row.getCells()[0];
    if (!keyCell) {
        throw new Error('Row has no key cell');
    }
    const key = keyCell.getText();
    const valueCell = row.getCells()[1];
    if (!valueCell) {
        throw new Error('Row has no value cell');
    }
    const value = valueCell.getText();
    return {key, keyCell, value, valueCell};
}

export function getKeyValuePairFromTable(
    rowIndex: number,
    table: TableBlockProxy,
): {
    key: string;
    keyCell: TableCellProxy;
    value: string;
    valueCell: TableCellProxy;
} {
    const row = table.getRows()[rowIndex];
    if (!row) {
        throw new Error(`Row at index ${rowIndex} not found`);
    }
    return getKeyValuePairFromRow(row);
}

function interpolateInto(prompt: string, name: string, value: string) {
    const bracketedName = '${' + name + '}';
    return prompt.replace(new RegExp(escapeRegExp(bracketedName), 'g'), value);
}

export function convertToAiShape(item: ItemProxy, client: EditorClient) {
    if (
        item instanceof SystemPromptBlock ||
        item instanceof UserPromptBlock ||
        item instanceof ResponseBlock ||
        item instanceof PromptSegmentBlock
    ) {
        return item;
    }
    if (SampleBlock.canBeSampleBlock(item)) {
        return new SampleBlock(item.id, client);
    }
    if (VariablesTableBlock.canBeVariablesTableBlock(item)) {
        return new VariablesTableBlock(item.id, client);
    }
    return undefined;
}

CustomBlockProxy.registerCustomBlockClass(SystemPromptBlock);
CustomBlockProxy.registerCustomBlockClass(UserPromptBlock);
CustomBlockProxy.registerCustomBlockClass(ResponseBlock);
CustomBlockProxy.registerCustomBlockClass(PromptSegmentBlock);
