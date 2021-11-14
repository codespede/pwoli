import Application from '../base/Application';
import Component from '../base/Component';
/**
 * ORMAdapter should be the base class for all ORM Adapters(like [[SequelizeAdapter]]) in Pwoli.
 * It serves as the interface between Pwoli and the ORM being used.
 */
export default class ORMAdapter extends Component {
    public modelClass;

    public primaryKey() {
        return 'id';
    }

    public extendableModelClass() {
        return Application.ormModelClass();
    }
}
