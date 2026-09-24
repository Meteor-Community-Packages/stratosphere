/* @refresh reload */
import { render } from 'solid-js/web';
import { Meteor } from 'meteor/meteor';
import { App } from './App';
import './main.css';

Meteor.startup(() => {
  render(() => <App />, document.getElementById('root'));
});
