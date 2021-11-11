import Application from '../base/Application';
import { DataTypes, Model } from 'sequelize';
import Model1 from './Models.jestignore';
import { ActiveDataProvider } from '..';

test('ModelsSetGetTest', async () => {
    const dataProvider = new ActiveDataProvider({
        modelClass: Model1,
    });
    await dataProvider.initialization;
    let models = [];
    for (let i = 0; i < 100; i++) models.push(new Model1());
    dataProvider.setModels(models);
    expect((await dataProvider.getModels()).length).toBe(100);
});
