import Ember from 'ember';
import KeyboardControlMixin from 'icecream-sundae/mixins/keyboard-control';

const { Component, computed, get, set, $ } = Ember;

export default Component.extend(KeyboardControlMixin, {

  classNames: ['list-item', 'media'],

  classNameBindings: ['isSelected:selected'],

  selection: null,

  isSelectable: computed('isVisible', function() {
    this.get('isVisible');
  }),

  isSelected: computed('item', 'selection', function() {
    let item = get(this, 'item');
    let selection = get(this, 'selection');

    return selection ? selection.includes(item) : false;
  }),

  releaseFocus() {
    this.$().closest('emberella-source-original').focus();
  },

  selectContent(e) {
    e.toggle = e.metaKey;
    this.sendAction('select', get(this, 'item'), e); // this originally referenced the directory controller which had the selectable-mixin
  },

  deselectContent() {
    this.sendAction('deselect', get(this, 'item')); //controller
  },

  deselectListings() {
    this.sendAction('deselectListings', get(this, 'listings')); //from leadView
  },

  click(e) {

    if (e.target.nodeName === 'INPUT') {
      return;
    }
    e.stopPropagation();

    if (get(this, 'isDeleted')) {
      return;
    }

    get(this, 'item').getTypeString === 'Library' ? this.deselectListings() : this.selectContent(e, true);
  },

  doubleClick(e) {
    if (e.target.nodeName === 'INPUT') {
      return;
    }
    e.stopPropagation();

    if (get(this, 'isDeleted')) {
      return;
    }
    this.sendAction('clearSearch'); // from controller
  },

  enterPressed(e, alt, ctrl, meta, shift) {
    e.preventDefault();
    this.releaseFocus();
  },

  tabPressed(e, alt, ctrl, meta, shift) {
    e.preventDefault();
    this.releaseFocus();
  }
});
