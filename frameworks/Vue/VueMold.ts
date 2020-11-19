import {PluginObject} from 'vue/types/plugin';
import {Vue} from 'vue/types/vue';

import Mold from '../../frontend/Mold';


const VueMold: PluginObject<void> = {
  install(vue: typeof Vue, options: any) {
    vue.prototype.$mold = new Mold(options);
  },
};

export default VueMold;
