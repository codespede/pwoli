import { Column, Model } from ".";

export default class DataColumn extends Column {
    
    public header = '#';

    public constructor(config: {[key: string]: any}) {
        super(config);
        Object.assign(this, config);
    }

    protected async renderDataCellContent(model: Model, key: string, index: number): Promise<string> {
        const pagination = this.grid.dataProvider.getPagination();
        if (pagination !== false)
            return pagination.getOffset() + index + 1;
        return (index + 1).toString();
    }
}
