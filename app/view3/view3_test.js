'use strict';

describe('myApp.view2 module', function() {

  beforeEach(module('myApp.view2'));

  describe('view3 controller', function(){

    it('should ....', inject(function($controller) {
      //spec body
      var view3Ctrl = $controller('View3Ctrl');
      expect(view3Ctrl).toBeDefined();
    }));

  });
});