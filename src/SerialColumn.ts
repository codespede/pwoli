import { Column } from ".";

export default class DataColumn extends Column {
    
    public constructor(config) {
        super(config);
        Object.assign(this, config);
    }

    public header = '#';

    protected renderDataCellContent(model, key, index) {
        const pagination = this.grid.dataProvider.getPagination();
        if (pagination !== false)
            return pagination.getOffset + index + 1;
        return index + 1;
    }
}
