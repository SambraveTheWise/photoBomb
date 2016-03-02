angular.module('photoBombApp').controller('mainController', ['$scope', '$route', 
    function ($scope, $route) {
        
        
        /*
            On success of taking the picture
        */
        $scope.photoSuccessCallback = function () {
            alert("photo success!");
        }
        
        /*
            On failure to take the picture
        */
        $scope.photoFailCallback = function () {
            alert("photo failure!");
        }
        
        /*
            Take a picture with the device's camera
        */
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