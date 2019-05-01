import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';


import SimpleDagEditor from '../components/SimpleDagEditor'

storiesOf('SimpleDagEditor', module)
  .add('basic', () => <SimpleDagEditor onClick={action('clicked')}>Hello Button</SimpleDagEditor>)
  
