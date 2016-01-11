////////////////////////////////////
// Angular V1 Example Directive 
////////////////////////////////////
var ElessarRangeController = function ElessarRangeController($scope, $window, $timeout) {
  this.init = function init(element, attrs) {
    this.element = element;
    this.attrs = attrs;
    $scope.min = 0;
    $scope.max = 1;
    this.renderRangeBar();
    $scope.$watch('min', _.bind(this.renderRangeBar, this));
    $scope.$watch('max', _.bind(this.renderRangeBar, this));
    $scope.$watch('values', $timeout(_.bind(function(values) {
      this.rangeBar.val($scope.values);
    }, this), 0), true);
  };

  this.updateSubscribers = _.debounce(function updateSubscribers(arg){
    if($scope.onChange){
      $scope.onChange(arg.values[0]);
    }
  }, 100);

  this.renderRangeBar = function renderRangeBar(){
    var min = parseFloat($scope.min);
    var max = parseFloat($scope.max);
    //remove range from dom
    this.element.empty();
    if(this.rangeBar){ this.rangeBar.off('change'); } //unregister change event
    //create range
    this.rangeBar = new $window.RangeBar({
      min: min,
      max: max,
      valueFormat: function(value) {
        return value;
      },
      valueParse: function(value) {
        return value;
      },
      values: $scope.values,
      label: function(a){
        return parseInt(a[0]*100)/100 + ' to ' + parseInt(a[1]*100)/100;
      },
      snap: (max-min)/100,
      minSize: (max-min)/100,
      maxRanges: 1
    });
    //add range to dom
    this.element.append(this.rangeBar.$el);
    //register for value changes
    $window.rangeBar = this.rangeBar;
    this.rangeBar.on('change', _.bind(function(event, values){
      this.updateSubscribers({values: values});
      $timeout(function() {}, 0);
    }, this));
  };

  $scope.$on('$destroy', function() {
    if(this.rangeBar){ this.rangeBar.off('change'); } //unregister change event
    this.rangeBar = null;
  });
};

var ElessarRangeDirective = function ElessarRangeDirective() {
  return {
    restrict: 'E',
    scope: {
      values: '=',
      min: '@',
      max: '@',
      onChange: '=',
    },
    controller: ElessarRangeController,
    controllerAs: 'elessarRangeController',
    template: '<div class="elessar-range-container"></div>',
    link: function link(scope, element, attrs, elessarRangeController) {
      elessarRangeController.init(element, attrs);
    }
  };
};
////////////////////////////////////
// End of Angular v1 Directive
////////////////////////////////////

angular.module('angular-legacy',[]);
angular.module('angular-legacy').directive('elessarRange', ElessarRangeDirective);

var adapter = new ng.upgrade.UpgradeAdapter();
  
var Foo2 = ng.core
  .Component({
    selector: 'foo2',
    template: 'Foo 2',    
  })
  .Class({
    constructor: function () { }
  });
  
var AppComponent = ng.core
  .Component({
    selector: 'app',
    template: '<foo2></foo2>, <elessar-range min="0" max="1" [values]="values" [onChange]="myFunc"></elessar-range>',
    directives: [Foo2, adapter.upgradeNg1Component('elessarRange')]
  })
  .Class({
    constructor: function () {
      this.values = [[0.22834645669291342, 0.35433070866141736]];
      this.myFunc = function(text){
        console.log(text);
      }
    }
  });  
  
angular.module('angular-legacy').directive('app', adapter.downgradeNg2Component(AppComponent));
adapter.bootstrap(document.body, ['angular-legacy']);
