import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';


import SimpleDagEditor from '../components/SimpleDagEditor'
let nodes = [
  //
  { id: "1", title: "node 1" },
  { id: "2", title: "long nody node node node really really long node let's see what happens" },
  { id: "3", title: "node 3" },
  { id: "4", title: "node 4" },
  { id: "5", title: "node 5" }
];
let edges = [
  { from: "1", to: "3", weight: "33%" },
  { from: "2", to: "4", weight: "100%" },
  { from: "1", to: "4", weight: "33%" },
  { from: "1", to: "5", weight: "33%" },
  { from: "4", to: "5", weight: "100%" }
];

storiesOf('SimpleDagEditor', module)
  .add('basic', () => <SimpleDagEditor nodes={nodes} edges={edges} />)
  
