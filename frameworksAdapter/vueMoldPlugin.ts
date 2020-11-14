import Vue, {PluginObject} from 'vue';
import MoldFrontend from '../frontend/MoldFrontend';


const VueMoldFrontend: PluginObject<void> = {
  install(vue: typeof Vue, options) {
    const mold = new MoldFrontend();

    // @ts-ignore
    vue.$mold = mold;
    // @ts-ignore
    vue.prototype.$mold = mold;
  },
};

export default VueMoldFrontend;
