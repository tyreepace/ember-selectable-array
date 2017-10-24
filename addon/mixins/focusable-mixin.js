import Ember from 'ember';

const { Mixin, set } = Ember;

export default Mixin.create({

  isFocusable: true,

  attributeBindings: ['tabindex'],

  tabindex: 0,

  classNameBindings: ['hasFocus:focused'],

  hasFocus: false,

  focusIn(e) {
    if (e !== null) {
      e.stopPropagation;
    }
    return set(this, 'hasFocus', true);
  },

  focusOut(e) {
    if (e !== null) {
      e.stopPropagation;
    }
    return set(this, 'hasFocus', false);
  }

});
