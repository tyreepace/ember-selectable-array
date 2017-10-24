import Ember from 'ember';
import SelectableArrayMixin from 'icecream-sundae/mixins/selectable-array';
import { module, test } from 'qunit';

module('Unit | Mixin | selectable array');

// Replace this with your real tests.
test('it works', function(assert) {
  let SelectableArrayObject = Ember.Object.extend(SelectableArrayMixin);
  let subject = SelectableArrayObject.create();
  assert.ok(subject);
});
