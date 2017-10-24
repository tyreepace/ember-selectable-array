import Ember from 'ember';
import SelectableArrayMixin from 'icecream-sundae/mixins/selectable-array';
import KeyboardControlMixin from 'icecream-sundae/mixins/keyboard-control';
import FocusableMixin from 'icecream-sundae/mixins/focusable-mixin';

const { Component, get, computed } = Ember;

export default Component.extend(SelectableArrayMixin, KeyboardControlMixin, FocusableMixin, {

  content: [],

  isSelected: null,

  previouslySelected: null,

  selection: computed('_selection.[]', 'content', 'arrangedContent.[]', 'previouslySelected', 'previouslySelected.[]', function() {
    let content = this.getActiveContent();
    let previouslySelected = get(this, 'previouslySelected') !== null ? get(this, 'previouslySelected') : [];
    let selection = get(this, '_selection');
    return selection.filter(function(item) {
      content.contains(item) || previouslySelected.contains(item);
    });
  }),

  selectContent(e, item) {
    // e.toggle = e.metaKey;
    let listing = get(this, 'content');
    listing.push(item);
  },

  deselectContent() {
    this.deselect(get(this, 'content'));
  },

  releaseFocus() {
    return this.$().closest('.list-type').focus();
  },

  shiftPressed(e, alt, ctrl, meta, shift) {
    e.preventDefault();
    return this.releaseFocus();
  },

  tabPressed(e, alt, ctrl, meta, shift) {
    e.preventDefault();
    return this.releaseFocus();
  },

  click(e) {
    let element = get(this, 'element');
    let $target = $(e.target);
    let isSelf = !!(element === e.target);
    let isEmptySpace = $target.hasClass('clear-selection');

    if (!isSelf && !isEmptySpace) {
      return;
    }

    if (!e.metaKey && !e.shiftKey) {
      return this.deselectAll();
    }

    let selected = this.get('isSelected');
    this.selectContent(e, selected);
  }

});
