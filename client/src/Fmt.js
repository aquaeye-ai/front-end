import Utils from './Utils';

var _ = require('lodash');

class Fmt {
  static num(val, options={}) {
    const defaults = {
      precision: 0,
      prefix: '',
      suffix: '',
      multiplier: 1e0
    };
    
    const c = _.extend(defaults, options);
   
    if (c.multiplier !== null) {
      val = val * c.multiplier;
    } 
    if ((c.precision !== null) && ((typeof(val) === "number") || (Utils.notNaN(parseFloat(val))))) {
      val = parseFloat(val).toFixed(c.precision);
      
      return `${c.prefix}${val}${c.suffix}`
    } else {
      return val
    }
  }

  static capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export default Fmt
