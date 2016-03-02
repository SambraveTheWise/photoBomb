angular.module('photoBombApp').controller('mainController', ['$scope', '$route', 
    function ($scope, $route) {
        
        
        $scope.photoSuccessCallback = function () {
            alert("photo success!");
        }
        
        $scope.photoFailCallback = function () {
            alert("photo failure!");
        }
        
        
        $scope.takePicture = function() {
            // Take picture using device camera and retrieve image as base64-encoded string
            navigator.camera.getPicture($scope.photoSuccessCallback, $scope.photoFailCallback, 
                { 
                    quality: 100,
                    destinationType: Camera.DestinationType.DATA_URL,
                    targetWidth: 600,
                    targetHeight: 800,
                    correctOrientation: true
                }
            );   
        }
    
    }]);