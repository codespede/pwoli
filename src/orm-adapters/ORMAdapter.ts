import Application from '../base/Application';
import Component from '../base/Component';
import IORMAdapter from './IORMAdapter';
export default class ORMAdapter extends Component {
  public modelClass;

  public primaryKey() {
    return 'id';
  }

  public extendableModelClass() {
    if (Application.ormModelClass === undefined) throw new Error("'Application.ormModelClass' should be set.");
    return Application.ormModelClass;
  }
}