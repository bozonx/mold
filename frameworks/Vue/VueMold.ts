import {PluginObject} from 'vue/types/plugin';
import {Vue} from 'vue/types/vue';

import Mold from '../../frontend/Mold';


export class VueMold implements PluginObject<void> {
  static install(vue: typeof Vue, options) {
    vue.prototype.$mold = new Mold(options);
  }
}
