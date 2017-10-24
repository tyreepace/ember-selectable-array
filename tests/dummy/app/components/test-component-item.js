import Ember from 'ember';

const { Component, computed, get, set } = Ember;

export default Component.extend({
  item: null,

  classNameBindings: ['active'],

  isSelected: null,

  active: computed('isSelected', 'item', function() {
    return get(this, 'isSelected') === get(this, 'item');
  }),

  click(e) {
    let selected = get(this, 'item');
    set(this, 'isSelected', selected);
  }
});
