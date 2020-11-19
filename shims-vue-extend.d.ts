import Mold from './frontend/Mold';


interface VueExtends {
  $mold: Mold;
}


declare module 'vue/types/vue' {
  interface Vue extends VueExtends {}
  // interface CombinedVueInstance extends VueExtends {}
  // interface VueConstructor extends VueExtends {}
}
