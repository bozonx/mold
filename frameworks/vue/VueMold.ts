// TODO: remove

import {Plugin} from 'vue'

import Mold from '../../frontend/Mold';
import {App} from '@vue/runtime-core'


const VueMold: Plugin = {
  install(app: App, ...options: any[]) {
    console.log(111, app, options)
    //app.prototype.$mold = new Mold(options);
  },
};

export default VueMold;
