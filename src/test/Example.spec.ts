import { IControllerService, IRootScopeService, module } from "angular";
import "angular-mocks/index";
import { SaySomethingController } from "../examples/say-something.directive";

/* FIXME UNIT TESTING NEEDS FIXING : angularjs needs the global window object */
//var window = {};

describe('window', function () {
    it('is defined', function () {
        expect(typeof window).toBe('object');
    });
    
    it('contains jasmine', function () {
        expect(typeof jasmine).toBe('object');
    });
});

describe('SaySomethingController', function () {
    beforeEach(() => {
        module('app');
        inject(function (_$controller_, _$rootScope_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $controller = _$controller_;
            $rootScope = _$rootScope_;
        });
    });

    var $controller: IControllerService, $rootScope: IRootScopeService;

    describe('SaySomethingController.sayHello()', function () {
        it('say hello to world', function () {
            //var $scope = $rootScope.$new();
            var controller = $controller<SaySomethingController>('SaySomethingController', { $http: null });
            controller.userName = 'world';
            expect(controller.sayHello()).toEqual('Hello, world !');
        });
    });
});
