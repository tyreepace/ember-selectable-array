import Ember from 'ember';

const { Mixin, get, set, typeOf, A, computed, aliasMethod, beginPropertyChanges, endPropertyChanges, isArray, observer } = Ember;

/*
  `SelectableArray` adds selection support to array controllers.
  This mixin is rough around the edges and is not verified to work
  across browsers.
  @class SelectableArray
*/

export default Mixin.create({
  /*
    @property isSelectable
    @type Boolean
    @default true
    @final
  */
  isSelectable: true, // quack like a duck

  init() {
    set(this, '_selection', A());
    get(this, 'selection');
    return this._super();
  },

  // allowsSelection: true #TODO: Enable this setting

  // allowsMultipleSelection: true #TODO: Enable this setting

  // allowsEmptySelection: true #TODO: Enable this setting

  /*
    A member of the content array. When expanding the selection, the selection
    will typically expand using the index of this object.
    @property cursor
    @type Object
    @default null
  */
  cursor: null,

  /*
    @private
    The complete set of all currently selected items.
    @property _selection
    @type Set
    @default null
  */
  _selection: null,

  /*
    The "active" selection: an array of items selected by the user that are
    also present in the content array. This allows the selection to be retained
    even if, for example, a filter removes a selected object from the `content`
    property. When the filter is removed, the previously selected object will,
    once again, appear to be selected.
    @property selection
    @type Array
    @default []
  */
  // TODO: Fix excessive array creation
  selection: computed('_selection.[]', 'content', 'arrangedContent.[]', function() {
    let content = this.getActiveContent();
    let selection = get(this, '_selection');
    return selection.filter(function(item) {
      return content.contains(item);
    });
  }),

  /*
    The first member of the content array that would be a valid selection. The
    default behavior is to simply use the first item in the content array.
    Override this property with validation checks as needed.
    @property firstSelectableObject
    @type Object
  */
  firstSelectableObject: computed('firstObject', function() {
    return get(this, 'firstObject');
  }),

  /*
    The last member of the content array that would be a valid selection. The
    default behavior is to simply use the last item in the content array.
    Override this property with validation checks as needed.
    @property firstSelectableObject
    @type Object
  */
  lastSelectableObject: computed('lastObject', function() {
    return get(this, 'lastObject');
  }),

  /*
    Retrieve an array of items that could appear in the active selection.
    The default behavior is simply to return the `content` array. Override this
    method to introduce custom retrieval or assembly of the array of
    potentially selectable items.
    @method getActiveContent
    @return Array
  */
  getActiveContent() {
    return get(this, 'content');
  },

  /*
    Manipulate the selection set.
    Typically, this method will empty the selection set and add the specified
    item to the selection.
    Optionally, the selection status of a given item can be toggled or all
    items between the cursor and the specified item can be selected.
    @method select
    @param {Object|Integer} item The object or index to select
    @param {Object} [options] Expand or toggle the selection
      @param {Boolean} [options.toggle]
        If true, the item's selection state will be toggled.
      @param {Boolean} [options.range]
        If true, all items between the item and the cursor (inclusive) will be
        added to the selection.
    @chainable
  */
  select(item, options) {
    options = options != null ? options : {};

    if (typeOf(item) === 'number') {
      item = this.objectAt(parseInt(item, 10));
    }

    let toggle = get(options, 'toggle');
    let range = get(options, 'range');
    let retainSelection = get(options, 'retainSelection');

    if (toggle || range) {
      if (toggle) {
        if (this.inSelection(item)) {
          this.deselectObject(item);
        } else {
          this.selectObject(item);
        }
      } else if (range) {
        let targetIdx = +this.indexOf(item);
        let indexOfCursor = this.indexOfCursor();
        let start = Math.min(targetIdx, indexOfCursor);
        let end = Math.max(targetIdx, indexOfCursor);
        let selectionRange = __range__(start, end, true);
        this.selectObjects(selectionRange);
      }
    } else {
      beginPropertyChanges(this);
      if (!retainSelection) {
        this.deselectAll();
      }

      this.selectObject(item);
      endPropertyChanges(this);
    }
    return this;
  },

  /*
    Check an item to see if it can be selected.
    @method isSelectableObject
    @param {Mixed} obj The item to check
    @return {Boolean}
  */
  isSelectableObject(obj) {
    let type = typeOf(obj);
    return !!(obj && ((type === 'instance') || (type === 'object')));
  },

  /*
    Add an item to the selection.
    @method selectObject
    @param {Object|Integer} item The object or index to select
    @chainable
  */
  selectObject(item) {
    if (typeOf(item) === 'number') {
      item = this.objectAt(parseInt(item, 10));
    }

    if (this.isSelectableObject(item)) {
      get(this, '_selection').addObject(item);
      set(this, 'cursor', item);
    }
    return this;
  },

  /*
    Add multiple items to the selection.
    @method selectObjects
    @param {Array} items Items or indexes to select
    @chainable
  */
  selectObjects(...items) {
    items = [].concat.apply([], items);
    beginPropertyChanges(this);

    for (let item of Array.from(items)) {
      this.selectObject(item);
    }

    endPropertyChanges(this);
    return this;
  },

  /*
    Add all items to the selection.
    @method selectAll
    @chainable
  */
  // TODO: Boost performance. Select All can feel quite slow.
  selectAll() {
    this.selectObjects(__range__(0, get(this, 'length'), false));
    return this;
  },

  /*
    Swap a selected item with another item. Useful if the content contains
    proxies or placeholders that must eventually be swapped.
    @method selectInstead
    @param {Object} current The item to replace
    @param {Object} replacement The new item
    @chainable
  */
  selectInstead(current, replacement) {
    if (this.inSelection(current)) {
      this.deselectObjects(current).selectObjects(replacement);
    }
    return this;
  },

  /*
    Alias to `deselectObject`.
    @method deselect
    @param {Object|Integer} item The item or indexes to remove from the selection
    @chainable
  */
  deselect: aliasMethod('deselectObjects'),

  /*
    Remove the specified item from the selection set.
    @method deselectObject
    @param {Object|Integer} item The item or indexes to remove from the selection
    @chainable
  */
  deselectObject(item) {
    if (typeOf(item) === 'number') {
      item = this.objectAt(parseInt(item, 10), true);
    }
    get(this, '_selection').removeObject(item);

    if (this.isSelectableObject(item)) {
      set(this, 'cursor', item);
    }
    return this;
  },

  /*
    Remove multiple items from the selection.
    @method deselectObjects
    @param {Array} items Items or indexes to deselect
    @chainable
  */
  deselectObjects(...items) {
    items = [].concat.apply([], items);
    beginPropertyChanges(this);

    for (let item of Array.from(items)) {
      this.deselectObject(item);
    }

    endPropertyChanges(this);
    return this;
  },

  /*
    Clear the selection set.
    @method deselectAll
    @chainable
  */
  deselectAll() {
    get(this, '_selection').clear();
    return this;
  },

  /*
    Determine if a given object is present in the selection set.
    @method inSelection
    @param {Mixed} obj Object to search for
    @return {Boolean}
  */
  inSelection(obj) {
    return get(this, '_selection').contains(obj);
  },

  /*
    Remove all actively selected objects from the content array.
    @method removeSelection
    @chainable
  */
  removeSelection() {
    let selection = get(this, 'selection');
    this.removeObjects(selection);
    this.deselectObjects(selection);
    return this;
  },

  /*
    Based on the arrangement of items in the content array, `indexOfSelection`
    creates an object with `first`, `last`, and `indexes` attributes.
    `first`:   The index of the selected item closest to the beginning of the
               content array.
    `last`:    The index of the selected item closest to the end of the
               content array.
    `indexes`: An array of integers representing each selected item's position
               in the content array.
    @example
      //Returned object
      {
        first: 3,
        last: 12,
        indexes: [5, 9, 12, 3, 10]
      }
    @method indexOfSelection
    @param content Array to search for current selection
    @return {Object|Boolean} `false` if nothing selected
  */
  indexOfSelection(content) {
    if (content == null) {
      content = get(this, 'arrangedContent').toArray();
    }

    let result = { indexes: A(), first: null, last: null };
    let selection = get(this, 'selection');

    if ((selection.length === 0) || !isArray(content)) {
      return false;
    }

    for (let selected of Array.from(selection)) {
      let idx = content.indexOf(selected);
      if ((result.first == null) || (idx < result.first)) {
        result.first = idx;
      }

      if ((result.last == null) || (idx > result.last)) {
        result.last = idx;
      }
      result.indexes.push(idx);
    }

    return result;
  },

  /*
    Move the selection forward from the last selected index.
    @method next
    @param {Boolean} expandSelection
    @param {Integer} count How far forward to move the selection
    @chainable
  */
  next(expandSelection, count) {
    let targetIdx;
    if (expandSelection == null) {
      expandSelection = false;
    }

    if (count == null) {
      count = 1;
    }

    let len = get(this, 'length');
    let indices = this.indexOfSelection();
    let firstIdx = parseInt(this.indexOf(get(this, 'firstSelectableObject')));

    if (indices) {
      targetIdx = indices.last + count;
      let itemsMod = (len % count) || count; // how many items on the last "row"

      // if last selected item is in last "row", don't move
      targetIdx = indices.last >= (len - itemsMod) ? indices.last : targetIdx;

      // if target is out of bounds, select last item
      targetIdx = (targetIdx >= len) && (targetIdx < (len + count)) ? len - 1 : targetIdx;
    } else {
      targetIdx = firstIdx;
    }

    return this.select(this.objectAt(targetIdx), { range: expandSelection });
  },

  /*
    Move the selection back from the first selected index.
    @method previous
    @param {Boolean} expandSelection
    @param {Integer} count How far back to move the selection
    @chainable
  */
  previous(expandSelection, count) {
    let targetIdx;

    if (expandSelection == null) {
      expandSelection = false;
    }

    if (count == null) {
      count = 1;
    }

    let indices = this.indexOfSelection();
    let lastIdx = parseInt(this.lastIndexOf(get(this, 'lastSelectableObject')));

    if (indices) {
      targetIdx = indices.first - count;
      targetIdx = indices.first < count ? indices.first : targetIdx;
    } else {
      targetIdx = lastIdx;
    }

    return this.select(this.objectAt(targetIdx), { range: expandSelection });
  },

  /*
    Find the position of the cursor object.
    @method indexOfCursor
    @return {Integer}
  */
  indexOfCursor() {
    return parseInt(this.indexOf(this.get('cursor')));
  },

  // SELECTION ARRAY SETUP/EVENTS

  /*
    Hook for responding to impending updates to the selection set. Override to
    add custom handling for selection set updates.
    @method selectionSetWillChange
  */
  selectionSetWillChange() {},

  /*
    Hook for responding to updates to the selection set. Override to
    add custom handling for selection set updates.
    @method selectionSetDidChange
  */
  selectionSetDidChange() {},

  /*
    Hook for responding to the selection set being replaced with a different
    selection set instance. Override to add custom handling.
    @method selectionWillChange
    @param {Object} self
  */
  selectionWillChange() {},

  /*
    Hook for responding to the selection set being replaced with a different
    selection set instance. Override to add custom handling.
    @method selectionDidChange
    @param {Object} self
  */
  selectionDidChange() {},

  actions: {
    select() {
      return this.select(...arguments);
    },

    next() {
      return this.next(...arguments);
    },

    previous() {
      return this.previous(...arguments);
    }
  },

  /*
    @private
    Handle a complete swap of the selection set.
    @method _selectionWillChange
  */

  _selectionWillChange: observer('_selection', function() {
    let selection = get(this, '_selection');
    let len = selection ? get(selection, 'length') : 0;

    this.selectionSetWillChange(this, 0, len, undefined);
    this.selectionWillChange(this);
    return this._teardownSelection(selection);
  }),

  /*
    @private
    Handle a complete swap of the selection set.
    @method _selectionDidChange
  */
  _selectionDidChange: observer('_selection', function() {
    let selection = get(this, '_selection');
    let len = selection ? get(selection, 'length') : 0;

    this._setupSelection(selection);
    this.selectionDidChange(this);
    return this.selectionSetDidChange(this, 0, undefined, len);
  }),

  /*
    @private
    Begin observing for updates to the selection set.
    @method _setupSelection
  */
  _setupSelection() {
    let selection = get(this, '_selection');
    if (selection) {
      return selection.addEnumerableObserver(this, {
        willChange: 'selectionSetWillChange',
        didChange: 'selectionSetDidChange'
      }
      );
    }
  },

  /*
    @private
    Discontinue observing of updates to the selection set.
    @method _setupSelection
  */
  _teardownSelection() {
    let selection = get(this, '_selection');
    if (selection) {
      return selection.removeEnumerableObserver(this, {
        willChange: 'selectionSetWillChange',
        didChange: 'selectionSetDidChange'
      }
      );
    }
  },

  /*
    Called before destruction of the host object.
    @method willDestroy
  */
  willDestroy() {
    this._super();
    return this._teardownSelection();
  }
});

function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
