import provider from './ionic-datepicker.provider'
import service from './ionic-datepicker.service';

export default angular.module('ionic-datepicker', [
  'ionic',
  service,
  provider,
])
.name;
