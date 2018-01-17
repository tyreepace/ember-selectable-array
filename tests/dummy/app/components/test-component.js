import Ember from 'ember';
import SelectableArrayMixin from 'icecream-sundae/mixins/selectable-array';
import KeyboardControlMixin from 'icecream-sundae/mixins/keyboard-control';
import FocusableMixin from 'icecream-sundae/mixins/focusable-mixin';

const { Component, get, set, computed, A, isPresent, observer } = Ember;

export default Component.extend(SelectableArrayMixin, KeyboardControlMixin, FocusableMixin, {

  init() {
    set(this, 'isListingVisible', true);
    return this._super();
  },

  elementId: 'sources',

  classNames: ['source-list', 'sources'],

  isListingVisible: true,

  selection: computed('_selection.[]', 'content', function() {
    let content = this.getActiveContent();
    let selection = get(this, '_selection');
    return selection.filter(item => content.includes(item));
  }),

  selectableListings: computed('visibleListings', 'isSelectable', function() {
    get(this, 'visibleListings').filter(listing => listing.get('isSelectable'));
  }).volatile().readOnly(),

  previous(e) {
    this.changeSelection(-1, get(this, 'selectableListings.lastObject'), e);
  },

  next(e) {
    this.changeSelection(1, get(this, 'selectableListings.firstObject'), e);
  },

  changeSelection(count = 0, defaultSelection, e = {}) {
    let listings = get(this, 'selectableListings');
    let selection = this.currentSelectionIndex();
    count = parseInt(count, 10) || 0;

    selection = count >= 0 ? selection.pop() : selection.shift();

    let listing = listings.objectAt(selection + count) || defaultSelection;

    if (listing) {
      listing.selectContent(e);
    }

    return this;
  },

  currentSelectionIndex() {
    let listings = get(this, 'selectableListings');
    let results = A();

    for (let i = 0; i < listings.length; i++) {
      let listing = listings[i];
      if (listing.get('isSelected')) {
        results.push(i);
      }
    }
    return results;
  },

  upArrowPressed(e, alt, ctrl, meta, shift) {
    if (ctrl || (e.target.nodeName === 'INPUT')) {
      return;
    }
    this.previous(e);
  },

  downArrowPressed(e, alt, ctrl, meta, shift) {
    if (ctrl || (e.target.nodeName === 'INPUT')) {
      return;
    }
    this.next(e);
  },

  deselectListings(listings=get(this, 'listings')) {
    let originalSource = get(this, 'originalSource');
    let context = get(this, 'context'); // passed in from template - collection?

    if (isPresent(originalSource) && (isPresent(context) ? context.isSelectable : undefined)) {
      this.sendAction('deselectObjects', listings.mapBy('content'));
      if (!get(this, 'selection.length')) {
        this.sendAction('select', originalSource.get('selectableListings.firstObject'));
      }
    }
  },

  _listVisibilityDidChange: observer('isListingVisible', 'isVisible', function() {
    if (!(get(this, 'isListingVisible') && get(this, 'isVisible'))) {
      this.deselectListings();
    }
  })
});



// content: [],
//
// isSelected: null,
//
// previouslySelected: null,
//
// selection: computed('_selection.[]', 'content', 'arrangedContent.[]', 'previouslySelected', 'previouslySelected.[]', function() {
//   let content = this.getActiveContent();
//   let previouslySelected = get(this, 'previouslySelected') !== null ? get(this, 'previouslySelected') : [];
//   let selection = get(this, '_selection');
//   return selection.filter(function(item) {
//     content.contains(item) || previouslySelected.contains(item);
//   });
// }),
//
// selectContent(e, item) {
//   // e.toggle = e.metaKey;
//   let listing = get(this, 'content');
//   listing.push(item);
// },
//
// deselectContent() {
//   this.deselect(get(this, 'content'));
// },
//
// releaseFocus() {
//   return this.$().closest('.list-type').focus();
// },
//
// shiftPressed(e, alt, ctrl, meta, shift) {
//   e.preventDefault();
//   return this.releaseFocus();
// },
//
// tabPressed(e, alt, ctrl, meta, shift) {
//   e.preventDefault();
//   return this.releaseFocus();
// },
//
// click(e) {
//   let element = get(this, 'element');
//   let $target = $(e.target);
//   let isSelf = !!(element === e.target);
//   let isEmptySpace = $target.hasClass('clear-selection');
//
//   if (!isSelf && !isEmptySpace) {
//     return;
//   }
//
//   if (!e.metaKey && !e.shiftKey) {
//     return this.deselectAll();
//   }
//
//   let selected = this.get('isSelected');
//   this.selectContent(e, selected);
// }
