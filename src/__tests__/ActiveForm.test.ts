import ActiveField from '../ActiveField';
import ActiveForm from '../ActiveForm';
import Application from '../Application';
import { DataTypes, Model } from 'sequelize';
Application.ormModelClass = Model;
import Model1 from './Models.jestignore';

test('FormFieldInstances', () => {
  const model = new Model1();
  const form = new ActiveForm({ action: '/form' });
  expect(form.field(model, 'title')).toBeInstanceOf(ActiveField);
});

test('FormFieldsHtml', async () => {
  const model = new Model1();
  const form = new ActiveForm({ action: '/form' });
  expect(await form.field(model, 'title').input('text').__toString()).toMatch(
    /\<div.*class=".*field-model1-title required.*\<label class="control-label" for="model1-title"\>Title\<\/label\>.*\<input class="form-control" aria-required="true" id="model1-title" type="text" name="Model1\[title\]" value=""\>.*\<div class="help-block"\>\<\/div\>.*\<\/div\>/gs,
  );
});
