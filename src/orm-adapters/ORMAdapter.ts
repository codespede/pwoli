import Pwoli from '../base/Pwoli';
import Application from '../base/Application';
import Component from '../base/Component';
import IORMAdapter from './IORMAdapter';
export default class ORMAdapter extends Component {
    public modelClass;

    public primaryKey() {
        return 'id';
    }

    public extendableModelClass() {
        return (Application.ormModelClass)()
    }
}
