import Inflector = require('inflected');
import { emptyDir } from 'fs-extra';
import { DataTypes, Model as ActualModel } from 'sequelize';

export default class Model extends ActualModel {
  errors = [];
  dataValues;
  messages;
  getMessages;
  static selectedEventId;
  public attributeLabels = {};
  static hooks = {
    beforeFind(opts) {
      // if (Model.selectedEventId !== undefined) {
      //     console.log('cse', Model.selectedEventId);
      //     opts.where = { eventId: Model.selectedEventId };
      // }
      return opts;
    },
  };
  public toJSON() {
    const json = super.toJSON();
    if (this.errors.length === 0) return json;
    const newJson = { ...json, errors: this.errors };
    return newJson;
  }

  public getAttributeLabel(attribute) {
    return this.attributeLabels[attribute] !== undefined
      ? this.attributeLabels[attribute]
      : Inflector.humanize(attribute);
  }

  public static primaryKey() {
    return 'id';
  }

  public getFormName() {
    return this.constructor.name;
  }

  public load(data, formName = null) {
    const scope = formName === null ? this.getFormName() : formName;
    if (scope === '' && !emptyDir(data)) {
      this.setAttributes(data);
      return true;
    } else if (data[scope] !== undefined) {
      this.setAttributes(data[scope]);
      return true;
    }
    return false;
  }
}
