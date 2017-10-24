import Ember from 'ember';

const { Route, A } = Ember;

export default Route.extend({
  model() {
    return {
      offices: A([
        { id: 1, name: 'Los Angeles' },
        { id: 2, name: 'Mexico City' },
        { id: 3, name: 'Sao Paulo' },
        { id: 4, name: 'Toronto' },
        { id: 5, name: 'Bangkok' },
        { id: 6, name: 'Seoul' },
        { id: 7, name: 'Shanghai' },
        { id: 8, name: 'Singapore' },
        { id: 9, name: 'Sydney' },
        { id: 10, name: 'Tokyo' },
        { id: 11, name: 'Dubai' },
        { id: 12, name: 'London' },
        { id: 13, name: 'Madrid' },
        { id: 14, name: 'Moscow' },
        { id: 15, name: 'Paris' }
      ])
    };
  }
});
